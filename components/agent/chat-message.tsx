"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Copy,
  Download,
  FileAudio,
  User,
  Bot,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  audioFile?: File
  audioUrl?: string
  timestamp?: string
  summary?: string
  isProcessing?: boolean
  error?: string
}

interface ChatMessageProps {
  message: ChatMessage
  onCopy: (content: string) => void
}

export function ChatMessage({ message, onCopy }: ChatMessageProps) {
  const t = useTranslations('agent')
  const [activeTab, setActiveTab] = useState('summary')

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (message.type === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%]">
          <Card className="bg-coral-50 border-coral-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-coral-600" />
                    <span className="text-sm font-medium text-coral-700">{t('you')}</span>
                  </div>
                  
                  {message.audioFile && (
                    <div className="bg-white rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center">
                          <FileAudio className="w-5 h-5 text-coral-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{message.audioFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(message.audioFile.size)} • {message.audioFile.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-charcoal-700">{message.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (message.type === 'assistant') {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[85%]">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.isProcessing ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : message.error ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-700">{t('assistant')}</span>
                    {message.isProcessing && (
                      <Badge variant="secondary" className="text-xs">
                        {t('processing')}
                      </Badge>
                    )}
                    {message.error && (
                      <Badge variant="destructive" className="text-xs">
                        {t('error')}
                      </Badge>
                    )}
                  </div>
                  
                  {message.isProcessing ? (
                    <p className="text-sm text-gray-600">{message.content}</p>
                  ) : message.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{message.content}</p>
                      {message.error && (
                        <p className="text-xs text-red-600 mt-1">{message.error}</p>
                      )}
                    </div>
                  ) : message.timestamp || message.summary ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">{t('processingComplete')}</span>
                      </div>
                      
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="summary" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {t('summary')}
                          </TabsTrigger>
                          <TabsTrigger value="timestamp" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {t('timestamp')}
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="summary" className="mt-3">
                          {message.summary && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('aiSummary')}</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onCopy(message.summary!)}
                                    className="h-7 px-2"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadContent(message.summary!, 'audio-summary.txt')}
                                    className="h-7 px-2"
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="bg-almond-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                                <div className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-wrap">
                                  {message.summary}
                                </div>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="timestamp" className="mt-3">
                          {message.timestamp && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{t('timestampContent')}</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onCopy(message.timestamp!)}
                                    className="h-7 px-2"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadContent(message.timestamp!, 'audio-transcript.txt')}
                                    className="h-7 px-2"
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="bg-almond-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                                <div className="space-y-2 text-sm">
                                  {message.timestamp.split('\n').filter(line => line.trim()).map((line, index) => {
                                    const match = line.match(/\[([^\]]+)\]\s*(.*)/)
                                    if (match) {
                                      const [, timeRange, text] = match
                                      return (
                                        <div key={index} className="flex items-start gap-3">
                                          <span className="text-coral-600 font-mono text-xs bg-coral-100 px-2 py-1 rounded flex-shrink-0">
                                            {timeRange}
                                          </span>
                                          <p className="text-charcoal-700 leading-relaxed">
                                            {text.trim()}
                                          </p>
                                        </div>
                                      )
                                    } else {
                                      return (
                                        <div key={index} className="flex items-start gap-3">
                                          <span className="text-coral-600 font-mono text-xs bg-coral-100 px-2 py-1 rounded flex-shrink-0">
                                            {String(index + 1).padStart(2, '0')}
                                          </span>
                                          <p className="text-charcoal-700 leading-relaxed">
                                            {line.trim()}
                                          </p>
                                        </div>
                                      )
                                    }
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  ) : (
                    <p className="text-sm text-charcoal-700">{message.content}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
