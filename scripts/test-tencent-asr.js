#!/usr/bin/env node

/**
 * 腾讯云ASR权限和配置测试工具
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
  console.log('⚠️  无法加载 .env.local 文件，将使用系统环境变量')
}

console.log('🎤 腾讯云ASR权限测试工具')
console.log('=' .repeat(50))

// 签名函数
function sign(secretKey, stringToSign) {
  return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex')
}

// 腾讯云API请求函数
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
  const date = new Date(timestamp * 1000).toISOString().substring(0, 10)

  // 构建请求头
  const headers = {
    'Authorization': '',
    'Content-Type': 'application/json; charset=utf-8',
    'Host': endpoint,
    'X-TC-Action': action,
    'X-TC-Timestamp': timestamp.toString(),
    'X-TC-Version': version,
    'X-TC-Region': region,
  }

  const payload = JSON.stringify(params)

  // 构建签名
  const canonicalRequest = [
    'POST',
    '/',
    '',
    'content-type:application/json; charset=utf-8',
    `host:${endpoint}`,
    `x-tc-action:${action.toLowerCase()}`,
    `x-tc-timestamp:${timestamp}`,
    `x-tc-version:${version}`,
    '',
    'content-type;host;x-tc-action;x-tc-timestamp;x-tc-version',
    crypto.createHash('sha256').update(payload).digest('hex')
  ].join('\n')

  const stringToSign = [
    'TC3-HMAC-SHA256',
    timestamp,
    `${date}/${service}/tc3_request`,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex')
  ].join('\n')

  const kDate = sign(secretKey, date)
  const kService = sign(kDate, service)
  const kSigning = sign(kService, 'tc3_request')
  const signature = sign(kSigning, stringToSign)

  headers.Authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${date}/${service}/tc3_request, SignedHeaders=content-type;host;x-tc-action;x-tc-timestamp;x-tc-version, Signature=${signature}`

  console.log(`📡 发送请求到: https://${endpoint}`)
  console.log(`🔧 Action: ${action}`)
  console.log(`📋 参数:`, JSON.stringify(params, null, 2))

  // 发送请求
  const response = await fetch(`https://${endpoint}`, {
    method: 'POST',
    headers,
    body: payload,
  })

  const result = await response.json()
  console.log(`📥 响应状态: ${response.status}`)
  console.log(`📄 响应内容:`, JSON.stringify(result, null, 2))

  return result
}

// 测试1: 检查基本配置
function checkBasicConfig() {
  console.log('\n📋 检查基本配置...')
  
  const secretId = process.env.TENCENT_SECRET_ID
  const secretKey = process.env.TENCENT_SECRET_KEY
  const region = process.env.TENCENT_ASR_REGION
  
  console.log('SecretId:', secretId ? `${secretId.substring(0, 10)}...` : '❌ 未设置')
  console.log('SecretKey:', secretKey ? `${secretKey.substring(0, 10)}...` : '❌ 未设置')
  console.log('ASR Region:', region || '❌ 未设置 (将使用默认: ap-beijing)')
  
  return !!(secretId && secretKey)
}

// 测试2: 测试ASR权限
async function testASRPermissions() {
  console.log('\n🔐 测试ASR权限...')
  
  try {
    // 尝试创建一个测试任务（使用无效URL，但可以测试权限）
    const params = {
      EngineModelType: '16k_zh',
      ChannelNum: 1,
      ResTextFormat: 0,
      SourceType: 0,
      Url: 'https://example.com/test.wav', // 测试URL
    }
    
    const response = await tencentCloudRequest('CreateRecTask', params)
    
    if (response.Error) {
      const errorCode = response.Error.Code
      const errorMessage = response.Error.Message
      
      console.log(`❌ API错误: ${errorCode} - ${errorMessage}`)
      
      // 分析错误类型
      if (errorCode === 'AuthFailure.SignatureFailure') {
        console.log('💡 签名验证失败，请检查SecretId和SecretKey是否正确')
        return false
      } else if (errorCode === 'AuthFailure.UnauthorizedOperation') {
        console.log('💡 权限不足，请确保用户有ASR服务权限')
        return false
      } else if (errorCode === 'InvalidParameter.InvalidUrl') {
        console.log('✅ 权限验证通过（URL参数错误是预期的）')
        return true
      } else if (errorCode.includes('InvalidParameter')) {
        console.log('✅ 权限验证通过（参数错误是预期的）')
        return true
      } else {
        console.log('⚠️  未知错误，可能是权限问题')
        return false
      }
    } else {
      console.log('✅ ASR权限验证通过')
      return true
    }
  } catch (error) {
    console.log('❌ 网络请求失败:', error.message)
    return false
  }
}

// 测试3: 测试具体的音频URL
async function testAudioUrl() {
  console.log('\n🎵 测试音频URL访问...')
  
  // 使用实际的音频URL
  const testUrl = 'https://itsaiagent-1303812962.cos.ap-beijing.myqcloud.com/audio/mt1eIJXeLvRy-2_DkQgUL.mp3'
  
  try {
    console.log('🔗 测试音频URL:', testUrl.substring(0, 80) + '...')
    
    const response = await fetch(testUrl, { method: 'HEAD' })
    console.log(`📥 音频文件状态: ${response.status}`)
    console.log(`📊 Content-Type: ${response.headers.get('content-type')}`)
    console.log(`📏 Content-Length: ${response.headers.get('content-length')}`)
    
    if (response.status === 200) {
      console.log('✅ 音频文件可访问')
      return true
    } else {
      console.log('❌ 音频文件不可访问')
      return false
    }
  } catch (error) {
    console.log('❌ 音频URL测试失败:', error.message)
    return false
  }
}

// 测试4: 测试完整的ASR流程
async function testFullASRFlow() {
  console.log('\n🔄 测试完整ASR流程...')
  
  // 使用实际的音频文件和简化参数
  const params = {
    EngineModelType: '16k_zh',
    ChannelNum: 1,
    ResTextFormat: 0,
    SourceType: 0,
    Url: 'https://itsaiagent-1303812962.cos.ap-beijing.myqcloud.com/audio/mt1eIJXeLvRy-2_DkQgUL.mp3'
  }
  
  try {
    const response = await tencentCloudRequest('CreateRecTask', params)
    
    if (response.Error) {
      console.log(`❌ 创建任务失败: ${response.Error.Code} - ${response.Error.Message}`)
      return false
    }
    
    if (response.Response?.Data?.TaskId) {
      console.log(`✅ 任务创建成功, TaskId: ${response.Response.Data.TaskId}`)
      return true
    } else {
      console.log('❌ 响应格式异常:', JSON.stringify(response, null, 2))
      return false
    }
  } catch (error) {
    console.log('❌ 测试失败:', error.message)
    return false
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始ASR测试...\n')
  
  const results = {
    config: checkBasicConfig(),
    permissions: await testASRPermissions(),
    audioUrl: await testAudioUrl(),
    fullFlow: await testFullASRFlow()
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 测试结果汇总:')
  console.log('='.repeat(50))
  
  const testNames = {
    config: '基本配置检查',
    permissions: 'ASR权限验证',
    audioUrl: '音频URL访问',
    fullFlow: '完整ASR流程'
  }
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ 通过' : '❌ 失败'
    console.log(`${testNames[test]}: ${status}`)
  })
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n📈 总体结果: ${passedTests}/${totalTests} 项测试通过`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！ASR配置正确')
  } else {
    console.log('⚠️  部分测试失败，请检查配置和权限')
    
    console.log('\n💡 故障排除建议:')
    if (!results.config) {
      console.log('- 检查 .env.local 文件中的腾讯云配置')
    }
    if (!results.permissions) {
      console.log('- 检查用户是否有ASR服务权限')
      console.log('- 验证SecretId和SecretKey是否正确')
    }
    if (!results.audioUrl) {
      console.log('- 检查音频文件是否可访问')
      console.log('- 验证COS签名是否有效')
    }
    if (!results.fullFlow) {
      console.log('- 检查ASR服务配置和参数')
    }
  }
  
  console.log('\n📚 更多帮助请参考: docs/TENCENT_CLOUD_SETUP.md')
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { testASRPermissions, testAudioUrl, testFullASRFlow }
