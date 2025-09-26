"use client"

import { useLocale } from 'next-intl'
import { StructuredData } from './structured-data'
import { Breadcrumb } from './breadcrumb'
import { seoConfig, getPageSEO } from '@/lib/seo-config'

interface PageSEOProps {
  page?: string
  title?: string
  description?: string
  keywords?: string
  breadcrumbItems?: Array<{
    label: string
    href?: string
    current?: boolean
  }>
  structuredDataTypes?: Array<'website' | 'organization' | 'service' | 'faq'>
  noindex?: boolean
  canonical?: string
}

export function PageSEO({
  page = 'home',
  title,
  description,
  keywords,
  breadcrumbItems = [],
  structuredDataTypes = ['website', 'organization'],
  noindex = false,
  canonical
}: PageSEOProps) {
  const locale = useLocale() as 'zh' | 'en'
  
  // 获取页面SEO配置
  const pageSEO = getPageSEO(page, locale)
  
  // 使用传入的值或默认值
  const seoTitle = title || pageSEO.title
  const seoDescription = description || pageSEO.description
  const seoKeywords = keywords || pageSEO.keywords
  
  const baseUrl = seoConfig.baseUrl
  const currentUrl = canonical || `${baseUrl}/${locale}`

  return (
    <>
      {/* 页面标题和描述已经在layout中处理 */}
      
      {/* 结构化数据 */}
      {structuredDataTypes.map((type) => (
        <StructuredData key={type} type={type} />
      ))}
      
      {/* 面包屑导航 */}
      {breadcrumbItems.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}
      
      {/* 额外的SEO元标签 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": seoTitle,
            "description": seoDescription,
            "url": currentUrl,
            "inLanguage": locale === 'zh' ? 'zh-CN' : 'en-US',
            "isPartOf": {
              "@type": "WebSite",
              "name": seoConfig.siteName,
              "url": baseUrl
            },
            "dateModified": "2024-01-01T00:00:00.000Z",
            "breadcrumb": breadcrumbItems.length > 0 ? {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "首页",
                  "item": `${baseUrl}/${locale}`
                },
                ...breadcrumbItems.map((item, index) => ({
                  "@type": "ListItem",
                  "position": index + 2,
                  "name": item.label,
                  ...(item.href && { "item": `${baseUrl}${item.href}` })
                }))
              ]
            } : undefined
          })
        }}
      />
    </>
  )
}
