import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

const BUCKET = process.env.TENCENT_COS_BUCKET!
const REGION = process.env.TENCENT_COS_REGION!
const SECRET_ID = process.env.TENCENT_SECRET_ID!
const SECRET_KEY = process.env.TENCENT_SECRET_KEY!

// 腾讯云API签名工具
function sign(secretKey: string, stringToSign: string) {
  return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex')
}

// 腾讯云COS直接上传工具（简化版本，不设置ACL）
async function uploadToCOS(fileName: string, buffer: Buffer, contentType: string) {
  const endpoint = `${BUCKET}.cos.${REGION}.myqcloud.com`
  const now = Math.floor(Date.now() / 1000)
  const expires = now + 3600 // 1小时有效期
  const qSignTime = `${now};${expires}`
  const qKeyTime = qSignTime

  // 生成签名密钥
  const signKey = crypto.createHmac('sha1', SECRET_KEY).update(qKeyTime).digest('hex')

  // 构建HTTP字符串 - 简化版本，不包含ACL
  const httpString = `put\n/${fileName}\n\nhost=${endpoint}\n`

  // 构建签名字符串
  const stringToSign = `sha1\n${qKeyTime}\n${crypto.createHash('sha1').update(httpString).digest('hex')}\n`

  // 生成签名
  const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex')

  // 构建Authorization头
  const authorization = `q-sign-algorithm=sha1&q-ak=${SECRET_ID}&q-sign-time=${qSignTime}&q-key-time=${qKeyTime}&q-header-list=host&q-url-param-list=&q-signature=${signature}`

  // 构建请求头 - 简化版本
  const headers = {
    'Authorization': authorization,
    'Content-Type': contentType,
    'Host': endpoint,
  }

  console.log('上传到COS:', `https://${endpoint}/${fileName}`)
  console.log('使用简化签名（不设置ACL）')

  // 上传文件
  const response = await fetch(`https://${endpoint}/${fileName}`, {
    method: 'PUT',
    headers,
    body: buffer,
  })

  return response
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

    // 获取上传的文件
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: '请选择要上传的音频文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = [
      'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 
      'audio/flv', 'audio/mp4', 'audio/wma', 'audio/3gp', 
      'audio/amr', 'audio/aac', 'audio/ogg', 'audio/flac'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的音频格式' },
        { status: 400 }
      )
    }

    // 验证文件大小 (最大1GB)
    const maxSize = 1024 * 1024 * 1024 // 1GB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过1GB' },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop()
    const fileName = `audio/${nanoid()}.${fileExtension}`
    
    // 转换文件为Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 直接上传到腾讯云COS，设置公共读权限
    const uploadResponse = await uploadToCOS(fileName, buffer, file.type)

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('COS上传失败:', errorText)
      throw new Error(`COS上传失败: ${uploadResponse.status} ${errorText}`)
    }

    // 生成公共访问URL（无需签名）
    const publicUrl = `https://${BUCKET}.cos.${REGION}.myqcloud.com/${fileName}`

    console.log('音频文件上传成功:', publicUrl)

    return NextResponse.json({
      success: true,
      message: '音频文件上传成功',
      data: {
        fileName,
        fileUrl: publicUrl,
        fileSize: file.size,
        fileType: file.type,
        originalName: file.name,
        uploadTime: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('COS上传错误:', error)
    return NextResponse.json(
      { 
        error: '文件上传失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}
