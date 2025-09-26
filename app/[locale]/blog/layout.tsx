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
  const blogImage = `${baseUrl}/images/bloghaibao.png`

  return {
    title: isZh ? 'ITSAI Agent 博客 - 声音AI智能体技术分享' : 'ITSAI Agent Blog - Voice AI Agent Technology Insights',
    description: isZh
      ? '探索声音AI智能体的最新技术动态，了解音频识别、音频总结、声音生成、AI播客等声音场景的前沿应用。获取专业声音AI智能体服务支持。'
      : 'Explore the latest voice AI agent technology trends, learn about cutting-edge applications in audio recognition, audio summarization, voice generation, and AI podcasts. Get professional voice AI agent services.',
    keywords: isZh
      ? '声音AI智能体, 音频识别, 音频总结, 声音生成, AI播客, 技术博客, 语音技术'
      : 'Voice AI Agent, Audio Recognition, Audio Summarization, Voice Generation, AI Podcast, Tech Blog, Voice Technology',
    openGraph: {
      title: isZh ? 'ITSAI Agent 博客 - 声音AI智能体技术分享' : 'ITSAI Agent Blog - Voice AI Agent Technology',
      description: isZh
        ? '探索声音AI智能体的无限可能，获取最新声音技术动态和专业服务支持'
        : 'Explore the limitless possibilities of voice AI agents, get latest voice tech updates and professional service support',
      type: 'website',
      locale: locale,
      url: `${baseUrl}/${locale}/blog`,
      siteName: 'ITSAI Agent',
      images: [
        {
          url: blogImage,
          width: 1200,
          height: 630,
          alt: isZh ? 'ITSAI Agent 博客 - 声音AI智能体技术分享' : 'ITSAI Agent Blog - Voice AI Agent Technology',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh ? 'ITSAI Agent 博客' : 'ITSAI Agent Blog',
      description: isZh
        ? '探索声音AI智能体的最新技术动态和应用案例'
        : 'Explore the latest voice AI agent technology trends and use cases',
      creator: 'ITSAI Agent',
      images: [blogImage],
    },
    alternates: {
      canonical: `/blog`,
      languages: {
        'zh': '/zh/blog',
        'en': '/en/blog',
      },
    },
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 