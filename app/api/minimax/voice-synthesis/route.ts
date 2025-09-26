import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 语音合成API
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

    const { text, voiceId, voicePrompt, language = 'zh' } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json(
        { success: false, error: '文本和音色ID不能为空' },
        { status: 400 }
      )
    }

    const minimaxApiKey = process.env.MINIMAX_API_KEY
    const minimaxGroupId = process.env.MINIMAX_GROUP_ID

    if (!minimaxApiKey || !minimaxGroupId) {
      return NextResponse.json(
        { success: false, error: 'Minimax API配置缺失' },
        { status: 500 }
      )
    }

    // 音色映射
    const voiceMapping: Record<string, string> = {
      'male-qn-qingse': 'male-qn-qingse',
      'male-qn-jingying': 'male-qn-jingying',
      'male-qn-badao': 'male-qn-badao',
      'male-qn-daxuesheng': 'male-qn-daxuesheng',
      'female-shaonv': 'female-shaonv',
      'female-yujie': 'female-yujie',
      'female-chengshu': 'female-chengshu',
      'female-tianmei': 'female-tianmei',
      'presenter_male': 'male-qn-qingse',  // 映射到标准男声
      'presenter_female': 'female-shaonv', // 映射到标准女声
      'audiobook_male_1': 'audiobook_male_1',
      'audiobook_male_2': 'audiobook_male_2',
      'audiobook_female_1': 'audiobook_female_1',
      'audiobook_female_2': 'audiobook_female_2',
      'male-qn-qingse-jingpin': 'male-qn-qingse-jingpin',
      'male-qn-jingying-jingpin': 'male-qn-jingying-jingpin',
      'male-qn-badao-jingpin': 'male-qn-badao-jingpin',
      'male-qn-daxuesheng-jingpin': 'male-qn-daxuesheng-jingpin',
      'female-shaonv-jingpin': 'female-shaonv-jingpin',
      'female-yujie-jingpin': 'female-yujie-jingpin',
      'female-chengshu-jingpin': 'female-chengshu-jingpin',
      'female-tianmei-jingpin': 'female-tianmei-jingpin',
      'clever_boy': 'clever_boy',
      'cute_boy': 'cute_boy',
      'lovely_girl': 'lovely_girl',
      'cartoon_pig': 'cartoon_pig',
      'bingjiao_didi': 'bingjiao_didi',
      'junlang_nanyou': 'junlang_nanyou',
      'chunzhen_xuedi': 'chunzhen_xuedi',
      'lengdan_xiongzhang': 'lengdan_xiongzhang',
      'badao_shaoye': 'badao_shaoye',
      'tianxin_xiaoling': 'tianxin_xiaoling',
      'qiaopi_mengmei': 'qiaopi_mengmei',
      'wumei_yujie': 'wumei_yujie',
      'diadia_xuemei': 'diadia_xuemei',
      'danya_xuejie': 'danya_xuejie'
    }

    const selectedVoiceId = voiceMapping[voiceId] || voiceId

    // 验证音色ID是否存在
    if (!voiceMapping[voiceId]) {
      console.warn(`音色ID ${voiceId} 不在映射表中，使用原始ID: ${selectedVoiceId}`)
    }

    // 音色参数配置
    const voiceParams = {
      speed: 1.0,
      vol: 1.0,
      pitch: 0,
      style: 'natural'
    }

    const requestBody = {
      model: 'speech-2.5-hd-preview',
      text: text,
      stream: false,
      voice_setting: {
        voice_id: selectedVoiceId,
        speed: voiceParams.speed,
        vol: voiceParams.vol,
        pitch: voiceParams.pitch,
        emotion: 'neutral'
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: 'mp3',
        channel: 1
      }
    }

    // 调用Minimax语音合成API - 使用正确的端点
    const minimaxResponse = await fetch(`https://api.minimaxi.com/v1/t2a_v2?GroupId=${minimaxGroupId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${minimaxApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!minimaxResponse.ok) {
      const errorText = await minimaxResponse.text()
      return NextResponse.json(
        { success: false, error: `语音合成失败: ${minimaxResponse.status} - ${errorText}` },
        { status: 500 }
      )
    }

    const result = await minimaxResponse.json()

    // 检查API调用是否成功
    if (result.base_resp?.status_code !== 0) {
      console.error('MiniMax API调用失败:', result.base_resp?.status_msg)
      return NextResponse.json(
        { success: false, error: `语音合成失败: ${result.base_resp?.status_msg}` },
        { status: 500 }
      )
    }

    // 检查音频数据是否存在
    const hexAudioData = result.data?.audio
    if (!hexAudioData) {
      return NextResponse.json(
        { success: false, error: '语音合成失败，未返回音频数据' },
        { status: 500 }
      )
    }

    // 返回原始hex音频数据和base64 URL
    const audioBuffer = Buffer.from(hexAudioData, 'hex')
    const audioBase64 = audioBuffer.toString('base64')
    const audioDataUrl = `data:audio/mp3;base64,${audioBase64}`

    return NextResponse.json({
      success: true,
      data: {
        audioUrl: audioDataUrl,        // 用于单个段落播放
        audioBuffer: hexAudioData,     // 用于直接合并
        voiceId: selectedVoiceId,
        text: text,
        audioInfo: result.extra_info
      }
    })

  } catch (error) {
    console.error('语音合成失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取可用的音色列表
export async function GET() {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    // 返回可用的音色列表 - 适配speech-2.5-hd-preview模型
    const voiceList = [
      // 青年男声系列
      { id: 'male-qn-qingse', gender: 'male', category: 'youth' },
      { id: 'male-qn-jingying', gender: 'male', category: 'youth' },
      { id: 'male-qn-badao', gender: 'male', category: 'youth' },
      { id: 'male-qn-daxuesheng', gender: 'male', category: 'youth' },
      
      // 女声系列
      { id: 'female-shaonv', gender: 'female', category: 'youth' },
      { id: 'female-yujie', gender: 'female', category: 'mature' },
      { id: 'female-chengshu', gender: 'female', category: 'mature' },
      { id: 'female-tianmei', gender: 'female', category: 'sweet' },
      
      // 主持人系列
      { id: 'presenter_male', gender: 'male', category: 'professional' },
      { id: 'presenter_female', gender: 'female', category: 'professional' },
      
      // 有声书系列
      { id: 'audiobook_male_1', gender: 'male', category: 'audiobook' },
      { id: 'audiobook_male_2', gender: 'male', category: 'audiobook' },
      { id: 'audiobook_female_1', gender: 'female', category: 'audiobook' },
      { id: 'audiobook_female_2', gender: 'female', category: 'audiobook' },
      
      // 精品版本系列
      { id: 'male-qn-qingse-jingpin', gender: 'male', category: 'premium' },
      { id: 'male-qn-jingying-jingpin', gender: 'male', category: 'premium' },
      { id: 'male-qn-badao-jingpin', gender: 'male', category: 'premium' },
      { id: 'male-qn-daxuesheng-jingpin', gender: 'male', category: 'premium' },
      { id: 'female-shaonv-jingpin', gender: 'female', category: 'premium' },
      { id: 'female-yujie-jingpin', gender: 'female', category: 'premium' },
      { id: 'female-chengshu-jingpin', gender: 'female', category: 'premium' },
      { id: 'female-tianmei-jingpin', gender: 'female', category: 'premium' },
      
      // 童声系列
      { id: 'clever_boy', gender: 'child', category: 'child' },
      { id: 'cute_boy', gender: 'child', category: 'child' },
      { id: 'lovely_girl', gender: 'child', category: 'child' },
      
      // 特色角色系列
      { id: 'cartoon_pig', gender: 'cartoon', category: 'character' },
      { id: 'bingjiao_didi', gender: 'male', category: 'character' },
      { id: 'junlang_nanyou', gender: 'male', category: 'character' },
      { id: 'chunzhen_xuedi', gender: 'male', category: 'character' },
      { id: 'lengdan_xiongzhang', gender: 'male', category: 'character' },
      { id: 'badao_shaoye', gender: 'male', category: 'character' },
      { id: 'tianxin_xiaoling', gender: 'female', category: 'character' },
      { id: 'qiaopi_mengmei', gender: 'female', category: 'character' },
      { id: 'wumei_yujie', gender: 'female', category: 'character' },
      { id: 'diadia_xuemei', gender: 'female', category: 'character' },
      { id: 'danya_xuejie', gender: 'female', category: 'character' }
    ]

    return NextResponse.json({
      success: true,
      data: {
        voices: voiceList,
        total: voiceList.length
      }
    })

  } catch (error) {
    console.error('获取音色列表失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
