import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { voiceDesignData } = await request.json()

    if (!voiceDesignData || typeof voiceDesignData !== 'object') {
      return NextResponse.json({
        success: false,
        error: '缺少音色设计数据'
      }, { status: 400 })
    }

    const voiceDesigns: Record<string, any> = {}
    const preGeneratedAudios: Record<string, string> = {}

    // 为每个说话者设计音色并生成试听音频
    for (const [speaker, data] of Object.entries(voiceDesignData)) {
      const { voicePrompt, previewText } = data as { voicePrompt: string; previewText: string }

      try {
        // 优化方案：根据MiniMax官方文档，使用音色设计API但将对话内容作为试听文本
        // 这样可以在设计音色的同时生成完整的对话音频，只收取字符费用
        const designResponse = await fetch('https://api.minimax.chat/v1/voice_generation', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'speech-01',
            voice_setting: {
              voice_id: speaker.includes('主持人') ? 'male_qn_qingse' : 'female_tianmei',
              speed: 1.0,
              vol: 1.0,
              pitch: 0
            },
            text: previewText, // 关键：使用完整对话内容作为试听文本
            audio_setting: {
              audio_sample_rate: 32000,
              bitrate: 128000,
              format: 'mp3'
            },
            pronunciation_dict: {
              tone: voicePrompt // 音色描述
            }
          }),
        })

        if (!designResponse.ok) {
          throw new Error(`MiniMax API error: ${designResponse.status}`)
        }

        const designResult = await designResponse.json()

        if (designResult.base_resp?.status_code === 0) {
          // 成功：保存音色信息和预生成的音频
          voiceDesigns[speaker] = {
            voiceId: designResult.voice_id || (speaker.includes('主持人') ? 'male_qn_qingse' : 'female_tianmei'),
            voicePrompt: voicePrompt,
            audioSampleRate: 32000,
            bitrate: 128000,
            isOptimized: true, // 标记为优化方案
            characterCount: previewText.length // 记录字符数用于成本计算
          }

          // 保存预生成的音频URL（这是关键：通过试听文本生成的完整对话音频）
          if (designResult.audio_url) {
            preGeneratedAudios[speaker] = designResult.audio_url
            console.log(`✅ ${speaker} 音频生成成功，字符数: ${previewText.length}`)
          } else {
            throw new Error(`${speaker} 音频生成失败：未返回音频URL`)
          }
        } else {
          // 不进行降级处理，直接抛出错误
          const errorMsg = designResult.base_resp?.status_msg || '未知错误'
          throw new Error(`${speaker} 音色设计失败: ${errorMsg}`)
        }
      } catch (error) {
        console.error(`处理说话者 ${speaker} 时出错:`, error)
        // 不进行降级处理，直接抛出错误
        throw new Error(`处理说话者 ${speaker} 时出错: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }

    // 验证是否所有角色都成功生成了音频
    if (Object.keys(preGeneratedAudios).length === 0) {
      throw new Error('所有角色的音频生成都失败了')
    }

    console.log(`🎙️ 音色设计优化方案完成: ${Object.keys(preGeneratedAudios).length}个角色音频生成成功`)

    return NextResponse.json({
      success: true,
      data: {
        voiceDesigns,
        preGeneratedAudios
      }
    })

  } catch (error) {
    console.error('音色设计优化版本失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '音色设计失败'
    }, { status: 500 })
  }
}
