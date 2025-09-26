"use client"

import { useParams } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, FileText, Brain, Zap, Clock, Users, Volume2, MessageSquare } from 'lucide-react'

export function AudioSummaryHowItWorksContent() {
  const params = useParams()
  const isZh = params.locale === 'zh'

  const workflowSteps = [
    {
      icon: Mic,
      title: isZh ? '音频输入与预处理' : 'Audio Input & Preprocessing',
      description: isZh 
        ? '系统接收各种格式的音频文件，进行格式转换、降噪处理和音频优化，确保后续处理的音质和准确性。'
        : 'System receives various audio formats, performs format conversion, noise reduction, and audio optimization to ensure quality and accuracy for subsequent processing.',
      details: isZh
        ? ['支持多种音频格式', '智能降噪处理', '音频质量优化', '批量文件处理']
        : ['Multiple audio format support', 'Intelligent noise reduction', 'Audio quality optimization', 'Batch file processing']
    },
    {
      icon: Volume2,
      title: isZh ? '语音识别与转录' : 'Speech Recognition & Transcription',
      description: isZh
        ? '采用先进的语音识别技术，将音频内容转换为文字，支持多语言识别和方言处理，生成带时间戳的转录文本。'
        : 'Uses advanced speech recognition technology to convert audio content to text, supports multilingual recognition and dialect processing, generates timestamped transcripts.',
      details: isZh
        ? ['多语言识别支持', '精确时间戳标注', '说话人识别', '方言处理能力']
        : ['Multilingual recognition support', 'Precise timestamp annotation', 'Speaker identification', 'Dialect processing capability']
    },
    {
      icon: Brain,
      title: isZh ? '内容理解与分析' : 'Content Understanding & Analysis',
      description: isZh
        ? '运用先进的推理引擎对转录文本进行深度语义分析，理解上下文关系，识别关键信息和重要观点。'
        : 'Uses advanced reasoning engine for deep semantic analysis of transcribed text, understands contextual relationships, identifies key information and important viewpoints.',
      details: isZh
        ? ['语义理解分析', '上下文关联', '关键信息提取', '观点识别']
        : ['Semantic understanding analysis', 'Contextual correlation', 'Key information extraction', 'Viewpoint identification']
    },
    {
      icon: FileText,
      title: isZh ? '结构化总结生成' : 'Structured Summary Generation',
      description: isZh
        ? '基于内容分析结果，自动生成层次清晰的结构化总结，包含核心要点、关键时间节点和重要结论。'
        : 'Based on content analysis results, automatically generates clear hierarchical structured summaries, including core points, key timestamps, and important conclusions.',
      details: isZh
        ? ['层次化内容组织', '核心要点提取', '时间节点标记', '结论总结']
        : ['Hierarchical content organization', 'Core point extraction', 'Timestamp marking', 'Conclusion summarization']
    }
  ]

  const features = [
    {
      icon: Clock,
      title: isZh ? '高效处理' : 'Efficient Processing',
      description: isZh ? '几分钟内完成小时级音频的总结' : 'Complete hour-long audio summaries in minutes'
    },
    {
      icon: Users,
      title: isZh ? '多场景适用' : 'Multi-scenario Application',
      description: isZh ? '会议、访谈、播客、讲座等各种场景' : 'Meetings, interviews, podcasts, lectures and various scenarios'
    },
    {
      icon: MessageSquare,
      title: isZh ? '智能理解' : 'Intelligent Understanding',
      description: isZh ? '深度理解语义和上下文关系' : 'Deep understanding of semantics and contextual relationships'
    },
    {
      icon: Zap,
      title: isZh ? '精准提取' : 'Precise Extraction',
      description: isZh ? '准确识别和提取关键信息' : 'Accurately identify and extract key information'
    }
  ]

  return (
    <div className="min-h-screen bg-almond-50 dark:bg-charcoal-900">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* 文章头部 */}
          <header className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-coral-600 dark:text-coral-400">
                {isZh ? '音频总结智能体是如何工作的？' : 'How Does Audio Summary Agent Work?'}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {isZh
                ? '深入了解音频总结智能体的工作原理，从音频识别到内容理解，再到结构化总结生成的完整技术流程。'
                : 'Understand how audio summary agents work, from audio recognition to content understanding, to structured summary generation.'
              }
            </p>
          </header>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-muted-foreground mb-8">
              {isZh ? '发布时间：2025年7月20日' : 'Published: July 20, 2025'}
            </p>

            {/* 引言 */}
            <section className="mb-12">
              <div className="bg-almond-100 dark:bg-charcoal-800 p-6 rounded-lg border border-almond-200/50 dark:border-charcoal-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-coral-600 dark:bg-coral-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-charcoal-700 dark:text-charcoal-200">
                      {isZh ? '音频总结智能体：让长音频秒变精华摘要' : 'Audio Summary Agent: Transform Long Audio into Essential Highlights'}
                    </h2>
                    <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                      {isZh
                        ? '在信息爆炸的时代，我们每天都会接触到大量的音频内容：会议录音、播客节目、在线讲座、访谈记录等。如何快速从这些长时间的音频中提取关键信息，成为了现代工作和学习中的重要需求。音频总结智能体正是为解决这一痛点而生，它能够自动将小时级的音频内容转化为结构化的精华摘要。'
                        : 'In the information explosion era, we encounter massive audio content daily: meeting recordings, podcast shows, online lectures, interview records, etc. How to quickly extract key information from these long-duration audios has become an important need in modern work and study. Audio summary agents are born to solve this pain point, automatically transforming hour-long audio content into structured essential summaries.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 工作流程 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600">
                {isZh ? '音频总结智能体的工作流程' : 'Audio Summary Agent Workflow'}
              </h2>
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-coral-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="outline" className="border-coral-200 text-coral-600">
                              {isZh ? `步骤 ${index + 1}` : `Step ${index + 1}`}
                            </Badge>
                            <CardTitle className="text-xl">{step.title}</CardTitle>
                          </div>
                          <p className="text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {step.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-coral-500 rounded-full"></div>
                                <span className="text-sm text-charcoal-600">{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>

            {/* 核心特性 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600">
                {isZh ? '核心技术特性' : 'Core Technical Features'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-coral-600 rounded-lg flex items-center justify-center">
                          <feature.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                      </div>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 应用场景 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600">
                {isZh ? '实际应用场景' : 'Real Application Scenarios'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200/50">
                  <h3 className="text-lg font-semibold mb-3 text-blue-700">
                    {isZh ? '会议记录' : 'Meeting Minutes'}
                  </h3>
                  <p className="text-blue-600 text-sm mb-4">
                    {isZh
                      ? '自动将会议录音转换为结构化会议纪要，包含讨论要点、决策事项和行动计划。'
                      : 'Automatically convert meeting recordings into structured minutes, including discussion points, decisions, and action plans.'
                    }
                  </p>
                  <ul className="text-blue-600 text-sm space-y-1">
                    <li>• {isZh ? '讨论要点提取' : 'Discussion point extraction'}</li>
                    <li>• {isZh ? '决策事项记录' : 'Decision item recording'}</li>
                    <li>• {isZh ? '行动计划整理' : 'Action plan organization'}</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200/50">
                  <h3 className="text-lg font-semibold mb-3 text-green-700">
                    {isZh ? '播客分析' : 'Podcast Analysis'}
                  </h3>
                  <p className="text-green-600 text-sm mb-4">
                    {isZh
                      ? '快速生成播客节目的核心内容摘要，帮助听众快速了解节目精华。'
                      : 'Quickly generate core content summaries of podcast episodes, helping listeners understand the essence quickly.'
                    }
                  </p>
                  <ul className="text-green-600 text-sm space-y-1">
                    <li>• {isZh ? '核心观点提取' : 'Core viewpoint extraction'}</li>
                    <li>• {isZh ? '话题分段整理' : 'Topic segmentation'}</li>
                    <li>• {isZh ? '精彩片段标记' : 'Highlight marking'}</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200/50">
                  <h3 className="text-lg font-semibold mb-3 text-purple-700">
                    {isZh ? '学习笔记' : 'Study Notes'}
                  </h3>
                  <p className="text-purple-600 text-sm mb-4">
                    {isZh
                      ? '将在线课程、讲座录音转化为结构化学习笔记，提高学习效率。'
                      : 'Transform online courses and lecture recordings into structured study notes, improving learning efficiency.'
                    }
                  </p>
                  <ul className="text-purple-600 text-sm space-y-1">
                    <li>• {isZh ? '知识点梳理' : 'Knowledge point organization'}</li>
                    <li>• {isZh ? '重点内容标记' : 'Key content marking'}</li>
                    <li>• {isZh ? '复习要点提取' : 'Review point extraction'}</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 技术优势 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600">
                {isZh ? '技术优势与创新' : 'Technical Advantages & Innovation'}
              </h2>
              <div className="bg-almond-100 p-8 rounded-lg border border-almond-200/50">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-charcoal-700">
                      {isZh ? '智能化程度高' : 'High Intelligence Level'}
                    </h3>
                    <ul className="space-y-2 text-charcoal-600">
                      <li className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '深度语义理解' : 'Deep semantic understanding'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '上下文关联分析' : 'Contextual correlation analysis'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '智能信息提取' : 'Intelligent information extraction'}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-charcoal-700">
                      {isZh ? '处理能力强' : 'Strong Processing Capability'}
                    </h3>
                    <ul className="space-y-2 text-charcoal-600">
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '多语言混合识别' : 'Multilingual mixed recognition'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '长时音频处理' : 'Long-duration audio processing'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '实时处理能力' : 'Real-time processing capability'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* 立即体验 */}
            <section className="mb-12">
              <div className="bg-coral-600 p-6 rounded-lg text-white">
                <h3 className="text-2xl font-semibold mb-4">
                  {isZh ? '立即体验音频总结智能体' : 'Experience Audio Summary Agent Now'}
                </h3>
                <p className="mb-4">
                  {isZh
                    ? '准备好让AI为您的音频内容处理赋能了吗？立即体验音频总结智能体，将长音频转化为精华摘要。'
                    : 'Ready to empower your audio content processing with AI? Experience the audio summary agent now and transform long audio into essential summaries.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`/${params.locale}/#pricing`}
                    className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {isZh ? '立即体验' : 'Try Now'}
                  </a>
                  <a
                    href={`/${params.locale}/#features`}
                    className="inline-flex items-center px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-slate-700 transition-colors"
                  >
                    {isZh ? '了解更多' : 'Learn More'}
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
