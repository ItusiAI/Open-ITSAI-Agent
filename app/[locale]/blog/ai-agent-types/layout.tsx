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
  const blogImage = `${baseUrl}/images/agenthaibao.png`

  return {
    title: isZh
      ? 'ITSAI Agent提供哪些声音AI智能体？ - 声音AI智能体类型详解'
      : 'What Voice AI Agents Does ITSAI Agent Provide? - Voice AI Agent Types Explained',
    description: isZh
      ? '深入了解ITSAI Agent平台提供的四大声音AI智能体类型：音频识别、音频总结、声音生成、AI播客。从声音理解到声音创作，提供完整的声音AI解决方案。'
      : 'Explore the four major voice AI agent types provided by ITSAI Agent platform: audio recognition, audio summarization, voice generation, and AI podcasts. From voice understanding to voice creation, providing complete voice AI solutions.',
    keywords: isZh
      ? '声音AI智能体,音频识别智能体,音频总结智能体,声音生成智能体,AI播客智能体,语音识别,音频处理,声音创作,AI语音,智能体类型,多语言识别,全球语言支持'
      : 'Voice AI Agents,Audio Recognition Agent,Audio Summary Agent,Voice Generation Agent,AI Podcast Agent,Speech Recognition,Audio Processing,Voice Creation,AI Voice,Agent Types,Multilingual Recognition,Global Language Support',
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
        ? 'ITSAI Agent提供哪些声音AI智能体？'
        : 'What Voice AI Agents Does ITSAI Agent Provide?',
      description: isZh
        ? '深入了解ITSAI Agent平台提供的四大声音AI智能体类型：音频识别、音频总结、声音生成、AI播客。从声音理解到声音创作，提供完整的声音AI解决方案。'
        : 'Explore the four major voice AI agent types provided by ITSAI Agent platform: audio recognition, audio summarization, voice generation, and AI podcasts. From voice understanding to voice creation, providing complete voice AI solutions.',
      url: `${baseUrl}/${locale}/blog/ai-agent-types`,
      siteName: 'ITSAI Agent',
      locale: locale,
      type: 'article',
      publishedTime: '2025-07-01T00:00:00.000Z',
      authors: ['ITSAI Agent'],
      tags: isZh
        ? ['声音AI智能体', '音频识别', '音频总结', '声音生成', 'AI播客']
        : ['Voice AI Agents', 'Audio Recognition', 'Audio Summarization', 'Voice Generation', 'AI Podcast'],
      images: [
        {
          url: blogImage,
          width: 1200,
          height: 630,
          alt: isZh ? 'ITSAI Agent 声音AI智能体类型详解' : 'ITSAI Agent Voice AI Agent Types Explained',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh
        ? 'ITSAI Agent提供哪些声音AI智能体？'
        : 'What Voice AI Agents Does ITSAI Agent Provide?',
      description: isZh
        ? '深入了解ITSAI Agent平台提供的四大声音AI智能体类型：音频识别、音频总结、声音生成、AI播客。从声音理解到声音创作，提供完整的声音AI解决方案。'
        : 'Explore the four major voice AI agent types provided by ITSAI Agent platform: audio recognition, audio summarization, voice generation, and AI podcasts. From voice understanding to voice creation, providing complete voice AI solutions.',
      creator: 'ITSAI Agent',
      images: [blogImage],
    },
    alternates: {
      canonical: `/blog/ai-agent-types`,
      languages: {
        'zh': '/zh/blog/ai-agent-types',
        'en': '/en/blog/ai-agent-types',
      },
    },
  }
}

export default function AiAgentTypesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}