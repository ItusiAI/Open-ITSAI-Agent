import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { newsletterSubscriptions } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { email, token, locale = 'zh' } = await request.json()

    if (!email && !token) {
      return NextResponse.json(
        { error: locale === 'zh' ? '请提供邮箱地址或取消订阅令牌' : 'Please provide email address or unsubscribe token' },
        { status: 400 }
      )
    }

    let whereCondition
    if (token) {
      whereCondition = eq(newsletterSubscriptions.unsubscribeToken, token)
    } else {
      whereCondition = eq(newsletterSubscriptions.email, email)
    }

    // 查找订阅记录
    const existingSubscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(whereCondition)
      .limit(1)

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: locale === 'zh' ? '未找到订阅记录' : 'Subscription not found' },
        { status: 404 }
      )
    }

    const subscription = existingSubscription[0]

    if (!subscription.isActive) {
      return NextResponse.json(
        { message: locale === 'zh' ? '您已经取消了订阅' : 'You have already unsubscribed' },
        { status: 200 }
      )
    }

    // 取消订阅
    await db
      .update(newsletterSubscriptions)
      .set({
        isActive: false,
        unsubscribedAt: new Date(),
      })
      .where(whereCondition)

    return NextResponse.json({
      message: locale === 'zh' ? '取消订阅成功' : 'Successfully unsubscribed'
    })

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET请求用于通过链接取消订阅
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const locale = searchParams.get('locale') || 'zh'

    if (!token) {
      return NextResponse.json(
        { error: locale === 'zh' ? '无效的取消订阅链接' : 'Invalid unsubscribe link' },
        { status: 400 }
      )
    }

    // 查找订阅记录
    const existingSubscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.unsubscribeToken, token))
      .limit(1)

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: locale === 'zh' ? '未找到订阅记录' : 'Subscription not found' },
        { status: 404 }
      )
    }

    const subscription = existingSubscription[0]

    if (!subscription.isActive) {
      return NextResponse.json(
        { message: locale === 'zh' ? '您已经取消了订阅' : 'You have already unsubscribed' },
        { status: 200 }
      )
    }

    // 取消订阅
    await db
      .update(newsletterSubscriptions)
      .set({
        isActive: false,
        unsubscribedAt: new Date(),
      })
      .where(eq(newsletterSubscriptions.unsubscribeToken, token))

    return NextResponse.json({
      message: locale === 'zh' ? '取消订阅成功' : 'Successfully unsubscribed'
    })

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 