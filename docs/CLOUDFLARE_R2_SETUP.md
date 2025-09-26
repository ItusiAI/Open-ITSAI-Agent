# Cloudflare R2 存储配置指南

## 概述

音频总结全球版使用 Cloudflare R2 作为音频文件存储服务，相比中文版使用的腾讯云COS，R2具有以下优势：

- 全球边缘网络，访问速度更快
- 简单的定价模型，无请求费用
- 免费的出站流量（前10TB）
- 与Cloudflare CDN无缝集成

## 配置步骤

### 1. 创建 Cloudflare 账户

如果还没有 Cloudflare 账户，请先在 [Cloudflare官网](https://www.cloudflare.com/) 注册一个账户。

### 2. 创建 R2 存储桶

1. 登录 Cloudflare 控制台
2. 在左侧菜单中选择 "R2"
3. 点击 "创建存储桶" 按钮
4. 输入存储桶名称，例如 `audio-summary-global`
5. 点击 "创建" 按钮完成创建

### 3. 创建 API 令牌

1. 在 R2 控制台中，点击 "API 令牌" 标签
2. 点击 "创建 API 令牌" 按钮
3. 选择 "R2 存储" 权限
4. 设置权限为 "编辑" 或 "管理"
5. 点击 "创建 API 令牌" 按钮
6. 保存生成的 Access Key ID 和 Secret Access Key

### 4. 配置公共访问

为了让上传的音频文件可以被公开访问，需要配置公共访问：

#### 方法1：使用 R2 公共访问（推荐）

1. 在存储桶设置中，启用 "公共访问"
2. 设置适当的 CORS 策略
3. 记录生成的公共访问URL

#### 方法2：使用自定义域名和 Cloudflare Workers

1. 创建一个 Cloudflare Worker
2. 配置 Worker 路由到你的 R2 存储桶
3. 设置自定义域名指向该 Worker

### 5. 环境变量配置

在项目的 `.env` 文件中添加以下配置：

```env
# Cloudflare R2配置
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=your-r2-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
```

## 文件限制

全球版音频文件上传有以下限制：

- **最大文件大小**：25 MB
- **支持的文件格式**：mp3、mp4、mpeg、mpga、m4a、wav、webm

这些限制是由 OpenAI Whisper API 决定的，超过这些限制的文件将无法被处理。

## 安全考虑

### 访问控制

- API 令牌应妥善保管，不要泄露
- 考虑使用 IP 限制来增强安全性
- 定期轮换 API 令牌

### 数据保护

- 考虑启用 R2 的数据加密功能
- 设置适当的数据生命周期策略
- 定期审计存储桶访问日志

## 成本估算

Cloudflare R2 的定价模型：

- **存储**：每 GB 每月 $0.015
- **A 类操作**（PUT、POST、LIST 等）：每 1,000,000 次请求 $4.50
- **B 类操作**（GET、HEAD 等）：每 1,000,000 次请求 $0.36
- **出站流量**：前 10TB 免费

对于典型的音频总结应用，每月成本估算：

- 1000 个音频文件（平均 10MB）= 10GB 存储 = $0.15/月
- 1000 次上传操作 = $0.0045/月
- 5000 次读取操作 = $0.0018/月
- 总计：约 $0.16/月

## 故障排除

### 常见问题

1. **上传失败**
   - 检查 API 令牌权限
   - 验证存储桶名称是否正确
   - 确认文件大小和格式是否符合要求

2. **无法访问上传的文件**
   - 检查公共访问设置
   - 验证 CORS 配置
   - 确认 URL 构建是否正确

3. **性能问题**
   - 检查文件大小是否过大
   - 验证网络连接
   - 考虑使用 Cloudflare Workers 进行优化

## 参考资源

- [Cloudflare R2 官方文档](https://developers.cloudflare.com/r2/)
- [AWS S3 SDK 文档](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [OpenAI Whisper API 文档](https://platform.openai.com/docs/guides/speech-to-text)
