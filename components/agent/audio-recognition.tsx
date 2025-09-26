"use client"

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  Link2,
  FileAudio,
  Clock,
  Brain,
  Sparkles,
  Download,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface ProcessingRecord {
  id: string
  title: string
  timestamp: Date
  recognitionResult: string
  summary: string
  timestampContent: string
  language: string
}

interface AudioSummaryContentProps {
  onRecordsUpdate?: (records: ProcessingRecord[]) => void
  onRecordSelect?: (record: ProcessingRecord | null) => void
  selectedRecord?: ProcessingRecord | null
}

export function AudioSummaryContent({
  onRecordsUpdate,
  onRecordSelect,
  selectedRecord
}: AudioSummaryContentProps = {}) {
  const t = useTranslations('audioSummary')
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [selectedLanguage, setSelectedLanguage] = useState('global')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [timestampContent, setTimestampContent] = useState('')
  const [summary, setSummary] = useState('')
  const [recognitionResult, setRecognitionResult] = useState('')
  const [activeTab, setActiveTab] = useState('upload')
  const [audioDuration, setAudioDuration] = useState<number>(0)
  const [requiredPoints, setRequiredPoints] = useState<number>(0)
  const [userPoints, setUserPoints] = useState<number>(0)
  const [processingRecords, setProcessingRecords] = useState<ProcessingRecord[]>([])
  const [showInsufficientPointsDialog, setShowInsufficientPointsDialog] = useState(false)
  const [showLoginRequiredDialog, setShowLoginRequiredDialog] = useState(false)

  // 从localStorage加载记录
  useEffect(() => {
    const loadRecords = () => {
      try {
        const savedRecords = localStorage.getItem('audioSummaryRecords')
        if (savedRecords) {
          const records = JSON.parse(savedRecords).map((record: any) => ({
            ...record,
            timestamp: new Date(record.timestamp)
          }))
          setProcessingRecords(records)
          onRecordsUpdate?.(records)

          // 检查URL参数中是否有记录ID，如果有则自动选择该记录
          const recordId = searchParams.get('record')
          if (recordId && !selectedRecord) {
            const targetRecord = records.find((r: ProcessingRecord) => r.id === recordId)
            if (targetRecord) {
              onRecordSelect?.(targetRecord)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load records from localStorage:', error)
      }
    }
    loadRecords()
  }, [onRecordsUpdate, searchParams, selectedRecord, onRecordSelect])

  // 保存记录到localStorage
  const saveRecordsToStorage = (records: ProcessingRecord[]) => {
    try {
      localStorage.setItem('audioSummaryRecords', JSON.stringify(records))
      // 显示存储提示
      toast({
        title: t('storage.saved'),
        description: t('storage.savedDescription'),
        duration: 2000,
      })
    } catch (error) {
      console.error('Failed to save records to localStorage:', error)
      toast({
        title: t('storage.saveFailed'),
        description: t('storage.saveFailedDescription'),
        variant: "destructive",
      })
    }
  }

  // 获取用户积分
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/points')
          const result = await response.json()
          if (result.success) {
            setUserPoints(result.data.points)
          }
        } catch (error) {
          console.error(t('errors.fetchUserPointsFailed'), error)
        }
      }
    }

    fetchUserPoints()
  }, [session])

  // 获取音频时长的函数
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
      }
      audio.onerror = () => {
        reject(new Error(t('errors.cannotReadAudioFile')))
      }
      audio.src = URL.createObjectURL(file)
    })
  }

  // 获取URL音频时长的函数
  const getUrlAudioDuration = (url: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
      }
      audio.onerror = () => {
        reject(new Error(t('errors.cannotReadAudioUrl')))
      }
      audio.src = url
    })
  }

  // 计算所需积分（按分钟计费）
  const calculateRequiredPoints = (durationInSeconds: number): number => {
    const minutes = Math.ceil(durationInSeconds / 60) // 向上取整
    // 中文版：1分钟30积分，全球版：1分钟42积分
    const pointsPerMinute = selectedLanguage === 'zh' ? 30 : 42
    return minutes * pointsPerMinute
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // 检查登录状态
    if (!session) {
      setShowLoginRequiredDialog(true)
      event.target.value = '' // 清空文件选择
      return
    }

    const file = event.target.files?.[0]
    if (file) {
      try {
        // 获取音频时长
        const duration = await getAudioDuration(file)
        const points = calculateRequiredPoints(duration)

        setAudioDuration(duration)
        setRequiredPoints(points)
        setAudioFile(file)

        // 只在登录时检查积分是否足够
        if (session && userPoints < points) {
          setShowInsufficientPointsDialog(true)
          setAudioFile(null) // 清空文件
          event.target.value = '' // 清空文件选择
          return
        }
      } catch (error) {
        alert(t('errors.audioReadError'))
        event.target.value = '' // 清空文件选择
        return
      }
    }
  }

  // 处理URL输入
  const handleUrlChange = async (url: string) => {
    // 检查登录状态
    if (url && !session) {
      setShowLoginRequiredDialog(true)
      return
    }

    setAudioUrl(url)

    if (url && session) {
      try {
        // 获取URL音频时长
        const duration = await getUrlAudioDuration(url)
        const points = calculateRequiredPoints(duration)

        setAudioDuration(duration)
        setRequiredPoints(points)

        // 只在登录时检查积分是否足够
        if (session && userPoints < points) {
          setShowInsufficientPointsDialog(true)
          setAudioUrl('') // 清空URL
          return
        }
      } catch (error) {
        console.error(t('errors.cannotReadAudioUrlDuration'), error)
        // URL时长获取失败时不阻止用户继续，在处理时再检查
      }
    }
  }

  const handleProcess = async () => {
    // 检查登录状态
    if (!session) {
      setShowLoginRequiredDialog(true)
      return
    }

    // 全球版文件格式和大小限制检查
    if (selectedLanguage === 'global' && audioFile) {
      // 检查文件大小限制 (25MB)
      const maxFileSizeGlobal = 25 * 1024 * 1024 // 25MB
      if (audioFile.size > maxFileSizeGlobal) {
        alert(t('errors.globalFileSizeLimit', { size: (maxFileSizeGlobal / 1024 / 1024).toString() }))
        return
      }

      // 检查文件格式
      const supportedExtensionsGlobal = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
      const fileExtension = audioFile.name.split('.').pop()?.toLowerCase()
      if (!fileExtension || !supportedExtensionsGlobal.includes(fileExtension)) {
        alert(t('errors.globalFileFormatLimit', { formats: supportedExtensionsGlobal.join(', ') }))
        return
      }
    }

    // 检查是否有音频文件或URL
    if (!audioFile && !audioUrl) {
      alert(t('errors.selectAudioFile'))
      return
    }

    // 检查积分是否足够
    if (requiredPoints > 0 && userPoints < requiredPoints) {
      setShowInsufficientPointsDialog(true)
      return
    }

    setIsProcessing(true)
    setIsRecognizing(true)
    setTimestampContent('')
    setSummary('')
    setRecognitionResult('')

    // 显示处理开始提示
    toast({
      title: t('processing.started'),
      description: t('processing.startedDescription'),
      duration: 3000,
    })

    try {
      let audioFileUrl = audioUrl

      // 如果是文件上传，先上传到对应的存储服务
      if (audioFile && !audioUrl) {
        const formData = new FormData()
        formData.append('file', audioFile)

        // 根据版本选择不同的上传API
        const uploadEndpoint = selectedLanguage === 'zh'
          ? '/api/tencent/cos-upload'        // 中文版：腾讯云COS
          : '/api/cloudflare/upload-audio'   // 全球版：Cloudflare R2

        const uploadResponse = await fetch(uploadEndpoint, {
          method: 'POST',
          body: formData,
        })

        const uploadResult = await uploadResponse.json()
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || t('errors.uploadFailed'))
        }

        // 中文版使用公共URL，全球版使用公共URL
        audioFileUrl = selectedLanguage === 'zh'
          ? uploadResult.data.fileUrl
          : uploadResult.data.url
      }

      if (!audioFileUrl) {
        throw new Error(t('errors.selectAudioFile'))
      }

      // 第一阶段：创建语音识别任务
      // 根据版本选择不同的API：中文版使用腾讯云，全球版使用Whisper
      const apiEndpoint = selectedLanguage === 'zh'
        ? '/api/tencent/speech-recognition'
        : '/api/whisper/speech-recognition'

      const recognitionResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: audioFileUrl,
          language: selectedLanguage,
          requiredPoints: requiredPoints, // 传递所需积分
        }),
      })

      const recognitionResult = await recognitionResponse.json()
      if (!recognitionResult.success) {
        throw new Error(recognitionResult.error || t('errors.recognitionFailed'))
      }

      const taskId = recognitionResult.data.taskId

      // 根据版本选择不同的处理方式
      if (selectedLanguage === 'global') {
        // Whisper是同步的，直接处理结果
        await processRecognitionResult(recognitionResult)
      } else {
        // 腾讯云是异步的，需要轮询
        const pollRecognitionResult = async () => {
          const resultResponse = await fetch(`/api/tencent/speech-recognition?taskId=${taskId}`)
          const result = await resultResponse.json()

          if (result.success && result.data.status === 'completed') {
            await processRecognitionResult(result)
          } else if (result.success && result.data.status === 'processing') {
            // 继续轮询
            setTimeout(pollRecognitionResult, 5000) // 5秒后再次查询
          } else {
            throw new Error(t('errors.recognitionFailed'))
          }
        }

        // 开始轮询
        setTimeout(pollRecognitionResult, 5000) // 5秒后开始查询
      }

      // 处理识别结果的通用函数
      async function processRecognitionResult(result: any) {
        if (result.success && result.data.status === 'completed') {
          // 识别完成，立即显示时间戳内容
          const segments = result.data.segments || []
          const fullText = result.data.fullText || ''

          // 设置时间戳内容，UI会立即显示
          setTimestampContent(segments.map((seg: any) =>
            `[${formatTime(seg.startTime)}-${formatTime(seg.endTime)}] ${seg.text}`
          ).join('\n'))

          setRecognitionResult(fullText)
          setIsRecognizing(false) // 停止识别loading，时间戳内容立即显示
          setIsSummarizing(true)  // 开始总结loading，总结部分显示处理中

          // 第二阶段：AI推理总结
          // 根据版本选择不同的API：中文版使用通义千问，全球版使用Gemini
          const summaryApiEndpoint = selectedLanguage === 'zh'
            ? '/api/qwen/audio-summary'
            : '/api/gemini/audio-summary'

          const summaryResponse = await fetch(summaryApiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transcriptText: fullText,
              segments: segments,
              language: selectedLanguage,
            }),
          })

          const summaryResult = await summaryResponse.json()
          if (!summaryResult.success) {
            throw new Error(summaryResult.error || t('errors.summaryFailed'))
          }

          // 总结完成，立即显示总结内容
          setSummary(summaryResult.data.summary) // 设置总结内容，UI会立即显示
          setIsSummarizing(false) // 停止总结loading，总结内容立即显示
          setIsProcessing(false)  // 整个处理流程完成

          // 生成标题并保存记录
          const title = generateTitle(fullText, selectedLanguage)
          const newRecord: ProcessingRecord = {
            id: Date.now().toString(),
            title,
            timestamp: new Date(),
            recognitionResult: fullText,
            summary: summaryResult.data.summary,
            timestampContent: segments.map((seg: any) =>
              `[${formatTime(seg.startTime)}-${formatTime(seg.endTime)}] ${seg.text}`
            ).join('\n'),
            language: selectedLanguage
          }

          const updatedRecords = [newRecord, ...processingRecords]
          setProcessingRecords(updatedRecords)
          saveRecordsToStorage(updatedRecords)
          onRecordsUpdate?.(updatedRecords)

          // 处理完成后，清空上传页面的结果并跳转到记录页面
          setTimestampContent('')
          setSummary('')
          setRecognitionResult('')
          setAudioFile(null)
          setAudioUrl('')

          // 自动选择新创建的记录，显示记录页面
          onRecordSelect?.(newRecord)

          // 更新URL参数以保持记录选择状态
          const currentUrl = new URL(window.location.href)
          currentUrl.searchParams.set('record', newRecord.id)
          window.history.replaceState({}, '', currentUrl.toString())

          // 扣除积分逻辑
          if (requiredPoints > 0) {
            console.log('开始扣除积分:', {
              requiredPoints,
              audioDuration,
              selectedLanguage,
              userPoints
            })

            try {
              const deductResponse = await fetch('/api/user/points/deduct', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  points: requiredPoints,
                  description: selectedLanguage === 'zh'
                    ? t('billing.chineseVersionService', { minutes: Math.ceil(audioDuration / 60) })
                    : t('billing.globalVersionService', { minutes: Math.ceil(audioDuration / 60) }),
                  type: 'audio_summary'
                }),
              })

              console.log('积分扣除API响应状态:', deductResponse.status)

              if (!deductResponse.ok) {
                const errorText = await deductResponse.text()
                console.error('积分扣除API失败:', deductResponse.status, errorText)
                throw new Error(`积分扣除API失败: ${deductResponse.status}`)
              }

              const deductResult = await deductResponse.json()
              console.log('积分扣除结果:', deductResult)

              if (deductResult.success) {
                console.log('积分扣除成功:', {
                  deductedPoints: deductResult.data.deductedPoints,
                  remainingPoints: deductResult.data.remainingPoints
                })
                setUserPoints(deductResult.data.remainingPoints)

                // 显示积分扣除成功提示
                toast({
                  title: t('billing.pointsDeducted'),
                  description: t('billing.pointsDeductedDescription', {
                    points: deductResult.data.deductedPoints,
                    remaining: deductResult.data.remainingPoints
                  }),
                })
              } else {
                console.error('积分扣除失败:', deductResult.error)
                throw new Error(deductResult.error || '积分扣除失败')
              }
            } catch (error) {
              console.error('积分扣除异常:', error)

              // 显示积分扣除失败提示
              toast({
                title: t('errors.pointsDeductionFailed'),
                description: t('errors.pointsDeductionFailedDescription'),
                variant: "destructive",
              })
            }
          } else {
            console.log('无需扣除积分 (requiredPoints = 0)')
          }
        }
      }

    } catch (error) {
      console.error(t('errors.processingError'), error)
      alert(error instanceof Error ? error.message : t('errors.processingFailed'))
      setIsProcessing(false)
      setIsRecognizing(false)
      setIsSummarizing(false)
    }
  }

  // 辅助函数：格式化时间
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
  }

  // 生成标题的函数
  const generateTitle = (content: string, language: string): string => {
    // 移除多余的空白字符
    const cleanContent = content.trim().replace(/\s+/g, ' ')

    // 根据语言选择截取长度
    const maxLength = language === 'zh' ? 20 : 30

    if (cleanContent.length <= maxLength) {
      return cleanContent
    }

    // 截取前面部分作为标题
    return cleanContent.substring(0, maxLength) + '...'
  }

  // 如果选中了记录，显示记录内容
  if (selectedRecord) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => {
              onRecordSelect?.(null)
              // 清除URL参数
              const currentUrl = new URL(window.location.href)
              currentUrl.searchParams.delete('record')
              window.history.replaceState({}, '', currentUrl.toString())
            }}
            className="flex items-center gap-2 text-coral-600 hover:text-coral-700 transition-colors"
          >
            ← {t('common.back')}
          </button>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-charcoal-700 dark:text-charcoal-200 mb-2">
              {selectedRecord.title}
            </h1>
            <p className="text-charcoal-500 dark:text-charcoal-400">
              {selectedRecord.timestamp.toLocaleDateString()} {selectedRecord.timestamp.toLocaleTimeString()}
              <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                {selectedRecord.language === 'zh' ? t('languageSelection.chineseVersion') : t('languageSelection.globalVersion')}
              </span>
            </p>
          </div>

          {/* 时间戳内容 - 第一个显示 */}
          {selectedRecord.timestampContent && (
            <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm border dark:border-charcoal-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-charcoal-700 dark:text-charcoal-200">
                    ⏰ {t('timestamp.title')}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(selectedRecord.timestampContent)
                        toast({
                          title: t('timestamp.copySuccess'),
                          description: t('timestamp.copySuccessDescription'),
                        })
                      } catch (error) {
                        toast({
                          title: t('timestamp.copyError'),
                          description: t('timestamp.copyErrorDescription'),
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t('timestamp.copy')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      try {
                        const blob = new Blob([selectedRecord.timestampContent], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `audio-transcript-${new Date().toISOString().slice(0, 10)}.txt`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)

                        toast({
                          title: t('timestamp.downloadSuccess'),
                          description: t('timestamp.downloadSuccessDescription'),
                        })
                      } catch (error) {
                        toast({
                          title: t('timestamp.downloadError'),
                          description: t('timestamp.downloadErrorDescription'),
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('timestamp.download')}
                  </Button>
                </div>
              </div>

              <div className="bg-almond-50 dark:bg-charcoal-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="space-y-2 text-sm">
                  {selectedRecord.timestampContent.split('\n').filter(line => line.trim()).map((line, index) => {
                    // 解析时间戳格式: [00:01-00:12] 文本内容
                    const match = line.match(/\[([^\]]+)\]\s*(.*)/)
                    if (match) {
                      const [, timeRange, text] = match
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-coral-600 font-mono text-xs bg-coral-100 dark:bg-coral-900/30 px-2 py-1 rounded flex-shrink-0">
                            {timeRange}
                          </span>
                          <p className="text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
                            {text.trim()}
                          </p>
                        </div>
                      )
                    } else {
                      // 如果没有时间戳格式，直接显示文本
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-coral-600 font-mono text-xs bg-coral-100 dark:bg-coral-900/30 px-2 py-1 rounded flex-shrink-0">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <p className="text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
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

          {/* 总结内容 - 第二个显示 */}
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm border dark:border-charcoal-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-charcoal-700 dark:text-charcoal-200">
                  📋 {t('summary.title')}
                </h3>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selectedRecord.summary)
                      toast({
                        title: t('summary.copySuccess'),
                        description: t('summary.copySuccessDescription'),
                      })
                    } catch (error) {
                      toast({
                        title: t('summary.copyError'),
                        description: t('summary.copyErrorDescription'),
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {t('summary.copy')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    try {
                      const blob = new Blob([selectedRecord.summary], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `audio-summary-${new Date().toISOString().slice(0, 10)}.txt`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)

                      toast({
                        title: t('summary.downloadSuccess'),
                        description: t('summary.downloadSuccessDescription'),
                      })
                    } catch (error) {
                      toast({
                        title: t('summary.downloadError'),
                        description: t('summary.downloadErrorDescription'),
                        variant: "destructive",
                      })
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('summary.download')}
                </Button>
              </div>
            </div>

            <div className="bg-almond-50 dark:bg-charcoal-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                  {selectedRecord.summary}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 如果正在处理，显示处理界面
  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-charcoal-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* 正在思考中 */}
          {isRecognizing && !timestampContent && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-coral-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold text-charcoal-700 dark:text-charcoal-200">
                {t('processing.thinking')}
              </h2>
              <p className="text-charcoal-500 dark:text-charcoal-400 max-w-2xl mx-auto">
                {t('processing.thinkingDescription')}
              </p>
            </div>
          )}

          {/* 识别完成，显示时间戳内容 */}
          {timestampContent && isSummarizing && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm border dark:border-charcoal-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-charcoal-700 dark:text-charcoal-200">
                      ⏰ {t('timestamp.title')}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(timestampContent)
                          toast({
                            title: t('timestamp.copySuccess'),
                            description: t('timestamp.copySuccessDescription'),
                          })
                        } catch (error) {
                          toast({
                            title: t('timestamp.copyError'),
                            description: t('timestamp.copyErrorDescription'),
                            variant: "destructive",
                          })
                        }
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t('timestamp.copy')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          const blob = new Blob([timestampContent], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `audio-transcript-${new Date().toISOString().slice(0, 10)}.txt`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                          URL.revokeObjectURL(url)

                          toast({
                            title: t('timestamp.downloadSuccess'),
                            description: t('timestamp.downloadSuccessDescription'),
                          })
                        } catch (error) {
                          toast({
                            title: t('timestamp.downloadError'),
                            description: t('timestamp.downloadErrorDescription'),
                            variant: "destructive",
                          })
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('timestamp.download')}
                    </Button>
                  </div>
                </div>

                <div className="bg-almond-50 dark:bg-charcoal-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2 text-sm">
                    {timestampContent.split('\n').filter(line => line.trim()).map((line, index) => {
                      // 解析时间戳格式: [00:01-00:12] 文本内容
                      const match = line.match(/\[([^\]]+)\]\s*(.*)/)
                      if (match) {
                        const [, timeRange, text] = match
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <span className="text-coral-600 font-mono text-xs bg-coral-100 dark:bg-coral-900/30 px-2 py-1 rounded flex-shrink-0">
                              {timeRange}
                            </span>
                            <p className="text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
                              {text.trim()}
                            </p>
                          </div>
                        )
                      } else {
                        // 如果没有时间戳格式，直接显示文本
                        return (
                          <div key={index} className="flex items-start gap-3">
                            <span className="text-coral-600 font-mono text-xs bg-coral-100 dark:bg-coral-900/30 px-2 py-1 rounded flex-shrink-0">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <p className="text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
                              {line.trim()}
                            </p>
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              </div>

              {/* 正在分析总结中 */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="w-12 h-12 text-coral-600 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal-700 dark:text-charcoal-200">
                  {t('processing.analyzing')}
                </h2>
                <p className="text-charcoal-500 dark:text-charcoal-400 max-w-2xl mx-auto">
                  {t('processing.analyzingDescription')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-almond-100 dark:bg-almond-800/30 px-4 py-2 rounded-full mb-6">
            <Brain className="w-5 h-5 text-coral-600" />
            <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">
              {t('badge')}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-charcoal-700 dark:text-charcoal-200">
            <span className="text-coral-600 dark:text-coral-400">
              {t('title')}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('description')}
          </p>

          {/* Language Selection */}
          <div className="flex justify-center mb-8">
            <Card className="p-4 max-w-2xl">
              <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <Label className="text-base font-medium text-charcoal-700 dark:text-charcoal-200">
                      {t('languageSelection.label')}
                    </Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-40 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh">{t('languageSelection.chineseVersion')}</SelectItem>
                        <SelectItem value="global">{t('languageSelection.globalVersion')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language Support Info */}
                  <div className="text-xs text-charcoal-600 dark:text-charcoal-300 bg-almond-50 dark:bg-charcoal-700 p-3 rounded-lg">
                    {selectedLanguage === 'zh' ? (
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium text-green-600 dark:text-green-400">✅ {t('languageSelection.chineseRecognition')}</span>
                          {t('languageSelection.chineseCapability')}
                        </p>
                        <div className="text-xs bg-green-50 dark:bg-green-900/30 p-2 rounded border-l-2 border-green-400 dark:border-green-500">
                          <p className="font-medium text-green-700 dark:text-green-300 mb-1">{t('languageSelection.dialectSupport')}</p>
                          <p className="text-green-600 dark:text-green-400 leading-relaxed">
                            {t('languageSelection.dialectList')}
                          </p>
                          <p className="text-green-700 dark:text-green-300 font-medium mt-2">
                            {t('languageSelection.chineseBilling')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium text-green-600 dark:text-green-400">✅ {t('languageSelection.globalRecognition')}</span>
                          {t('languageSelection.globalCapability')}
                        </p>
                        <div className="text-xs bg-green-50 dark:bg-green-900/30 p-2 rounded border-l-2 border-green-400 dark:border-green-500">
                          <p className="text-green-600 dark:text-green-400 leading-relaxed">
                            {t('languageSelection.globalDescription')}
                          </p>
                          <p className="text-green-700 dark:text-green-300 font-medium mt-2">
                            {t('languageSelection.globalBilling')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
          </div>
        </div>

        <div className="space-y-8">
          {/* Input Section */}
          <div className="flex justify-center">
              <Card className="w-full max-w-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5 text-coral-600" />
                    {t('input.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upload" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {t('input.uploadTab')}
                    </TabsTrigger>
                    <TabsTrigger value="url" className="flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      {t('input.urlTab')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="space-y-3">
                    <div className="border-2 border-dashed border-charcoal-300 rounded-lg p-8 text-center hover:border-coral-400 hover:bg-coral-50/50 transition-all duration-300 group">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="audio-upload"
                        disabled={!session}
                      />
                      <label
                        htmlFor={session ? "audio-upload" : undefined}
                        className="block cursor-pointer"
                        onClick={(e) => {
                          if (!session) {
                            e.preventDefault()
                            setShowLoginRequiredDialog(true)
                          }
                        }}
                      >
                        <FileAudio className="w-12 h-12 text-charcoal-400 group-hover:text-coral-500 mx-auto mb-4 transition-colors" />
                        <p className="text-lg font-medium text-charcoal-600 group-hover:text-charcoal-700 mb-2 transition-colors">
                          {t('input.uploadTitle')}
                        </p>
                        <p className="text-sm text-charcoal-500 group-hover:text-charcoal-600 transition-colors">
                          {selectedLanguage === 'zh'
                            ? t('input.uploadDescription')
                            : t('input.uploadDescriptionGlobal')
                          }
                        </p>
                      </label>
                    </div>

                    {audioFile && (
                      <div className="flex items-center gap-3 p-3 bg-almond-50 rounded-lg">
                        <FileAudio className="w-5 h-5 text-coral-600" />
                        <span className="text-sm font-medium">{audioFile.name}</span>
                        <Badge variant="secondary">{(audioFile.size / 1024 / 1024).toFixed(1)} MB</Badge>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="audio-url">
                        {t('input.urlLabel')}
                      </Label>
                      <Input
                        id="audio-url"
                        placeholder={t('input.urlPlaceholder')}
                        value={audioUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        onFocus={() => {
                          if (!session) {
                            setShowLoginRequiredDialog(true)
                          }
                        }}
                      />
                      {selectedLanguage === 'zh' && (
                        <p className="text-xs text-charcoal-500 mt-2">
                          {t('input.urlDescription')}
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>



                {/* 积分信息显示 */}
                {session && (
                  <div className="mt-4 p-3 bg-almond-100 dark:bg-almond-800/30 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-charcoal-600 dark:text-charcoal-300">{t('billing.currentPoints')}</span>
                      <span className="font-medium text-coral-600 dark:text-coral-400">{userPoints} {t('billing.points')}</span>
                    </div>
                    {requiredPoints > 0 && (
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-charcoal-600 dark:text-charcoal-300">{t('billing.thisConsumption')}</span>
                        <span className="font-medium text-charcoal-700 dark:text-charcoal-200">
                          {requiredPoints} {t('billing.points')} ({Math.ceil(audioDuration / 60)}{t('billing.minutes')} × {selectedLanguage === 'zh' ? '30' : '42'}{t('billing.pointsPerMinute')})
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || (!audioFile && !audioUrl) || (!!session && requiredPoints > 0 && userPoints < requiredPoints)}
                  className="w-full mt-6 bg-coral-600 text-white hover:bg-coral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isRecognizing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('input.recognizingButton')}
                    </>
                  ) : isSummarizing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('input.summarizingButton')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('input.startButton')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            </div>

            {/* Processing Status - 只显示处理状态，不显示结果 */}
            {(isRecognizing || isSummarizing) && (
              <div className="flex justify-center">
                <Card className="w-full max-w-4xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      {isRecognizing ? (
                        <>
                          <Clock className="w-5 h-5 text-coral-600" />
                          {t('timestamp.title')}
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5 text-coral-600" />
                          {t('summary.title')}
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                <CardContent>
                  {isRecognizing && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3 text-coral-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">{t('timestamp.recognizing')}</p>
                          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
                            {t('timestamp.recognizingDescription')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isSummarizing && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3 text-coral-600">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200">{t('summary.summarizing')}</p>
                          <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">
                            {t('summary.summarizingDescription')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}


                </CardContent>
              </Card>
              </div>
            )}



        {/* Features Section */}
        <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t('features.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-coral-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('features.timestampTitle')}
                </h3>
                <p className="text-muted-foreground">
                  {t('features.timestampDescription')}
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-coral-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('features.reasoningTitle')}
                </h3>
                <p className="text-muted-foreground">
                  {t('features.reasoningDescription')}
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="w-12 h-12 bg-coral-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t('features.structuredTitle')}
                </h3>
                <p className="text-muted-foreground">
                  {t('features.structuredDescription')}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 积分不足对话框 */}
      <Dialog open={showInsufficientPointsDialog} onOpenChange={setShowInsufficientPointsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-coral-600">{t('billing.insufficientPoints')}</DialogTitle>
            <DialogDescription>
              {t('billing.insufficientPointsMessage')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-almond-50 rounded-lg">
              <span className="text-sm text-charcoal-600">{t('billing.currentPoints')}</span>
              <span className="font-medium text-charcoal-700">{userPoints} {t('billing.points')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-coral-50 rounded-lg">
              <span className="text-sm text-charcoal-600">{t('billing.requiredPoints')}</span>
              <span className="font-medium text-coral-600">{requiredPoints} {t('billing.points')}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-charcoal-600">{t('billing.needToRecharge')}</span>
              <span className="font-medium text-red-600">{requiredPoints - userPoints} {t('billing.points')}</span>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInsufficientPointsDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-coral-600 hover:bg-coral-700"
              onClick={() => {
                setShowInsufficientPointsDialog(false)
                router.push('/profile')
              }}
            >
              {t('billing.goRecharge')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 登录提示对话框 */}
      <Dialog open={showLoginRequiredDialog} onOpenChange={setShowLoginRequiredDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-coral-600">{t('errors.loginRequired')}</DialogTitle>
            <DialogDescription>
              {t('errors.loginRequiredDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLoginRequiredDialog(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-coral-600 hover:bg-coral-700"
              onClick={() => {
                const currentPath = window.location.pathname
                router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`)
              }}
            >
              {t('common.login')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}