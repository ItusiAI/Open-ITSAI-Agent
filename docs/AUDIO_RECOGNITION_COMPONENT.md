# 音频识别组件 - 专为Agent页面设计

## 🎯 设计目标

为Agent页面创建专门的音频识别组件，复用现有的音频识别功能，但提供更适合Agent工作台的界面设计。

## 🔧 组件架构

### 文件结构
```
components/agent/
├── agent-content.tsx          # 主容器组件
├── agent-sidebar.tsx          # 侧边栏组件
├── audio-recognition.tsx      # 新建的音频识别组件
├── audio-upload-area.tsx      # 原有上传组件（保留）
└── chat-message.tsx           # 聊天消息组件（保留）
```

### 组件关系
```
AgentContent
├── AgentSidebar (智能体选择)
└── AudioRecognition (音频识别功能)
```

## 🎨 界面设计

### 整体布局
```
┌─────────────────────────────────────────────────────────┐
│                AI智能体工作台                              │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  智能体选择   │           音频识别组件                      │
│              │                                          │
│ 🎵 音频总结   │  ┌─────────────────────────────────────┐  │
│ 🎙️ AI播客    │  │ 版本选择                             │  │
│              │  │ 🇨🇳 中文版    🌍 全球版              │  │
│              │  └─────────────────────────────────────┘  │
│              │                                          │
│              │  ┌─────────────────────────────────────┐  │
│              │  │ 音频上传                             │  │
│              │  │ [上传文件] [音频链接]                │  │
│              │  │ 拖拽音频文件到此处...                │  │
│              │  └─────────────────────────────────────┘  │
│              │                                          │
│              │  ┌─────────────────────────────────────┐  │
│              │  │ 处理结果                             │  │
│              │  │ [总结] [转录]                        │  │
│              │  └─────────────────────────────────────┘  │
└──────────────┴──────────────────────────────────────────┘
```

## 🔄 功能复用

### 核心功能保持一致
- ✅ **版本选择**: 中文版(30积分/分钟) vs 全球版(42积分/分钟)
- ✅ **音频上传**: 文件上传 + URL输入
- ✅ **语音识别**: 腾讯云ASR + OpenAI Whisper
- ✅ **AI总结**: DeepSeek + Google Gemini
- ✅ **积分系统**: 积分检查、扣除、余额更新

### API调用流程
```typescript
// 1. 文件上传
const uploadEndpoint = selectedLanguage === 'zh'
  ? '/api/tencent/cos-upload'        // 中文版：腾讯云COS直接上传
  : '/api/cloudflare/upload-audio'   // 全球版：Cloudflare R2

// 2. 语音识别
const apiEndpoint = selectedLanguage === 'zh'
  ? '/api/tencent/speech-recognition'  // 使用公共URL
  : '/api/whisper/speech-recognition'

// 3. AI总结
const summaryApiEndpoint = selectedLanguage === 'zh'
  ? '/api/deepseek/audio-summary'
  : '/api/gemini/audio-summary'

// 4. 积分扣除
await fetch('/api/user/points/deduct', {
  method: 'POST',
  body: JSON.stringify({
    points: requiredPoints,
    description: `音频总结服务(${selectedLanguage === 'zh' ? '中文版' : '全球版'})`,
    type: 'audio_summary'
  })
})
```

## 🎨 界面优化

### 1. 居中布局
```typescript
<div className="max-w-4xl mx-auto p-6 space-y-6">
  {/* 版本选择卡片 */}
  {/* 音频上传区域 */}
  {/* 结果展示区域 */}
</div>
```

### 2. 版本选择卡片
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* 中文版卡片 */}
  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
    selectedLanguage === 'zh'
      ? 'border-coral-500 bg-coral-50'
      : 'border-gray-200 hover:border-coral-300'
  }`}>
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">🇨🇳</span>
      <div>
        <h3 className="font-semibold">中文版</h3>
        <p className="text-sm text-coral-600">30 积分/分钟</p>
      </div>
    </div>
    <p className="text-sm text-gray-600">基于腾讯云ASR + DeepSeek推理</p>
  </div>
  
  {/* 全球版卡片 */}
  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
    selectedLanguage === 'global'
      ? 'border-blue-500 bg-blue-50'
      : 'border-gray-200 hover:border-blue-300'
  }`}>
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">🌍</span>
      <div>
        <h3 className="font-semibold">全球版</h3>
        <p className="text-sm text-blue-600">42 积分/分钟</p>
      </div>
    </div>
    <p className="text-sm text-gray-600">基于OpenAI Whisper + Google Gemini</p>
  </div>
