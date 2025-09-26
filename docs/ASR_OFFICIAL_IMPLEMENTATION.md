# 腾讯云ASR官方文档实现

## 📚 参考文档

按照腾讯云官方文档实现ASR API调用：
https://cloud.tencent.com/document/product/1093/37823#.E7.A4.BA.E4.BE.8B1-.E9.80.9A.E8.BF.87.E9.9F.B3.E9.A2.91Url.E6.9D.A5.E8.B0.83.E7.94.A8.E6.8E.A5.E5.8F.A3

## ✅ 已完成的改进

### 1. 签名算法重构

#### **修改前的问题**
- 使用了不标准的签名实现
- 日期格式处理不正确
- 签名步骤不完整

#### **修改后的实现**
```typescript
// 腾讯云API签名函数 - 按照官方文档实现
function sign(key: string, msg: string) {
  return crypto.createHmac('sha256', key).update(msg, 'utf8').digest('hex')
}

function getHash(msg: string) {
  return crypto.createHash('sha256').update(msg, 'utf8').digest('hex')
}

function getDate(timestamp: number) {
  const date = new Date(timestamp * 1000)
  const year = date.getUTCFullYear()
  const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
  const day = ('0' + date.getUTCDate()).slice(-2)
  return `${year}-${month}-${day}`
}
```

### 2. 规范请求串构建

#### **按照官方文档的5个步骤**

**步骤1：拼接规范请求串**
```typescript
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
```

**步骤2：拼接待签名字符串**
```typescript
const algorithm = 'TC3-HMAC-SHA256'
const credentialScope = date + '/' + service + '/' + 'tc3_request'
const hashedCanonicalRequest = getHash(canonicalRequest)
const stringToSign = algorithm + '\n' +
  timestamp + '\n' +
  credentialScope + '\n' +
  hashedCanonicalRequest
```

**步骤3：计算签名**
```typescript
const secretDate = sign(('TC3' + secretKey), date)
const secretService = sign(secretDate, service)
const secretSigning = sign(secretService, 'tc3_request')
const signature = sign(secretSigning, stringToSign)
```

**步骤4：拼接Authorization**
```typescript
const authorization = algorithm + ' ' +
  'Credential=' + secretId + '/' + credentialScope + ', ' +
  'SignedHeaders=' + signedHeaders + ', ' +
  'Signature=' + signature
```

**步骤5：构造并发起请求**
```typescript
const headers = {
  'Authorization': authorization,
  'Content-Type': 'application/json; charset=utf-8',
  'Host': endpoint,
  'X-TC-Action': action,
  'X-TC-Timestamp': timestamp.toString(),
  'X-TC-Version': version,
  'X-TC-Region': region,
}
```

### 3. 参数简化

#### **修改前（复杂参数）**
```typescript
const params = {
  EngineModelType: '16k_zh_large', // 大模型
  ChannelNum: 1,
  ResTextFormat: 2, // 详细格式
  SourceType: 0,
  Url: audioUrl,
  FilterDirty: 1, // 过滤脏话
  FilterModal: 1, // 过滤语气词
  FilterPunc: 0, // 标点符号
  ConvertNumMode: 1, // 数字转换
  SpeakerDiarization: 1, // 说话人分离
  SpeakerNumber: 0, // 说话人数量
  HotwordId: '', // 热词表
}
```

#### **修改后（基础参数）**
```typescript
const params = {
  EngineModelType: '16k_zh', // 基础中文模型
  ChannelNum: 1, // 单声道
  ResTextFormat: 0, // 基础文本格式
  SourceType: 0, // 音频URL
  Url: audioUrl, // 音频文件URL
}
```

### 4. 错误处理改进

#### **详细的错误信息**
```typescript
if (response.Error) {
  console.error('腾讯云API错误详情:', response.Error)
  throw new Error(`腾讯云API错误: ${response.Error.Code} - ${response.Error.Message}`)
}

if (!response.Response?.Data?.TaskId) {
  console.error('API响应结构异常:', JSON.stringify(response, null, 2))
  
  if (response.Response?.Error) {
    const error = response.Response.Error
    throw new Error(`腾讯云ASR错误: ${error.Code} - ${error.Message}`)
  } else {
    throw new Error(`创建识别任务失败 - 响应结构异常: ${JSON.stringify(response)}`)
  }
}
```

## 🔧 技术改进点

### 1. 编码处理
- 所有字符串处理使用 `utf8` 编码
- 确保中文字符正确处理

### 2. 时间戳处理
- 使用UTC时间确保时区一致性
- 正确的日期格式化

### 3. 签名头简化
- 只使用必需的签名头：`content-type;host`
- 移除不必要的自定义头部

### 4. 调试信息
- 添加详细的请求和响应日志
- 便于问题排查和调试

## 🎯 预期效果

### 1. 解决签名验证失败
- 按照官方文档标准实现
- 消除 `AuthFailure.SignatureFailure` 错误

### 2. 提高成功率
- 使用基础参数减少兼容性问题
- 简化请求降低出错概率

### 3. 更好的错误处理
- 提供详细的错误信息
- 便于快速定位问题

## 🧪 测试方法

### 1. 直接测试音频总结功能
1. 访问音频总结页面
2. 上传音频文件
3. 观察控制台日志
4. 确认是否成功创建ASR任务

### 2. 查看详细日志
控制台会显示：
```
腾讯云ASR API调用:
Action: CreateRecTask
Params: {...}
响应状态: 200
响应内容: {...}
```

### 3. 成功标志
- 响应状态为200
- 返回TaskId
- 没有Error字段

## 📋 关键改进总结

| 方面 | 修改前 | 修改后 | 改进效果 |
|------|--------|--------|----------|
| **签名算法** | 自定义实现 | 官方文档标准 | 🚀 符合规范 |
| **参数复杂度** | 12个参数 | 5个基础参数 | 🚀 降低出错率 |
| **错误处理** | 简单提示 | 详细错误信息 | 🚀 便于调试 |
| **编码处理** | 默认编码 | 明确UTF-8 | 🚀 中文兼容 |
| **日志记录** | 基础日志 | 详细调试信息 | 🚀 问题排查 |

## 🚀 下一步

现在可以直接测试音频总结功能：

1. **上传音频文件**
2. **观察控制台输出**
3. **确认ASR任务创建成功**
4. **验证完整的音频总结流程**

按照腾讯云官方文档的标准实现，ASR API调用应该能够正常工作，解决之前的签名验证失败问题。
