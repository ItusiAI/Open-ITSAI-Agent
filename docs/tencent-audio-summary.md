# 腾讯云音频识别总结功能

## 功能概述

本功能集成了腾讯云的语音识别服务和AI总结功能，专门为中文音频内容提供：

1. **音频文件上传** - 上传到腾讯云COS存储
2. **语音识别** - 使用腾讯云16k_zh_large大模型，支持中文普通话 + 英语 + 27种方言混合识别
3. **AI总结** - 基于识别结果生成结构化总结

### 语言支持能力

**16k_zh_large大模型特色：**
- ✅ **中文普通话**：标准普通话识别
- ✅ **英语混合**：中英文混合语音识别
- ✅ **27种方言**：覆盖全国主要方言区域

**支持的方言列表：**
上海话、四川话、武汉话、贵阳话、昆明话、西安话、郑州话、太原话、兰州话、银川话、西宁话、南京话、合肥话、南昌话、长沙话、苏州话、杭州话、济南话、天津话、石家庄话、黑龙江话、吉林话、辽宁话、闽南语、客家话、粤语、南宁话

## API端点

### 1. 腾讯云COS上传 `/api/tencent/cos-upload`

**功能**: 将音频文件直接上传到腾讯云COS存储，设置公共读权限

**方法**: POST

**请求格式**: FormData
- `file`: 音频文件

**支持格式**: MP3, WAV, M4A, FLAC, FLV, MP4, WMA, 3GP, AMR, AAC, OGG

**文件大小限制**: 最大1GB

**响应示例**:
```json
{
  "success": true,
  "message": "音频文件上传成功",
  "data": {
    "fileName": "audio/abc123.mp3",
    "fileUrl": "https://bucket.cos.region.myqcloud.com/audio/abc123.mp3",
    "fileSize": 1024000,
    "fileType": "audio/mp3",
    "originalName": "recording.mp3",
    "uploadTime": "2024-01-01T12:00:00.000Z"
  }
}
```



### 1.1. 腾讯云语音识别 `/api/tencent/speech-recognition`

**功能**: 创建语音识别任务和查询识别结果

#### 创建识别任务 (POST)

**请求参数**:
```json
{
  "audioUrl": "https://bucket.cos.region.myqcloud.com/audio/abc123.mp3",
  "language": "zh",
  "requiredPoints": 5
}
```

**参数说明**:
- `audioUrl`: 音频文件的公共访问URL（必需）
- `language`: 语言版本，固定为 "zh"
- `requiredPoints`: 所需积分数（可选，用于积分检查）

**响应示例**:
```json
{
  "success": true,
  "message": "语音识别任务创建成功",
  "data": {
    "taskId": "12345",
    "status": "processing",
    "engineModel": "16k_zh_large"
  }
}
```

#### 查询识别结果 (GET)

**请求参数**: `?taskId=12345`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "taskId": "12345",
    "status": "completed",
    "segments": [
      {
        "startTime": 0,
        "endTime": 5.2,
        "text": "这是一段测试音频",
        "speaker": 0
      }
    ],
    "fullText": "这是一段测试音频"
  }
}
```

### 1.2. DeepSeek推理总结 `/api/deepseek/audio-summary`

**功能**: 使用DeepSeek推理模型生成高质量AI总结

**特色**:
- 支持最大64K输出
- 深度推理能力
- 结构化总结
- OpenAI兼容API

**方法**: POST

**请求参数**:
```json
{
  "transcriptText": "这是完整的转录文本...",
  "segments": [
    {
      "startTime": 0,
      "endTime": 5.2,
      "text": "这是一段测试音频",
      "speaker": 0
    }
  ],
  "language": "zh"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "DeepSeek推理总结生成成功",
  "data": {
    "summary": "# 🎯 音频内容总结\n\n## 📋 基本信息\n...",
    "statistics": {
      "originalLength": 1000,
      "summaryLength": 800,
      "compressionRatio": 20,
      "inputTokens": 2500,
      "outputTokens": 2000,
      "totalTokens": 4500,
      "model": "deepseek-reasoner",
      "maxOutputSupport": "64K tokens"
    },
    "segments": [...],
    "processingTime": "2024-01-01T12:00:00.000Z"
  }
}
```

## 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# 腾讯云配置
TENCENT_SECRET_ID=your_tencent_secret_id
TENCENT_SECRET_KEY=your_tencent_secret_key

# 腾讯云COS配置
TENCENT_COS_BUCKET=your-cos-bucket-name
TENCENT_COS_REGION=ap-beijing

# 腾讯云语音识别配置
TENCENT_ASR_REGION=ap-beijing

# DeepSeek推理模型配置（主要用于AI总结）
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-reasoner

# OpenAI配置（备用AI总结）
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-3.5-turbo
```

