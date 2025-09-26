import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

// 邮件模板配置
const emailTemplates = {
  verification: {
    zh: {
      subject: '验证您的邮箱地址 - ITSAI Agent',
      title: '验证您的邮箱地址',
      subtitle: '专业AI智能体服务平台',
      greeting: '感谢您注册ITSAI Agent！请点击下方按钮验证您的邮箱地址以完成注册。',
      buttonText: '验证邮箱地址',
      linkText: '如果按钮无法点击，请复制以下链接到浏览器：',
      footer1: '此邮件由 ITSAI Agent 自动发送，请勿回复。',
      footer2: '如果您没有注册账户，请忽略此邮件。'
    },
    en: {
      subject: 'Verify Your Email Address - ITSAI Agent',
      title: 'Verify Your Email Address',
      subtitle: 'Professional AI Agent Service Platform',
      greeting: 'Thank you for registering with ITSAI Agent! Please click the button below to verify your email address and complete your registration.',
      buttonText: 'Verify Email Address',
      linkText: 'If the button doesn\'t work, please copy the following link to your browser:',
      footer1: 'This email was sent automatically by ITSAI Agent, please do not reply.',
      footer2: 'If you did not register an account, please ignore this email.'
    }
  },
  passwordReset: {
    zh: {
      subject: '重置您的密码 - ITSAI Agent',
      title: '重置您的密码',
      subtitle: '专业AI智能体服务平台',
      greeting: '您请求重置ITSAI Agent账户的密码。请点击下方按钮设置新密码。',
      buttonText: '重置密码',
      linkText: '如果按钮无法点击，请复制以下链接到浏览器：',
      footer1: '此邮件由 ITSAI Agent 自动发送，请勿回复。',
      footer2: '如果您没有请求重置密码，请忽略此邮件。'
    },
    en: {
      subject: 'Reset Your Password - ITSAI Agent',
      title: 'Reset Your Password',
      subtitle: 'Professional AI Agent Service Platform',
      greeting: 'You have requested to reset your ITSAI Agent account password. Please click the button below to set a new password.',
      buttonText: 'Reset Password',
      linkText: 'If the button doesn\'t work, please copy the following link to your browser:',
      footer1: 'This email was sent automatically by ITSAI Agent, please do not reply.',
      footer2: 'If you did not request a password reset, please ignore this email.'
    }
  }
}

// 生成邮件HTML模板
function generateEmailTemplate(
  url: string,
  template: typeof emailTemplates.verification.zh
): string {
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1f2937; margin-bottom: 10px;">ITSAI Agent</h1>
        <p style="color: #6b7280; font-size: 16px;">${template.subtitle}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
        <h2 style="color: #1f2937; margin-bottom: 20px; text-align: center;">${template.title}</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
          ${template.greeting}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" 
             style="background: linear-gradient(135deg, #475569 0%, #ea580c 100%); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: 600;
                    display: inline-block;
                    box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3);">
            ${template.buttonText}
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
          ${template.linkText}<br>
          <span style="color: #ea580c; word-break: break-all;">${url}</span>
        </p>
      </div>
      
      <div style="text-align: center; color: #9ca3af; font-size: 12px;">
        <p>${template.footer1}</p>
        <p>${template.footer2}</p>
      </div>
    </div>
  `
}

export async function sendVerificationEmail(email: string, token: string, locale: 'zh' | 'en' = 'en') {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/${locale}/auth/verify-email?token=${token}`
  const template = emailTemplates.verification[locale]
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'ITSAI Agent <onboarding@resend.dev>',
      to: [email],
      subject: template.subject,
      html: generateEmailTemplate(verificationUrl, template),
    })

    if (error) {
      console.error('发送邮件失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('发送邮件异常:', error)
    return { success: false, error: '发送邮件失败' }
  }
}

export async function sendPasswordResetEmail(email: string, token: string, locale: 'zh' | 'en' = 'en') {
  const resetUrl = `${process.env.NEXTAUTH_URL}/${locale}/auth/reset-password?token=${token}`
  const template = emailTemplates.passwordReset[locale]
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'ITSAI Agent <onboarding@resend.dev>',
      to: [email],
      subject: template.subject,
      html: generateEmailTemplate(resetUrl, template),
    })

    if (error) {
      console.error('发送邮件失败:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('发送邮件异常:', error)
    return { success: false, error: '发送邮件失败' }
  }
} 