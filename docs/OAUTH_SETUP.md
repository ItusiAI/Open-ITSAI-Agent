# 第三方OAuth登录配置指南

本项目支持GitHub和Google的第三方OAuth登录。以下是各个平台的配置步骤：

## 1. GitHub OAuth配置

### 创建GitHub OAuth应用
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: ITSAI Agent
   - **Homepage URL**: `http://localhost:3000` (开发环境) 或您的域名
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. 创建应用后，获取 `Client ID` 和 `Client Secret`

### 环境变量配置
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 2. Google OAuth配置

### 创建Google OAuth应用
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 进入 "凭据" 页面，点击 "创建凭据" > "OAuth 2.0 客户端ID"
5. 选择 "Web应用程序"
6. 填写信息：
   - **名称**: ITSAI Agent
   - **已获授权的重定向URI**: `http://localhost:3000/api/auth/callback/google`
7. 获取 `Client ID` 和 `Client Secret`

### 环境变量配置
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 3. 完整环境变量配置

将以下内容添加到您的 `.env.local` 文件中：

```env
# NextAuth配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 4. 生产环境配置

在生产环境中，请确保：

1. 将回调URL更改为您的实际域名
2. 使用HTTPS协议
3. 妥善保管所有密钥信息
4. 定期轮换密钥

### 生产环境回调URL示例
- GitHub: `https://yourdomain.com/api/auth/callback/github`
- Google: `https://yourdomain.com/api/auth/callback/google`

## 5. 注意事项

1. **账户关联**: 如果用户已经通过邮箱注册，后续使用OAuth登录时需要确保邮箱一致
2. **错误处理**: 系统已内置完善的错误处理机制，会引导用户处理各种异常情况
3. **安全性**: 所有OAuth流程都遵循最佳安全实践

## 6. 测试

配置完成后，您可以：

1. 启动开发服务器
2. 访问登录页面测试各个OAuth提供商
3. 检查控制台输出，确认配置正确

如果遇到问题，请检查：
- 环境变量是否正确配置
- 回调URL是否匹配
- 各平台的应用状态是否正常 