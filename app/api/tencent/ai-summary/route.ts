import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

// 使用OpenAI兼容的API（可以是任何兼容的AI服务）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
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

    // 构建AI总结的提示词
    const systemPrompt = `你是一个专业的音频内容总结专家。请根据提供的音频转录文本，生成一个结构化的总结报告。

要求：
1. 提取核心要点和关键信息
2. 按照逻辑顺序组织内容
3. 保留重要的时间节点信息
4. 使用清晰的标题和段落结构
5. 突出重要观点和结论
6. 如果有多个说话人，请区分不同说话人的观点

输出格式：
# 音频内容总结

## 📋 基本信息
- 总时长：[时长]
- 主要话题：[话题]
- 参与人数：[人数]

## 🎯 核心要点
[列出3-5个核心要点]

## 📝 详细内容
[按时间顺序或主题分类整理内容]

## 💡 重要观点
[提取重要观点和结论]

## 🔗 关键时间节点
[如果有重要时间节点，请列出]

请确保总结准确、简洁、有条理。`

    const userPrompt = `请总结以下音频转录内容：

转录文本：
${transcriptText}

${segments && segments.length > 0 ? `
时间戳信息：
${segments.map((seg: any) => `[${formatTime(seg.startTime)}-${formatTime(seg.endTime)}] ${seg.text}`).join('\n')}
` : ''}

请生成结构化的总结报告。`

    console.log('开始AI总结，文本长度:', transcriptText.length)

    // 调用AI生成总结
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const summary = completion.choices[0]?.message?.content

    if (!summary) {
      throw new Error('AI总结生成失败')
    }

    console.log('AI总结生成成功，长度:', summary.length)

    return NextResponse.json({
      success: true,
      message: 'AI总结生成成功',
      data: {
        summary,
        originalLength: transcriptText.length,
        summaryLength: summary.length,
        compressionRatio: Math.round((1 - summary.length / transcriptText.length) * 100)
      }
    })

  } catch (error) {
    console.error('AI总结错误:', error)
    return NextResponse.json(
      { 
        error: 'AI总结生成失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
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
