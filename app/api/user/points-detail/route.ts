import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPointsDetail } from '@/lib/points-manager'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const pointsDetail = await getUserPointsDetail(session.user.id)
    
    return NextResponse.json(pointsDetail)
  } catch (error) {
    console.error('获取用户积分详情失败:', error)
    return NextResponse.json(
      { error: '获取积分详情失败' },
      { status: 500 }
    )
  }
} 