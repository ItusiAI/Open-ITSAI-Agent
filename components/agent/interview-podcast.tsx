"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Play,
  Pause,
  Download,
  Loader2,
  Volume2,
  FileAudio,
  Sparkles,
  MessageSquare,
  Copy,
  CheckCircle,
  Brain,
  Edit,
  Save,
  X,
  Check,
  ArrowLeft,
  AlertCircle
} from 'lucide-react'

interface DialogueSegment {
  speaker: string
  role: 'host' | 'guest'
  content: string
  voicePrompt?: string
  voiceId?: string
  audioUrl?: string
}

interface PodcastRecord {
  id: string
  title: string
  timestamp: Date
  inputContent: string
  dialogueSegments: DialogueSegment[]
  finalAudioUrl?: string
}

interface InterviewPodcastContentProps {
  onRecordsUpdate?: (records: PodcastRecord[]) => void
  onRecordSelect?: (record: PodcastRecord | null) => void
  selectedRecord?: PodcastRecord | null
}

export function InterviewPodcastContent({
  onRecordsUpdate,
  onRecordSelect,
  selectedRecord
}: InterviewPodcastContentProps = {}) {
  const t = useTranslations('agent.interviewPodcast')
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [inputContent, setInputContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingVoicePrompts, setIsGeneratingVoicePrompts] = useState(false)
  const [isDesigningVoices, setIsDesigningVoices] = useState(false)
  const [isSynthesizing, setIsSynthesizing] = useState(false)
  const [dialogueSegments, setDialogueSegments] = useState<DialogueSegment[]>([])
  const [voicePrompts, setVoicePrompts] = useState<Record<string, string>>({})
  const [voiceDesigns, setVoiceDesigns] = useState<Record<string, any>>({})
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [finalAudioUrl, setFinalAudioUrl] = useState<string | null>(null)
  const [podcastRecords, setPodcastRecords] = useState<PodcastRecord[]>([])
  const [showLoginRequiredDialog, setShowLoginRequiredDialog] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // 积分相关状态
  const [userPoints, setUserPoints] = useState(0)
  const [requiredPoints, setRequiredPoints] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)

  // 编辑状态管理
  const [isEditingOriginalContent, setIsEditingOriginalContent] = useState(false)
  const [editingSegmentIndex, setEditingSegmentIndex] = useState<number | null>(null)
  const [editedOriginalContent, setEditedOriginalContent] = useState('')
  const [editedSegmentContent, setEditedSegmentContent] = useState('')
  const [editedSegmentVoicePrompt, setEditedSegmentVoicePrompt] = useState('')

  // 音色和语言选择状态
  const [selectedLanguage, setSelectedLanguage] = useState<'zh'>('zh') // 暂时只支持中文
  const [selectedHostVoice, setSelectedHostVoice] = useState('male-qn-qingse')
  const [selectedGuestVoice, setSelectedGuestVoice] = useState('female-shaonv')
  const [availableVoices, setAvailableVoices] = useState<any[]>([])

  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])

  // 按类别分组音色
  const groupVoicesByCategory = (voices: any[], genderFilter: string[]) => {
    const filteredVoices = voices.filter(voice => genderFilter.includes(voice.gender))
    const grouped = filteredVoices.reduce((acc, voice) => {
      if (!acc[voice.category]) {
        acc[voice.category] = []
      }
      acc[voice.category].push(voice)
      return acc
    }, {} as Record<string, any[]>)

    // 定义类别显示顺序
    const categoryOrder = ['youth', 'mature', 'sweet', 'professional', 'audiobook', 'premium', 'child', 'character', 'cartoon']

    return categoryOrder.reduce((orderedGroups, category) => {
      if (grouped[category]) {
        orderedGroups[category] = grouped[category]
      }
      return orderedGroups
    }, {} as Record<string, any[]>)
  }

  // 加载可用音色列表
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch('/api/minimax/voice-synthesis')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setAvailableVoices(result.data.voices)
          }
        }
      } catch (error) {
        console.error('Failed to load voices:', error)
      }
    }

    loadVoices()
  }, [])

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
          console.error('Failed to fetch user points:', error)
        }
      }
    }

    fetchUserPoints()
  }, [session])

  // 计算所需积分
  useEffect(() => {
    const count = inputContent.length
    const points = Math.ceil(count * 0.2) // 0.2积分/字符，向上取整
    setCharacterCount(count)
    setRequiredPoints(points)
  }, [inputContent])

  // 积分扣除函数（在最终音频生成完成后调用）
  const deductPointsForPodcast = async () => {
    try {
      const deductResponse = await fetch('/api/user/points/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: requiredPoints,
          description: `访谈播客生成服务 - ${characterCount}字符`,
          type: 'interview_generation'
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
          title: t('success.podcastGenerated'),
          description: t('success.podcastGeneratedWithBilling', {
            points: deductResult.data.deductedPoints,
            remaining: deductResult.data.remainingPoints,
            characters: characterCount
          }),
        })
      } else {
        console.error('积分扣除失败:', deductResult.error)
        throw new Error(deductResult.error || '积分扣除失败')
      }
    } catch (deductError) {
      console.error('积分扣除过程中发生错误:', deductError)
      // 显示普通成功提示，但记录积分扣除失败
      toast({
        title: t('success.podcastGenerated'),
        description: t('success.podcastGenerated'),
      })
    }
  }

  // 从localStorage加载记录
  useEffect(() => {
    const loadRecords = () => {
      try {
        const savedRecords = localStorage.getItem('interviewPodcastRecords')
        if (savedRecords) {
          const records = JSON.parse(savedRecords).map((record: any) => ({
            ...record,
            timestamp: new Date(record.timestamp)
          }))
          setPodcastRecords(records)
          onRecordsUpdate?.(records)

          // 检查URL参数中是否有记录ID
          const recordId = searchParams.get('record')
          if (recordId && !selectedRecord) {
            const targetRecord = records.find((r: PodcastRecord) => r.id === recordId)
            if (targetRecord) {
              onRecordSelect?.(targetRecord)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load podcast records from localStorage:', error)
      }
    }

    loadRecords()
  }, [searchParams, selectedRecord, onRecordsUpdate, onRecordSelect])

  // 保存记录到localStorage（必须包含完整音频数据）
  const saveRecord = (record: PodcastRecord) => {
    // 验证记录是否包含完整的音频数据
    if (!record.finalAudioUrl) {
      toast({
        title: t('errors.saveRecordFailed'),
        description: t('errors.incompleteAudioData'),
        variant: "destructive"
      })
      return
    }

    // 验证所有对话段落是否都有音频
    const hasAllAudio = record.dialogueSegments.every(segment => segment.audioUrl)
    if (!hasAllAudio) {
      toast({
        title: t('errors.saveRecordFailed'),
        description: t('errors.incompleteSegmentAudio'),
        variant: "destructive"
      })
      return
    }

    try {
      const updatedRecords = [record, ...podcastRecords.filter(r => r.id !== record.id)]

      // 尝试保存完整记录（包含音频）
      localStorage.setItem('interviewPodcastRecords', JSON.stringify(updatedRecords))

      // 只有保存成功才更新状态
      setPodcastRecords(updatedRecords)
      onRecordsUpdate?.(updatedRecords)
      onRecordSelect?.(record)

      // 更新URL参数以保持状态
      const params = new URLSearchParams(searchParams.toString())
      params.set('record', record.id)
      router.replace(`?${params.toString()}`, { scroll: false })

      toast({
        title: t('success.recordSaved'),
        description: t('success.recordSavedWithAudio'),
      })

    } catch (error) {
      console.error('Failed to save podcast record:', error)

      // 如果是存储配额错误，提供清晰的错误信息
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast({
          title: t('errors.storageQuotaExceeded'),
          description: t('errors.storageQuotaExceededDesc'),
          variant: "destructive"
        })
      } else {
        toast({
          title: t('errors.saveRecordFailed'),
          description: error instanceof Error ? error.message : t('errors.unknownError'),
          variant: "destructive"
        })
      }
    }
  }

  // 清理旧记录（保留最新N条）
  const cleanupOldRecords = (keepCount: number = 5) => {
    const sortedRecords = [...podcastRecords].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    const recordsToKeep = sortedRecords.slice(0, keepCount)

    setPodcastRecords(recordsToKeep)
    localStorage.setItem('interviewPodcastRecords', JSON.stringify(recordsToKeep))
    onRecordsUpdate?.(recordsToKeep)

    toast({
      title: t('success.cleanupCompleted'),
      description: t('success.cleanupCompletedDesc', { count: keepCount }),
    })
  }

  // 获取存储使用情况
  const getStorageInfo = () => {
    try {
      const data = localStorage.getItem('interviewPodcastRecords')
      if (data) {
        const sizeInBytes = new Blob([data]).size
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)
        return { size: sizeInMB, recordCount: podcastRecords.length }
      }
    } catch (error) {
      console.error('Failed to get storage info:', error)
    }
    return { size: '0', recordCount: 0 }
  }

  // 第一步：生成访谈对话内容
  const generateInterview = async () => {
    if (!inputContent.trim()) {
      toast({
        title: t('errors.inputRequired'),
        description: t('errors.inputRequired'),
        variant: "destructive"
      })
      return
    }

    if (!session?.user?.email) {
      setShowLoginRequiredDialog(true)
      return
    }

    // 检查积分是否足够
    if (userPoints < requiredPoints) {
      toast({
        title: t('errors.insufficientPoints'),
        description: t('errors.insufficientPointsDesc', {
          required: requiredPoints,
          current: userPoints,
          characters: characterCount
        }),
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    setDialogueSegments([])
    setVoicePrompts({})
    setVoiceDesigns({})
    setFinalAudioUrl(null)
    setShowPreview(false)

    try {
      // 使用通义千问-Turbo-Latest模型生成访谈内容
      const response = await fetch('/api/qwen/interview-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputContent
        }),
      })

      const result = await response.json()

      if (!result.success) {
        // 如果是积分不足错误，显示详细信息
        if (result.error === '积分不足' && result.data) {
          toast({
            title: t('errors.insufficientPoints'),
            description: t('errors.insufficientPointsDesc', {
              required: result.data.requiredPoints,
              current: result.data.currentPoints,
              characters: result.data.characterCount
            }),
            variant: "destructive"
          })
        } else {
          throw new Error(result.error || t('errors.generateFailed'))
        }
        return
      }

      const segments = result.data.segments
      setDialogueSegments(segments)
      setIsGenerating(false)
      setShowPreview(true)

      toast({
        title: t('success.dialogueGenerated'),
        description: t('success.dialogueGeneratedDesc'),
      })

    } catch (error) {
      console.error('Failed to generate interview:', error)
      setIsGenerating(false)
      toast({
        title: t('errors.generateFailed'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        variant: "destructive"
      })
    }
  }

  // 第二步：直接使用选择的音色进行语音合成（注释掉音色prompt生成，保留代码以备后用）
  const generateVoicePrompts = async () => {
    if (dialogueSegments.length === 0) {
      toast({
        title: t('errors.dialogueRequired'),
        description: t('errors.dialogueRequired'),
        variant: "destructive"
      })
      return
    }

    if (!session?.user?.email) {
      setShowLoginRequiredDialog(true)
      return
    }

    // 直接使用选择的音色进行语音合成
    await synthesizeVoicesWithSelectedVoices()
  }

  // 使用选择的音色进行语音合成
  const synthesizeVoicesWithSelectedVoices = async () => {
    setIsSynthesizing(true)

    try {
      const audioBuffers: Buffer[] = []
      const updatedSegments = [...dialogueSegments]

      for (let i = 0; i < dialogueSegments.length; i++) {
        const segment = dialogueSegments[i]

        // 根据角色选择对应的音色
        const voiceId = segment.role === 'host' ? selectedHostVoice : selectedGuestVoice

        // 根据语言版本选择不同的语音合成API
        // 中文版使用MiniMax，全球版也使用MiniMax（暂时）
        const voiceSynthesisEndpoint = selectedLanguage === 'zh'
          ? '/api/minimax/voice-synthesis'
          : '/api/minimax/voice-synthesis'

        const response = await fetch(voiceSynthesisEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: segment.content,
            voiceId: voiceId,
            language: selectedLanguage
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`语音合成失败: HTTP ${response.status} - ${errorText}`)
        }

        const result = await response.json()

        if (result.success && result.data.audioBuffer) {
          // 直接收集音频Buffer，避免base64转换
          const audioBuffer = Buffer.from(result.data.audioBuffer, 'hex')
          audioBuffers.push(audioBuffer)

          // 为了显示，仍然创建单个段落的audioUrl
          const segmentAudioBase64 = audioBuffer.toString('base64')
          const segmentAudioUrl = `data:audio/mp3;base64,${segmentAudioBase64}`

          updatedSegments[i] = {
            ...segment,
            voiceId: voiceId,
            audioUrl: segmentAudioUrl
          }

          // 更新当前段落的音频URL
          setDialogueSegments([...updatedSegments])
        } else {
          throw new Error(result.error || t('errors.voiceSynthesisFailed'))
        }
      }



      // 直接合并音频Buffer，无需API调用
      let mergedAudioUrl = undefined
      if (audioBuffers.length > 0) {
        // 直接合并所有音频Buffer
        const mergedBuffer = Buffer.concat(audioBuffers)

        // 转换为base64数据URL
        const mergedBase64 = mergedBuffer.toString('base64')
        mergedAudioUrl = `data:audio/mp3;base64,${mergedBase64}`

        setFinalAudioUrl(mergedAudioUrl)
      }

      setIsSynthesizing(false)

        // 保存记录
        const newRecord: PodcastRecord = {
          id: `podcast_${Date.now()}`,
          title: inputContent.slice(0, 50) + (inputContent.length > 50 ? '...' : ''),
          timestamp: new Date(),
          inputContent: inputContent,
          dialogueSegments: updatedSegments,
          finalAudioUrl: mergedAudioUrl  // 使用刚刚获取的合并音频URL
        }


        saveRecord(newRecord)

      // 最终音频生成完成，扣除积分
      await deductPointsForPodcast()

    } catch (error) {
      console.error('Voice synthesis failed:', error)
      setIsSynthesizing(false)
      toast({
        title: t('errors.voiceSynthesisFailed'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        variant: "destructive"
      })
    }
  }

  /*
  // 原始音色prompt生成代码（保留以备后用）
  const generateVoicePromptsOriginal = async () => {
    if (dialogueSegments.length === 0) {
      toast({
        title: t('errors.dialogueRequired'),
        description: t('errors.dialogueRequired'),
        variant: "destructive"
      })
      return
    }

    setIsGeneratingVoicePrompts(true)

    try {
      const response = await fetch('/api/gemini/voice-prompt-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segments: dialogueSegments
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || t('errors.voicePromptFailed'))
      }

      setVoicePrompts(result.data.voicePrompts)
      setIsGeneratingVoicePrompts(false)

      // 自动进行下一步：设计音色
      await designVoices(result.data.voicePrompts)

    } catch (error) {
      console.error('Failed to generate voice prompts:', error)
      setIsGeneratingVoicePrompts(false)
      toast({
        title: t('errors.voicePromptFailed'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        variant: "destructive"
      })
    }
  }
  */

  /*
  // 第三步：设计音色（成本优化版本）- 注释掉，保留代码以备后用
  const designVoices = async (prompts?: Record<string, string>) => {
    const promptsToUse = prompts || voicePrompts

    if (Object.keys(promptsToUse).length === 0) {
      toast({
        title: t('errors.voicePromptRequired'),
        description: t('errors.voicePromptRequired'),
        variant: "destructive"
      })
      return
    }

    setIsDesigningVoices(true)

    try {
      // 准备试听文本：将每个角色的对话段落合并作为试听文本
      const voiceDesignData: Record<string, { voicePrompt: string; previewText: string }> = {}

      // 为每个说话者收集对话内容作为试听文本
      Object.keys(promptsToUse).forEach(speaker => {
        const speakerSegments = dialogueSegments.filter(segment => segment.speaker === speaker)
        const previewText = speakerSegments.map(segment => segment.content).join('。')

        voiceDesignData[speaker] = {
          voicePrompt: promptsToUse[speaker],
          previewText: previewText
        }
      })

      const response = await fetch('/api/minimax/voice-design-optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voiceDesignData: voiceDesignData
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || t('errors.voiceDesignFailed'))
      }

      // 保存音色设计结果和生成的音频URL
      setVoiceDesigns(result.data.voiceDesigns)

      // 优化方案：如果返回了预生成的音频，直接使用
      if (result.data.preGeneratedAudios) {
        await processPreGeneratedAudios(result.data.preGeneratedAudios, result.data.voiceDesigns)
      } else {
        // 传统方案暂时禁用，如果没有预生成音频则报错
        throw new Error(t('errors.noPreGeneratedAudio'))
        // TODO: 传统语音合成流程（暂时禁用）
        // await synthesizeVoices(result.data.voiceDesigns)
      }

      setIsDesigningVoices(false)

    } catch (error) {
      console.error('Voice design failed:', error)
      setIsDesigningVoices(false)
      toast({
        title: t('errors.voiceDesignFailed'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        variant: "destructive"
      })
    }
  }
  */

  /*
  // 处理预生成的音频（成本优化版本）- 注释掉，保留代码以备后用
  const processPreGeneratedAudios = async (preGeneratedAudios: Record<string, string>, voiceDesigns: Record<string, any>) => {
    try {
      setIsSynthesizing(true)

      // 将预生成的完整音频按段落切割
      const audioUrls: string[] = []
      const updatedSegments = [...dialogueSegments]

      for (let i = 0; i < dialogueSegments.length; i++) {
        const segment = dialogueSegments[i]
        const speakerAudioUrl = preGeneratedAudios[segment.speaker]
        const voiceDesign = voiceDesigns[segment.speaker]

        if (speakerAudioUrl && voiceDesign) {
          // 调用音频切割API，根据文本内容切割对应的音频片段
          const response = await fetch('/api/audio/segment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audioUrl: speakerAudioUrl,
              text: segment.content,
              segmentIndex: i,
              allSegments: dialogueSegments.filter(s => s.speaker === segment.speaker).map(s => s.content)
            }),
          })

          const result = await response.json()

          if (result.success && result.data.segmentAudioUrl) {
            audioUrls.push(result.data.segmentAudioUrl)
            updatedSegments[i] = {
              ...segment,
              voicePrompt: voiceDesign.voicePrompt,
              voiceId: voiceDesign.voiceId,
              audioUrl: result.data.segmentAudioUrl
            }
          }
        }
      }

      // 更新对话段落
      setDialogueSegments(updatedSegments)

      // 合成最终音频
      if (audioUrls.length > 0) {
        const mergeResponse = await fetch('/api/audio/merge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioUrls: audioUrls
          }),
        })

        const mergeResult = await mergeResponse.json()
        if (mergeResult.success) {
          setFinalAudioUrl(mergeResult.data.mergedAudioUrl)
        }
      }

      setIsSynthesizing(false)

      // 保存记录
      const newRecord: PodcastRecord = {
        id: `podcast_${Date.now()}`,
        title: inputContent.slice(0, 50) + (inputContent.length > 50 ? '...' : ''),
        timestamp: new Date(),
        inputContent: inputContent,
        dialogueSegments: updatedSegments,
        finalAudioUrl: finalAudioUrl || undefined
      }
      saveRecord(newRecord)

      toast({
        title: t('success.podcastGenerated'),
        description: t('success.podcastGenerated'),
      })

    } catch (error) {
      console.error('Pre-generated audio processing failed:', error)
      setIsSynthesizing(false)
      toast({
        title: t('errors.voiceSynthesisFailed'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        variant: "destructive"
      })
    }
  }
  */

  /*
  // 第四步：语音合成（传统方案 - 暂时禁用，保留代码以备后用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const synthesizeVoices = async (designs?: Record<string, any>) => {
    const designsToUse = designs || voiceDesigns

    if (Object.keys(designsToUse).length === 0) {
      toast({
        title: t('errors.voiceDesignRequired'),
        description: t('errors.voiceDesignRequired'),
        variant: "destructive"
      })
      return
    }

    setIsSynthesizing(true)

    try {
      const audioUrls: string[] = []
      const updatedSegments = [...dialogueSegments]

      for (let i = 0; i < dialogueSegments.length; i++) {
        const segment = dialogueSegments[i]
        const voiceDesign = designsToUse[segment.speaker]

        if (!voiceDesign) {
          console.warn(`Voice design not found for ${segment.speaker}`)
          continue
        }

        const response = await fetch('/api/minimax/voice-synthesis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: segment.content,
            voiceId: voiceDesign.voiceId,
            voicePrompt: voiceDesign.voicePrompt
          }),
        })

        const result = await response.json()

        if (result.success && result.data.audioUrl) {
          audioUrls.push(result.data.audioUrl)
          updatedSegments[i] = {
            ...segment,
            voicePrompt: voiceDesign.voicePrompt,
            voiceId: voiceDesign.voiceId,
            audioUrl: result.data.audioUrl
          }

          // 更新当前段落的音频URL
          setDialogueSegments([...updatedSegments])
        }
      }

      // 合成最终音频
      if (audioUrls.length > 0) {
        const mergeResponse = await fetch('/api/audio/merge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audioUrls: audioUrls
          }),
        })

        const mergeResult = await mergeResponse.json()

        if (mergeResult.success) {
          setFinalAudioUrl(mergeResult.data.mergedAudioUrl)
        }
      }

      setIsSynthesizing(false)

      // 保存记录
      const newRecord: PodcastRecord = {
        id: `podcast_${Date.now()}`,
        title: inputContent.slice(0, 50) + (inputContent.length > 50 ? '...' : ''),
        timestamp: new Date(),
        inputContent: inputContent,
        dialogueSegments: updatedSegments,
        finalAudioUrl: finalAudioUrl || undefined
      }
      saveRecord(newRecord)

      toast({
        title: t('success.podcastGenerated'),
        description: t('success.podcastGenerated'),
      })

    } catch (error) {
      console.error('Voice synthesis failed:', error)
      setIsSynthesizing(false)
      toast({
        title: t('errors.voiceSynthesisFailed'),
        description: error instanceof Error ? error.message : t('errors.unknownError'),
        variant: "destructive"
      })
    }
  }
  */

  // 播放/暂停音频
  const toggleAudio = (index: number) => {
    const audio = audioRefs.current[index]
    if (!audio) return

    if (currentlyPlaying === index) {
      audio.pause()
      setCurrentlyPlaying(null)
    } else {
      // 暂停其他音频
      audioRefs.current.forEach((a, i) => {
        if (a && i !== index) {
          a.pause()
        }
      })
      
      audio.play()
      setCurrentlyPlaying(index)
    }
  }

  // 下载音频
  const downloadAudio = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 编辑相关函数（记录模式下不使用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startEditingOriginalContent = () => {
    setIsEditingOriginalContent(true)
    setEditedOriginalContent(selectedRecord?.inputContent || '')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cancelEditingOriginalContent = () => {
    setIsEditingOriginalContent(false)
    setEditedOriginalContent('')
  }

  const saveOriginalContent = () => {
    if (!selectedRecord) return

    const updatedRecord = {
      ...selectedRecord,
      inputContent: editedOriginalContent,
      title: editedOriginalContent.slice(0, 50) + (editedOriginalContent.length > 50 ? '...' : '')
    }

    saveRecord(updatedRecord)
    setIsEditingOriginalContent(false)
    setEditedOriginalContent('')

    toast({
      title: t('ui.editSuccess'),
      description: t('ui.editSuccessDesc'),
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startEditingSegment = (index: number) => {
    const segment = selectedRecord?.dialogueSegments[index]
    if (segment) {
      setEditingSegmentIndex(index)
      setEditedSegmentContent(segment.content)
      setEditedSegmentVoicePrompt(segment.voicePrompt || '')
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cancelEditingSegment = () => {
    setEditingSegmentIndex(null)
    setEditedSegmentContent('')
    setEditedSegmentVoicePrompt('')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveSegmentContent = () => {
    if (!selectedRecord || editingSegmentIndex === null) return

    const updatedSegments = [...selectedRecord.dialogueSegments]
    updatedSegments[editingSegmentIndex] = {
      ...updatedSegments[editingSegmentIndex],
      content: editedSegmentContent,
      voicePrompt: editedSegmentVoicePrompt
    }

    const updatedRecord = {
      ...selectedRecord,
      dialogueSegments: updatedSegments
    }

    saveRecord(updatedRecord)
    setEditingSegmentIndex(null)
    setEditedSegmentContent('')
    setEditedSegmentVoicePrompt('')

    toast({
      title: t('ui.editSuccess'),
      description: t('ui.editSuccessDesc'),
    })
  }

  // 如果有选中的记录，显示记录详情
  if (selectedRecord) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 头部信息 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => {
                  onRecordSelect?.(null)
                  // 清除URL参数并确保回到访谈智能体页面
                  const params = new URLSearchParams(searchParams.toString())
                  params.delete('record')
                  // 确保agent参数设置为podcast-ai
                  params.set('agent', 'podcast-ai')
                  router.replace(`/agent?${params.toString()}`, { scroll: false })
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('ui.back')}
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-charcoal-700 dark:text-charcoal-200 mb-2">
                {selectedRecord.title}
              </h1>
              <p className="text-charcoal-500 dark:text-charcoal-400">
                {selectedRecord.timestamp.toLocaleDateString()} {selectedRecord.timestamp.toLocaleTimeString()}
                <span className="ml-2 px-2 py-1 bg-coral-100 dark:bg-coral-900/50 text-coral-700 dark:text-coral-300 rounded text-sm">
                  {t('ui.podcastRecord')}
                </span>
              </p>
            </div>
          </div>

          {/* 最终音频 */}
          {selectedRecord.finalAudioUrl && (
            <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm border dark:border-charcoal-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-charcoal-700 dark:text-charcoal-200">
                    🎵 {t('ui.completePodcast')}
                  </h3>
                </div>
                <Button
                  onClick={() => downloadAudio(selectedRecord.finalAudioUrl!, 'interview_podcast.mp3')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('downloadAudio')}
                </Button>
              </div>

              <div className="bg-almond-50 dark:bg-charcoal-700 rounded-lg p-4">
                <audio controls className="w-full">
                  <source src={selectedRecord.finalAudioUrl} type="audio/mpeg" />
                  {t('ui.browserNotSupported')}
                </audio>
              </div>
            </div>
          )}

          {/* 原始内容 */}
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm border dark:border-charcoal-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-charcoal-700 dark:text-charcoal-200">
                  📝 {t('ui.originalContent')}
                </h3>
              </div>
              {/* 记录模式下只显示复制按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(selectedRecord.inputContent)
                    toast({
                      title: t('success.copySuccess'),
                      description: t('success.copySuccessDesc'),
                    })
                  } catch (error) {
                    toast({
                      title: t('errors.copyFailed'),
                      description: t('errors.copyFailed'),
                      variant: "destructive",
                    })
                  }
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                {t('ui.copy')}
              </Button>
            </div>

            <div className="bg-almond-50 dark:bg-charcoal-700 rounded-lg p-4">
              <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed whitespace-pre-wrap">
                {selectedRecord.inputContent}
              </p>
            </div>
          </div>

          {/* 访谈对话 */}
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm border dark:border-charcoal-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-charcoal-700 dark:text-charcoal-200">
                  🎙️ {t('ui.interviewDialogue')}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {selectedRecord.dialogueSegments.map((segment, index) => (
                <div key={index} className="bg-almond-50 dark:bg-charcoal-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={segment.role === 'host' ? 'default' : 'secondary'}>
                        {segment.role === 'host' ? t('hostLabel') : t('guestLabel')}
                      </Badge>
                      <span className="font-medium text-charcoal-700 dark:text-charcoal-200">
                        {segment.speaker}
                      </span>
                    </div>

                    {/* 记录模式下只显示音频播放按钮 */}
                    <div className="flex items-center gap-2">
                      {segment.audioUrl && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleAudio(index)}
                          >
                            {currentlyPlaying === index ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadAudio(segment.audioUrl!, `${segment.speaker}_${index + 1}.mp3`)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 记录模式下只显示内容，不允许编辑 */}
                  <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed mb-3">
                    {segment.content}
                  </p>

                  {segment.voicePrompt && (
                    <div className="text-sm text-charcoal-500 dark:text-charcoal-400 bg-white dark:bg-charcoal-800 p-3 rounded border">
                      <strong>{t('ui.voiceCharacteristics')}：</strong>{segment.voicePrompt}
                    </div>
                  )}

                  {segment.audioUrl && (
                    <audio
                      ref={(el) => {
                        audioRefs.current[index] = el
                      }}
                      src={segment.audioUrl}
                      onEnded={() => setCurrentlyPlaying(null)}
                      className="hidden"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
    )
  }

  // 如果正在处理，显示处理界面
  if (isGenerating || isGeneratingVoicePrompts || isDesigningVoices || isSynthesizing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-charcoal-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* 正在分析中 */}
          {isGenerating && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-coral-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold text-charcoal-700 dark:text-charcoal-200">
                {t('ui.analyzing')}
              </h2>
              <p className="text-charcoal-500 dark:text-charcoal-400 max-w-2xl mx-auto">
                {t('ui.analyzingDesc')}
              </p>
            </div>
          )}

          {/* 对话生成完成，显示对话内容 */}
          {dialogueSegments.length > 0 && (isGeneratingVoicePrompts || isDesigningVoices || isSynthesizing) && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm border dark:border-charcoal-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-charcoal-700 dark:text-charcoal-200">
                      🎙️ {t('ui.dialogueContent')}
                    </h3>
                  </div>
                  <Badge variant="outline">
                    {t('ui.segmentCount', { count: dialogueSegments.length })}
                  </Badge>
                </div>

                <div className="bg-almond-50 dark:bg-charcoal-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {dialogueSegments.map((segment, index) => (
                      <div key={index} className="border-l-4 border-coral-200 dark:border-coral-700 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={segment.role === 'host' ? 'default' : 'secondary'} className="text-xs">
                            {segment.role === 'host' ? t('hostLabel') : t('guestLabel')}
                          </Badge>
                          <span className="font-medium text-charcoal-700 dark:text-charcoal-200 text-sm">
                            {segment.speaker}
                          </span>
                        </div>
                        <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed text-sm">
                          {segment.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 正在生成中 */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="w-12 h-12 text-coral-600 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal-700 dark:text-charcoal-200">
                  {isGeneratingVoicePrompts && t('ui.generatingVoiceFeatures')}
                  {isDesigningVoices && t('ui.designingVoices')}
                  {isSynthesizing && t('ui.generatingAudio')}
                </h2>
                <p className="text-charcoal-500 dark:text-charcoal-400 max-w-2xl mx-auto">
                  {isGeneratingVoicePrompts && t('ui.generatingVoiceFeaturesDesc')}
                  {isDesigningVoices && t('ui.designingVoicesDesc')}
                  {isSynthesizing && t('ui.generatingAudioDesc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 预览界面 - 显示生成的对话
  if (showPreview && dialogueSegments.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 头部信息 */}
          <div className="mb-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-charcoal-700 dark:text-charcoal-200 mb-2">
                {t('ui.dialoguePreview')}
              </h1>
              <p className="text-charcoal-500 dark:text-charcoal-400">
                {t('ui.dialoguePreviewDesc')}
                <span className="ml-2 px-2 py-1 bg-coral-100 dark:bg-coral-900/50 text-coral-700 dark:text-coral-300 rounded text-sm">
                  {t('ui.previewMode')}
                </span>
              </p>
            </div>
          </div>

          {/* 对话内容 */}
          <div className="bg-white dark:bg-charcoal-800 rounded-lg p-6 shadow-sm border dark:border-charcoal-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-coral-600" />
                <h3 className="text-lg font-semibold text-charcoal-700 dark:text-charcoal-200">
                  {t('ui.dialogueContent')}
                </h3>
              </div>
              <Badge variant="outline">
                {t('ui.segmentCount', { count: dialogueSegments.length })}
              </Badge>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {dialogueSegments.map((segment, index) => (
                <div key={index} className="bg-almond-50 dark:bg-charcoal-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={segment.role === 'host' ? 'default' : 'secondary'}>
                        {segment.role === 'host' ? t('hostLabel') : t('guestLabel')}
                      </Badge>
                      <span className="font-medium text-charcoal-700 dark:text-charcoal-200">
                        {segment.speaker}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingSegmentIndex(index)
                        setEditedSegmentContent(segment.content)
                      }}
                      disabled={editingSegmentIndex === index}
                      className="h-8 px-2"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>

                  {editingSegmentIndex === index ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedSegmentContent}
                        onChange={(e) => setEditedSegmentContent(e.target.value)}
                        className="min-h-[100px] resize-none"
                        placeholder={t('ui.editDialogueContent')}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const updatedSegments = [...dialogueSegments]
                            updatedSegments[index] = {
                              ...updatedSegments[index],
                              content: editedSegmentContent
                            }
                            setDialogueSegments(updatedSegments)
                            setEditingSegmentIndex(null)
                            setEditedSegmentContent('')
                          }}
                          className="h-8"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {t('ui.save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingSegmentIndex(null)
                            setEditedSegmentContent('')
                          }}
                          className="h-8"
                        >
                          <X className="w-3 h-3 mr-1" />
                          {t('ui.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                      {segment.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(false)
                setDialogueSegments([])
                setVoicePrompts({})
                setVoiceDesigns({})
                setFinalAudioUrl(null)
                // 重新开始生成流程
                generateInterview()
              }}
              className="px-8"
              disabled={isGenerating || isGeneratingVoicePrompts || isDesigningVoices || isSynthesizing}
            >
              {t('ui.regenerateDialogue')}
            </Button>

            <Button
              onClick={generateVoicePrompts}
              disabled={isGeneratingVoicePrompts || isDesigningVoices || isSynthesizing}
              className="px-8 bg-coral-600 text-white hover:bg-coral-700"
            >
              {isGeneratingVoicePrompts || isDesigningVoices || isSynthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('ui.processing')}
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  {t('ui.generateVoice')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 主界面 - 输入界面
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
        </div>

        {/* 输入区域 */}
        <div className="flex justify-center mb-16">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5 text-coral-600" />
                {t('ui.contentInput')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content-input">
                  {t('ui.inputLabel')}
                </Label>
                <Textarea
                  id="content-input"
                  placeholder={t('inputPlaceholder')}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                  disabled={isGenerating || isSynthesizing}
                  onFocus={() => {
                    if (!session) {
                      setShowLoginRequiredDialog(true)
                    }
                  }}
                />
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                  {t('ui.inputHint')}
                </p>

                {/* 积分信息 */}
                {session && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-coral-50 to-almond-50 dark:from-coral-900/10 dark:to-almond-900/10 rounded-lg border border-coral-200 dark:border-coral-800/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-coral-100 dark:bg-coral-900/30 rounded-full">
                        <MessageSquare className="w-4 h-4 text-coral-600 dark:text-coral-400" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-coral-700 dark:text-coral-300">
                          {t('ui.billing.characterCount')}: <span className="font-semibold">{characterCount}</span>
                        </div>
                        <div className="text-xs text-coral-600 dark:text-coral-400">
                          {t('ui.billing.requiredPoints')}: <span className="font-semibold">{requiredPoints}</span> 积分
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-charcoal-600 dark:text-charcoal-300 mb-1">
                        {t('ui.billing.currentPoints')}
                      </div>
                      <div className="text-lg font-bold text-coral-600 dark:text-coral-400">
                        {userPoints}
                      </div>
                    </div>
                  </div>
                )}

                {/* 积分不足警告 */}
                {session && userPoints < requiredPoints && requiredPoints > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-lg border border-red-200 dark:border-red-800/50 shadow-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                        {t('ui.billing.insufficientPoints')}
                      </div>
                      <div className="text-xs text-red-600 dark:text-red-400">
                        {t('ui.billing.needMorePoints', { points: requiredPoints - userPoints })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 语音设置 */}
              <div className="space-y-4 p-4 bg-almond-50 dark:bg-charcoal-700 rounded-lg">
                <h3 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-200 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  {t('ui.voiceSettings')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 语言选择 */}
                    <div className="space-y-2">
                      <Label className="text-xs text-charcoal-600 dark:text-charcoal-300">
                        {t('ui.language')}
                      </Label>
                    <Select value={selectedLanguage} onValueChange={(value: 'zh') => setSelectedLanguage(value)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh">{t('ui.chinese')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 主持人音色 */}
                  <div className="space-y-2">
                    <Label className="text-xs text-charcoal-600 dark:text-charcoal-300">
                      {t('ui.hostVoice')}
                    </Label>
                    <Select value={selectedHostVoice} onValueChange={setSelectedHostVoice}>
                      <SelectTrigger className="h-9">
                        <SelectValue>
                          {selectedHostVoice ? t(`ui.voices.${selectedHostVoice}.name`) : t('ui.selectVoice')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {Object.entries(groupVoicesByCategory(availableVoices, ['male', 'female', 'child', 'cartoon'])).map(([category, voices], categoryIndex) => (
                          <div key={category} className="space-y-1">
                            {categoryIndex > 0 && (
                              <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 my-2" />
                            )}
                            <div className="px-3 py-2 text-xs font-semibold text-coral-700 dark:text-coral-300 bg-coral-50 dark:bg-coral-900/20">
                              {t(`ui.voiceCategories.${category}`)}
                            </div>
                            {voices.map((voice: any) => (
                              <SelectItem
                                key={voice.id}
                                value={voice.id}
                                className="px-3 py-2 cursor-pointer focus:bg-almond-100 dark:focus:bg-charcoal-700"
                              >
                                <div className="flex flex-col gap-1 w-full">
                                  <span className="font-medium text-sm text-left">
                                    {t(`ui.voices.${voice.id}.name`)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 text-left line-clamp-2">
                                    {t(`ui.voices.${voice.id}.description`)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 嘉宾音色 */}
                  <div className="space-y-2">
                    <Label className="text-xs text-charcoal-600 dark:text-charcoal-300">
                      {t('ui.guestVoice')}
                    </Label>
                    <Select value={selectedGuestVoice} onValueChange={setSelectedGuestVoice}>
                      <SelectTrigger className="h-9">
                        <SelectValue>
                          {selectedGuestVoice ? t(`ui.voices.${selectedGuestVoice}.name`) : t('ui.selectVoice')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {Object.entries(groupVoicesByCategory(availableVoices, ['male', 'female', 'child', 'cartoon'])).map(([category, voices], categoryIndex) => (
                          <div key={category} className="space-y-1">
                            {categoryIndex > 0 && (
                              <div className="h-px bg-gray-200 dark:bg-gray-700 mx-2 my-2" />
                            )}
                            <div className="px-3 py-2 text-xs font-semibold text-coral-700 dark:text-coral-300 bg-coral-50 dark:bg-coral-900/20">
                              {t(`ui.voiceCategories.${category}`)}
                            </div>
                            {voices.map((voice: any) => (
                              <SelectItem
                                key={voice.id}
                                value={voice.id}
                                className="px-3 py-2 cursor-pointer focus:bg-almond-100 dark:focus:bg-charcoal-700"
                              >
                                <div className="flex flex-col gap-1 w-full">
                                  <span className="font-medium text-sm text-left">
                                    {t(`ui.voices.${voice.id}.name`)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 text-left line-clamp-2">
                                    {t(`ui.voices.${voice.id}.description`)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateInterview}
                disabled={isGenerating || isGeneratingVoicePrompts || isDesigningVoices || isSynthesizing || !inputContent.trim()}
                className="w-full bg-coral-600 text-white hover:bg-coral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isGenerating || isGeneratingVoicePrompts || isDesigningVoices || isSynthesizing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('ui.processing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('generateButton')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 功能介绍 */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-charcoal-700 dark:text-charcoal-200">
            {t('ui.features')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-coral-600" />
                </div>
                <CardTitle className="text-lg">{t('ui.intelligentDialogue')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-charcoal-600 dark:text-charcoal-300">
                  {t('ui.intelligentDialogueDesc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-6 h-6 text-coral-600" />
                </div>
                <CardTitle className="text-lg">{t('ui.intelligentVoice')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-charcoal-600 dark:text-charcoal-300">
                  {t('ui.intelligentVoiceDesc')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-coral-100 dark:bg-coral-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileAudio className="w-6 h-6 text-coral-600" />
                </div>
                <CardTitle className="text-lg">{t('ui.oneStopProduction')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-charcoal-600 dark:text-charcoal-300">
                  {t('ui.oneStopProductionDesc')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 登录提示对话框 */}
        <Dialog open={showLoginRequiredDialog} onOpenChange={setShowLoginRequiredDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('ui.loginRequired')}</DialogTitle>
              <DialogDescription>
                {t('ui.loginRequiredDesc')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowLoginRequiredDialog(false)}>
                {t('ui.cancel')}
              </Button>
              <Button onClick={() => router.push('/auth/signin')}>
                {t('ui.loginNow')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
