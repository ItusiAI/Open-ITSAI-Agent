import { db } from '@/lib/db'
import { users, pointsHistory } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

// 积分使用策略：优先使用赠送积分，再使用购买积分
export async function usePoints(userId: string, pointsToUse: number, description: string) {
  try {
    // 获取用户当前积分信息
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (user.length === 0) {
      throw new Error('用户不存在')
    }

    const currentUser = user[0]
    const totalPoints = currentUser.points || 0
    const giftedPoints = currentUser.giftedPoints || 0
    const purchasedPoints = currentUser.purchasedPoints || 0

    if (totalPoints < pointsToUse) {
      throw new Error('积分不足')
    }

    let remainingPointsToUse = pointsToUse
    let giftedPointsUsed = 0
    let purchasedPointsUsed = 0

    // 优先使用赠送积分
    if (giftedPoints > 0 && remainingPointsToUse > 0) {
      giftedPointsUsed = Math.min(giftedPoints, remainingPointsToUse)
      remainingPointsToUse -= giftedPointsUsed
    }

    // 如果还有剩余需要扣除的积分，使用购买积分
    if (remainingPointsToUse > 0) {
      purchasedPointsUsed = remainingPointsToUse
    }

    // 更新用户积分
    await db
      .update(users)
      .set({
        points: sql`${users.points} - ${pointsToUse}`,
        giftedPoints: sql`${users.giftedPoints} - ${giftedPointsUsed}`,
        purchasedPoints: sql`${users.purchasedPoints} - ${purchasedPointsUsed}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // 记录积分使用历史
    if (giftedPointsUsed > 0) {
      await db.insert(pointsHistory).values({
        id: uuidv4(),
        userId,
        points: -giftedPointsUsed,
        pointsType: 'gifted',
        action: 'use',
        description: `${description} - 使用赠送积分`,
        createdAt: new Date(),
      })
    }

    if (purchasedPointsUsed > 0) {
      await db.insert(pointsHistory).values({
        id: uuidv4(),
        userId,
        points: -purchasedPointsUsed,
        pointsType: 'purchased',
        action: 'use',
        description: `${description} - 使用购买积分`,
        createdAt: new Date(),
      })
    }

    return {
      success: true,
      pointsUsed: pointsToUse,
      giftedPointsUsed,
      purchasedPointsUsed,
      remainingPoints: totalPoints - pointsToUse,
    }
  } catch (error) {
    console.error('积分使用失败:', error)
    throw error
  }
}

// 获取用户积分详情
export async function getUserPointsDetail(userId: string) {
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
    
    if (user.length === 0) {
      throw new Error('用户不存在')
    }

    const currentUser = user[0]
    
    return {
      totalPoints: currentUser.points || 0,
      purchasedPoints: currentUser.purchasedPoints || 0,
      giftedPoints: currentUser.giftedPoints || 0,
      subscriptionStatus: currentUser.subscriptionStatus,
      subscriptionPlan: currentUser.subscriptionPlan,
      subscriptionCurrentPeriodEnd: currentUser.subscriptionCurrentPeriodEnd,
    }
  } catch (error) {
    console.error('获取用户积分详情失败:', error)
    throw error
  }
}

// 管理员手动添加积分
export async function addPointsManually(userId: string, points: number, type: 'purchased' | 'gifted', description: string) {
  try {
    // 更新用户积分
    if (type === 'purchased') {
      await db
        .update(users)
        .set({
          points: sql`${users.points} + ${points}`,
          purchasedPoints: sql`${users.purchasedPoints} + ${points}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    } else {
      await db
        .update(users)
        .set({
          points: sql`${users.points} + ${points}`,
          giftedPoints: sql`${users.giftedPoints} + ${points}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    }

    // 记录积分历史
    await db.insert(pointsHistory).values({
      id: uuidv4(),
      userId,
      points,
      pointsType: type,
      action: 'manual',
      description,
      createdAt: new Date(),
    })

    return {
      success: true,
      pointsAdded: points,
      type,
    }
  } catch (error) {
    console.error('手动添加积分失败:', error)
    throw error
  }
} 