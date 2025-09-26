import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

// 腾讯云API签名函数 - 修复版本
function sign(key: string | Buffer, msg: string) {
  return crypto.createHmac('sha256', key).update(msg, 'utf8').digest('hex')
}

function getHash(msg: string) {
  return crypto.createHash('sha256').update(msg, 'utf8').digest('hex')
}

function getDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 腾讯云ASR API请求函数 - 严格按照官方文档实现
async function tencentCloudRequest(action: string, params: any) {
  const secretId = process.env.TENCENT_SECRET_ID!
  const secretKey = process.env.TENCENT_SECRET_KEY!
  const region = process.env.TENCENT_ASR_REGION || 'ap-beijing'
  const service = 'asr'
  const version = '2019-06-14'
  const endpoint = 'asr.tencentcloudapi.com'

  const timestamp = Math.floor(Date.now() / 1000)
  const date = getDate(timestamp)

  // ************* 步骤 1：拼接规范请求串 *************
  const httpRequestMethod = 'POST'
  const canonicalUri = '/'
  const canonicalQueryString = ''
  const canonicalHeaders = 'content-type:application/json; charset=utf-8\n' + `host:${endpoint}\n`
  const signedHeaders = 'content-type;host'

  const payload = JSON.stringify(params)
  const hashedRequestPayload = getHash(payload)
  const canonicalRequest = httpRequestMethod + '\n' +
    canonicalUri + '\n' +
    canonicalQueryString + '\n' +
    canonicalHeaders + '\n' +
    signedHeaders + '\n' +
    hashedRequestPayload

  // ************* 步骤 2：拼接待签名字符串 *************
  const algorithm = 'TC3-HMAC-SHA256'
  const credentialScope = date + '/' + service + '/' + 'tc3_request'
  const hashedCanonicalRequest = getHash(canonicalRequest)
  const stringToSign = algorithm + '\n' +
    timestamp + '\n' +
    credentialScope + '\n' +
    hashedCanonicalRequest

  // ************* 步骤 3：计算签名 *************
  const secretDate = sign(Buffer.from('TC3' + secretKey, 'utf8'), date)
  const secretService = sign(Buffer.from(secretDate, 'hex'), service)
  const secretSigning = sign(Buffer.from(secretService, 'hex'), 'tc3_request')
  const signature = sign(Buffer.from(secretSigning, 'hex'), stringToSign)

  // ************* 步骤 4：拼接 Authorization *************
  const authorization = algorithm + ' ' +
    'Credential=' + secretId + '/' + credentialScope + ', ' +
    'SignedHeaders=' + signedHeaders + ', ' +
    'Signature=' + signature

  // ************* 步骤 5：构造并发起请求 *************
  const headers = {
    'Authorization': authorization,
    'Content-Type': 'application/json; charset=utf-8',
    'Host': endpoint,
    'X-TC-Action': action,
    'X-TC-Timestamp': timestamp.toString(),
    'X-TC-Version': version,
    'X-TC-Region': region,
  }

  console.log('腾讯云ASR API调用:')
  console.log('Action:', action)
  console.log('Params:', JSON.stringify(params, null, 2))

  const response = await fetch(`https://${endpoint}`, {
    method: 'POST',
    headers,
    body: payload,
  })

  const result = await response.json()
  console.log('响应状态:', response.status)
  console.log('响应内容:', JSON.stringify(result, null, 2))

  return result
}

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

    const { audioUrl, language = 'zh', requiredPoints } = await request.json()

    // 使用公共URL（不再使用预签名URL）
    const finalAudioUrl = audioUrl

    if (!finalAudioUrl) {
      return NextResponse.json(
        { error: '音频URL不能为空' },
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
            { error: '积分不足，无法进行语音识别' },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('检查用户积分失败:', error)
        return NextResponse.json(
          { error: '积分检查失败' },
          { status: 500 }
        )
      }
    }

    // 只支持中文识别
    if (language !== 'zh') {
      return NextResponse.json(
        { error: '当前仅支持中文语音识别' },
        { status: 400 }
      )
    }

    // 创建语音识别任务 - 启用说话人分离功能
    const params = {
      EngineModelType: '16k_zh', // 使用基础中文模型（支持说话人分离）
      ChannelNum: 1, // 单声道（说话人分离要求）
      ResTextFormat: 0, // 基础文本格式
      SourceType: 0, // 音频URL
      Url: finalAudioUrl, // 音频文件URL
      SpeakerDiarization: 1, // 开启说话人分离
      SpeakerNumber: 0, // 自动分离（最多分离出20个人）
    }

    console.log('开始语音识别，参数:', params)

    // 调用腾讯云语音识别API
    const response = await tencentCloudRequest('CreateRecTask', params)

    if (response.Error) {
      console.error('腾讯云API错误详情:', response.Error)
      throw new Error(`腾讯云API错误: ${response.Error.Code} - ${response.Error.Message}`)
    }

    if (!response.Response?.Data?.TaskId) {
      console.error('API响应结构异常:', JSON.stringify(response, null, 2))

      // 检查是否有具体的错误信息
      if (response.Response?.Error) {
        const error = response.Response.Error
        throw new Error(`腾讯云ASR错误: ${error.Code} - ${error.Message}`)
      } else {
        throw new Error(`创建识别任务失败 - 响应结构异常: ${JSON.stringify(response)}`)
      }
    }

    const taskId = response.Response.Data.TaskId

    console.log('语音识别任务创建成功，TaskId:', taskId)

    return NextResponse.json({
      success: true,
      message: '语音识别任务创建成功',
      data: {
        taskId,
        status: 'processing',
        engineModel: '16k_zh_large'
      }
    })

  } catch (error) {
    console.error('语音识别错误:', error)
    return NextResponse.json(
      { 
        error: '语音识别失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 查询识别结果的GET接口
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'TaskId不能为空' },
        { status: 400 }
      )
    }

    // 查询识别结果
    const response = await tencentCloudRequest('DescribeTaskStatus', {
      TaskId: parseInt(taskId)
    })

    if (response.Error) {
      throw new Error(`腾讯云API错误: ${response.Error.Message}`)
    }

    const taskStatus = response.Response?.Data?.StatusStr
    const result = response.Response?.Data?.Result

    console.log('查询识别结果，TaskId:', taskId, 'Status:', taskStatus)

    if (taskStatus === 'success' && result) {
      // 解析识别结果 - 腾讯云返回的是带时间戳的字符串格式
      console.log('原始识别结果:', result)

      let segments: any[] = []
      let fullText = ''

      if (typeof result === 'string') {
        // 解析时间戳格式的文本，支持说话人分离
        // 格式可能是: [0:1.000,0:12.580] 文本内容 或 [0:1.000,0:12.580]spk0 文本内容
        const lines = result.split('\n').filter(line => line.trim())
        segments = lines.map((line, index) => {
          // 尝试匹配多种时间戳格式
          // 格式1: [1:26.290,1:28.970,0] 文本内容 (带说话人ID)
          const format1Match = line.match(/\[(\d+):(\d+\.\d+),(\d+):(\d+\.\d+),(\d+)\]\s*(.*)/)
          if (format1Match) {
            const [, startMin, startSec, endMin, endSec, speakerId, text] = format1Match
            return {
              startTime: parseInt(startMin) * 60 + parseFloat(startSec),
              endTime: parseInt(endMin) * 60 + parseFloat(endSec),
              text: text.trim(),
              speaker: `Speaker ${parseInt(speakerId) + 1}`,
              speakerId: parseInt(speakerId) + 1
            }
          }

          // 格式2: [1:26.290,1:28.970]spk0 文本内容
          const format2Match = line.match(/\[(\d+):(\d+\.\d+),(\d+):(\d+\.\d+)\](?:spk(\d+))?\s*(.*)/)
          if (format2Match) {
            const [, startMin, startSec, endMin, endSec, speakerId, text] = format2Match
            const speakerNumber = speakerId ? parseInt(speakerId) + 1 : 1
            return {
              startTime: parseInt(startMin) * 60 + parseFloat(startSec),
              endTime: parseInt(endMin) * 60 + parseFloat(endSec),
              text: text.trim(),
              speaker: `Speaker ${speakerNumber}`,
              speakerId: speakerNumber
            }
          }

          // 格式3: [1:26.290,1:28.970] 文本内容 (普通格式)
          const format3Match = line.match(/\[(\d+):(\d+\.\d+),(\d+):(\d+\.\d+)\]\s*(.*)/)
          if (format3Match) {
            const [, startMin, startSec, endMin, endSec, text] = format3Match
            return {
              startTime: parseInt(startMin) * 60 + parseFloat(startSec),
              endTime: parseInt(endMin) * 60 + parseFloat(endSec),
              text: text.trim(),
              speaker: 'Speaker 1',
              speakerId: 1
            }
          }

          // 如果没有时间戳，创建一个默认的段落
          return {
            startTime: index * 5,
            endTime: (index + 1) * 5,
            text: line.trim(),
            speaker: 'Speaker 1',
            speakerId: 1
          }
        }).filter(segment => segment.text)

        fullText = segments.map(s => s.text).join(' ')
      } else if (Array.isArray(result)) {
        // 如果是数组格式（其他返回格式）
        segments = result.map((item: any) => ({
          startTime: item.StartTime || 0,
          endTime: item.EndTime || 0,
          text: item.VoiceTextStr || item.text || '',
          speaker: item.SpeakerId || 'Speaker 1'
        }))
        fullText = segments.map(s => s.text).join(' ')
      } else {
        // 如果是其他格式，直接使用原始结果
        fullText = String(result)
        segments = [{
          startTime: 0,
          endTime: 0,
          text: fullText,
          speaker: 'Speaker 1'
        }]
      }

      return NextResponse.json({
        success: true,
        data: {
          taskId,
          status: 'completed',
          segments,
          fullText,
          duration: segments.length > 0 ? Math.max(...segments.map(s => s.endTime)) : 0
        }
      })
    } else if (taskStatus === 'failed') {
      return NextResponse.json({
        success: false,
        error: '语音识别失败',
        data: {
          taskId,
          status: 'failed'
        }
      })
    } else {
      // 仍在处理中
      return NextResponse.json({
        success: true,
        data: {
          taskId,
          status: 'processing'
        }
      })
    }

  } catch (error) {
    console.error('查询识别结果错误:', error)
    return NextResponse.json(
      { 
        error: '查询识别结果失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
