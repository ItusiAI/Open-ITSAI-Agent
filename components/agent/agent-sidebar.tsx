"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileAudio
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatSession {
  id: string
  title: string
  createdAt: Date
  messages: any[]
}

interface Agent {
  id: string
  name: string
  icon: string
  description: string
  isActive: boolean
}

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

// 通用记录类型
type AgentRecord = ProcessingRecord | PodcastRecord

interface AgentSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onSelectAgent: (agentId: string) => void
  isOpen: boolean
  onToggle: () => void
  currentAgent: string
  processingRecords?: AgentRecord[]
  onSelectRecord?: (record: AgentRecord) => void
  selectedRecord?: AgentRecord | null
}

export function AgentSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onSelectAgent,
  isOpen,
  onToggle,
  currentAgent,
  processingRecords = [],
  onSelectRecord,
  selectedRecord
}: AgentSidebarProps) {
  const [displayedRecordsCount, setDisplayedRecordsCount] = useState(10)
  const [hoveredSession, setHoveredSession] = useState<string | null>(null)
  const t = useTranslations('agent')

  // 智能体列表
  const agents: Agent[] = [
    {
      id: 'audio-summary',
      name: t('audioSummaryAgent'),
      icon: '🧠',
      description: t('audioSummaryAgentDesc'),
      isActive: true
    },
    {
      id: 'podcast-ai',
      name: t('podcastAiAgent'),
      icon: '🤖',
      description: t('podcastAiAgentDesc'),
      isActive: true // 设置为开发中，禁用点击
    }
  ]

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getSessionPreview = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1]
    if (!lastMessage) return t('noMessages')
    
    if (lastMessage.type === 'user' && lastMessage.audioFile) {
      return `🎵 ${lastMessage.audioFile.name}`
    }
    
    return lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '')
  }

  return (
    <>
      {/* 侧边栏 */}
      <div className={cn(
        "bg-white dark:bg-charcoal-800 border-r dark:border-charcoal-700 transition-all duration-300 flex flex-col",
        isOpen ? "w-80" : "w-0 overflow-hidden"
      )}>
        {/* 顶部区域 */}
        <div className="p-4 border-b dark:border-charcoal-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-charcoal-700 dark:text-charcoal-200">{t('aiAgents')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          
          {/* 智能体列表 */}
          <div className="space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={cn(
                  "p-3 rounded-lg cursor-pointer transition-all duration-200",
                  currentAgent === agent.id
                    ? "bg-coral-50 dark:bg-coral-900/30 border border-coral-200 dark:border-coral-700"
                    : agent.isActive
                    ? "hover:bg-gray-50 dark:hover:bg-charcoal-700 border border-transparent"
                    : "opacity-50 cursor-not-allowed border border-transparent"
                )}
                onClick={() => agent.isActive && onSelectAgent(agent.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate text-charcoal-700 dark:text-charcoal-200">{agent.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.description}</p>
                  </div>
                  {!agent.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      {t('comingSoon')}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* 处理记录 */}
        <div className="px-4 py-2 border-b dark:border-charcoal-700">
          <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">
            {currentAgent === 'audio-summary' ? t('processingHistory') : t('interviewPodcast.podcastRecords')}
          </h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* 显示处理记录 */}
            {processingRecords.length > 0 && (
              <>
                {processingRecords.slice(0, displayedRecordsCount).map((record) => {
                  const isSelected = selectedRecord?.id === record.id
                  const isAudioRecord = 'recognitionResult' in record
                  const isPodcastRecord = 'inputContent' in record

                  return (
                    <div
                      key={record.id}
                      className={cn(
                        "group relative rounded-lg p-3 cursor-pointer transition-all duration-200 border",
                        isSelected
                          ? "bg-coral-50 dark:bg-coral-900/30 border-coral-200 dark:border-coral-700"
                          : "border-transparent hover:bg-gray-50 dark:hover:bg-charcoal-700 hover:border-gray-200 dark:hover:border-charcoal-600"
                      )}
                      onClick={() => onSelectRecord?.(record)}
                    >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-coral-500 dark:bg-coral-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 leading-tight break-words word-wrap">
                          {record.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          <span className="whitespace-nowrap">{record.timestamp.toLocaleDateString()}</span>
                          <span>•</span>
                          {isAudioRecord && (
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-charcoal-600 rounded text-xs whitespace-nowrap">
                              {(record as ProcessingRecord).language === 'zh' ? t('chineseVersion') : t('globalVersion')}
                            </span>
                          )}
                          {isPodcastRecord && (
                            <span className="px-1.5 py-0.5 bg-coral-100 dark:bg-coral-900/50 text-coral-700 dark:text-coral-300 rounded text-xs whitespace-nowrap">
                              {t('interviewPodcast.ui.podcastRecord')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                  )
                })}

                {/* 加载更多按钮 */}
                {processingRecords.length > displayedRecordsCount && (
                  <div className="p-2">
                    <button
                      onClick={() => setDisplayedRecordsCount(prev => prev + 10)}
                      className="w-full text-sm text-coral-600 hover:text-coral-700 dark:text-coral-400 dark:hover:text-coral-300 py-2 px-3 rounded-lg hover:bg-coral-50 dark:hover:bg-coral-900/30 transition-colors"
                    >
                      {t('loadMore')} ({processingRecords.length - displayedRecordsCount} {t('records')})
                    </button>
                  </div>
                )}
              </>
            )}

            {sessions.length === 0 && processingRecords.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-charcoal-700 rounded-full flex items-center justify-center">
                  <FileAudio className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {currentAgent === 'audio-summary' ? t('noProcessingHistory') : t('interviewPodcast.noPodcastRecords')}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {currentAgent === 'audio-summary' ? t('noProcessingHistoryDescription') : t('interviewPodcast.noPodcastRecordsDescription')}
                </p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group relative rounded-lg p-3 cursor-pointer transition-colors",
                    currentSessionId === session.id
                      ? "bg-coral-50 border border-coral-200"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => onSelectSession(session.id)}
                  onMouseEnter={() => setHoveredSession(session.id)}
                  onMouseLeave={() => setHoveredSession(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {session.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mb-2">
                        {getSessionPreview(session)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(session.createdAt)}
                        <span>•</span>
                        <span>{session.messages.length} {t('messages')}</span>
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    {hoveredSession === session.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          // TODO: 实现删除功能
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* 底部信息 */}
        <div className="p-4 border-t dark:border-charcoal-700 bg-gray-50 dark:bg-charcoal-800">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            {currentAgent === 'audio-summary' ? (
              <div className="flex justify-between">
                <span>{t('totalRecords')}</span>
                <span>{processingRecords.length}</span>
              </div>
            ) : currentAgent === 'podcast-ai' ? (
              <div className="flex justify-between">
                <span>{t('interviewPodcast.totalPodcasts')}</span>
                <span>{processingRecords.length}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>{t('totalSessions')}</span>
                  <span>{sessions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('totalMessages')}</span>
                  <span>{sessions.reduce((acc, s) => acc + s.messages.length, 0)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 收起状态的切换按钮 */}
      {!isOpen && (
        <div className="w-12 bg-white border-r flex flex-col items-center py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="mb-4"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          <div className="flex-1" />
        </div>
      )}
    </>
  )
}
