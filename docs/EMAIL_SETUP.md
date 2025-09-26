# 邮件配置指南

## 📧 Resend 邮件服务配置

### 1. 获取 Resend API Key

1. 访问 [Resend 官网](https://resend.com)
2. 注册并登录账户
3. 在控制台中创建新的 API Key
4. 复制 API Key 并添加到环境变量：
   ```
   RESEND_API_KEY=your-resend-api-key
   ```

### 2. 配置发送邮箱地址

#### 选项 1：使用 Resend 默认地址（推荐用于测试）
```
RESEND_FROM_EMAIL=ITSAI Agent <onboarding@resend.dev>
```

#### 选项 2：使用自定义域名（生产环境推荐）
1. 在 Resend 控制台中添加您的域名
2. 按照说明验证域名（添加 DNS 记录）
3. 验证完成后，使用您的域名：
   ```
   RESEND_FROM_EMAIL=ITSAI Agent <noreply@yourdomain.com>
   ```

### 3. 环境变量配置

在您的 `.env.local` 文件中添加以下配置：

```env
# 邮件服务配置
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=ITSAI Agent <onboarding@resend.dev>
```

### 4. 域名验证步骤（可选，用于生产环境）

1. **添加域名**：
   - 在 Resend 控制台中点击 "Domains"
   - 点击 "Add Domain"
   - 输入您的域名（例如：yourdomain.com）

2. **验证域名**：
   - 添加提供的 DNS 记录到您的域名解析服务商
   - 等待 DNS 传播（通常需要几分钟到几小时）
   - 在 Resend 控制台中点击 "Verify"

3. **更新环境变量**：
   ```
   RESEND_FROM_EMAIL=ITSAI Agent <noreply@yourdomain.com>
   ```

### 5. 测试邮件发送

您可以通过以下方式测试邮件发送：

1. **注册新用户**：尝试注册新账户，检查是否收到验证邮件
2. **重置密码**：使用忘记密码功能，检查是否收到重置邮件
3. **检查日志**：查看控制台输出，确认没有错误信息

### 6. 常见问题

#### Q: 为什么收不到邮件？
A: 请检查：
- API Key 是否正确配置
- 发送地址是否使用了验证过的域名
- 邮件是否在垃圾箱中
- Resend 配额是否已用完

#### Q: 如何更改邮件模板？
A: 编辑 `lib/email.ts` 文件中的 `emailTemplates` 对象

#### Q: 如何添加更多语言支持？
A: 在 `emailTemplates` 对象中添加新的语言配置

### 7. 生产环境建议

1. **使用自定义域名**：提高邮件送达率和品牌形象
2. **监控邮件发送**：定期检查 Resend 控制台的发送统计
3. **设置 SPF/DKIM**：提高邮件安全性和送达率
4. **备用邮件服务**：考虑配置备用邮件服务提供商

### 8. 安全注意事项

- 不要在代码中硬编码 API Key
- 使用环境变量管理敏感信息
- 定期轮换 API Key
- 监控邮件发送量，防止滥用

---

**注意**：如果您在开发阶段遇到域名验证问题，可以暂时使用 Resend 提供的默认地址 `onboarding@resend.dev`。 