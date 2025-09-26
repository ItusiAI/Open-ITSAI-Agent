"use client"

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronRight, Home } from 'lucide-react'
import { seoConfig } from '@/lib/seo-config'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const locale = useLocale()
  const t = useTranslations('navbar')
  
  // 添加首页作为第一项
  const allItems: BreadcrumbItem[] = [
    {
      label: t('home'),
      href: `/${locale}`,
    },
    ...items
  ]

  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && { "item": `${seoConfig.baseUrl}${item.href}` })
    }))
  }

  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* 面包屑导航 */}
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
      >
        <ol className="flex items-center space-x-2">
          {allItems.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
              )}
              
              {item.current || !item.href ? (
                <span 
                  className="font-medium text-foreground"
                  aria-current={item.current ? "page" : undefined}
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {index === 0 && <Home className="h-4 w-4 mr-1 inline" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

// 预定义的面包屑配置
export const breadcrumbConfigs = {
  blog: (locale: string, t: any) => [
    { label: t('blog'), href: `/${locale}/blog`, current: true }
  ],
  
  blogPost: (locale: string, t: any, postTitle: string) => [
    { label: t('blog'), href: `/${locale}/blog` },
    { label: postTitle, current: true }
  ],
  
  terms: (locale: string, t: any) => [
    { label: t('legal.terms'), current: true }
  ],
  
  privacy: (locale: string, t: any) => [
    { label: t('legal.privacy'), current: true }
  ],
  
  cookies: (locale: string, t: any) => [
    { label: t('legal.cookies'), current: true }
  ],
  
  profile: (locale: string, t: any) => [
    { label: t('profile.title'), current: true }
  ],
  
  dashboard: (locale: string, t: any) => [
    { label: t('dashboard.title'), current: true }
  ]
}
