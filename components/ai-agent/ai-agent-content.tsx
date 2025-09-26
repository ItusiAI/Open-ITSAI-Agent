"use client"

import { useParams } from 'next/navigation'
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import Image from 'next/image'

export function AiAgentContent() {
  const params = useParams()
  const locale = params.locale as string
  const isZh = locale === 'zh'

  return (
    <div className="min-h-screen bg-almond-50 dark:bg-charcoal-900">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-coral-600 dark:text-coral-400">
                {isZh ? '什么是AI智能体？' : 'What is an AI Agent?'}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {isZh 
                ? '深入了解AI智能体的定义、工作原理和应用场景'
                : 'Understand the definition, working principles, and application scenarios of AI agents'
              }
            </p>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="text-muted-foreground mb-8">
              {isZh ? '发布时间：2025年7月1日' : 'Published: July 1, 2025'}
            </p>
            
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600 dark:text-coral-400">
                {isZh ? '1. AI智能体的定义' : '1. Definition of AI Agent'}
              </h2>
              <p className="mb-6 text-lg leading-relaxed">
                {isZh
                  ? 'AI智能体（AI Agent）是一种能够感知环境、做出决策并采取行动以实现特定目标的人工智能系统。与传统的AI模型不同，AI智能体具有自主性、反应性和主动性，能够在复杂的环境中独立工作。'
                  : 'An AI Agent is an artificial intelligence system that can perceive its environment, make decisions, and take actions to achieve specific goals. Unlike traditional AI models, AI agents possess autonomy, reactivity, and proactivity, enabling them to work independently in complex environments.'
                }
              </p>
              <div className="bg-almond-100 dark:bg-charcoal-800 p-6 rounded-lg border border-almond-200/50 dark:border-charcoal-700 mb-6">
                <h3 className="text-xl font-semibold mb-3 text-charcoal-700 dark:text-charcoal-200">
                  {isZh ? '核心特征' : 'Core Characteristics'}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>{isZh ? '自主性' : 'Autonomy'}</strong>：{isZh ? '能够在没有人类直接干预的情况下运行' : 'Can operate without direct human intervention'}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>{isZh ? '反应性' : 'Reactivity'}</strong>：{isZh ? '能够感知环境变化并及时响应' : 'Can perceive environmental changes and respond promptly'}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>{isZh ? '主动性' : 'Proactivity'}</strong>：{isZh ? '能够主动采取行动以实现目标' : 'Can proactively take actions to achieve goals'}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span><strong>{isZh ? '社交能力' : 'Social Ability'}</strong>：{isZh ? '能够与其他智能体或人类进行交互' : 'Can interact with other agents or humans'}</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600 dark:text-coral-400">
                {isZh ? '2. AI智能体的工作原理' : '2. How AI Agents Work'}
              </h2>

              <h3 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
                {isZh ? '2.1 感知-决策-行动循环' : '2.1 Perceive-Decide-Act Loop'}
              </h3>
              <p className="mb-6 text-lg leading-relaxed">
                {isZh 
                  ? 'AI智能体通过一个连续的感知-决策-行动循环来工作。这个循环使智能体能够不断地从环境中获取信息，处理这些信息，然后采取相应的行动。'
                  : 'AI agents work through a continuous perceive-decide-act loop. This loop enables agents to continuously gather information from the environment, process this information, and then take appropriate actions.'
                }
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-charcoal-50 dark:bg-charcoal-800 p-6 rounded-lg border border-charcoal-200/50 dark:border-charcoal-700">
                  <div className="w-12 h-12 bg-charcoal-600 dark:bg-charcoal-500 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-charcoal-700 dark:text-charcoal-200">
                    {isZh ? '感知' : 'Perceive'}
                  </h4>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-300">
                    {isZh ? '通过传感器或数据接口收集环境信息' : 'Collect environmental information through sensors or data interfaces'}
                  </p>
                </div>

                <div className="bg-coral-50 dark:bg-coral-900/30 p-6 rounded-lg border border-coral-200/50 dark:border-coral-700">
                  <div className="w-12 h-12 bg-coral-600 dark:bg-coral-500 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-coral-700 dark:text-coral-300">
                    {isZh ? '决策' : 'Decide'}
                  </h4>
                  <p className="text-sm text-coral-600 dark:text-coral-400">
                    {isZh ? '基于感知到的信息和预设目标做出决策' : 'Make decisions based on perceived information and preset goals'}
                  </p>
                </div>

                <div className="bg-almond-100 dark:bg-almond-900/30 p-6 rounded-lg border border-almond-200/50 dark:border-almond-700">
                  <div className="w-12 h-12 bg-coral-600 dark:bg-coral-500 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-charcoal-700 dark:text-charcoal-200">
                    {isZh ? '行动' : 'Act'}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {isZh ? '执行决策，对环境产生影响' : 'Execute decisions and impact the environment'}
                  </p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
                {isZh ? '2.2 核心组件' : '2.2 Core Components'}
              </h3>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-coral-600 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <div>
                    <strong className="text-charcoal-700 dark:text-charcoal-200">{isZh ? '知识库' : 'Knowledge Base'}</strong>：
                    {isZh ? '存储智能体的专业知识和经验' : 'Stores the agent\'s professional knowledge and experience'}
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-coral-600 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <div>
                    <strong className="text-charcoal-700 dark:text-charcoal-200">{isZh ? '推理引擎' : 'Reasoning Engine'}</strong>：
                    {isZh ? '负责分析信息和制定决策' : 'Responsible for analyzing information and making decisions'}
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-coral-600 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <div>
                    <strong className="text-charcoal-700 dark:text-charcoal-200">{isZh ? '执行器' : 'Actuator'}</strong>：
                    {isZh ? '将决策转化为具体的行动' : 'Converts decisions into concrete actions'}
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-3 h-3 bg-coral-600 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                  <div>
                    <strong className="text-charcoal-700 dark:text-charcoal-200">{isZh ? '学习模块' : 'Learning Module'}</strong>：
                    {isZh ? '从经验中学习并改进性能' : 'Learn from experience and improve performance'}
                  </div>
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600 dark:text-coral-400">
                {isZh ? '3. AI智能体的类型' : '3. Types of AI Agents'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-charcoal-50 dark:bg-charcoal-800 p-6 rounded-lg border border-charcoal-200/50 dark:border-charcoal-700">
                  <h3 className="text-xl font-semibold mb-3 text-charcoal-700 dark:text-charcoal-200">
                    {isZh ? '反应式智能体' : 'Reactive Agents'}
                  </h3>
                  <p className="text-charcoal-600 dark:text-charcoal-300 mb-3">
                    {isZh ? '基于当前感知直接做出反应，不维护内部状态。' : 'React directly based on current perception without maintaining internal state.'}
                  </p>
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                    {isZh ? '适用于：实时控制、简单任务执行' : 'Suitable for: Real-time control, simple task execution'}
                  </p>
                </div>

                <div className="bg-coral-50 dark:bg-coral-900/30 p-6 rounded-lg border border-coral-200/50 dark:border-coral-700">
                  <h3 className="text-xl font-semibold mb-3 text-coral-700 dark:text-coral-300">
                    {isZh ? '认知智能体' : 'Cognitive Agents'}
                  </h3>
                  <p className="text-coral-600 dark:text-coral-400 mb-3">
                    {isZh ? '具有内部状态和记忆，能够进行复杂推理。' : 'Have internal state and memory, capable of complex reasoning.'}
                  </p>
                  <p className="text-sm text-coral-500 dark:text-coral-400">
                    {isZh ? '适用于：问题解决、决策支持、专家系统' : 'Suitable for: Problem solving, decision support, expert systems'}
                  </p>
                </div>

                <div className="bg-almond-100 p-6 rounded-lg border border-almond-200/50">
                  <h3 className="text-xl font-semibold mb-3 text-charcoal-700">
                    {isZh ? '学习智能体' : 'Learning Agents'}
                  </h3>
                  <p className="text-charcoal-600 mb-3">
                    {isZh ? '能够从经验中学习，不断改进自己的性能。' : 'Can learn from experience and continuously improve performance.'}
                  </p>
                  <p className="text-sm text-charcoal-500">
                    {isZh ? '适用于：个性化推荐、自适应系统' : 'Suitable for: Personalized recommendations, adaptive systems'}
                  </p>
                </div>

                <div className="bg-coral-100 p-6 rounded-lg border border-coral-200/50">
                  <h3 className="text-xl font-semibold mb-3 text-coral-700">
                    {isZh ? '多智能体系统' : 'Multi-Agent Systems'}
                  </h3>
                  <p className="text-coral-600 mb-3">
                    {isZh ? '多个智能体协作完成复杂任务。' : 'Multiple agents collaborate to complete complex tasks.'}
                  </p>
                  <p className="text-sm text-coral-500">
                    {isZh ? '适用于：分布式计算、协作工作流' : 'Suitable for: Distributed computing, collaborative workflows'}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600 dark:text-coral-400">
                {isZh ? '4. AI智能体的应用场景' : '4. Application Scenarios of AI Agents'}
              </h2>
              
              <div className="space-y-8">
                <div className="bg-almond-100 dark:bg-charcoal-800 p-6 rounded-lg border border-almond-200/50 dark:border-charcoal-700">
                  <h3 className="text-2xl font-semibold mb-4 text-charcoal-700 dark:text-charcoal-200">
                    {isZh ? '4.1 内容创作' : '4.1 Content Creation'}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '播客制作' : 'Podcast Production'}</strong>：{isZh ? '自动生成播客内容、配音和后期制作' : 'Automatically generate podcast content, voiceovers, and post-production'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '视频制作' : 'Video Production'}</strong>：{isZh ? '智能视频编辑、特效添加和内容优化' : 'Intelligent video editing, effects addition, and content optimization'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '音频处理' : 'Audio Processing'}</strong>：{isZh ? '智能配音、音效处理和音频优化' : 'Intelligent dubbing, sound effects processing, and audio optimization'}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-coral-50 dark:bg-coral-900/30 p-6 rounded-lg border border-coral-200/50 dark:border-coral-700">
                  <h3 className="text-2xl font-semibold mb-4 text-coral-700 dark:text-coral-300">
                    {isZh ? '4.2 商业应用' : '4.2 Business Applications'}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '客户服务' : 'Customer Service'}</strong>：{isZh ? '智能客服机器人，24/7在线支持' : 'Intelligent customer service robots, 24/7 online support'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '销售助手' : 'Sales Assistant'}</strong>：{isZh ? '个性化产品推荐和销售支持' : 'Personalized product recommendations and sales support'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '数据分析' : 'Data Analysis'}</strong>：{isZh ? '自动化数据处理和洞察生成' : 'Automated data processing and insight generation'}</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-almond-100 dark:bg-charcoal-800 p-6 rounded-lg border border-almond-200/50 dark:border-charcoal-700">
                  <h3 className="text-2xl font-semibold mb-4 text-charcoal-700 dark:text-charcoal-200">
                    {isZh ? '4.3 个人助手' : '4.3 Personal Assistant'}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-coral-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '日程管理' : 'Schedule Management'}</strong>：{isZh ? '智能日程安排和提醒' : 'Intelligent schedule arrangement and reminders'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-slate-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '信息检索' : 'Information Retrieval'}</strong>：{isZh ? '智能搜索和信息整理' : 'Intelligent search and information organization'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-slate-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300"><strong>{isZh ? '学习辅助' : 'Learning Assistance'}</strong>：{isZh ? '个性化学习计划和进度跟踪' : 'Personalized learning plans and progress tracking'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600 dark:text-coral-400">
                {isZh ? '5. AI智能体的优势' : '5. Advantages of AI Agents'}
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
                    {isZh ? '效率提升' : 'Efficiency Improvement'}
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300">{isZh ? '24/7不间断工作，无需休息' : '24/7 continuous work without breaks'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300">{isZh ? '处理速度远超人类' : 'Processing speed far exceeds humans'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300">{isZh ? '并行处理多个任务' : 'Parallel processing of multiple tasks'}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
                    {isZh ? '成本优化' : 'Cost Optimization'}
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300">{isZh ? '减少人力成本' : 'Reduce labor costs'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300">{isZh ? '降低错误率和返工成本' : 'Reduce error rates and rework costs'}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-slate-700 dark:text-slate-300">{isZh ? '快速扩展能力' : 'Rapid scaling capability'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-coral-600 dark:text-coral-400">
                {isZh ? '6. 未来展望' : '6. Future Outlook'}
              </h2>
              <p className="mb-6 text-lg leading-relaxed">
                {isZh 
                  ? 'AI智能体技术正在快速发展，未来将在更多领域发挥重要作用。随着大语言模型、多模态AI和强化学习技术的进步，AI智能体将变得更加智能、自主和可靠。'
                  : 'AI agent technology is rapidly developing and will play important roles in more fields in the future. With advances in large language models, multimodal AI, and reinforcement learning, AI agents will become more intelligent, autonomous, and reliable.'
                }
              </p>
              
              <div className="bg-coral-600 p-6 rounded-lg text-white">
                <h3 className="text-2xl font-semibold mb-4">
                  {isZh ? '体验ITSAI Agent' : 'Experience ITSAI Agent'}
                </h3>
                <p className="mb-4">
                  {isZh 
                    ? 'ITSAI Agent是一个先进的AI智能体平台，专注于内容创作和生产力提升。我们提供播客制作、视频生成、音频处理等多种AI智能体服务。'
                    : 'ITSAI Agent is an advanced AI agent platform focused on content creation and productivity enhancement. We provide various AI agent services including podcast production, video generation, and audio processing.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`/${locale}/#pricing`}
                    className="inline-flex items-center px-6 py-3 bg-white dark:bg-white text-slate-700 dark:text-slate-700 font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-100 transition-colors"
                  >
                    {isZh ? '立即开始' : 'Get Started'}
                  </a>
                  <a
                    href={`/${locale}/#features`}
                    className="inline-flex items-center px-6 py-3 border border-white dark:border-white text-white dark:text-white font-semibold rounded-lg hover:bg-white hover:text-slate-700 dark:hover:bg-white dark:hover:text-slate-700 transition-colors"
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