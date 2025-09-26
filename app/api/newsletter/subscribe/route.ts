import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { newsletterSubscriptions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import { isAdmin } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const { email, locale = 'zh' } = await request.json()

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: locale === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // 检查是否已经订阅
    const existingSubscription = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email))
      .limit(1)

    if (existingSubscription.length > 0) {
      const subscription = existingSubscription[0]
      
      // 如果已经是活跃订阅
      if (subscription.isActive) {
        return NextResponse.json(
          { message: locale === 'zh' ? '您已经订阅了我们的邮件列表' : 'You are already subscribed to our newsletter' },
          { status: 200 }
        )
      } else {
        // 重新激活订阅
        await db
          .update(newsletterSubscriptions)
          .set({
            isActive: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            locale: locale,
          })
          .where(eq(newsletterSubscriptions.email, email))

        return NextResponse.json({
          message: locale === 'zh' ? '欢迎回来！您已重新订阅成功' : 'Welcome back! You have successfully resubscribed'
        })
      }
    }

    // 创建新订阅
    const subscriptionId = nanoid()
    const unsubscribeToken = crypto.randomBytes(32).toString('hex')

    await db.insert(newsletterSubscriptions).values({
      id: subscriptionId,
      email: email,
      locale: locale,
      unsubscribeToken: unsubscribeToken,
    })

    // TODO: 这里可以发送欢迎邮件
    // await sendWelcomeEmail(email, locale, unsubscribeToken)

    return NextResponse.json({
      message: locale === 'zh' ? '订阅成功！感谢您的关注' : 'Successfully subscribed! Thank you for your interest'
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // 获取订阅统计信息（仅用于管理）
  try {
    // 验证管理员权限
    const adminAccess = await isAdmin()
    if (!adminAccess) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      const totalSubscriptions = await db
        .select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.isActive, true))

      return NextResponse.json({
        total: totalSubscriptions.length,
        zh: totalSubscriptions.filter(sub => sub.locale === 'zh').length,
        en: totalSubscriptions.filter(sub => sub.locale === 'en').length,
      })
    }

    if (action === 'list') {
      const allSubscriptions = await db
        .select({
          id: newsletterSubscriptions.id,
          email: newsletterSubscriptions.email,
          locale: newsletterSubscriptions.locale,
          isActive: newsletterSubscriptions.isActive,
          subscribedAt: newsletterSubscriptions.subscribedAt,
          unsubscribedAt: newsletterSubscriptions.unsubscribedAt,
        })
        .from(newsletterSubscriptions)
        .orderBy(newsletterSubscriptions.subscribedAt)

      return NextResponse.json({
        subscriptions: allSubscriptions
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Newsletter stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 