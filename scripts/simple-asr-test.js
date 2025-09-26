#!/usr/bin/env node

console.log('🎤 简单ASR测试')
console.log('开始测试...')

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
  console.log('无法加载环境变量:', error.message)
}

const secretId = process.env.TENCENT_SECRET_ID
const secretKey = process.env.TENCENT_SECRET_KEY

console.log('SecretId:', secretId ? 'OK' : 'Missing')
console.log('SecretKey:', secretKey ? `OK (长度: ${secretKey.length})` : 'Missing')

if (secretKey && secretKey.length !== 40) {
  console.log('❌ SecretKey长度错误！应该是40个字符，当前是', secretKey.length)
  console.log('请重新生成腾讯云API密钥')
} else {
  console.log('✅ 密钥配置看起来正确')
}
