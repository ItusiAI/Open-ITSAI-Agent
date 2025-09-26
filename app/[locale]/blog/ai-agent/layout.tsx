import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

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

  const isZh = locale === 'zh'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://itsaiagent.com'
  const blogImage = `${baseUrl}/images/aiagenthaibao.png`
  
  return {
    title: isZh
      ? '什么是AI智能体？深度解析声音AI智能体 - ITSAI Agent'
      : 'What is an AI Agent? Deep Dive into Voice AI Agents - ITSAI Agent',
    description: isZh
      ? '深入了解AI智能体的定义、工作原理和应用场景，重点解析声音AI智能体在音频识别、内容总结、声音生成等领域的应用。'
      : 'Understand the definition, working principles, and application scenarios of AI agents, with focus on voice AI agents in audio recognition, content summarization, and voice generation.',
    keywords: isZh
      ? '什么是AI智能体,AI智能体定义,声音AI智能体,音频识别,音频总结,声音生成,AI播客,人工智能,智能体工作原理,ITSAI Agent'
      : 'What is AI Agent,AI Agent Definition,Voice AI Agent,Audio Recognition,Audio Summarization,Voice Generation,AI Podcast,Artificial Intelligence,Agent Working Principles,ITSAI Agent',
    authors: [{ name: 'ITSAI Agent' }],
    creator: 'ITSAI Agent',
    publisher: 'ITSAI Agent',
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
    openGraph: {
      title: isZh
        ? '什么是AI智能体？深度解析声音AI智能体'
        : 'What is an AI Agent? Deep Dive into Voice AI Agents',
      description: isZh
        ? '深入了解AI智能体的定义、工作原理和应用场景，重点解析声音AI智能体在音频识别、内容总结、声音生成等领域的应用。'
        : 'Understand the definition, working principles, and application scenarios of AI agents, with focus on voice AI agents in audio recognition, content summarization, and voice generation.',
      url: `${baseUrl}/${locale}/blog/ai-agent`,
      siteName: 'ITSAI Agent',
      locale: locale,
      type: 'article',
      publishedTime: '2025-07-01T00:00:00.000Z',
      authors: ['ITSAI Agent'],
      tags: isZh
        ? ['什么是AI智能体', 'AI智能体定义', '声音AI智能体', '音频识别', '音频总结']
        : ['What is AI Agent', 'AI Agent Definition', 'Voice AI Agent', 'Audio Recognition', 'Audio Summarization'],
      images: [
        {
          url: blogImage,
          width: 1200,
          height: 630,
          alt: isZh ? 'ITSAI Agent - 什么是AI智能体？' : 'ITSAI Agent - What is an AI Agent?',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh
        ? '什么是AI智能体？深度解析声音AI智能体'
        : 'What is an AI Agent? Deep Dive into Voice AI Agents',
      description: isZh
        ? '深入了解AI智能体的定义、工作原理和应用场景，重点解析声音AI智能体在音频识别、内容总结、声音生成等领域的应用。'
        : 'Understand the definition, working principles, and application scenarios of AI agents, with focus on voice AI agents in audio recognition, content summarization, and voice generation.',
      creator: 'ITSAI Agent',
      images: [blogImage],
    },
    alternates: {
      canonical: `/blog/ai-agent`,
      languages: {
        'zh': '/zh/blog/ai-agent',
        'en': '/en/blog/ai-agent',
      },
    },
  }
}

export default function AiAgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}