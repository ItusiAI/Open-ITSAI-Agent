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

    const { voicePrompts } = await request.json()

    if (!voicePrompts || typeof voicePrompts !== 'object') {
      return NextResponse.json(
        { success: false, error: '音色prompt不能为空' },
        { status: 400 }
      )
    }

    // 检查Minimax API密钥
    const minimaxApiKey = process.env.MINIMAX_API_KEY
    const minimaxGroupId = process.env.MINIMAX_GROUP_ID
    
    if (!minimaxApiKey || !minimaxGroupId) {
      return NextResponse.json(
        { success: false, error: 'Minimax API配置未完成' },
        { status: 500 }
      )
    }

    console.log('开始Minimax音色设计，角色数量:', Object.keys(voicePrompts).length)

    const voiceDesigns: Record<string, any> = {}

    // 为每个角色设计音色
    for (const [speakerName, voicePrompt] of Object.entries(voicePrompts)) {
      try {
        console.log(`正在为${speakerName}设计音色...`)

        // 调用Minimax音色设计API
        const designResponse = await fetch(`https://api.minimax.chat/v1/voice_design?GroupId=${minimaxGroupId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${minimaxApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            voice_description: voicePrompt as string,
            voice_name: speakerName,
            // 可以添加其他音色设计参数
            language: 'zh-CN',
            gender: (voicePrompt as string).includes('女') || (voicePrompt as string).includes('female') ? 'female' : 'male'
          }),
        })

        if (!designResponse.ok) {
          const errorData = await designResponse.text()
          console.error(`${speakerName}音色设计失败:`, errorData)
          
          // 如果音色设计失败，使用默认音色ID
          const defaultVoiceId = (voicePrompt as string).includes('女') || (voicePrompt as string).includes('female') 
            ? 'female-shaonv' 
            : 'male-qn-qingse'
          
          voiceDesigns[speakerName] = {
            voiceId: defaultVoiceId,
            voicePrompt: voicePrompt,
            isCustom: false,
            error: '音色设计失败，使用默认音色'
          }
          continue
        }

        const designResult = await designResponse.json()
        
        if (designResult.voice_id) {
          voiceDesigns[speakerName] = {
            voiceId: designResult.voice_id,
            voicePrompt: voicePrompt,
            isCustom: true,
            designInfo: designResult
          }
          console.log(`${speakerName}音色设计成功，音色ID: ${designResult.voice_id}`)
        } else {
          // 如果没有返回音色ID，使用默认音色
          const defaultVoiceId = (voicePrompt as string).includes('女') || (voicePrompt as string).includes('female') 
            ? 'female-shaonv' 
            : 'male-qn-qingse'
          
          voiceDesigns[speakerName] = {
            voiceId: defaultVoiceId,
            voicePrompt: voicePrompt,
            isCustom: false,
            error: '未返回音色ID，使用默认音色'
          }
        }

      } catch (error) {
        console.error(`${speakerName}音色设计异常:`, error)
        
        // 异常情况下使用默认音色
        const defaultVoiceId = (voicePrompt as string).includes('女') || (voicePrompt as string).includes('female') 
          ? 'female-shaonv' 
          : 'male-qn-qingse'
        
        voiceDesigns[speakerName] = {
          voiceId: defaultVoiceId,
          voicePrompt: voicePrompt,
          isCustom: false,
          error: '音色设计异常，使用默认音色'
        }
      }
    }

    console.log(`Minimax音色设计完成，成功设计${Object.keys(voiceDesigns).length}个音色`)

    return NextResponse.json({
      success: true,
      message: 'Minimax音色设计成功',
      data: {
        voiceDesigns: voiceDesigns,
        totalCount: Object.keys(voiceDesigns).length,
        customCount: Object.values(voiceDesigns).filter((design: any) => design.isCustom).length
      }
    })

  } catch (error) {
    console.error('Minimax音色设计失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取音色设计状态
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const voiceId = searchParams.get('voiceId')

    if (!voiceId) {
      return NextResponse.json(
        { success: false, error: '音色ID不能为空' },
        { status: 400 }
      )
    }

    // 检查Minimax API密钥
    const minimaxApiKey = process.env.MINIMAX_API_KEY
    const minimaxGroupId = process.env.MINIMAX_GROUP_ID
    
    if (!minimaxApiKey || !minimaxGroupId) {
      return NextResponse.json(
        { success: false, error: 'Minimax API配置未完成' },
        { status: 500 }
      )
    }

    // 查询音色设计状态
    const statusResponse = await fetch(`https://api.minimax.chat/v1/voice_design/${voiceId}?GroupId=${minimaxGroupId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${minimaxApiKey}`,
      },
    })

    if (!statusResponse.ok) {
      const errorData = await statusResponse.text()
      console.error('查询音色设计状态失败:', errorData)
      return NextResponse.json(
        { success: false, error: '查询音色设计状态失败' },
        { status: 500 }
      )
    }

    const statusResult = await statusResponse.json()

    return NextResponse.json({
      success: true,
      data: statusResult
    })

  } catch (error) {
    console.error('查询音色设计状态失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
