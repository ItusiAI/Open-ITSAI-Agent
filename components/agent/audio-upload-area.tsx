"use client"

import { useState, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Upload,
  Link2,
  FileAudio,
  Loader2,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioUploadAreaProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  selectedLanguage: string
  onLanguageChange?: (language: string) => void
  compact?: boolean
  chatInput?: boolean
}

export function AudioUploadArea({
  onFileSelect,
  disabled = false,
  selectedLanguage,
  onLanguageChange,
  compact = false,
  chatInput = false
}: AudioUploadAreaProps) {
  const t = useTranslations('agent')
  const [isDragOver, setIsDragOver] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => file.type.startsWith('audio/'))
    
    if (audioFile) {
      onFileSelect(audioFile)
    }
  }, [disabled, onFileSelect])

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = ''
  }

  // 处理URL提交
  const handleUrlSubmit = async () => {
    if (!audioUrl.trim()) return
    
    try {
      // 这里可以添加URL验证逻辑
      // 暂时创建一个虚拟文件对象
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const file = new File([blob], 'audio-from-url', { type: blob.type })
      onFileSelect(file)
      setAudioUrl('')
    } catch (error) {
      console.error('URL音频加载失败:', error)
    }
  }

  // 智能体音频上传界面
  if (chatInput) {
    return (
      <div className="space-y-6">
        {/* 版本选择卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 中文版卡片 */}
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedLanguage === 'zh' 
                ? "ring-2 ring-coral-500 bg-coral-50" 
                : "hover:bg-gray-50"
            )}
            onClick={() => onLanguageChange?.('zh')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🇨🇳</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('chineseVersion')}</h3>
                  <p className="text-sm text-coral-600">30 {t('pointsPerMinute')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {t('chineseVersionDescription')}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>•</span>
                <span>{t('chineseVersionFeatures')}</span>
              </div>
            </CardContent>
          </Card>

          {/* 全球版卡片 */}
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-md",
              selectedLanguage === 'global' 
                ? "ring-2 ring-blue-500 bg-blue-50" 
                : "hover:bg-gray-50"
            )}
            onClick={() => onLanguageChange?.('global')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🌍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t('globalVersion')}</h3>
                  <p className="text-sm text-blue-600">42 {t('pointsPerMinute')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {t('globalVersionDescription')}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>•</span>
                <span>{t('globalVersionFeatures')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 音频上传区域 */}
        <Card className="border-2 border-dashed border-gray-300 hover:border-coral-400 transition-colors">
          <CardContent className="p-4">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="upload" className="flex items-center gap-2 text-sm">
                  <Upload className="w-3 h-3" />
                  {t('uploadFile')}
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2 text-sm">
                  <Link2 className="w-3 h-3" />
                  {t('audioUrl')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-3">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    isDragOver && !disabled
                      ? "border-coral-400 bg-coral-50"
                      : "border-gray-300 hover:border-coral-400",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center">
                      {disabled ? (
                        <Loader2 className="w-6 h-6 text-coral-600 animate-spin" />
                      ) : (
                        <FileAudio className="w-6 h-6 text-coral-600" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-1">
                        {disabled ? t('processing') : t('dragDropAudio')}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {t('supportedFormats')}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled}
                      className="bg-coral-600 hover:bg-coral-700 text-white"
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {t('selectFile')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-3">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Link2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-base font-medium mb-1">{t('audioUrlTitle')}</h3>
                  <p className="text-sm text-gray-600">{t('audioUrlDescription')}</p>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder={t('audioUrlPlaceholder')}
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    disabled={disabled}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={disabled || !audioUrl.trim()}
                    className="bg-coral-600 hover:bg-coral-700 text-white"
                    size="sm"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    {t('loadUrl')}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  // 紧凑模式和其他模式保持不变...
  return null
}
