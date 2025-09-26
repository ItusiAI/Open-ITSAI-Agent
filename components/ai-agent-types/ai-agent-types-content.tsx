"use client"

import { useParams } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, FileText, Headphones, Zap, Brain, Volume2 } from 'lucide-react'

export function AiAgentTypesContent() {
  const params = useParams()
  const isZh = params.locale === 'zh'

  const agentTypes = [
    {
      icon: Mic,
      title: isZh ? '音频识别智能体' : 'Audio Recognition Agent',
      description: isZh
        ? '企业级语音识别服务，支持中文普通话+英语+27种方言混合识别，以及全球近100个国家语言。提供精确到秒的时间戳和说话人分离。'
        : 'Enterprise-grade speech recognition service supporting Mandarin Chinese + English + 27 dialects mixed recognition, as well as nearly 100 global languages. Provides precise timestamp and speaker separation.',
      features: isZh
        ? ['近100个国家语言支持', '27种方言识别', '说话人分离', '精确时间戳']
        : ['Nearly 100 global languages support', '27 dialect recognition', 'Speaker separation', 'Precise timestamps']
    },
    {
      icon: FileText,
      title: isZh ? '音频总结智能体' : 'Audio Summary Agent',
      description: isZh
        ? '基于推理引擎深度理解音频内容，自动生成结构化总结。支持会议记录、访谈整理、播客分析，让长音频内容秒变精华摘要。'
        : 'Based on reasoning engine for deep audio content understanding, automatically generates structured summaries. Supports meeting records, interview organization, and podcast analysis, turning long audio into essential highlights.',
      features: isZh
        ? ['推理引擎分析', '结构化总结', '会议记录', '播客分析']
        : ['Reasoning engine analysis', 'Structured summarization', 'Meeting records', 'Podcast analysis']
    },
    {
      icon: Volume2,
      title: isZh ? '声音生成智能体' : 'Voice Generation Agent',
      description: isZh
        ? '高质量AI语音合成服务，支持多种音色和情感表达。从文本到自然流畅的语音，为广告配音、有声读物、教育内容提供专业级声音创作。'
        : 'High-quality AI voice synthesis service supporting multiple tones and emotional expressions. From text to natural fluent speech, providing professional-grade voice creation for ads, audiobooks, and educational content.',
      features: isZh
        ? ['多种音色选择', '情感表达', '自然流畅', '专业级质量']
        : ['Multiple voice options', 'Emotional expression', 'Natural fluency', 'Professional quality']
    },
    {
      icon: Headphones,
      title: isZh ? 'AI播客智能体' : 'AI Podcast Agent',
      description: isZh
        ? '一站式播客制作服务，从脚本生成到音频制作全流程自动化。智能匹配背景音乐和音效，支持多人对话模拟，轻松制作专业播客内容。'
        : 'One-stop podcast production service with full automation from script generation to audio production. Intelligently matches background music and sound effects, supports multi-person dialogue simulation for professional podcast creation.',
      features: isZh
        ? ['脚本自动生成', '背景音乐匹配', '多人对话', '一站式制作']
        : ['Automatic script generation', 'Background music matching', 'Multi-person dialogue', 'One-stop production']
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
                {isZh ? 'ITSAI Agent提供哪些声音AI智能体？' : 'What Voice AI Agents Does ITSAI Agent Provide?'}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {isZh
                ? '深入了解ITSAI Agent平台提供的四大声音AI智能体类型：音频识别、音频总结、声音生成、AI播客。从声音理解到声音创作，提供完整的声音AI解决方案。'
                : 'Explore the four major voice AI agent types provided by ITSAI Agent platform: audio recognition, audio summarization, voice generation, and AI podcasts. From voice understanding to voice creation, providing complete voice AI solutions.'
              }
            </p>
          </header>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-muted-foreground mb-8">
              {isZh ? '发布时间：2025年7月1日' : 'Published: July 1, 2025'}
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
                      {isZh ? '专业声音AI智能体服务平台' : 'Professional Voice AI Agent Service Platform'}
                    </h2>
                    <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                      {isZh
                        ? 'ITSAI Agent是一个专注声音场景的AI智能体服务平台，致力于为用户提供完整的声音AI解决方案。我们的四大核心智能体涵盖了音频识别、内容总结、声音生成、播客制作等声音处理全链路，从声音理解到声音创作，帮助用户提升工作效率，释放创造力。'
                        : 'ITSAI Agent is a professional voice AI agent service platform focused on voice scenarios, dedicated to providing users with complete voice AI solutions. Our four core agents cover the entire voice processing pipeline including audio recognition, content summarization, voice generation, and podcast production, from voice understanding to voice creation, helping users improve work efficiency and unleash creativity.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 智能体类型介绍 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600">
                {isZh ? '四大声音AI智能体类型' : 'Four Major Voice AI Agent Types'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {agentTypes.map((agent, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-coral-600 rounded-lg flex items-center justify-center">
                          <agent.icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">{agent.title}</CardTitle>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{agent.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          {isZh ? '核心功能：' : 'Core Features:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {agent.features.map((feature, featureIndex) => (
                            <Badge key={featureIndex} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 应用场景 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600">
                {isZh ? '声音AI应用场景' : 'Voice AI Application Scenarios'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200/50">
                  <h3 className="text-lg font-semibold mb-3 text-blue-700">
                    {isZh ? '音频内容创作' : 'Audio Content Creation'}
                  </h3>
                  <p className="text-blue-600 text-sm">
                    {isZh
                      ? '播客主播、音频创作者使用我们的声音AI智能体进行音频识别、内容总结、声音生成和播客制作。'
                      : 'Podcast hosts and audio creators use our voice AI agents for audio recognition, content summarization, voice generation, and podcast production.'
                    }
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200/50">
                  <h3 className="text-lg font-semibold mb-3 text-green-700">
                    {isZh ? '商务办公' : 'Business Office'}
                  </h3>
                  <p className="text-green-600 text-sm">
                    {isZh
                      ? '企业使用我们的智能体进行会议记录、音频转录、客服通话分析和培训材料制作。'
                      : 'Companies use our agents for meeting records, audio transcription, customer service call analysis, and training material creation.'
                    }
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200/50">
                  <h3 className="text-lg font-semibold mb-3 text-purple-700">
                    {isZh ? '教育培训' : 'Education & Training'}
                  </h3>
                  <p className="text-purple-600 text-sm">
                    {isZh
                      ? '教育机构利用我们的智能体制作课程音频、讲座总结、语言学习材料和有声读物。'
                      : 'Educational institutions use our agents to create course audio, lecture summaries, language learning materials, and audiobooks.'
                    }
                  </p>
                </div>
              </div>
            </section>

            {/* 技术优势 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600">
                {isZh ? '声音AI技术优势' : 'Voice AI Technical Advantages'}
              </h2>
              <div className="bg-almond-100 p-8 rounded-lg border border-almond-200/50">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-charcoal-700">
                      {isZh ? '企业级识别精度' : 'Enterprise-Grade Recognition Accuracy'}
                    </h3>
                    <ul className="space-y-2 text-charcoal-600">
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '支持全球近百种语言' : 'Supports nearly 100 global languages'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '支持27种方言混合识别' : 'Supports 27 dialect mixed recognition'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '精确到秒的时间戳' : 'Precise timestamp to the second'}</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-charcoal-700">
                      {isZh ? '完整声音处理链路' : 'Complete Voice Processing Pipeline'}
                    </h3>
                    <ul className="space-y-2 text-charcoal-600">
                      <li className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '推理引擎深度分析' : 'Reasoning engine deep analysis'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '从理解到创作全链路' : 'Full pipeline from understanding to creation'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-coral-500" />
                        <span>{isZh ? '一站式声音AI服务' : 'One-stop voice AI service'}</span>
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
                  {isZh ? '立即体验声音AI智能体' : 'Experience Voice AI Agents Now'}
                </h3>
                <p className="mb-4">
                  {isZh
                    ? '准备好体验专业的声音AI智能体服务了吗？立即注册，开始您的声音创作之旅。从音频识别到声音生成，让AI为您的声音场景赋能。'
                    : 'Ready to experience professional voice AI agent services? Register now and start your voice creation journey. From audio recognition to voice generation, let AI empower your voice scenarios.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`/${params.locale}/#pricing`}
                    className="inline-flex items-center px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {isZh ? '立即开始' : 'Get Started'}
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