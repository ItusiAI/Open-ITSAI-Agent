"use client"

import Head from 'next/head'
import { useLocale, useTranslations } from 'next-intl'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  noindex?: boolean
  ogImage?: string
  ogType?: string
  twitterCard?: string
  structuredData?: any
}

export function SEOHead({
  title,
  description,
  keywords,
  canonical,
  noindex = false,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData
}: SEOHeadProps) {
  const locale = useLocale()
  const t = useTranslations('metadata')
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itsaiagent.com'
  const currentUrl = canonical || `${baseUrl}/${locale}`
  
  const seoTitle = title || t('title')
  const seoDescription = description || t('description')
  const seoKeywords = keywords || (locale === 'zh' 
    ? 'AI智能体,人工智能,播客制作,配音生成,视频创作,AI服务,智能体平台,内容创作,语音合成,视频制作'
    : 'AI Agent,Artificial Intelligence,Podcast Production,Voice Generation,Video Creation,AI Services,Agent Platform,Content Creation,Voice Synthesis,Video Production')
  const seoImage = ogImage || `${baseUrl}/logo.png`

  return (
    <Head>
      {/* 基础SEO标签 */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content="ITSAI Team" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* 语言和地区 */}
      <meta httpEquiv="content-language" content={locale === 'zh' ? 'zh-CN' : 'en-US'} />
      <meta name="geo.region" content={locale === 'zh' ? 'CN' : 'US'} />
      
      {/* 规范链接 */}
      <link rel="canonical" href={currentUrl} />
      
      {/* 多语言链接 */}
      <link rel="alternate" hrefLang="zh" href={`${baseUrl}/zh`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}/en`} />
      
      {/* Open Graph 标签 */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="ITSAI Agent" />
      <meta property="og:image" content={seoImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seoTitle} />
      <meta property="og:locale" content={locale === 'zh' ? 'zh_CN' : 'en_US'} />
      
      {/* Twitter Card 标签 */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:creator" content="@zyailive" />
      <meta name="twitter:site" content="@zyailive" />
      
      {/* 移动端优化 */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="email=no" />
      <meta name="format-detection" content="address=no" />
      
      {/* PWA 相关 */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="ITSAI Agent" />
      
      {/* 图标 */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />
      
      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
      
      {/* DNS 预解析 */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* 结构化数据 */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  )
}
