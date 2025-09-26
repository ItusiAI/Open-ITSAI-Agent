import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'

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

    const { audioUrl, requiredPoints } = await request.json()

    if (!audioUrl) {
      return NextResponse.json(
        { success: false, error: '音频URL不能为空' },
        { status: 400 }
      )
    }

    // 如果提供了所需积分，检查用户积分是否足够
    if (requiredPoints && requiredPoints > 0) {
      try {
        const userList = await db
          .select({ points: users.points })
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1)

        const user = userList[0]
        if (!user || (user.points || 0) < requiredPoints) {
          return NextResponse.json(
            { success: false, error: '积分不足，无法进行语音识别' },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('检查用户积分失败:', error)
        return NextResponse.json(
          { success: false, error: '积分检查失败' },
          { status: 500 }
        )
      }
    }

    // 调用OpenAI Whisper API
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API密钥未配置' },
        { status: 500 }
      )
    }

    // 下载音频文件
    const audioResponse = await fetch(audioUrl)
    if (!audioResponse.ok) {
      return NextResponse.json(
        { success: false, error: '无法下载音频文件' },
        { status: 400 }
      )
    }

    const audioBuffer = await audioResponse.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })

    // 创建FormData用于Whisper API
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.mp3')
    formData.append('model', 'whisper-1')
    // 全球版让Whisper自动检测语言，不指定特定语言
    // formData.append('language', 'auto') // Whisper会自动检测语言
    formData.append('response_format', 'verbose_json')
    formData.append('timestamp_granularities[]', 'segment')

    // 调用Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    })

    if (!whisperResponse.ok) {
      const errorData = await whisperResponse.json()
      console.error('Whisper API错误:', errorData)
      return NextResponse.json(
        { success: false, error: 'Whisper语音识别失败' },
        { status: 500 }
      )
    }

    const whisperResult = await whisperResponse.json()

    // 处理Whisper返回的结果
    const segments = whisperResult.segments?.map((segment: any) => ({
      startTime: segment.start,
      endTime: segment.end,
      text: segment.text.trim(),
      speaker: 'Speaker 1' // Whisper不支持说话人分离，默认为Speaker 1
    })) || []

    const fullText = whisperResult.text || ''

    return NextResponse.json({
      success: true,
      data: {
        taskId: `whisper_${Date.now()}`, // 生成一个任务ID用于兼容
        status: 'completed',
        segments: segments,
        fullText: fullText,
        duration: whisperResult.duration || 0
      }
    })

  } catch (error) {
    console.error('Whisper语音识别失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// GET方法用于兼容轮询查询（实际上Whisper是同步的，直接返回完成状态）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('taskId')

  if (!taskId) {
    return NextResponse.json(
      { success: false, error: '任务ID不能为空' },
      { status: 400 }
    )
  }

  // 对于Whisper，我们直接返回已完成状态
  // 实际的结果已经在POST请求中返回了
  return NextResponse.json({
    success: true,
    data: {
      status: 'completed',
      message: 'Whisper识别已完成'
    }
  })
}
