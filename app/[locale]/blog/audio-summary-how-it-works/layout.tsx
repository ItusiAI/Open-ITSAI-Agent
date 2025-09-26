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
  const blogImage = `${baseUrl}/images/audiosummaryhaibao.png`

  return {
    title: isZh 
      ? '音频总结智能体是如何工作的？深度解析AI音频处理技术 - ITSAI Agent'
      : 'How Does Audio Summary Agent Work? Deep Dive into AI Audio Processing Technology - ITSAI Agent',
    description: isZh
      ? '深入了解音频总结智能体的工作原理，从音频识别到内容理解，再到结构化总结生成的完整技术流程。探索AI如何将长音频内容转化为精华摘要。'
      : 'Understand how audio summary agents work, from audio recognition to content understanding, to structured summary generation. Explore how AI transforms long audio content into essential highlights.',
    keywords: isZh
      ? '音频总结智能体,AI音频处理,音频识别技术,内容总结,语音转文字,会议记录,播客总结,音频分析,智能摘要,ITSAI Agent'
      : 'Audio Summary Agent,AI Audio Processing,Audio Recognition Technology,Content Summarization,Speech to Text,Meeting Notes,Podcast Summary,Audio Analysis,Smart Summary,ITSAI Agent',
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
        ? '音频总结智能体是如何工作的？深度解析AI音频处理技术'
        : 'How Does Audio Summary Agent Work? Deep Dive into AI Audio Processing Technology',
      description: isZh
        ? '深入了解音频总结智能体的工作原理，从音频识别到内容理解，再到结构化总结生成的完整技术流程。探索AI如何将长音频内容转化为精华摘要。'
        : 'Understand how audio summary agents work, from audio recognition to content understanding, to structured summary generation. Explore how AI transforms long audio content into essential highlights.',
      url: `${baseUrl}/${locale}/blog/audio-summary-how-it-works`,
      siteName: 'ITSAI Agent',
      locale: locale,
      type: 'article',
      publishedTime: '2025-07-20T00:00:00.000Z',
      authors: ['ITSAI Agent'],
      tags: isZh
        ? ['音频总结智能体', 'AI音频处理', '音频识别技术', '内容总结', '智能摘要']
        : ['Audio Summary Agent', 'AI Audio Processing', 'Audio Recognition Technology', 'Content Summarization', 'Smart Summary'],
      images: [
        {
          url: blogImage,
          width: 1200,
          height: 630,
          alt: isZh ? 'ITSAI Agent - 音频总结智能体是如何工作的？' : 'ITSAI Agent - How Does Audio Summary Agent Work?',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh 
        ? '音频总结智能体是如何工作的？深度解析AI音频处理技术'
        : 'How Does Audio Summary Agent Work? Deep Dive into AI Audio Processing Technology',
      description: isZh
        ? '深入了解音频总结智能体的工作原理，从音频识别到内容理解，再到结构化总结生成的完整技术流程。探索AI如何将长音频内容转化为精华摘要。'
        : 'Understand how audio summary agents work, from audio recognition to content understanding, to structured summary generation. Explore how AI transforms long audio content into essential highlights.',
      creator: 'ITSAI Agent',
      images: [blogImage],
    },
    alternates: {
      canonical: `/blog/audio-summary-how-it-works`,
      languages: {
        'zh': '/zh/blog/audio-summary-how-it-works',
        'en': '/en/blog/audio-summary-how-it-works',
      },
    },
  }
}

export default function AudioSummaryHowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