## 使用流程

1. **上传音频文件**
   ```javascript
   const formData = new FormData()
   formData.append('file', audioFile)
   
   const uploadResponse = await fetch('/api/tencent/cos-upload', {
     method: 'POST',
     body: formData,
   })
   ```

2. **创建识别任务**
   ```javascript
   const recognitionResponse = await fetch('/api/tencent/speech-recognition', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       audioUrl: uploadResult.data.fileUrl,
       language: 'zh',
     }),
   })
   ```

3. **轮询识别结果**
   ```javascript
   const pollResult = async (taskId) => {
     const response = await fetch(`/api/tencent/speech-recognition?taskId=${taskId}`)
     const result = await response.json()
     
     if (result.data.status === 'completed') {
       // 识别完成，进行AI总结
       return result.data
     } else if (result.data.status === 'processing') {
       // 继续轮询
       setTimeout(() => pollResult(taskId), 5000)
     }
   }
   ```

4. **生成DeepSeek推理总结**
   ```javascript
   const summaryResponse = await fetch('/api/deepseek/audio-summary', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       transcriptText: recognitionResult.fullText,
       segments: recognitionResult.segments,
       language: 'zh',
     }),
   })
   ```

## 注意事项

1. **语言支持**:
   - ✅ **中文版本**：支持普通话 + 英语 + 27种方言混合识别
   - 🚧 **全球化版本**：更多国际语言支持即将上线
2. **文件格式**: 支持主流音频格式，推荐使用MP3或WAV
3. **文件大小**: 最大支持1GB文件上传
4. **识别时间**: 根据音频长度，识别时间通常为音频时长的1/10到1/5
5. **方言识别**: 支持全国27个主要方言区域，包括粤语、闽南语、客家话等
6. **费用**: 使用腾讯云服务会产生相应费用，请注意成本控制

## 错误处理

所有API都会返回统一的错误格式：

```json
{
  "error": "错误描述",
  "details": "详细错误信息"
}
```

常见错误：
- `401`: 用户未登录
- `400`: 请求参数错误
- `500`: 服务器内部错误

## 技术特色

- **16k_zh_large模型**: 使用腾讯云最先进的中文语音识别模型
- **多语言混合**: 支持中文普通话 + 英语 + 27种方言混合识别
- **方言覆盖全面**: 覆盖全国主要方言区域，包括：
  - **华东方言**: 上海话、南京话、合肥话、苏州话、杭州话
  - **华南方言**: 粤语、闽南语、客家话、南宁话
  - **西南方言**: 四川话、贵阳话、昆明话
  - **华中方言**: 武汉话、南昌话、长沙话
  - **华北方言**: 天津话、济南话、石家庄话
  - **西北方言**: 西安话、郑州话、太原话、兰州话、银川话、西宁话
  - **东北方言**: 黑龙江话、吉林话、辽宁话
- **说话人分离**: 自动识别不同说话人
- **时间戳精确**: 提供精确到秒的时间戳信息
- **DeepSeek推理总结**: 使用最先进的推理模型生成高质量总结
- **64K输出支持**: 支持超长内容的详细总结分析
- **深度推理能力**: 提取深层洞察和关键信息
- **结构化输出**: 自动生成清晰的Markdown格式总结
- **高可用性**: 基于腾讯云稳定的基础设施