</div>
```

### 3. 音频上传区域
```typescript
<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
  <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  <div className="space-y-2">
    <p className="text-lg font-medium">选择音频文件</p>
    <p className="text-sm text-gray-500">支持 MP3, WAV, M4A 等格式</p>
  </div>
  <label className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-coral-600 text-white rounded-lg hover:bg-coral-700 cursor-pointer">
    <Upload className="w-4 h-4" />
    选择文件
  </label>
</div>
```

### 4. 结果展示
```typescript
<Tabs defaultValue="summary">
  <TabsList>
    <TabsTrigger value="summary">总结</TabsTrigger>
    <TabsTrigger value="transcript">转录</TabsTrigger>
  </TabsList>
  
  <TabsContent value="summary">
    <div className="flex justify-between items-center">
      <h3 className="font-medium">AI总结</h3>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Copy className="w-4 h-4 mr-1" />
          复制
        </Button>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" />
          下载
        </Button>
      </div>
    </div>
    <Textarea value={summary} readOnly className="min-h-[200px]" />
  </TabsContent>
  
  <TabsContent value="transcript">
    <Textarea value={timestampContent} readOnly className="min-h-[200px] font-mono text-sm" />
  </TabsContent>
</Tabs>
```

## 🔧 技术特点

### 1. 组件独立性
- ✅ **独立组件**: 不依赖现有的AudioSummaryContent
- ✅ **功能完整**: 包含完整的音频识别流程
- ✅ **样式定制**: 专为Agent页面优化的界面

### 2. 状态管理
```typescript
const [selectedLanguage, setSelectedLanguage] = useState('global')
const [audioFile, setAudioFile] = useState<File | null>(null)
const [audioUrl, setAudioUrl] = useState('')
const [isProcessing, setIsProcessing] = useState(false)
const [isRecognizing, setIsRecognizing] = useState(false)
const [isSummarizing, setIsSummarizing] = useState(false)
const [timestampContent, setTimestampContent] = useState('')
const [summary, setSummary] = useState('')
const [userPoints, setUserPoints] = useState<number>(0)
```

### 3. 错误处理
- ✅ **积分检查**: 处理前检查积分是否足够
- ✅ **文件验证**: 验证音频文件格式和大小
- ✅ **API错误**: 处理上传、识别、总结各阶段的错误
- ✅ **用户提示**: 友好的错误提示和成功反馈

## 🎯 使用方式

### 在Agent页面中使用
```typescript
// agent-content.tsx
const renderAgentComponent = () => {
  switch (currentAgent) {
    case 'audio-summary':
      return (
        <div className="flex-1 bg-white overflow-y-auto">
          <AudioRecognition />
        </div>
      )
    // 其他智能体...
  }
}
```

### 扩展新智能体
```typescript
case 'new-agent':
  return (
    <div className="flex-1 bg-white overflow-y-auto">
      <NewAgentComponent />
    </div>
  )
```

## 🌐 多语言支持

### 翻译键复用
- 使用现有的`audioSummary`翻译键
- 保持与原有组件的一致性
- 支持中英文界面切换

## 🎉 优势总结

### 1. 功能一致性
- ✅ **API复用**: 使用相同的后端API
- ✅ **逻辑一致**: 保持相同的处理流程
- ✅ **积分系统**: 完整的积分检查和扣除

### 2. 界面优化
- ✅ **居中布局**: 更适合Agent工作台
- ✅ **卡片设计**: 清晰的版本选择界面
- ✅ **响应式**: 适配不同屏幕尺寸

### 3. 可扩展性
- ✅ **组件独立**: 便于维护和扩展
- ✅ **智能体框架**: 为新智能体提供模板
- ✅ **代码复用**: 减少重复开发

🎊 **新的AudioRecognition组件为Agent页面提供了完整的音频识别功能，界面居中显示，功能与现有组件保持一致，同时为未来的智能体扩展奠定了基础！**
