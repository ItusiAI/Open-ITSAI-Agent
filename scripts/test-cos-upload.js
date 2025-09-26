#!/usr/bin/env node

/**
 * 腾讯云COS上传测试工具
 * 测试新的公共读权限上传方式
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

console.log('🔍 腾讯云COS上传测试工具')
console.log('=' .repeat(50))

const BUCKET = process.env.TENCENT_COS_BUCKET
const REGION = process.env.TENCENT_COS_REGION
const SECRET_ID = process.env.TENCENT_SECRET_ID
const SECRET_KEY = process.env.TENCENT_SECRET_KEY

// 检查配置
function checkConfig() {
  console.log('\n📋 检查配置...')
  
  const configs = {
    'TENCENT_COS_BUCKET': BUCKET,
    'TENCENT_COS_REGION': REGION,
    'TENCENT_SECRET_ID': SECRET_ID,
    'TENCENT_SECRET_KEY': SECRET_KEY
  }
  
  let allSet = true
  
  Object.entries(configs).forEach(([key, value]) => {
    if (value) {
      console.log(`✅ ${key}: ${key.includes('SECRET') ? value.substring(0, 10) + '...' : value}`)
    } else {
      console.log(`❌ ${key}: 未设置`)
      allSet = false
    }
  })
  
  return allSet
}

// 生成COS签名
function generateCOSSignature(method, fileName) {
  const now = Math.floor(Date.now() / 1000)
  const expires = now + 3600
  const qSignTime = `${now};${expires}`
  const qKeyTime = qSignTime

  // 生成签名密钥
  const signKey = crypto.createHmac('sha1', SECRET_KEY).update(qKeyTime).digest('hex')

  // 构建HTTP字符串
  const endpoint = `${BUCKET}.cos.${REGION}.myqcloud.com`
  const httpString = `${method.toLowerCase()}\n/${fileName}\n\nhost=${endpoint}\nx-cos-acl=public-read\n`
  
  // 构建签名字符串
  const stringToSign = `sha1\n${qKeyTime}\n${crypto.createHash('sha1').update(httpString).digest('hex')}\n`
  
  // 生成签名
  const signature = crypto.createHmac('sha1', signKey).update(stringToSign).digest('hex')

  // 构建Authorization头
  const authorization = `q-sign-algorithm=sha1&q-ak=${SECRET_ID}&q-sign-time=${qSignTime}&q-key-time=${qKeyTime}&q-header-list=host;x-cos-acl&q-url-param-list=&q-signature=${signature}`

  return {
    authorization,
    endpoint,
    expires
  }
}

// 测试签名生成
function testSignatureGeneration() {
  console.log('\n📝 测试签名生成...')
  
  if (!SECRET_ID || !SECRET_KEY || !BUCKET || !REGION) {
    console.log('❌ 缺少必要配置，跳过签名测试')
    return false
  }
  
  try {
    const fileName = 'audio/test-file.mp3'
    const signatureInfo = generateCOSSignature('PUT', fileName)
    
    console.log('✅ 签名生成成功')
    console.log(`   文件名: ${fileName}`)
    console.log(`   端点: ${signatureInfo.endpoint}`)
    console.log(`   签名: ${signatureInfo.authorization.substring(0, 50)}...`)
    console.log(`   过期时间: ${new Date(signatureInfo.expires * 1000).toISOString()}`)
    
    return true
  } catch (error) {
    console.log('❌ 签名生成失败:', error.message)
    return false
  }
}

// 测试存储桶访问
async function testBucketAccess() {
  console.log('\n🌐 测试存储桶访问...')
  
  if (!BUCKET || !REGION) {
    console.log('❌ 缺少存储桶配置')
    return false
  }
  
  try {
    const bucketUrl = `https://${BUCKET}.cos.${REGION}.myqcloud.com/`
    console.log(`🔗 测试URL: ${bucketUrl}`)
    
    const response = await fetch(bucketUrl, { method: 'HEAD' })
    console.log(`📥 响应状态: ${response.status}`)
    
    if (response.status === 200 || response.status === 403) {
      console.log('✅ 存储桶可访问')
      return true
    } else {
      console.log('❌ 存储桶访问异常')
      return false
    }
  } catch (error) {
    console.log('❌ 存储桶访问失败:', error.message)
    return false
  }
}

// 测试公共读权限
async function testPublicReadAccess() {
  console.log('\n🔓 测试公共读权限...')
  
  // 尝试访问一个可能存在的公共文件
  const testUrl = `https://${BUCKET}.cos.${REGION}.myqcloud.com/audio/test.txt`
  
  try {
    console.log(`🔗 测试公共访问: ${testUrl}`)
    
    const response = await fetch(testUrl, { method: 'HEAD' })
    console.log(`📥 响应状态: ${response.status}`)
    
    if (response.status === 200) {
      console.log('✅ 公共读权限已配置')
      return true
    } else if (response.status === 404) {
      console.log('⚠️  文件不存在，但存储桶可能已配置公共读权限')
      return true
    } else if (response.status === 403) {
      console.log('❌ 公共读权限未配置或访问被拒绝')
      return false
    } else {
      console.log('⚠️  未知响应状态')
      return false
    }
  } catch (error) {
    console.log('❌ 公共读权限测试失败:', error.message)
    return false
  }
}

// 生成配置建议
function generateSuggestions(results) {
  console.log('\n💡 配置建议:')
  
  if (!results.config) {
    console.log('- 请检查 .env.local 文件中的腾讯云配置')
    console.log('- 确保所有必需的环境变量都已设置')
  }
  
  if (!results.signature) {
    console.log('- 检查 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY 是否正确')
    console.log('- 验证密钥格式和长度')
  }
  
  if (!results.bucketAccess) {
    console.log('- 检查存储桶名称和地域配置')
    console.log('- 确认存储桶存在且可访问')
  }
  
  if (!results.publicRead) {
    console.log('- 需要配置存储桶的公共读权限')
    console.log('- 参考文档: docs/COS_PUBLIC_ACCESS_SETUP.md')
    console.log('- 在COS控制台设置存储桶访问权限为公共读')
  }
  
  console.log('\n📚 相关文档:')
  console.log('   - docs/COS_PUBLIC_ACCESS_SETUP.md')
  console.log('   - docs/TENCENT_CLOUD_SETUP.md')
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始COS上传测试...\n')
  
  const results = {
    config: checkConfig(),
    signature: testSignatureGeneration(),
    bucketAccess: await testBucketAccess(),
    publicRead: await testPublicReadAccess()
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 测试结果汇总:')
  console.log('='.repeat(50))
  
  const testNames = {
    config: '基本配置检查',
    signature: '签名生成测试',
    bucketAccess: '存储桶访问',
    publicRead: '公共读权限'
  }
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ 通过' : '❌ 失败'
    console.log(`${testNames[test]}: ${status}`)
  })
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n📈 总体结果: ${passedTests}/${totalTests} 项测试通过`)
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！COS配置正确')
    console.log('\n✨ 您现在可以使用新的公共读上传方式了')
  } else {
    console.log('⚠️  部分测试失败，请检查配置')
    generateSuggestions(results)
  }
  
  console.log('\n🔗 下一步:')
  console.log('   1. 如果公共读权限测试失败，请按照文档配置存储桶权限')
  console.log('   2. 测试音频文件上传功能')
  console.log('   3. 验证ASR语音识别是否正常工作')
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = {
  checkConfig,
  testSignatureGeneration,
  testBucketAccess,
  testPublicReadAccess
}
