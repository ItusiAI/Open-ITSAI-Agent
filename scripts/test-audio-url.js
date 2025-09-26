#!/usr/bin/env node

/**
 * 音频文件URL访问测试工具
 */

const testUrl = process.argv[2] || 'https://itsaiagent-1303812962.cos.ap-beijing.myqcloud.com/audio/mt1eIJXeLvRy-2_DkQgUL.mp3'

console.log('🎵 音频文件URL访问测试')
console.log('=' .repeat(50))
console.log('测试URL:', testUrl)

async function testAudioAccess() {
  try {
    console.log('\n📡 发送HEAD请求...')
    const response = await fetch(testUrl, { method: 'HEAD' })
    
    console.log('📥 响应状态:', response.status)
    console.log('📊 响应头:')
    
    const headers = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })
    
    console.log(JSON.stringify(headers, null, 2))
    
    if (response.status === 200) {
      console.log('\n✅ 音频文件可以直接访问')
      console.log('📏 文件大小:', headers['content-length'] || '未知')
      console.log('📄 文件类型:', headers['content-type'] || '未知')
      return true
    } else if (response.status === 403) {
      console.log('\n❌ 访问被拒绝 - 需要配置存储桶公共读权限')
      return false
    } else if (response.status === 404) {
      console.log('\n❌ 文件不存在')
      return false
    } else {
      console.log('\n⚠️  未知响应状态')
      return false
    }
  } catch (error) {
    console.log('\n❌ 网络请求失败:', error.message)
    return false
  }
}

async function testFullDownload() {
  try {
    console.log('\n📥 测试完整下载...')
    const response = await fetch(testUrl)
    
    if (response.ok) {
      const buffer = await response.arrayBuffer()
      console.log('✅ 下载成功，文件大小:', buffer.byteLength, '字节')
      return true
    } else {
      console.log('❌ 下载失败，状态码:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ 下载失败:', error.message)
    return false
  }
}

async function runTest() {
  const accessTest = await testAudioAccess()
  
  if (accessTest) {
    const downloadTest = await testFullDownload()
    
    if (downloadTest) {
      console.log('\n🎉 音频文件完全可访问！')
      console.log('💡 ASR服务应该能够正常访问此文件')
      console.log('💡 如果ASR仍然失败，问题可能在于：')
      console.log('   - ASR服务权限不足')
      console.log('   - 音频文件格式不支持')
      console.log('   - ASR API参数配置问题')
    }
  } else {
    console.log('\n⚠️  音频文件无法访问')
    console.log('💡 请按照以下步骤配置存储桶权限：')
    console.log('   1. 登录腾讯云COS控制台')
    console.log('   2. 进入存储桶 "itsaiagent-1303812962"')
    console.log('   3. 权限管理 > 存储桶访问权限')
    console.log('   4. 设置读权限为 "公有读"')
    console.log('   5. 参考文档: docs/COS_BUCKET_PUBLIC_READ_SETUP.md')
  }
}

runTest().catch(console.error)
