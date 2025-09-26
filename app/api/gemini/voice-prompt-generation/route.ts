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

    const { segments } = await request.json()

    if (!segments || !Array.isArray(segments) || segments.length === 0) {
      return NextResponse.json(
        { success: false, error: '对话段落不能为空' },
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

    console.log('开始生成音色prompt，对话段落数:', segments.length)

    // 构建系统提示词
    const systemPrompt = `你是一个专业的声音设计专家，擅长根据对话内容和角色特征设计合适的声音特征描述。

你的任务是：
1. 分析每个角色的对话内容和说话风格
2. 根据角色特征和对话内容为每个角色生成详细的声音特征描述
3. 确保声音特征与角色身份和说话内容相匹配

声音特征描述要求：
- 包含年龄范围、性别、语调特点、说话风格、语速特征
- 体现角色的专业背景和个性特征
- 使用具体的声音描述词汇，如"温和磁性"、"清晰有力"、"亲切自然"等
- 适合语音合成的详细特征描述
- 主持人通常声音专业、引导性强
- 嘉宾声音要体现其专业领域的特点

请严格按照以下JSON格式输出：
{
  "voicePrompts": {
    "角色名称": "详细的声音特征描述"
  }
}`

    // 构建用户提示词
    const dialogueContent = segments.map((segment: any, index: number) => 
      `${index + 1}. ${segment.speaker}（${segment.role === 'host' ? '主持人' : '嘉宾'}）：${segment.content}`
    ).join('\n\n')

    const userPrompt = `请根据以下访谈对话内容，为每个角色生成合适的声音特征描述：

【对话内容】
${dialogueContent}

【分析要求】
1. 分析每个角色的说话风格和内容特点
2. 主持人要体现专业性和引导性
3. 嘉宾要体现其专业背景和个人特色
4. 为每个角色生成独特且合适的声音特征描述

请确保生成的声音特征描述能够很好地匹配角色的身份和说话内容。`

    // 调用Gemini API
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
          temperature: 0.7,
          topK: 32,
          topP: 0.8,
          maxOutputTokens: 4000,
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
        { success: false, error: 'Gemini音色prompt生成失败' },
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

    console.log('Gemini生成的音色prompt:', generatedText)

    // 解析JSON格式的音色prompt
    let parsedContent
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('未找到有效的JSON格式')
      }
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      return NextResponse.json(
        { success: false, error: '生成的音色prompt格式无效' },
        { status: 500 }
      )
    }

    // 验证解析结果
    if (!parsedContent.voicePrompts || typeof parsedContent.voicePrompts !== 'object') {
      return NextResponse.json(
        { success: false, error: '生成的音色prompt结构无效' },
        { status: 500 }
      )
    }

    console.log(`音色prompt生成成功，共${Object.keys(parsedContent.voicePrompts).length}个角色`)

    return NextResponse.json({
      success: true,
      message: 'Gemini音色prompt生成成功',
      data: {
        voicePrompts: parsedContent.voicePrompts,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        usage: {
          promptTokens: geminiResult.usageMetadata?.promptTokenCount || 0,
          completionTokens: geminiResult.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: geminiResult.usageMetadata?.totalTokenCount || 0
        }
      }
    })

  } catch (error) {
    console.error('Gemini音色prompt生成失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
