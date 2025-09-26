import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, emailVerificationTokens } from '@/lib/schema'
import { sendVerificationEmail } from '@/lib/email'
import { giveRegisterBonus } from '@/lib/points'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, locale } = await request.json()

    // 从请求中获取语言信息，默认为英文
    const language = locale || 'en'
    
    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: language === 'en' ? 'Please fill in all required fields' : '请填写所有必填字段' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: language === 'en' ? 'Password must be at least 6 characters long' : '密码至少需要6个字符' },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (existingUser) {
      return NextResponse.json(
        { error: language === 'en' ? 'This email is already registered' : '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const userId = nanoid()
    await db.insert(users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
    })

    // 赠送注册积分
    try {
      await giveRegisterBonus(userId)
      console.log(`新用户 ${email} 注册成功，已赠送注册积分`)
    } catch (pointsError) {
      console.error('赠送注册积分失败:', pointsError)
      // 积分赠送失败不影响注册流程
    }

    // 生成邮箱验证令牌
    const verificationToken = nanoid(32)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

    await db.insert(emailVerificationTokens).values({
      id: nanoid(),
      email,
      token: verificationToken,
      expires,
    })

    // 发送验证邮件（根据语言）
    const emailResult = await sendVerificationEmail(email, verificationToken, language as 'zh' | 'en')

    if (!emailResult.success) {
      return NextResponse.json(
        { error: language === 'en' 
          ? 'Registration successful, but failed to send verification email. Please try again later.' 
          : '注册成功，但发送验证邮件失败，请稍后重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: language === 'en' 
        ? 'Registration successful! Please check your email and click the verification link to complete registration.'
        : '注册成功！请检查您的邮箱并点击验证链接完成注册。',
      success: true
    })

  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { error: 'Registration failed, please try again later' },
      { status: 500 }
    )
  }
} 