import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'

// Cloudflare R2配置
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

// 支持的音频文件类型（全球版限制）
const SUPPORTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/mpeg',
  'audio/mp4',
  'audio/m4a',
  'audio/wav',
  'audio/webm',
  'video/mp4', // mp4视频文件也支持音频提取
  'application/octet-stream' // 某些情况下的通用类型
]

// 支持的文件扩展名
const SUPPORTED_EXTENSIONS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']

// 文件大小限制：25MB
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB in bytes

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

    // 检查R2配置
    if (!process.env.CLOUDFLARE_R2_ENDPOINT || 
        !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 
        !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
        !process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      return NextResponse.json(
        { success: false, error: 'Cloudflare R2配置不完整' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到上传文件' },
        { status: 400 }
      )
    }

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `文件大小超过限制，最大支持25MB，当前文件大小：${(file.size / 1024 / 1024).toFixed(2)}MB` 
        },
        { status: 400 }
      )
    }

    // 检查文件类型
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !SUPPORTED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `不支持的文件格式，支持的格式：${SUPPORTED_EXTENSIONS.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // 验证MIME类型
    if (!SUPPORTED_AUDIO_TYPES.includes(file.type) && file.type !== '') {
      // 如果MIME类型不匹配但有正确的扩展名，我们仍然允许（某些浏览器可能不设置正确的MIME类型）
      console.warn(`文件MIME类型不匹配: ${file.type}，但扩展名正确: ${fileExtension}`)
    }

    // 生成唯一的文件名
    const timestamp = Date.now()
    const randomId = nanoid(8)
    const fileName = `global-audio/${timestamp}-${randomId}.${fileExtension}`

    // 将文件转换为Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 上传到Cloudflare R2
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type || `audio/${fileExtension}`,
      ContentLength: buffer.length,
      Metadata: {
        'original-name': file.name,
        'uploaded-by': session.user.email,
        'upload-time': new Date().toISOString(),
        'file-size': file.size.toString(),
        'version': 'global'
      }
    })

    await r2Client.send(uploadCommand)

    // 构建公共访问URL
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`

    return NextResponse.json({
      success: true,
      message: '文件上传成功',
      data: {
        fileName: fileName,
        originalName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: publicUrl,
        uploadTime: new Date().toISOString(),
        version: 'global'
      }
    })

  } catch (error) {
    console.error('Cloudflare R2上传失败:', error)
    return NextResponse.json(
      { success: false, error: '文件上传失败，请重试' },
      { status: 500 }
    )
  }
}

// GET方法用于获取上传配置信息
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
      supportedTypes: SUPPORTED_EXTENSIONS,
      supportedMimeTypes: SUPPORTED_AUDIO_TYPES,
      version: 'global',
      storage: 'Cloudflare R2'
    }
  })
}
