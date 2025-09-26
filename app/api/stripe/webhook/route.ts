import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { users, pointsHistory } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { createPaymentRecord, PaymentStatus, PaymentType } from '@/lib/payments'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const sig = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // 处理支付成功事件（积分购买）
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      const userId = paymentIntent.metadata.userId
      const points = parseInt(paymentIntent.metadata.points)
      const type = paymentIntent.metadata.type

      if (type === 'points_purchase' && userId && points) {
        try {
          // 更新用户购买积分（永不过期）
          await db
            .update(users)
            .set({
              points: sql`${users.points} + ${points}`,
              purchasedPoints: sql`${users.purchasedPoints} + ${points}`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId))

          // 记录积分历史
          await db.insert(pointsHistory).values({
            id: uuidv4(),
            userId,
            points,
            pointsType: 'purchased',
            action: 'purchase',
            description: `购买积分 - 支付 $${(paymentIntent.amount / 100).toFixed(2)}`,
            createdAt: new Date(),
          })

          // 创建支付记录
          await createPaymentRecord({
            userId,
            stripeCustomerId: paymentIntent.customer as string,
            paymentIntentId: paymentIntent.id,
            paymentStatus: PaymentStatus.SUCCEEDED,
            paymentType: PaymentType.POINTS_PURCHASE,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            pointsAmount: points,
            pointsType: 'purchased',
            productName: `${points.toLocaleString()} 积分`,
            productDescription: `购买 ${points.toLocaleString()} 积分`,
            metadata: paymentIntent.metadata,
            webhookEventId: event.id,
          })

          console.log(`成功为用户 ${userId} 发放 ${points} 购买积分`)
        } catch (error) {
          console.error('积分发放失败:', error)
          // 这里可以添加重试逻辑或者错误通知
        }
      }
    }

    // 处理订阅相关事件
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      if (session.mode === 'subscription') {
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        
        try {
          // 获取客户邮箱 - 如果session中没有邮箱，从Stripe获取
          let customerEmail = session.customer_email
          if (!customerEmail && customerId) {
            try {
              const customer = await stripe.customers.retrieve(customerId)
              if (customer && !customer.deleted && customer.email) {
                customerEmail = customer.email
              }
            } catch (customerError) {
              console.error('获取客户信息失败:', customerError)
            }
          }
          
          if (!customerEmail) {
            console.error('无法获取客户邮箱:', {
              sessionCustomerEmail: session.customer_email,
              customerId,
              subscriptionId
            })
            return NextResponse.json({ received: true, warning: 'Customer email not found, will retry' })
          }
          
          // 通过邮箱查找用户
          const user = await db.select().from(users).where(eq(users.email, customerEmail)).limit(1)
          
          if (user.length === 0) {
            console.error('未找到用户:', customerEmail)
            return NextResponse.json({ received: true, warning: 'User not found, will retry' })
          }
          
          console.log('找到用户:', {
            userId: user[0].id,
            email: user[0].email,
            currentPoints: user[0].points,
            currentSubscriptionStatus: user[0].subscriptionStatus,
            currentEndDate: user[0].subscriptionCurrentPeriodEnd
          })

          // 主动使用Stripe SDK获取最新的完整订阅信息
          console.log('获取订阅信息:', subscriptionId)
          const latestSubscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          console.log('获取到的订阅信息:', {
            subscriptionId: latestSubscription.id,
            status: latestSubscription.status,
            created: latestSubscription.created,
            createdDate: new Date(latestSubscription.created * 1000),
            plan: latestSubscription.items.data[0]?.price?.id
          })

          // 计算新的到期时间：
          // 如果用户已有活跃订阅且还未到期，在现有到期时间基础上累加30天
          // 否则从当前时间开始计算30天
          let finalEndDate: Date
          const currentUser = user[0]
          const hasActiveSubscription = currentUser.subscriptionStatus === 'active' && 
                                       currentUser.subscriptionCurrentPeriodEnd &&
                                       currentUser.subscriptionCurrentPeriodEnd > new Date()
          
          if (hasActiveSubscription) {
            // 在现有到期时间基础上累加30天
            const currentEndTime = currentUser.subscriptionCurrentPeriodEnd!.getTime()
            const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
            finalEndDate = new Date(currentEndTime + thirtyDaysInMs)
            
            console.log('用户已有活跃订阅，时间累加:', {
              原到期时间: currentUser.subscriptionCurrentPeriodEnd,
              新到期时间: finalEndDate,
              累加时间: '30天'
            })
          } else {
            // 从订阅创建时间开始计算30天
            const subscriptionCreated = latestSubscription.created
            const oneMonthLater = subscriptionCreated + (30 * 24 * 60 * 60) // 30天后
            finalEndDate = new Date(oneMonthLater * 1000)
            
            console.log('新订阅或已过期，重新计算:', {
              创建时间: new Date(subscriptionCreated * 1000),
              到期时间: finalEndDate,
              有效期: '30天'
            })
          }

          console.log('准备更新数据库:', {
            userId: user[0].id,
            subscriptionId: latestSubscription.id,
            status: latestSubscription.status,
            endDate: finalEndDate,
            赠送积分: 10000
          })

          // 更新用户订阅状态并赠送10000积分（无论之前是否有赠送积分）
          await db
            .update(users)
            .set({
              stripeCustomerId: customerId,
              subscriptionId: latestSubscription.id,
              subscriptionStatus: latestSubscription.status,
              subscriptionPlan: 'pro',
              subscriptionCurrentPeriodEnd: finalEndDate,
              points: sql`${users.points} + 10000`,
              giftedPoints: sql`${users.giftedPoints} + 10000`,
              updatedAt: new Date(),
            })
            .where(eq(users.id, user[0].id))

          // 记录赠送积分历史
          await db.insert(pointsHistory).values({
            id: uuidv4(),
            userId: user[0].id,
            points: 10000,
            pointsType: 'gifted',
            action: 'subscription_gift',
            description: hasActiveSubscription 
              ? `续订专业版赠送积分（时间累加30天）`
              : `订阅专业版赠送积分`,
            createdAt: new Date(),
          })

          // 创建订阅支付记录
          await createPaymentRecord({
            userId: user[0].id,
            stripeCustomerId: customerId,
            checkoutSessionId: session.id,
            subscriptionId: latestSubscription.id,
            paymentStatus: PaymentStatus.SUCCEEDED,
            paymentType: PaymentType.SUBSCRIPTION,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            subscriptionPlan: 'pro',
            subscriptionPeriodStart: new Date(latestSubscription.created * 1000),
            subscriptionPeriodEnd: finalEndDate,
            pointsAmount: 10000,
            pointsType: 'gifted',
            productName: '专业版订阅',
            productDescription: hasActiveSubscription 
              ? '续订专业版订阅，赠送10000积分'
              : '订阅专业版，赠送10000积分',
            priceId: latestSubscription.items.data[0]?.price?.id,
            metadata: session.metadata,
            webhookEventId: event.id,
          })

          console.log(`订阅${hasActiveSubscription ? '续订' : '创建'}成功: ${latestSubscription.id}，用户: ${user[0].id}，赠送10000积分，到期时间: ${finalEndDate}`)
        } catch (error) {
          console.error('订阅处理失败:', error)
        }
      } else if (session.mode === 'payment' && session.metadata?.type === 'points_purchase') {
        // 处理积分购买
        const userId = session.metadata.userId
        const points = parseInt(session.metadata.points)
        
        if (userId && points) {
          try {
            // 更新用户购买积分（永不过期）
            await db
              .update(users)
              .set({
                points: sql`${users.points} + ${points}`,
                purchasedPoints: sql`${users.purchasedPoints} + ${points}`,
                updatedAt: new Date(),
              })
              .where(eq(users.id, userId))

            // 记录积分历史
            await db.insert(pointsHistory).values({
              id: uuidv4(),
              userId,
              points,
              pointsType: 'purchased',
              action: 'purchase',
              description: `购买积分 - 支付 $${(session.amount_total! / 100).toFixed(2)}`,
              createdAt: new Date(),
            })

            // 创建支付记录
            await createPaymentRecord({
              userId,
              stripeCustomerId: session.customer as string,
              checkoutSessionId: session.id,
              paymentStatus: PaymentStatus.SUCCEEDED,
              paymentType: PaymentType.POINTS_PURCHASE,
              amount: session.amount_total || 0,
              currency: session.currency || 'usd',
              pointsAmount: points,
              pointsType: 'purchased',
              productName: `${points.toLocaleString()} 积分`,
              productDescription: `购买 ${points.toLocaleString()} 积分`,
              priceId: session.metadata?.priceId,
              metadata: session.metadata,
              webhookEventId: event.id,
            })

            console.log(`成功为用户 ${userId} 发放 ${points} 购买积分`)
          } catch (error) {
            console.error('积分发放失败:', error)
          }
        }
      }
    }

    // 处理订阅更新事件
    if (event.type === 'customer.subscription.updated') {
      const webhookSubscription = event.data.object as Stripe.Subscription
      
      try {
        // 主动获取最新的订阅信息，而不是使用webhook中的数据
        console.log('订阅更新事件，主动获取最新订阅信息:', webhookSubscription.id)
        const latestSubscription = await stripe.subscriptions.retrieve(webhookSubscription.id)
        
        console.log('获取到的最新订阅更新信息:', {
          subscriptionId: latestSubscription.id,
          status: latestSubscription.status,
          current_period_end: (latestSubscription as any).current_period_end,
          current_period_end_date: (latestSubscription as any).current_period_end 
            ? new Date((latestSubscription as any).current_period_end * 1000) 
            : null
        })

        await db
          .update(users)
          .set({
            subscriptionStatus: latestSubscription.status,
            subscriptionCurrentPeriodEnd: (latestSubscription as any).current_period_end 
              ? new Date((latestSubscription as any).current_period_end * 1000) 
              : null,
            updatedAt: new Date(),
          })
          .where(eq(users.subscriptionId, latestSubscription.id))

        console.log(`订阅更新成功: ${latestSubscription.id}，状态: ${latestSubscription.status}`)
      } catch (error) {
        console.error('订阅更新失败:', error)
      }
    }

    // 处理订阅取消事件 - 清零赠送积分
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      
      try {
        // 获取用户当前信息
        const user = await db.select().from(users).where(eq(users.subscriptionId, subscription.id)).limit(1)
        
        if (user.length > 0) {
          const currentUser = user[0]
          
          // 由于每次订阅都会赠送10,000积分，订阅取消时只清零10,000积分
          // 如果用户的赠送积分少于10,000，则清零所有赠送积分
          const pointsToRemove = Math.min(currentUser.giftedPoints || 0, 10000)
          
          console.log('订阅取消，清零积分:', {
            userId: currentUser.id,
            subscriptionId: subscription.id,
            当前赠送积分: currentUser.giftedPoints,
            将要清零积分: pointsToRemove
          })
          
          if (pointsToRemove > 0) {
            // 更新用户状态，清零部分赠送积分
            await db
              .update(users)
              .set({
                subscriptionStatus: 'canceled',
                subscriptionPlan: null,
                points: sql`${users.points} - ${pointsToRemove}`,
                giftedPoints: sql`${users.giftedPoints} - ${pointsToRemove}`,
                updatedAt: new Date(),
              })
              .where(eq(users.subscriptionId, subscription.id))

            // 记录积分清零历史
            await db.insert(pointsHistory).values({
              id: uuidv4(),
              userId: currentUser.id,
              points: -pointsToRemove,
              pointsType: 'gifted',
              action: 'subscription_expired',
              description: `订阅取消，清零本次订阅赠送的积分`,
              createdAt: new Date(),
            })

            console.log(`订阅取消成功: ${subscription.id}，清零 ${pointsToRemove} 赠送积分`)
          } else {
            // 没有赠送积分需要清零的情况
            await db
              .update(users)
              .set({
                subscriptionStatus: 'canceled',
                subscriptionPlan: null,
                updatedAt: new Date(),
              })
              .where(eq(users.subscriptionId, subscription.id))

            console.log(`订阅取消成功: ${subscription.id}，无赠送积分需要清零`)
          }
        }
      } catch (error) {
        console.error('订阅取消处理失败:', error)
      }
    }

    // 处理支付失败事件
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      
      try {
        await db
          .update(users)
          .set({
            subscriptionStatus: 'past_due',
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, invoice.customer as string))

        console.log(`支付失败处理: ${invoice.id}`)
      } catch (error) {
        console.error('支付失败处理失败:', error)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook处理失败:', error)
    return NextResponse.json({ error: 'Webhook处理失败' }, { status: 500 })
  }
} 