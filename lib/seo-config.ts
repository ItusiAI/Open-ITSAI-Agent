export const seoConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://itsaiagent.com',
  siteName: 'ITSAI Agent',
  defaultLocale: 'zh',
  locales: ['zh', 'en'],
  
  // 默认SEO设置
  defaultSEO: {
    zh: {
      title: 'ITSAI Agent - 新一代声音AI智能体平台，重新定义声音创作体验',
      description: 'ITSAI Agent集成前沿AI技术的声音智能体生态，提供音频识别、智能总结、声音生成、AI播客等专业服务。从声音理解到内容创作，一站式解决您的声音AI需求。',
      keywords: '新一代声音AI智能体,声音创作体验,音频识别,智能总结,声音生成,AI播客,语音识别,语音合成,音频处理,声音创作,AI语音,智能体平台,ITSAI,人工智能,声音场景,多语言识别,全球语言支持,声音AI生态',
    },
    en: {
      title: 'ITSAI Agent - Next-Generation Voice AI Agent Platform, Redefining Audio Creation Experience',
      description: 'ITSAI Agent is an advanced AI-powered voice agent ecosystem featuring audio recognition, intelligent summarization, voice synthesis, and AI podcasting. From audio understanding to content creation, your all-in-one voice AI solution.',
      keywords: 'Next-Generation Voice AI Agent,Audio Creation Experience,Audio Recognition,Intelligent Summarization,Voice Generation,AI Podcast,Speech Recognition,Voice Synthesis,Audio Processing,Voice Creation,AI Voice,Agent Platform,ITSAI,Artificial Intelligence,Voice Scenarios,Multilingual Recognition,Global Language Support,Voice AI Ecosystem',
    }
  },

  // 页面特定SEO设置
  pages: {
    agent: {
      zh: {
        title: '声音AI智能体 - ITSAI Agent | 专业声音AI服务平台',
        description: '体验ITSAI Agent专业的声音AI智能体服务：音频识别总结、AI播客制作、智能配音生成。专注声音场景的AI解决方案，重新定义声音创作体验。',
        keywords: '声音AI智能体,音频识别,音频总结,AI播客,智能配音,语音识别,声音生成,音频处理,声音创作,语音AI,声音场景,音频AI',
      },
      en: {
        title: 'Voice AI Agent - ITSAI Agent | Professional Voice AI Service Platform',
        description: 'Experience ITSAI Agent\'s professional voice AI agent services: audio recognition & summarization, AI podcast production, intelligent voice generation. AI solutions focused on voice scenarios, redefining audio creation experience.',
        keywords: 'Voice AI Agent,Audio Recognition,Audio Summarization,AI Podcast,Intelligent Voice-over,Speech Recognition,Voice Generation,Audio Processing,Voice Creation,Voice AI,Audio Scenarios,Audio AI',
      }
    },
    blog: {
      zh: {
        title: 'ITSAI Agent 博客 - 新一代声音AI智能体技术分享',
        description: '探索新一代声音AI智能体的最新动态和技术分享，深入了解音频识别、智能总结、声音生成、AI播客等声音创作场景的技术解析。',
        keywords: '新一代声音AI智能体博客,声音创作技术,音频识别技术,智能总结,声音生成,AI播客制作,语音技术,音频处理,声音AI应用,声音创作体验',
      },
      en: {
        title: 'ITSAI Agent Blog - Next-Generation Voice AI Agent Technology Insights',
        description: 'Explore the latest next-generation voice AI agent technology trends and insights, learn about audio recognition, intelligent summarization, voice generation, AI podcasts and more audio creation scenarios.',
        keywords: 'Next-Generation Voice AI Agent Blog,Audio Creation Technology,Audio Recognition Technology,Intelligent Summarization,Voice Generation,AI Podcast Production,Voice Technology,Audio Processing,Voice AI Applications,Audio Creation Experience',
      }
    },
    terms: {
      zh: {
        title: '服务条款 - ITSAI Agent',
        description: '查看ITSAI Agent声音AI智能体服务的使用条款，了解音频识别、声音生成等服务的使用规则、用户权利和责任。',
        keywords: '服务条款,使用协议,用户协议,声音AI服务条款,音频处理服务规则,智能体服务协议',
      },
      en: {
        title: 'Terms of Service - ITSAI Agent',
        description: 'View ITSAI Agent\'s Terms of Service for voice AI agent services, understanding usage rules, user rights and responsibilities for audio recognition, voice generation and other services.',
        keywords: 'Terms of Service,User Agreement,Service Agreement,Voice AI Service Terms,Audio Processing Service Rules,Agent Service Agreement',
      }
    },
    privacy: {
      zh: {
        title: '隐私政策 - ITSAI Agent',
        description: '了解ITSAI Agent如何收集、使用和保护您的音频数据和个人信息，保障您的隐私权益。',
        keywords: '隐私政策,数据保护,个人信息,音频数据安全,隐私权,声音数据保护',
      },
      en: {
        title: 'Privacy Policy - ITSAI Agent',
        description: 'Learn how ITSAI Agent collects, uses and protects your audio data and personal information to safeguard your privacy rights.',
        keywords: 'Privacy Policy,Data Protection,Personal Information,Audio Data Security,Privacy Rights,Voice Data Protection',
      }
    },
    cookies: {
      zh: {
        title: 'Cookie政策 - ITSAI Agent',
        description: '了解ITSAI Agent如何使用Cookie和相关技术来优化声音AI智能体服务体验。',
        keywords: 'Cookie政策,网站Cookie,用户体验,数据收集,声音AI服务优化,网站分析',
      },
      en: {
        title: 'Cookie Policy - ITSAI Agent',
        description: 'Learn how ITSAI Agent uses cookies and related technologies to optimize voice AI agent service experience.',
        keywords: 'Cookie Policy,Website Cookies,User Experience,Data Collection,Voice AI Service Optimization,Website Analytics',
      }
    },

    'ai-agent-types': {
      zh: {
        title: 'ITSAI Agent提供哪些声音AI智能体？ - 新一代声音AI智能体类型详解',
        description: '深入了解新一代ITSAI Agent平台提供的四大声音AI智能体类型：音频识别、智能总结、声音生成、AI播客。重新定义声音创作体验，提供完整的声音AI解决方案。',
        keywords: '新一代声音AI智能体,音频识别智能体,智能总结智能体,声音生成智能体,AI播客智能体,语音识别,音频处理,声音创作,AI语音,智能体类型,多语言识别,全球语言支持,声音创作体验',
      },
      en: {
        title: 'What Voice AI Agents Does ITSAI Agent Provide? - Next-Generation Voice AI Agent Types Explained',
        description: 'Explore the four major next-generation voice AI agent types provided by ITSAI Agent platform: audio recognition, intelligent summarization, voice generation, and AI podcasts. Redefining audio creation experience with complete voice AI solutions.',
        keywords: 'Next-Generation Voice AI Agents,Audio Recognition Agent,Intelligent Summary Agent,Voice Generation Agent,AI Podcast Agent,Speech Recognition,Audio Processing,Voice Creation,AI Voice,Agent Types,Multilingual Recognition,Global Language Support,Audio Creation Experience',
      }
    },
    'ai-agent': {
      zh: {
        title: '什么是AI智能体？深度解析新一代声音AI智能体 - ITSAI Agent',
        description: '深入了解AI智能体的定义、工作原理和应用场景，重点解析新一代声音AI智能体在音频识别、智能总结、声音生成等领域如何重新定义声音创作体验。',
        keywords: '什么是AI智能体,AI智能体定义,新一代声音AI智能体,音频识别,智能总结,声音生成,AI播客,人工智能,智能体工作原理,ITSAI Agent,声音创作体验',
      },
      en: {
        title: 'What is an AI Agent? Deep Dive into Next-Generation Voice AI Agents - ITSAI Agent',
        description: 'Understand the definition, working principles, and application scenarios of AI agents, with focus on next-generation voice AI agents in audio recognition, intelligent summarization, and voice generation that redefine audio creation experience.',
        keywords: 'What is AI Agent,AI Agent Definition,Next-Generation Voice AI Agent,Audio Recognition,Intelligent Summarization,Voice Generation,AI Podcast,Artificial Intelligence,Agent Working Principles,ITSAI Agent,Audio Creation Experience',
      }
    },
    'audio-summary-how-it-works': {
      zh: {
        title: '音频总结智能体是如何工作的？深度解析新一代AI音频处理技术 - ITSAI Agent',
        description: '深入了解新一代音频总结智能体的工作原理，从音频识别到内容理解，再到结构化总结生成的完整技术流程。探索AI如何重新定义声音创作体验，将长音频内容转化为精华摘要。',
        keywords: '新一代音频总结智能体,AI音频处理,音频识别技术,智能总结,语音转文字,会议记录,播客总结,音频分析,智能摘要,ITSAI Agent,声音创作体验',
      },
      en: {
        title: 'How Does Audio Summary Agent Work? Deep Dive into Next-Generation AI Audio Processing Technology - ITSAI Agent',
        description: 'Understand how next-generation audio summary agents work, from audio recognition to content understanding, to structured summary generation. Explore how AI redefines audio creation experience by transforming long audio content into essential highlights.',
        keywords: 'Next-Generation Audio Summary Agent,AI Audio Processing,Audio Recognition Technology,Intelligent Summarization,Speech to Text,Meeting Notes,Podcast Summary,Audio Analysis,Smart Summary,ITSAI Agent,Audio Creation Experience',
      }
    }
  },

  // 社交媒体设置
  social: {
    twitter: '@itusi2024',
    email: 'app@itusi.cn',
  },

  // 验证码设置
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    bing: process.env.BING_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    baidu: process.env.BAIDU_SITE_VERIFICATION,
  },

  // 分析工具设置
  analytics: {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_ID,
    baiduAnalytics: process.env.NEXT_PUBLIC_BAIDU_ANALYTICS_ID,
  },

  // 图片设置
  images: {
    logo: '/logo.png',
    ogImage: '/logo.png',
    favicon: '/favicon.ico',
  },

  // 结构化数据设置
  organization: {
    name: 'ITSAI Agent',
    foundingDate: '2024',
    industry: 'Artificial Intelligence',
    numberOfEmployees: '1-10',
    contactEmail: 'app@itusi.cn',
    url: 'https://itsaiagent.com',
    sameAs: [
      'https://twitter.com/itusi2024'
    ]
  }
}

// 获取页面SEO配置的辅助函数
export function getPageSEO(page: string, locale: string) {
  const pageSEO = seoConfig.pages[page as keyof typeof seoConfig.pages]
  const defaultSEO = seoConfig.defaultSEO[locale as keyof typeof seoConfig.defaultSEO]
  
  if (pageSEO && pageSEO[locale as keyof typeof pageSEO]) {
    return pageSEO[locale as keyof typeof pageSEO]
  }
  
  return defaultSEO
}

// 生成完整URL的辅助函数
export function getFullUrl(path: string, locale?: string) {
  const localePrefix = locale ? `/${locale}` : ''
  return `${seoConfig.baseUrl}${localePrefix}${path}`
}

// 生成多语言链接的辅助函数
export function getAlternateLinks(path: string) {
  return seoConfig.locales.reduce((acc, locale) => {
    acc[locale] = getFullUrl(path, locale)
    return acc
  }, {} as Record<string, string>)
}
