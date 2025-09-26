"use client"

import { useLocale, useTranslations } from 'next-intl'

interface StructuredDataProps {
  type?: 'website' | 'organization' | 'service' | 'faq' | 'software'
  data?: any
}

export function StructuredData({ type = 'website', data }: StructuredDataProps) {
  const locale = useLocale()
  const t = useTranslations()
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itsaiagent.com'
  
  const getWebsiteStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": t('metadata.title'),
    "description": t('metadata.description'),
    "url": `${baseUrl}/${locale}`,
    "inLanguage": locale === 'zh' ? 'zh-CN' : 'en-US',
    "publisher": {
      "@type": "Organization",
      "name": "ITSAI Agent",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`,
        "width": 200,
        "height": 200
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/${locale}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  })

  const getOrganizationStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ITSAI Agent",
    "description": t('metadata.description'),
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.png`,
      "width": 200,
      "height": 200
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "app@itusi.cn",
      "availableLanguage": ["Chinese", "English"]
    },
    "sameAs": [
      "https://twitter.com/zyailive",
      "https://github.com/ItusiAI"
    ],
    "foundingDate": "2025",
    "numberOfEmployees": "1-10",
    "industry": "Artificial Intelligence",
    "keywords": locale === 'zh'
      ? "声音AI智能体,音频识别,音频总结,AI播客,智能配音,语音识别,声音生成"
      : "Voice AI Agent,Audio Recognition,Audio Summarization,AI Podcast,Intelligent Voice-over,Speech Recognition,Voice Generation"
  })

  const getServiceStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": t('metadata.title'),
    "description": t('metadata.description'),
    "provider": {
      "@type": "Organization",
      "name": "ITSAI Agent",
      "url": baseUrl
    },
    "serviceType": locale === 'zh' ? "声音AI智能体服务" : "Voice AI Agent Services",
    "areaServed": "Worldwide",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": locale === 'zh' ? "声音AI智能体服务目录" : "Voice AI Agent Service Catalog",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": locale === 'zh' ? "音频识别智能体" : "Audio Recognition Agent",
            "description": locale === 'zh'
              ? "高精度音频识别服务，支持中文方言和100+种语言，提供精确的语音转文字功能"
              : "High-precision audio recognition service supporting Chinese dialects and 100+ languages with accurate speech-to-text conversion"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": locale === 'zh' ? "音频总结智能体" : "Audio Summarization Agent",
            "description": locale === 'zh'
              ? "智能音频内容总结服务，自动提取关键信息，生成结构化摘要"
              : "Intelligent audio content summarization service that automatically extracts key information and generates structured summaries"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": locale === 'zh' ? "AI播客智能体" : "AI Podcast Agent",
            "description": locale === 'zh'
              ? "专业的播客制作智能体，自动生成脚本、主持对话，配备真人级语音合成"
              : "Professional podcast production agent that automatically generates scripts, hosts conversations, and features human-like voice synthesis"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": locale === 'zh' ? "AI配音智能体" : "AI Voice-over Agent",
            "description": locale === 'zh'
              ? "智能配音服务，输入文本即可生成媲美真人的专业配音，支持多种音色和情感表达"
              : "Intelligent voice-over service that generates professional voice-overs comparable to humans from text input, supporting multiple voice tones and emotional expressions"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": locale === 'zh' ? "声音生成智能体" : "Voice Generation Agent",
            "description": locale === 'zh'
              ? "高质量AI语音合成服务，支持多种音色和情感表达，为内容创作提供专业级声音解决方案"
              : "High-quality AI voice synthesis service supporting multiple voice tones and emotional expressions, providing professional-grade voice solutions for content creation"
          }
        }
      ]
    }
  })

  const getSoftwareStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ITSAI Agent",
    "description": t('metadata.description'),
    "url": baseUrl,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "ITSAI Agent",
      "url": baseUrl
    },
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": locale === 'zh' ? 'zh-CN' : 'en-US',
    "featureList": locale === 'zh'
      ? ["音频识别", "音频总结", "AI播客制作", "智能配音", "声音生成"]
      : ["Audio Recognition", "Audio Summarization", "AI Podcast Production", "Intelligent Voice-over", "Voice Generation"]
  })

  const getFAQStructuredData = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t('faq.usage.howToStart.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.usage.howToStart.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.usage.voiceQuality.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.usage.voiceQuality.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.usage.contentOwnership.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.usage.contentOwnership.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.usage.dataPrivacy.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.usage.dataPrivacy.answer')
        }
      }
    ]
  })

  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return getOrganizationStructuredData()
      case 'service':
        return getServiceStructuredData()
      case 'software':
        return getSoftwareStructuredData()
      case 'faq':
        return getFAQStructuredData()
      default:
        return getWebsiteStructuredData()
    }
  }

  const structuredData = data || getStructuredData()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}
