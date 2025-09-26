# Agent重命名升级 - 统一命名规范

## 🎯 重命名目标

将所有相关的命名从"audio-chat"统一改为"agent"，提供更清晰的命名规范和更好的可扩展性。

## 📁 文件结构变更

### 修改前
```
app/[locale]/audio-chat/
├── page.tsx

components/audio-chat/
├── audio-chat-content.tsx
├── audio-chat-sidebar.tsx
├── audio-upload-area.tsx
└── chat-message.tsx
```

### 修改后
```
app/[locale]/agent/
├── page.tsx

components/agent/
├── agent-content.tsx
├── agent-sidebar.tsx
├── audio-upload-area.tsx
└── chat-message.tsx
```

## 🔧 组件重命名

### 1. 页面组件
- ✅ `AudioChatContent` → `AgentContent`
- ✅ `AudioChatSidebar` → `AgentSidebar`
- ✅ 保留 `AudioUploadArea` (功能明确)
- ✅ 保留 `ChatMessage` (通用组件)

### 2. 接口重命名
- ✅ `AudioChatSidebarProps` → `AgentSidebarProps`
- ✅ 其他接口保持功能性命名

### 3. 翻译键重命名
- ✅ `audioChat` → `agent`
- ✅ 所有相关翻译键统一更新

## 🌐 路由变更

### URL路径
- **修改前**: `/zh/audio-chat`, `/en/audio-chat`
- **修改后**: `/zh/agent`, `/en/agent`

### 导航链接
- **修改前**: `getLocalizedPath("/audio-chat")`
- **修改后**: `getLocalizedPath("/agent")`

## 🎨 左侧边栏隐藏功能

### 隐藏状态设计
```typescript
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
    
    <Badge variant="outline" className="rotate-90 text-xs">
      {userPoints}
    </Badge>
  </div>
)}
```

### 功能特点
- ✅ **完全隐藏**: 侧边栏宽度变为0，内容隐藏
- ✅ **快速切换**: 点击按钮快速展开/收起
- ✅ **状态保持**: 保留积分显示（旋转90度）
- ✅ **响应式**: 平滑的动画过渡效果

## 🌐 多语言更新

### 中文翻译
```json
{
  "navbar": {
    "agent": "AI智能体"
  },
  "agent": {
    "aiWorkbench": "AI智能体工作台",
    "aiAgents": "AI智能体",
    "audioSummaryAgent": "音频总结智能体",
    "podcastAiAgent": "AI播客智能体"
  }
}
```

### 英文翻译
```json
{
  "navbar": {
    "agent": "AI Agent"
  },
  "agent": {
    "aiWorkbench": "AI Agent Workbench",
    "aiAgents": "AI Agents",
    "audioSummaryAgent": "Audio Summary Agent",
    "podcastAiAgent": "AI Podcast Agent"
  }
}
```

## 🔄 导入语句更新

### 组件导入
```typescript
// 修改前
import { AudioChatContent } from '@/components/audio-chat/audio-chat-content'
import { AudioChatSidebar } from './audio-chat-sidebar'

// 修改后
import { AgentContent } from '@/components/agent/agent-content'
import { AgentSidebar } from './agent-sidebar'
```

### 翻译使用
```typescript
// 修改前
const t = useTranslations('audioChat')

// 修改后
const t = useTranslations('agent')
```

## 🎯 命名规范统一

### 1. 文件命名
- **页面组件**: `agent-*.tsx`
- **功能组件**: 保持功能性命名 (`audio-upload-area.tsx`)
- **通用组件**: 保持通用命名 (`chat-message.tsx`)

### 2. 组件命名
- **主要组件**: `Agent*` 前缀
- **功能组件**: 保持功能性命名
- **接口命名**: `Agent*Props` 格式

### 3. 翻译键命名
- **顶级键**: `agent`
- **子键**: 保持功能性和描述性命名

## 📊 改进效果

### 1. 命名一致性
- ✅ **统一前缀**: 所有主要组件使用Agent前缀
- ✅ **清晰层次**: 文件结构更加清晰
- ✅ **易于维护**: 统一的命名规范便于维护

### 2. 可扩展性
- ✅ **模块化**: 每个智能体可以有独立的组件
- ✅ **复用性**: 通用组件可在多个智能体中使用
- ✅ **扩展性**: 新增智能体时命名规范清晰

### 3. 用户体验
- ✅ **侧边栏隐藏**: 提供更大的工作空间
- ✅ **快速切换**: 一键展开/收起侧边栏
- ✅ **状态保持**: 隐藏时仍显示关键信息

## 🔍 侧边栏隐藏详细设计

### 展开状态 (isOpen = true)
```
┌──────────────┬──────────────────────────────────────────┐
│              │                                          │
│  AI智能体     │           主内容区域                      │
│              │                                          │
│ 🎵 音频总结   │                                          │
│ 🎙️ AI播客    │                                          │
│              │                                          │
│ ────────────  │                                          │
│  处理记录     │                                          │
│              │                                          │
│ • 记录1      │                                          │
│ • 记录2      │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### 收起状态 (isOpen = false)
```
┌──┬─────────────────────────────────────────────────────┐
│ ▶│                                                     │
│  │              主内容区域                              │
│  │                                                     │
│  │                                                     │
│  │                                                     │
│  │                                                     │
│  │                                                     │
│ 积│                                                     │
│ 分│                                                     │
└──┴─────────────────────────────────────────────────────┘
```

## 🎉 升级完成

### 访问方式
- **中文版**: `/zh/agent`
- **英文版**: `/en/agent`

### 导航访问
1. 登录账户
2. 点击用户头像
3. 选择"AI智能体"/"AI Agent"

### 功能特点
- ✅ **统一命名**: 所有组件使用agent命名规范
- ✅ **侧边栏隐藏**: 支持完全隐藏和快速切换
- ✅ **响应式设计**: 平滑的动画过渡效果
- ✅ **状态保持**: 隐藏时保留关键信息显示

🎊 **Agent重命名升级完成！提供了更统一的命名规范、更好的可扩展性和更灵活的侧边栏交互体验！**
