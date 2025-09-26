import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/*
// 原有的Gemini模型访谈生成API（保留作为备用）
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

    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { success: false, error: '内容不能为空' },
        { status: 400 }
      )
    }

    // 检查Gemini API密钥
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API密钥未配置' },
        { status: 500 }
      )
    }

    console.log('开始生成访谈对话，内容长度:', content.length)

    // 分析内容长度，动态确定对话段落数量
    const contentLength = content.length
    let targetSegments = 8 // 默认段落数
    let segmentLength = "50-150字" // 默认段落长度

    if (contentLength < 200) {
      targetSegments = 4
      segmentLength = "30-60字"
    } else if (contentLength < 500) {
      targetSegments = 6
      segmentLength = "40-80字"
    } else if (contentLength < 1000) {
      targetSegments = 10
      segmentLength = "60-120字"
    } else if (contentLength < 2000) {
      targetSegments = 15
      segmentLength = "80-150字"
    } else if (contentLength < 3000) {
      targetSegments = 20
      segmentLength = "100-180字"
    } else if (contentLength < 5000) {
      targetSegments = 25
      segmentLength = "120-200字"
    } else {
      // 对于超长内容，按比例计算段落数，但设置合理上限
      targetSegments = Math.min(40, Math.ceil(contentLength / 200))
      segmentLength = "150-250字"
    }

    // 构建系统提示词
    const systemPrompt = `你是一个专业的访谈播客制作专家，擅长将任何内容转化为生动有趣的多人访谈对话。

你的任务是：
1. 分析输入的内容，理解其核心主题和关键信息
2. 设计访谈角色（1个主持人 + 1个嘉宾，固定2人）
3. 创建自然流畅的访谈对话

角色设计原则：
- 主持人：专业、引导性强、善于提问和总结，控制节目节奏
- 嘉宾：根据内容主题设计专业背景，观点鲜明，有个人特色

对话生成要求：
- 自然流畅，符合真实访谈节目的风格
- 充分覆盖输入内容的核心信息，不遗漏重要观点
- 根据内容长度动态调整对话段落数量和长度
- 每段对话长度：${segmentLength}
- 目标生成约${targetSegments}段对话（可根据内容需要适当调整）
- 主持人负责开场、过渡、提问、总结
- 嘉宾负责深入阐述、举例说明、专业解答
- 对话要有层次感，从浅入深，逐步展开
- 严格限制为2个角色：1个主持人 + 1个嘉宾

请严格按照以下JSON格式输出：
{
  "segments": [
    {
      "speaker": "角色名称",
      "role": "host" | "guest",
      "content": "对话内容"
    }
  ]
}`

    const userPrompt = `请基于以下内容生成一个专业的访谈播客对话：

【内容分析】
原始内容：
${content}

内容长度：${contentLength}字
建议对话段落：约${targetSegments}段
每段长度：${segmentLength}

【生成要求】
1. 深度分析内容主题和关键信息点
2. 设计2个访谈角色：1个主持人 + 1个嘉宾
3. 根据内容长度和复杂度生成合适数量的对话段落
4. 生成充分覆盖所有要点的访谈对话，不遗漏重要信息
5. 确保对话自然流畅，有访谈节目的真实感
6. 主持人要善于引导话题，嘉宾要有专业见解
7. 对话要有起承转合，层次分明
8. 内容越丰富，对话应该越详细深入

请确保生成的对话完整覆盖原始内容的所有重要信息，不要遗漏关键观点。`

    // 调用Gemini 2.5 Pro API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,  // 适中的创造性
          topK: 32,
          topP: 0.8,
          maxOutputTokens: Math.min(65536, Math.max(8000, targetSegments * 300)),  // 根据目标段落数动态调整输出长度
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json()
      console.error('Gemini API错误:', errorData)
      return NextResponse.json(
        { success: false, error: 'Gemini访谈生成失败' },
        { status: 500 }
      )
    }

    const geminiResult = await geminiResponse.json()

    // 提取生成的内容
    const generatedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!generatedText) {
      return NextResponse.json(
        { success: false, error: 'Gemini未返回有效内容' },
        { status: 500 }
      )
    }

    console.log('Gemini生成的原始内容:', generatedText)

    // 解析JSON格式的对话内容
    let parsedContent
    try {
      // 尝试提取JSON部分
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('未找到有效的JSON格式')
      }
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      return NextResponse.json(
        { success: false, error: '生成的对话格式无效' },
        { status: 500 }
      )
    }

    // 验证解析结果
    if (!parsedContent.segments || !Array.isArray(parsedContent.segments)) {
      return NextResponse.json(
        { success: false, error: '生成的对话结构无效' },
        { status: 500 }
      )
    }

    // 验证每个段落的格式
    const validSegments = parsedContent.segments.filter((segment: any) =>
      segment.speaker &&
      segment.role &&
      segment.content &&
      ['host', 'guest'].includes(segment.role)
    )

    if (validSegments.length === 0) {
      return NextResponse.json(
        { success: false, error: '生成的对话段落无效' },
        { status: 500 }
      )
    }

    console.log(`访谈对话生成成功，共${validSegments.length}个段落`)

    return NextResponse.json({
      success: true,
      message: 'Gemini访谈对话生成成功',
      data: {
        segments: validSegments,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        usage: {
          promptTokens: geminiResult.usageMetadata?.promptTokenCount || 0,
          completionTokens: geminiResult.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: geminiResult.usageMetadata?.totalTokenCount || 0
        }
      }
    })

  } catch (error) {
    console.error('Gemini访谈生成失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
*/

// 新的访谈生成API已迁移到 /api/qwen/interview-generation
// 使用通义千问-Turbo-Latest模型
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: '此API已迁移，请使用 /api/qwen/interview-generation' },
    { status: 410 }
  )
}
