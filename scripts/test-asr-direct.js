#!/usr/bin/env node

/**
 * 直接测试ASR API调用
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
  console.log('无法加载环境变量')
}

console.log('🎤 直接测试ASR API')
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

async function testASR() {
  const secretId = process.env.TENCENT_SECRET_ID
  const secretKey = process.env.TENCENT_SECRET_KEY
  const region = 'ap-beijing'
  const service = 'asr'
  const version = '2019-06-14'
  const endpoint = 'asr.tencentcloudapi.com'
  const action = 'CreateRecTask'

  const timestamp = Math.floor(Date.now() / 1000)
  const date = getDate(timestamp)

  // 请求参数 - 使用基础配置
  const params = {
    EngineModelType: '16k_zh',
    ChannelNum: 1,
    ResTextFormat: 0,
    SourceType: 0,
    Url: 'https://itsaiagent-1303812962.cos.ap-beijing.myqcloud.com/audio/mt1eIJXeLvRy-2_DkQgUL.mp3'
  }

  console.log('请求参数:', JSON.stringify(params, null, 2))

  // 构建签名
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

  const algorithm = 'TC3-HMAC-SHA256'
  const credentialScope = date + '/' + service + '/' + 'tc3_request'
  const hashedCanonicalRequest = getHash(canonicalRequest)
  const stringToSign = algorithm + '\n' +
    timestamp + '\n' +
    credentialScope + '\n' +
    hashedCanonicalRequest

  const secretDate = sign(('TC3' + secretKey), date)
  const secretService = sign(secretDate, service)
  const secretSigning = sign(secretService, 'tc3_request')
  const signature = sign(secretSigning, stringToSign)

  const authorization = algorithm + ' ' +
    'Credential=' + secretId + '/' + credentialScope + ', ' +
    'SignedHeaders=' + signedHeaders + ', ' +
    'Signature=' + signature

  const headers = {
    'Authorization': authorization,
    'Content-Type': 'application/json; charset=utf-8',
    'Host': endpoint,
    'X-TC-Action': action,
    'X-TC-Timestamp': timestamp.toString(),
    'X-TC-Version': version,
    'X-TC-Region': region,
  }

  console.log('发送请求到:', `https://${endpoint}`)

  try {
    const response = await fetch(`https://${endpoint}`, {
      method: 'POST',
      headers,
      body: payload,
    })

    const result = await response.json()
    console.log('响应状态:', response.status)
    console.log('响应内容:', JSON.stringify(result, null, 2))

    if (result.Error) {
      console.log('\n❌ API调用失败')
      console.log('错误代码:', result.Error.Code)
      console.log('错误信息:', result.Error.Message)
    } else if (result.Response?.Data?.TaskId) {
      console.log('\n✅ ASR任务创建成功!')
      console.log('TaskId:', result.Response.Data.TaskId)
    } else {
      console.log('\n⚠️  响应格式异常')
    }
  } catch (error) {
    console.log('\n❌ 网络请求失败:', error.message)
  }
}

testASR().catch(console.error)
