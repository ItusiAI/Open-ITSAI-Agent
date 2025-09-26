import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, emailVerificationTokens } from '@/lib/schema'
import { eq, and, gt } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: '验证令牌缺失' },
        { status: 400 }
      )
    }

    // 查找验证令牌
    const verificationToken = await db.query.emailVerificationTokens.findFirst({
      where: and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expires, new Date())
      )
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: '验证令牌无效或已过期' },
        { status: 400 }
      )
    }

    // 更新用户邮箱验证状态
    await db.update(users)
      .set({ 
        emailVerified: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.email, verificationToken.email))

    // 删除验证令牌
    await db.delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token))

    return NextResponse.json({
      message: '邮箱验证成功！您现在可以登录了。',
      success: true
    })

  } catch (error) {
    console.error('邮箱验证错误:', error)
    return NextResponse.json(
      { error: '邮箱验证失败，请稍后重试' },
      { status: 500 }
    )
  }
} 