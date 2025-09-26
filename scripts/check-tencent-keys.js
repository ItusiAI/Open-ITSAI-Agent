#!/usr/bin/env node

/**
 * 腾讯云密钥格式检查工具
 */

// 手动加载环境变量
const fs = require('fs')
const path = require('path')

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

console.log('🔑 腾讯云密钥格式检查工具')
console.log('=' .repeat(50))

const secretId = process.env.TENCENT_SECRET_ID
const secretKey = process.env.TENCENT_SECRET_KEY

console.log('\n📋 密钥信息:')
console.log('SecretId:', secretId || '未设置')
console.log('SecretKey:', secretKey ? `${secretKey.substring(0, 10)}...` : '未设置')

console.log('\n🔍 格式检查:')

// 检查SecretId
if (secretId) {
  console.log(`SecretId长度: ${secretId.length} (应该是36)`)
  console.log(`SecretId格式: ${secretId.startsWith('AKID') ? '✅ 正确' : '❌ 错误，应该以AKID开头'}`)
  console.log(`SecretId字符: ${/^[A-Za-z0-9]+$/.test(secretId) ? '✅ 正确' : '❌ 错误，应该只包含字母数字'}`)
} else {
  console.log('❌ SecretId未设置')
}

// 检查SecretKey
if (secretKey) {
  console.log(`SecretKey长度: ${secretKey.length} (应该是40)`)
  console.log(`SecretKey字符: ${/^[A-Za-z0-9]+$/.test(secretKey) ? '✅ 正确' : '❌ 错误，应该只包含字母数字'}`)
  
  if (secretKey.length !== 40) {
    console.log('❌ SecretKey长度错误！这是导致签名失败的主要原因')
    console.log('💡 请重新生成腾讯云API密钥')
  }
} else {
  console.log('❌ SecretKey未设置')
}

console.log('\n🔗 获取正确密钥的步骤:')
console.log('1. 访问 https://console.cloud.tencent.com/cam/capi')
console.log('2. 点击 "新建密钥"')
console.log('3. 复制生成的SecretId和SecretKey')
console.log('4. 更新 .env.local 文件')
console.log('5. 重启开发服务器')

if (secretKey && secretKey.length !== 40) {
  console.log('\n⚠️  当前SecretKey长度不正确，这会导致所有API调用失败')
  console.log('请立即更新密钥配置！')
}
