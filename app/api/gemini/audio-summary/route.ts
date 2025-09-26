import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Gemini模型音频总结API（全球版）
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

    const { transcriptText, segments } = await request.json()

    if (!transcriptText) {
      return NextResponse.json(
        { success: false, error: '转录文本不能为空' },
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

    // 构建Gemini的提示词
    // 检测转录文本的主要语言
    const detectLanguage = (text: string): string => {
      // Unicode范围检测（优先级最高）
      if (/[\u4e00-\u9fff]/.test(text)) return 'Chinese'
      if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'Japanese'
      if (/[\uac00-\ud7af]/.test(text)) return 'Korean'
      if (/[\u0600-\u06ff]/.test(text)) return 'Arabic'
      if (/[\u0400-\u04ff]/.test(text)) return 'Russian'
      if (/[\u0370-\u03ff]/.test(text)) return 'Greek'
      if (/[\u0590-\u05ff]/.test(text)) return 'Hebrew'
      if (/[\u0e00-\u0e7f]/.test(text)) return 'Thai'

      // 简化的拉丁语系检测
      const sampleText = text.toLowerCase().slice(0, 500)

      // 西班牙语特征词
      if (/\b(el|la|de|en|con|por|para|que|es|un|una|los|las|del|al|se|no|le|su|me|te|lo|ya|todo|pero|más|hacer|tiempo|año|dos|día|hombre|tanto|después|vida|mundo|casa)\b/g.test(sampleText)) {
        return 'Spanish'
      }

      // 法语特征词
      if (/\b(le|la|de|du|des|et|est|une|dans|pour|avec|sur|être|avoir|que|ce|il|se|ne|pas|tout|vous|plus|son|faire|comme|dire|elle|aller|voir|savoir|pouvoir)\b/g.test(sampleText)) {
        return 'French'
      }

      // 德语特征词
      if (/\b(der|die|das|und|ist|ein|eine|mit|für|von|auf|zu|an|als|nach|bei|aus|über|durch|werden|haben|sein|können|müssen|sollen|wollen|dürfen|mögen)\b/g.test(sampleText)) {
        return 'German'
      }

      // 葡萄牙语特征词
      if (/\b(o|a|de|em|para|com|que|é|um|uma|do|da|no|na|por|se|não|mais|como|mas|seu|sua|ou|quando|muito|já|também|só|pelo|pela|até|sem|sobre|depois)\b/g.test(sampleText)) {
        return 'Portuguese'
      }

      // 意大利语特征词
      if (/\b(il|la|di|in|per|con|che|è|un|una|del|della|nel|nella|dal|dalla|sul|sulla|al|alla|questo|questa|quello|quella|mio|mia|tuo|tua|suo|sua|nostro|nostra)\b/g.test(sampleText)) {
        return 'Italian'
      }

      // 默认为英语
      return 'English'
    }

    const detectedLanguage = detectLanguage(transcriptText)

    // 使用英文提示词，但要求输出与识别语言一致
    const systemPrompt = `You are a professional multilingual audio content analyst. Please analyze the following audio transcript and provide a comprehensive summary.

IMPORTANT: The transcript is in ${detectedLanguage}. You MUST respond in the SAME language as the transcript (${detectedLanguage}). Do not translate or change the language of your response.

Please generate a structured summary in the following format:

# Audio Content Summary

## Main Content Overview
[Brief overview of the main content and themes of the audio]

## Key Points
[List 3-5 key points in chronological order, including timestamps when available]

## Core Insights
[Extract and list the core insights and important information from the audio]

## Summary
[Comprehensive summary of the entire audio content]

## Additional Notes
[Any relevant context, speaker information, or important details]

Requirements:
1. Respond in ${detectedLanguage} language only
2. Maintain the original meaning and context
3. Use clear, professional language appropriate for the detected language
4. Include timestamps when available in the format [MM:SS] or [HH:MM:SS]
5. Ensure the summary is accurate, concise, and well-organized
6. Preserve any technical terms, names, or specific terminology from the original audio

Remember: Your entire response must be in ${detectedLanguage}, matching the language of the transcript.`

    // 准备时间戳信息
    const timestampInfo = segments && segments.length > 0
      ? segments.map((seg: any) =>
          `[${formatTime(seg.startTime)}-${formatTime(seg.endTime)}] ${seg.text.trim()}`
        ).join('\n')
      : ''

    const fullPrompt = `${systemPrompt}

Audio Transcript:
${transcriptText}

${timestampInfo ? `Timestamped Segments:\n${timestampInfo}` : ''}

Please analyze the above content and provide your summary in ${detectedLanguage}.`

    // 调用Gemini 2.5 Pro API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,  // 降低温度以获得更一致和准确的输出
          topK: 32,
          topP: 0.8,
          maxOutputTokens: 60000,  // 利用Gemini 2.5 Pro的大输出容量支持更详细的总结
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
        { success: false, error: 'Gemini总结生成失败' },
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

    return NextResponse.json({
      success: true,
      message: 'Gemini总结生成成功',
      data: {
        summary: generatedText,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        usage: {
          promptTokens: geminiResult.usageMetadata?.promptTokenCount || 0,
          completionTokens: geminiResult.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: geminiResult.usageMetadata?.totalTokenCount || 0
        }
      }
    })

  } catch (error) {
    console.error('Gemini总结生成失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
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
