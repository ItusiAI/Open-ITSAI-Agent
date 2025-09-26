# Gemini 和 OpenAI API 配置指南

## 概述

音频总结全球版使用以下AI服务：
- **OpenAI Whisper**：用于多语言语音识别
- **Google Gemini 2.5 Pro**：用于智能内容总结

本文档将指导您完成这两个服务的配置。

## OpenAI API 配置

### 1. 获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册或登录您的账户
3. 进入 [API Keys 页面](https://platform.openai.com/api-keys)
4. 点击 "Create new secret key" 创建新的API密钥
5. 复制并安全保存生成的API密钥

### 2. 设置计费信息

1. 进入 [Billing 页面](https://platform.openai.com/account/billing)
2. 添加付款方式（信用卡或借记卡）
3. 设置使用限额以控制成本
4. 建议设置月度预算警报

### 3. Whisper API 使用限制

- **文件大小限制**：最大 25 MB
- **支持格式**：mp3, mp4, mpeg, mpga, m4a, wav, webm
- **音频时长**：建议不超过 30 分钟
- **并发限制**：根据您的账户等级

### 4. 定价信息

- **Whisper API**：$0.006 / 分钟
- 按实际音频时长计费
- 不足1分钟按1分钟计费

## Google Gemini API 配置

### 1. 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/)
2. 使用Google账户登录
3. 点击 "Get API key" 按钮
4. 选择或创建一个Google Cloud项目
5. 复制生成的API密钥

### 2. 启用必要的API

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择您的项目
3. 进入 "APIs & Services" > "Library"
4. 搜索并启用 "Generative Language API"

### 3. 设置配额和限制

1. 进入 [Google Cloud Console](https://console.cloud.google.com/)
2. 导航到 "APIs & Services" > "Quotas"
3. 查找 "Generative Language API" 相关配额
4. 根据需要调整请求限制

### 4. Gemini 2.5 Pro 特性

- **上下文长度**：最大 2M tokens
- **输出长度**：最大 65,536 tokens
- **支持语言**：100+ 种语言
- **响应速度**：通常 2-5 秒

### 5. 定价信息

- **输入 tokens**：$1.25 / 1M tokens
- **输出 tokens**：$5.00 / 1M tokens
- 按实际使用的token数量计费

## 环境变量配置

在项目的 `.env` 文件中添加以下配置：

```env
# OpenAI 配置（全球版语音识别）
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1

# Gemini 配置（全球版AI总结）
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp
```

### 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `OPENAI_API_KEY` | OpenAI API密钥 | `sk-proj-...` |
| `OPENAI_BASE_URL` | OpenAI API基础URL | `https://api.openai.com/v1` |
| `GEMINI_API_KEY` | Gemini API密钥 | `AIza...` |
| `GEMINI_MODEL` | 使用的Gemini模型 | `gemini-2.0-flash-exp` |

## 安全最佳实践

### 1. API密钥安全

- ✅ **使用环境变量**：永远不要在代码中硬编码API密钥
- ✅ **定期轮换**：定期更新API密钥
- ✅ **最小权限**：只授予必要的API权限
- ✅ **监控使用**：定期检查API使用情况

### 2. 访问控制

- 🔒 **IP限制**：在可能的情况下限制API访问的IP地址
- 🔒 **域名限制**：设置允许的域名白名单
- 🔒 **使用限制**：设置合理的API调用频率限制

### 3. 成本控制

- 💰 **预算警报**：设置月度预算警报
- 💰 **使用监控**：定期检查API使用量和成本
- 💰 **缓存策略**：实施适当的缓存以减少重复调用

## 测试配置

### 1. OpenAI Whisper 测试

```bash
curl -X POST "https://api.openai.com/v1/audio/transcriptions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-audio.mp3" \
  -F "model=whisper-1"
```

### 2. Gemini API 测试

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, how are you?"
      }]
    }]
  }'
```

## 故障排除

### 常见问题

#### OpenAI API 问题

1. **401 Unauthorized**
   - 检查API密钥是否正确
   - 确认API密钥是否有效且未过期

2. **429 Too Many Requests**
   - 降低请求频率
   - 检查账户的速率限制

3. **413 Request Entity Too Large**
   - 检查音频文件大小是否超过25MB
   - 压缩音频文件或分段处理

#### Gemini API 问题

1. **403 Forbidden**
   - 检查API密钥权限
   - 确认已启用Generative Language API

2. **400 Bad Request**
   - 检查请求格式是否正确
   - 验证输入内容是否符合要求

3. **500 Internal Server Error**
   - 稍后重试
   - 检查Google Cloud服务状态

### 调试技巧

1. **启用详细日志**：在开发环境中启用API调用日志
2. **使用测试数据**：使用小文件进行初始测试
3. **监控响应时间**：跟踪API响应时间以优化用户体验
4. **错误处理**：实施适当的错误处理和重试机制

## 性能优化

### 1. OpenAI Whisper 优化

- **音频预处理**：在上传前压缩音频文件
- **格式选择**：使用压缩率高的格式如MP3
- **并发控制**：避免同时发送过多请求

### 2. Gemini 优化

- **提示词优化**：使用清晰、具体的提示词
- **输出长度控制**：最大可设置65,536 tokens，建议根据需要设置合适的值
- **温度参数调整**：根据需要调整创造性参数（0.0-1.0）
- **上下文管理**：充分利用2M tokens的上下文容量

## 监控和维护

### 1. 使用量监控

- 定期检查API使用统计
- 设置使用量警报
- 分析使用模式以优化成本

### 2. 性能监控

- 监控API响应时间
- 跟踪错误率
- 分析用户满意度

### 3. 定期维护

- 更新API密钥
- 检查服务状态
- 更新配置参数

## 参考资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [Gemini API 文档](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OpenAI Platform](https://platform.openai.com/)
- [Google AI Studio](https://aistudio.google.com/)
