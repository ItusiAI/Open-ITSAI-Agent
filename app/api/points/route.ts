import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPoints, addPoints, deductPoints, PointsAction } from '@/lib/points'
import { isAdmin } from '@/lib/auth-utils'

// 获取当前用户积分
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const points = await getUserPoints(session.user.id)
    
    return NextResponse.json({
      points,
      userId: session.user.id,
      email: session.user.email,
    })
  } catch (error) {
    console.error('获取积分失败:', error)
    return NextResponse.json(
      { error: '获取积分失败' },
      { status: 500 }
    )
  }
}

// 管理员操作：添加或扣除积分
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminAccess = await isAdmin()
    if (!adminAccess) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      )
    }

    const { userId, points, action, operation } = await request.json()
    
    if (!userId || !points || !operation) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    let result
    if (operation === 'add') {
      result = await addPoints(userId, points, action || PointsAction.MANUAL)
    } else if (operation === 'deduct') {
      result = await deductPoints(userId, points)
    } else {
      return NextResponse.json(
        { error: '无效的操作类型' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: `积分操作成功`,
      newPoints: result,
      success: true
    })
  } catch (error) {
    console.error('积分操作失败:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '积分操作失败'
      },
      { status: 500 }
    )
  }
} 