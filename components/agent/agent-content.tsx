"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/use-toast'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { AgentSidebar } from './agent-sidebar'
import { AudioSummaryContent } from './audio-recognition'
import { InterviewPodcastContent } from './interview-podcast'

interface ProcessingRecord {
  id: string
  title: string
  timestamp: Date
  recognitionResult: string
  summary: string
  timestampContent: string
  language: string
}

interface PodcastRecord {
  id: string
  title: string
  timestamp: Date
  inputContent: string
  dialogueSegments: any[]
  finalAudioUrl?: string
}

export function AgentContent() {
  const t = useTranslations('agent')
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  // 状态管理
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentAgent, setCurrentAgent] = useState(() => {
    // 从URL参数获取智能体类型，默认为podcast-ai（AI访谈智能体）
    const agentParam = searchParams.get('agent')
    return agentParam || 'podcast-ai'
  })
  const [audioRecords, setAudioRecords] = useState<ProcessingRecord[]>([])
  const [podcastRecords, setPodcastRecords] = useState<PodcastRecord[]>([])
  const [selectedAudioRecord, setSelectedAudioRecord] = useState<ProcessingRecord | null>(null)
  const [selectedPodcastRecord, setSelectedPodcastRecord] = useState<PodcastRecord | null>(null)

  // 监听URL参数变化
  useEffect(() => {
    const agentParam = searchParams.get('agent')
    if (agentParam && agentParam !== currentAgent) {
      setCurrentAgent(agentParam)
    }
  }, [searchParams, currentAgent])

  // 防止浏览器滚动条
  useEffect(() => {
    // 组件挂载时隐藏body滚动条
    document.body.style.overflow = 'hidden'

    // 组件卸载时恢复body滚动条
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // 选择智能体
  const selectAgent = (agentId: string) => {
    setCurrentAgent(agentId)
    // 切换智能体时清空选中的记录
    setSelectedAudioRecord(null)
    setSelectedPodcastRecord(null)

    // 更新URL参数
    const params = new URLSearchParams(searchParams.toString())
    params.set('agent', agentId)
    router.replace(`?${params.toString()}`, { scroll: false })

    if (agentId !== 'audio-summary' && agentId !== 'podcast-ai') {
      // 其他智能体暂时显示提示
      toast({
        title: t('comingSoon'),
        description: t('agentComingSoonDescription'),
      })
    }
  }



  // 渲染当前智能体的组件
  const renderAgentComponent = () => {
    switch (currentAgent) {
      case 'audio-summary':
        return (
          <div className="flex-1 bg-white dark:bg-charcoal-800 overflow-y-auto custom-scrollbar">
            <AudioSummaryContent
              onRecordsUpdate={setAudioRecords}
              onRecordSelect={setSelectedAudioRecord}
              selectedRecord={selectedAudioRecord}
            />
          </div>
        )
      case 'podcast-ai':
        return (
          <div className="flex-1 bg-white dark:bg-charcoal-800 overflow-y-auto custom-scrollbar">
            <InterviewPodcastContent
              onRecordsUpdate={setPodcastRecords}
              onRecordSelect={setSelectedPodcastRecord}
              selectedRecord={selectedPodcastRecord}
            />
          </div>
        )
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-charcoal-800 overflow-y-auto custom-scrollbar">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-charcoal-700 dark:text-charcoal-200">{t('selectAgent')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('selectAgentDescription')}</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-charcoal-900 overflow-hidden">
      {/* 顶部导航 */}
      <Navbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* 左侧边栏 */}
        <AgentSidebar
          sessions={[]} // 简化为空数组
          currentSessionId={null}
          onSelectSession={() => {}} // 空函数
          onSelectAgent={selectAgent}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          currentAgent={currentAgent}
          processingRecords={currentAgent === 'audio-summary' ? audioRecords : podcastRecords as any}
          onSelectRecord={currentAgent === 'audio-summary' ?
            (record: any) => setSelectedAudioRecord(record as ProcessingRecord) :
            (record: any) => setSelectedPodcastRecord(record as PodcastRecord)
          }
          selectedRecord={currentAgent === 'audio-summary' ? selectedAudioRecord : selectedPodcastRecord as any}
        />

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col">


        {/* 智能体组件区域 */}
        {renderAgentComponent()}
        </div>
      </div>
    </div>
  )
}
