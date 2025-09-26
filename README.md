# Open-ITSAI-Agent

欢迎使用 Open-ITSAI-Agent，这是一个功能强大的开源 AI 智能体工作台，基于 Next.js 构建，提供多种 AI 模型集成、音频处理、用户认证和支付系统等功能。

## ✨ 主要功能

### 🤖 AI 智能体工作台
* **音频总结智能体**：支持中文版和全球版，可处理多种语言的音频文件
* **声音克隆智能体**：即将推出
* **AI 播客智能体**：即将推出

### 🌐 多 LLM 支持
* **Gemini**：用于全球版音频总结
* **DeepSeek**：用于中文版音频总结
* **Qwen (阿里云通义千问)**
* **Minimax**

### 🗣️ 音频处理功能
* **中文版**：基于腾讯云 ASR + DeepSeek 推理，支持中文方言识别
* **全球版**：基于 OpenAI Whisper + Google Gemini，支持 100+ 种语言
* **音频上传**：支持文件上传和音频链接处理

### 🔒 用户系统
* **认证系统**：支持 OAuth 登录（如 Google、GitHub）
* **积分系统**：基于积分的 AI 功能访问管理
* **订阅支付**：集成 Stripe 支付系统

### 👑 管理功能
* **管理员仪表盘**：用户管理、内容管理和应用设置
* **博客平台**：内容发布系统

### 🌍 其他特性
* **国际化**：支持中文和英文界面
* **云存储**：集成 Cloudflare R2 存储服务
* **SEO 优化**：搜索引擎优化

## 🛠️ 技术栈

* **框架**：[Next.js](https://nextjs.org/)
* **语言**：[TypeScript](https://www.typescriptlang.org/)
* **样式**：[Tailwind CSS](https://tailwindcss.com/)
* **UI 组件**：[shadcn/ui](https://ui.shadcn.com/)
* **数据库 ORM**：[Drizzle ORM](https://orm.drizzle.team/)
* **认证**：[NextAuth.js](https://next-auth.js.org/)
* **支付**：[Stripe](https://stripe.com/)
* **存储**：[Cloudflare R2](https://www.cloudflare.com/products/r2/)

## 🚀 快速开始

### 环境要求
* [Node.js](https://nodejs.org/) (v18.x 或更高版本)
* [pnpm](https://pnpm.io/)

## 📚 文档
详细文档请查看 docs/ 目录：

- AI 智能体工作台
- 音频总结全球版
- Gemini 和 OpenAI 设置
- Cloudflare R2 设置
- Stripe 支付设置
- OAuth 认证设置
- SEO 指南

## 🤝 贡献
欢迎贡献代码、报告问题或提出新功能建议！请遵循以下步骤：

1. 1.
   Fork 仓库
2. 2.
   创建功能分支 ( git checkout -b feature/amazing-feature )
3. 3.
   提交更改 ( git commit -m 'Add some amazing feature' )
4. 4.
   推送到分支 ( git push origin feature/amazing-feature )
5. 5.
   创建 Pull Request
## 📄 许可证
本项目采用 MIT 许可证 - 详情请查看 LICENSE 文件。