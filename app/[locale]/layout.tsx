import type React from "react"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const locales = ['en', 'zh']

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  // 验证locale是否有效
  if (!locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'metadata' })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itsaiagent.com'
  const currentUrl = `${baseUrl}/${locale}`

  return {
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`
    },
    description: t('description'),
    keywords: locale === 'zh'
      ? 'AI智能体,人工智能,播客制作,配音生成,视频创作,AI服务,智能体平台,内容创作,语音合成,视频制作'
      : 'AI Agent,Artificial Intelligence,Podcast Production,Voice Generation,Video Creation,AI Services,Agent Platform,Content Creation,Voice Synthesis,Video Production',
    authors: [{ name: 'ITSAI Team' }],
    creator: 'ITSAI Agent',
    publisher: 'ITSAI Agent',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    manifest: '/manifest.json',
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: currentUrl,
      languages: {
        'zh': `${baseUrl}/zh`,
        'en': `${baseUrl}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: currentUrl,
      title: t('title'),
      description: t('description'),
      siteName: 'ITSAI Agent',
      images: [
        {
          url: `${baseUrl}/images/homehaibao.png`,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      creator: '@itusi2024',
      images: [`${baseUrl}/homehaibao.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  // 在Next.js 15中，params需要被await
  const { locale } = await params
  
  // 验证locale是否有效
  if (!locales.includes(locale)) {
    notFound()
  }

  // 使用getMessages从i18n配置获取翻译，传递locale参数
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div data-locale={locale}>
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
