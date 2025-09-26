import { NextRequest, NextResponse } from 'next/server'
import { stripe, getActualPriceIds } from '@/lib/stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 检查Stripe是否已配置
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, planType, locale = 'en' } = await request.json()

    // 获取实际的价格ID
    const actualPriceIds = getActualPriceIds()

    // 添加调试日志
    console.log('=== Stripe Checkout Debug ===')
    console.log('收到的价格ID:', priceId)
    console.log('计划类型:', planType)
    console.log('语言:', locale)
    console.log('实际的价格ID配置:', actualPriceIds)

    // 企业版不支持在线支付
    if (planType === 'enterprise') {
      return NextResponse.json({ error: 'Enterprise plan requires contact sales' }, { status: 400 })
    }

    // 确定要使用的价格ID
    let finalPriceId = priceId
    
    // 如果前端传递的价格ID为空或无效，使用服务端的配置
    if (!priceId || priceId.trim() === '') {
      if (planType === 'pro') {
        finalPriceId = actualPriceIds.pro
      } else {
        return NextResponse.json({ error: 'Missing price ID for plan type' }, { status: 400 })
      }
    }

    // 验证最终的价格ID
    if (!finalPriceId || finalPriceId.trim() === '') {
      console.error('价格ID验证失败!')
      console.error('计划类型:', planType)
      console.error('最终价格ID:', finalPriceId)
      console.error('可用的价格ID:', actualPriceIds)
      return NextResponse.json({ error: 'Price ID not configured for this plan' }, { status: 400 })
    }

    console.log('使用的最终价格ID:', finalPriceId)

    // 创建或获取客户
    let customer
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
      })
    }

    // 验证locale并构建成功URL
    const validLocales = ['en', 'zh']
    const validLocale = validLocales.includes(locale) ? locale : 'en'

    // 创建结账会话
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${validLocale}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${validLocale}/#pricing`,
      metadata: {
        userId: session.user.id || '',
        planType,
        locale: validLocale,
      },
      // 允许在Stripe Checkout页面输入优惠码
      allow_promotion_codes: true,
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 