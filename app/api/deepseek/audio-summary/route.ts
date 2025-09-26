import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

// DeepSeek推理模型配置
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
})

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { transcriptText, segments, language = 'zh' } = await request.json()

    if (!transcriptText) {
      return NextResponse.json(
        { error: '转录文本不能为空' },
        { status: 400 }
      )
    }

    // 只支持中文总结
    if (language !== 'zh') {
      return NextResponse.json(
        { error: '当前仅支持中文内容总结' },
        { status: 400 }
      )
    }

    // 检查文本长度，DeepSeek支持最大64K输出
    const maxInputLength = 200000 // 约200K字符输入限制
    if (transcriptText.length > maxInputLength) {
      return NextResponse.json(
        { error: `输入文本过长，最大支持${Math.floor(maxInputLength/1000)}K字符` },
        { status: 400 }
      )
    }

    // 构建AI推理的提示词
    const systemPrompt = `你是一个专业的音频内容分析专家，擅长从语音转录文本中提取核心信息并生成高质量的结构化总结。

你的任务是：
1. 深度理解音频内容的主题和核心观点
2. 识别关键信息点和重要细节
3. 分析内容的逻辑结构和论证过程
4. 提取有价值的洞察和结论
5. 生成清晰、有条理的总结报告

输出要求：
- 使用Markdown格式
- 结构清晰，层次分明
- 突出重点信息
- 保持客观准确
- 如有时间戳信息，合理利用
- 总结长度适中，既要全面又要精炼

输出格式模板：
# 🎯 音频内容总结

## 📋 基本信息
- **内容时长**：[根据时间戳计算]
- **主要话题**：[核心主题]
- **内容类型**：[会议/讲座/访谈/其他]
- **参与人数**：[说话人数量]

## 🎯 核心要点
[用3-5个要点概括最重要的内容]

## 📝 详细内容
### [主题1]
[详细描述]

### [主题2] 
[详细描述]

## 💡 重要观点与洞察
[提取的重要观点、结论或洞察]

## ⏰ 关键时间节点
[如果有重要的时间节点，列出关键时刻]

## 📊 总结与建议
[整体总结和可能的后续建议]

请确保总结准确、全面、有价值。`

    const userPrompt = `请对以下音频转录内容进行深度分析和总结：

**转录文本：**
${transcriptText}

${segments && segments.length > 0 ? `
**时间戳信息：**
${segments.map((seg: any, index: number) => {
  const startTime = formatTime(seg.startTime || 0)
  const endTime = formatTime(seg.endTime || 0)
  const speaker = seg.speaker !== undefined ? `[说话人${seg.speaker}]` : ''
  return `${startTime}-${endTime} ${speaker} ${seg.text}`
}).join('\n')}
` : ''}

请基于以上内容生成专业的结构化总结报告。`

    console.log('开始DeepSeek推理总结，文本长度:', transcriptText.length)

    // 调用DeepSeek推理模型
    const completion = await deepseek.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-reasoner',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 65536, // DeepSeek支持最大64K输出
      stream: false,
    })

    const summary = completion.choices[0]?.message?.content

    if (!summary) {
      throw new Error('DeepSeek推理总结生成失败')
    }

    console.log('AI推理总结生成成功，长度:', summary.length)

    // 计算处理统计信息
    const inputTokens = completion.usage?.prompt_tokens || 0
    const outputTokens = completion.usage?.completion_tokens || 0
    const totalTokens = completion.usage?.total_tokens || 0

    return NextResponse.json({
      success: true,
      message: 'AI推理总结生成成功',
      data: {
        summary,
        statistics: {
          originalLength: transcriptText.length,
          summaryLength: summary.length,
          compressionRatio: Math.round((1 - summary.length / transcriptText.length) * 100),
          inputTokens,
          outputTokens,
          totalTokens,
          model: process.env.DEEPSEEK_MODEL || 'ai-reasoner',
          maxOutputSupport: '64K tokens'
        },
        segments: segments || [],
        processingTime: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('DeepSeek推理总结错误:', error)
    
    // 处理特定的DeepSeek API错误
    let errorMessage = 'DeepSeek推理总结生成失败'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        errorMessage = 'API调用频率超限，请稍后重试'
        statusCode = 429
      } else if (error.message.includes('insufficient_quota')) {
        errorMessage = 'API配额不足，请检查账户余额'
        statusCode = 402
      } else if (error.message.includes('invalid_api_key')) {
        errorMessage = 'API密钥无效，请检查配置'
        statusCode = 401
      } else if (error.message.includes('context_length_exceeded')) {
        errorMessage = '输入内容过长，请缩短音频长度'
        statusCode = 400
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : '未知错误',
        provider: 'DeepSeek',
        model: process.env.DEEPSEEK_MODEL || 'deepseek-reasoner'
      },
      { status: statusCode }
    )
  }
}

// 辅助函数：格式化时间
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}
