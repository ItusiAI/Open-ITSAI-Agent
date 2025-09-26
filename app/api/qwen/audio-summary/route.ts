import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    const { transcriptText, segments, language = 'zh' } = await request.json()

    if (!transcriptText) {
      return NextResponse.json(
        { success: false, error: '转录文本不能为空' },
        { status: 400 }
      )
    }

    // 只支持中文总结
    if (language !== 'zh') {
      return NextResponse.json(
        { success: false, error: '当前仅支持中文内容总结' },
        { status: 400 }
      )
    }

    // 检查通义千问API密钥
    const qwenApiKey = process.env.QWEN_API_KEY
    if (!qwenApiKey) {
      return NextResponse.json(
        { success: false, error: '通义千问API密钥未配置' },
        { status: 500 }
      )
    }

    // 检查文本长度
    const maxInputLength = 200000 // 约200K字符输入限制
    if (transcriptText.length > maxInputLength) {
      return NextResponse.json(
        { success: false, error: `输入文本过长，最大支持${Math.floor(maxInputLength/1000)}K字符` },
        { status: 400 }
      )
    }

    console.log('开始生成音频总结，转录文本长度:', transcriptText.length)

    // 构建中文音频总结的提示词
    const prompt = `你是一个专业的音频内容分析专家，擅长从语音转录文本中提取核心信息并生成高质量的结构化总结。

你的任务是：
1. 深度理解音频内容的主题和核心观点
2. 识别关键信息点和重要细节
3. 分析内容的逻辑结构和论证过程
4. 提取有价值的洞察和结论
5. 生成清晰、有条理的总结报告

请对以下音频转录内容进行智能总结分析，按照以下JSON格式输出：

{
  "summary": "简洁的内容总结（100-200字）",
  "keyPoints": ["要点1", "要点2", "要点3"],
  "topics": ["主题1", "主题2"],
  "sentiment": "positive/neutral/negative",
  "language": "Chinese",
  "duration_analysis": "时长分析说明",
  "content_type": "会议/讲座/对话/演讲/其他",
  "actionItems": ["行动项1", "行动项2"]
}

音频转录内容：
${transcriptText}`

    // 调用通义千问-Turbo-Latest API
    const qwenResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${qwenApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-turbo-latest',
        input: {
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        parameters: {
          temperature: 0.3,
          top_p: 0.8,
          max_tokens: 30000,
          result_format: 'message'
        }
      }),
    })

    if (!qwenResponse.ok) {
      const errorText = await qwenResponse.text()
      console.error('通义千问API错误:', errorText)
      return NextResponse.json(
        { success: false, error: `音频总结生成失败: ${qwenResponse.status}` },
        { status: 500 }
      )
    }

    const result = await qwenResponse.json()
    console.log('通义千问API响应:', JSON.stringify(result, null, 2))

    if (!result.output) {
      console.error('通义千问API响应格式错误:', result)
      return NextResponse.json(
        { success: false, error: '音频总结生成失败，API响应格式错误' },
        { status: 500 }
      )
    }

    // 通义千问API的响应格式
    const generatedContent = result.output.text || result.output.choices?.[0]?.message?.content || result.output.content || ''
    
    if (!generatedContent) {
      console.error('通义千问API未返回内容:', result)
      return NextResponse.json(
        { success: false, error: '音频总结生成失败，API未返回内容' },
        { status: 500 }
      )
    }

    // 解析JSON响应
    let parsedSummary
    try {
      // 尝试提取JSON部分
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedSummary = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('未找到JSON格式的响应')
      }
    } catch (parseError) {
      console.error('解析总结内容失败:', parseError)
      console.error('原始内容:', generatedContent)
      
      // 如果JSON解析失败，创建一个基本的总结结构
      parsedSummary = {
        summary: generatedContent.slice(0, 500) + '...',
        keyPoints: ['解析失败，请查看原始内容'],
        topics: ['未知主题'],
        sentiment: 'neutral',
        language: 'Chinese',
        duration_analysis: '无法分析',
        content_type: '其他',
        actionItems: []
      }
    }

    // 验证和清理响应数据
    const cleanedSummary = {
      summary: parsedSummary.summary || '无法生成总结',
      keyPoints: Array.isArray(parsedSummary.keyPoints) ? parsedSummary.keyPoints : [],
      topics: Array.isArray(parsedSummary.topics) ? parsedSummary.topics : [],
      sentiment: parsedSummary.sentiment || 'neutral',
      language: parsedSummary.language || 'Chinese',
      duration_analysis: parsedSummary.duration_analysis || '无法分析',
      content_type: parsedSummary.content_type || '其他',
      actionItems: Array.isArray(parsedSummary.actionItems) ? parsedSummary.actionItems : []
    }

    console.log('成功生成音频总结')

    return NextResponse.json({
      success: true,
      data: {
        ...cleanedSummary,
        model: 'qwen-turbo-latest'
      }
    })

  } catch (error) {
    console.error('音频总结生成失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
