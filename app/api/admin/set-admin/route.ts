import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: '请在URL中提供邮箱参数，例如：?email=your@email.com' },
        { status: 400 }
      )
    }

    // 更新用户角色为管理员
    const result = await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: `用户 ${email} 已设置为管理员`,
      success: true 
    })
  } catch (error) {
    console.error('Set admin error:', error)
    return NextResponse.json(
      { 
        error: '设置管理员失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: '邮箱地址是必需的' },
        { status: 400 }
      )
    }

    // 更新用户角色为管理员
    const result = await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: `用户 ${email} 已设置为管理员`,
      success: true 
    })
  } catch (error) {
    console.error('Set admin error:', error)
    return NextResponse.json(
      { 
        error: '设置管理员失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 