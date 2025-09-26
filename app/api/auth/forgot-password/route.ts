import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { sendPasswordResetEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, locale } = await request.json()

    // 从请求中获取语言信息，默认为英文
    const language = locale || 'en'

    if (!email) {
      return NextResponse.json(
        { error: language === 'en' ? 'Email is required' : '邮箱地址是必填项' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (user.length === 0) {
      return NextResponse.json(
        { error: language === 'en' ? 'User not found' : '用户不存在' },
        { status: 404 }
      )
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    // 保存重置令牌到数据库
    await db.update(users)
      .set({
        resetToken,
        resetTokenExpiry
      })
      .where(eq(users.email, email))

    // 发送重置密码邮件（根据语言）
    await sendPasswordResetEmail(email, resetToken, language as 'zh' | 'en')

    return NextResponse.json(
      { message: language === 'en' 
        ? 'Password reset email sent successfully' 
        : '密码重置邮件已发送成功' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 