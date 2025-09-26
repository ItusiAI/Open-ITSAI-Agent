#!/usr/bin/env node

/**
 * 腾讯云ASR官方文档实现测试工具
 * 按照官方文档 https://cloud.tencent.com/document/product/1093/37823 实现
 */

// 手动加载环境变量
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

try {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
} catch (error) {
  console.log('⚠️  无法加载 .env.local 文件')
}

console.log('🎤 腾讯云ASR官方文档实现测试')
console.log('=' .repeat(50))

// 腾讯云API签名函数 - 按照官方文档实现
function sign(key, msg) {
  return crypto.createHmac('sha256', key).update(msg, 'utf8').digest('hex')
}

function getHash(msg) {
  return crypto.createHash('sha256').update(msg, 'utf8').digest('hex')
}

function getDate(timestamp) {
  const date = new Date(timestamp * 1000)
  const year = date.getUTCFullYear()
  const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
  const day = ('0' + date.getUTCDate()).slice(-2)
  return `${year}-${month}-${day}`
}

// 腾讯云ASR API请求函数 - 严格按照官方文档实现
async function tencentCloudRequest(action, params) {
  const secretId = process.env.TENCENT_SECRET_ID
  const secretKey = process.env.TENCENT_SECRET_KEY
  const region = process.env.TENCENT_ASR_REGION || 'ap-beijing'
  const service = 'asr'
  const version = '2019-06-14'
  const endpoint = 'asr.tencentcloudapi.com'

  if (!secretId || !secretKey) {
    throw new Error('缺少腾讯云访问密钥')
  }

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

  console.log('规范请求串:')
  console.log(canonicalRequest)
  console.log('')

  // ************* 步骤 2：拼接待签名字符串 *************
  const algorithm = 'TC3-HMAC-SHA256'
  const credentialScope = date + '/' + service + '/' + 'tc3_request'
  const hashedCanonicalRequest = getHash(canonicalRequest)
  const stringToSign = algorithm + '\n' +
    timestamp + '\n' +
    credentialScope + '\n' +
    hashedCanonicalRequest

  console.log('待签名字符串:')
  console.log(stringToSign)
  console.log('')

  // ************* 步骤 3：计算签名 *************
  const secretDate = sign(('TC3' + secretKey), date)
  const secretService = sign(secretDate, service)
  const secretSigning = sign(secretService, 'tc3_request')
  const signature = sign(secretSigning, stringToSign)

  console.log('签名:', signature)
  console.log('')

  // ************* 步骤 4：拼接 Authorization *************
  const authorization = algorithm + ' ' +
    'Credential=' + secretId + '/' + credentialScope + ', ' +
    'SignedHeaders=' + signedHeaders + ', ' +
    'Signature=' + signature

  console.log('Authorization:', authorization)
  console.log('')

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

  console.log('请求头:', JSON.stringify(headers, null, 2))
  console.log('请求体:', payload)
  console.log('')

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

// 测试函数
async function testOfficialASR() {
  console.log('🚀 开始测试官方ASR实现...\n')

  // 检查配置
  const secretId = process.env.TENCENT_SECRET_ID
  const secretKey = process.env.TENCENT_SECRET_KEY

  console.log('📋 配置检查:')
  console.log('SecretId:', secretId ? `${secretId.substring(0, 10)}...` : '❌ 未设置')
  console.log('SecretKey:', secretKey ? `${secretKey.substring(0, 10)}... (长度: ${secretKey.length})` : '❌ 未设置')
  console.log('')

  if (!secretId || !secretKey) {
    console.log('❌ 缺少必要配置，无法继续测试')
    return
  }

  if (secretKey.length !== 40) {
    console.log('❌ SecretKey长度错误！应该是40个字符')
    console.log('请重新生成腾讯云API密钥')
    return
  }

  // 使用官方文档示例参数
  const params = {
    EngineModelType: '16k_zh',
    ChannelNum: 1,
    ResTextFormat: 0,
    SourceType: 0,
    Url: 'https://itsaiagent-1303812962.cos.ap-beijing.myqcloud.com/audio/mt1eIJXeLvRy-2_DkQgUL.mp3'
  }

  console.log('📋 测试参数:', JSON.stringify(params, null, 2))
  console.log('')

  try {
    const result = await tencentCloudRequest('CreateRecTask', params)

    if (result.Error) {
      console.log('❌ API调用失败:', result.Error.Code, '-', result.Error.Message)
      
      if (result.Error.Code === 'AuthFailure.SignatureFailure') {
        console.log('💡 签名验证失败，可能的原因:')
        console.log('   - SecretKey长度或格式错误')
        console.log('   - 签名算法实现有误')
        console.log('   - 时间戳问题')
      }
    } else if (result.Response?.Data?.TaskId) {
      console.log('✅ ASR任务创建成功!')
      console.log('TaskId:', result.Response.Data.TaskId)
    } else {
      console.log('⚠️  响应格式异常')
    }
  } catch (error) {
    console.log('❌ 网络请求失败:', error.message)
  }
}

// 运行测试
testOfficialASR().catch(console.error)
