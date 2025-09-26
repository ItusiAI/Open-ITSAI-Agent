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
  const agentImage = `${baseUrl}/images/bloghaibao.png` // 使用博客海报图作为默认图片

  return {
    title: isZh
      ? '声音AI智能体 - ITSAI Agent | 专业声音AI服务平台'
      : 'Voice AI Agent - ITSAI Agent | Professional Voice AI Service Platform',
    description: isZh
      ? '体验ITSAI Agent专业的声音AI智能体服务：音频识别总结、AI播客制作、智能配音生成。专注声音场景的AI解决方案，重新定义声音创作体验。'
      : 'Experience ITSAI Agent\'s professional voice AI agent services: audio recognition & summarization, AI podcast production, intelligent voice generation. AI solutions focused on voice scenarios, redefining audio creation experience.',
    keywords: isZh
      ? '声音AI智能体, 音频识别, 音频总结, AI播客, 智能配音, 语音识别, 声音生成, 音频处理, 声音创作, 语音AI, 声音场景, 音频AI'
      : 'Voice AI Agent, Audio Recognition, Audio Summarization, AI Podcast, Intelligent Voice-over, Speech Recognition, Voice Generation, Audio Processing, Voice Creation, Voice AI, Audio Scenarios, Audio AI',
    openGraph: {
      title: isZh
        ? '声音AI智能体 - ITSAI Agent | 专业声音AI服务'
        : 'Voice AI Agent - ITSAI Agent | Professional Voice AI Services',
      description: isZh
        ? '专业的声音AI智能体平台，提供音频识别总结、AI播客制作、智能配音等声音场景解决方案，重新定义声音创作体验。'
        : 'Professional voice AI agent platform providing audio recognition & summarization, AI podcast production, intelligent voice-over and other voice scenario solutions, redefining audio creation experience.',
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}/agent`,
      siteName: 'ITSAI Agent',
      images: [
        {
          url: agentImage,
          width: 1200,
          height: 630,
          alt: isZh
            ? 'ITSAI Agent 声音AI智能体 - 专业声音AI服务平台'
            : 'ITSAI Agent Voice AI Agent - Professional Voice AI Service Platform',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh ? 'ITSAI Agent 声音AI智能体' : 'ITSAI Agent Voice AI Agent',
      description: isZh
        ? '专业的声音AI智能体服务：音频识别总结、AI播客、智能配音'
        : 'Professional voice AI agent services: audio recognition & summarization, AI podcast, intelligent voice-over',
      creator: 'ITSAI Agent',
      images: [agentImage],
    },
    alternates: {
      canonical: `/agent`,
      languages: {
        'zh': '/zh/agent',
        'en': '/en/agent',
      },
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
  }
}

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
