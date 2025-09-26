# Stripe积分购买配置指南

本文档介绍如何配置Stripe支付系统以支持订阅和积分购买功能。

## 1. 创建Stripe账户

1. 访问 [Stripe官网](https://stripe.com/) 并注册账户
2. 完成账户验证（可能需要提供身份证明和银行信息）
3. 进入Stripe Dashboard

## 2. 获取API密钥

### 测试环境
1. 在Stripe Dashboard中，点击左侧导航栏的 "Developers"
2. 选择 "API keys"
3. 复制以下密钥：
   - **Publishable key** (以 `pk_test_` 开头)
   - **Secret key** (以 `sk_test_` 开头)

### 生产环境
1. 在右上角切换到 "Live" 模式
2. 重复上述步骤获取生产环境密钥：
   - **Publishable key** (以 `pk_live_` 开头)
   - **Secret key** (以 `sk_live_` 开头)

## 3. 创建产品和价格

### 3.1 创建订阅产品（专业版）

1. 在Stripe Dashboard中，点击 "Products"
2. 点击 "Add product"
3. 填写产品信息：
   - **Name**: Professional Plan
   - **Description**: 专业版订阅服务
4. 创建价格：
   - **Price**: $9.99
   - **Billing period**: Monthly
   - **Currency**: USD
5. 保存并复制价格ID（以 `price_` 开头）

### 3.2 创建积分购买产品

#### 入门套餐（5,000积分）
1. 创建产品：
   - **Name**: 5,000 Points - Starter Package
   - **Description**: 入门积分套餐，适合新用户试用
2. 创建价格：
   - **Price**: $5.00
   - **Type**: One-time payment
   - **Currency**: USD
3. 复制价格ID

#### 热门套餐（10,000积分）
1. 创建产品：
   - **Name**: 10,000 Points - Popular Package
   - **Description**: 热门积分套餐，最受欢迎的选择
2. 创建价格：
   - **Price**: $10.00
   - **Type**: One-time payment
   - **Currency**: USD
3. 复制价格ID

#### 高级套餐（100,000积分）
1. 创建产品：
   - **Name**: 100,000 Points - Premium Package
   - **Description**: 高级积分套餐，适合重度用户
2. 创建价格：
   - **Price**: $100.00
   - **Type**: One-time payment
   - **Currency**: USD
3. 复制价格ID

## 4. 配置Webhook

### 创建Webhook端点
1. 在Stripe Dashboard中，点击 "Developers" → "Webhooks"
2. 点击 "Add endpoint"
3. 填写端点URL：
   - 测试环境: `https://your-domain.com/api/stripe/webhook`
   - 使用ngrok等工具进行本地测试: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
4. 选择要监听的事件：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 点击 "Add endpoint"

### 获取Webhook密钥
1. 在创建的webhook端点页面中，点击 "Signing secret"
2. 点击 "Reveal" 复制密钥 (以 `whsec_` 开头)

## 5. 环境变量配置

在您的 `.env.local` 文件中添加以下配置：

```env
# Stripe基础配置
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# 订阅价格ID
STRIPE_PRO_PRICE_ID=price_your_pro_subscription_price_id

# 积分购买价格ID
STRIPE_POINTS_STARTER_PRICE_ID=price_your_starter_points_price_id
STRIPE_POINTS_POPULAR_PRICE_ID=price_your_popular_points_price_id
STRIPE_POINTS_PREMIUM_PRICE_ID=price_your_premium_points_price_id

# 应用URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 6. 积分系统说明

### 积分类型
系统支持两种类型的积分：

| 积分类型 | 获取方式 | 有效期 | 使用优先级 |
|----------|----------|--------|------------|
| **购买积分** | 通过Stripe支付购买、注册奖励 | 永不过期 | 第二优先级 |
| **赠送积分** | 订阅专业版赠送 | 订阅到期清零 | 第一优先级 |

### 积分套餐配置

| 套餐 | 积分数量 | 价格 | 价格ID环境变量 | 描述 |
|------|----------|------|----------------|------|
| 入门套餐 | 5,000 | $5 | `STRIPE_POINTS_STARTER_PRICE_ID` | 适合新用户试用 |
| 热门套餐 | 10,000 | $10 | `STRIPE_POINTS_POPULAR_PRICE_ID` | 最受欢迎的选择 |
| 高级套餐 | 100,000 | $100 | `STRIPE_POINTS_PREMIUM_PRICE_ID` | 适合重度用户 |

### 订阅赠送规则

- **专业版订阅**: 立即赠送 **10,000 积分**
- **积分类型**: 赠送积分（订阅到期清零）
- **使用优先级**: 系统优先使用赠送积分，再使用购买积分
- **到期处理**: 订阅取消或到期时，所有赠送积分将被清零

### 积分使用逻辑

1. **优先级规则**: 赠送积分 > 购买积分
2. **扣除顺序**: 
   - 首先扣除赠送积分
   - 赠送积分不足时，扣除购买积分
3. **历史记录**: 所有积分变动都会记录在积分历史中

## 7. 价格ID的优势

使用Stripe价格ID有以下优势：

1. **集中管理**: 在Stripe Dashboard中统一管理价格
2. **灵活调整**: 可以随时在Stripe中调整价格，无需修改代码
3. **多币种支持**: 支持不同地区的货币
4. **促销活动**: 可以创建限时优惠价格
5. **税务处理**: Stripe自动处理税务计算
6. **合规性**: 符合各地区的支付合规要求

## 8. 测试支付

### 测试卡号
在测试环境中，您可以使用以下测试卡号：

- **成功支付**: `4242 4242 4242 4242`
- **需要验证**: `4000 0025 0000 3155`
- **被拒绝**: `4000 0000 0000 0002`

### 测试信息
- **过期日期**: 任何未来日期 (如 12/25)
- **CVC**: 任何3位数字 (如 123)
- **邮政编码**: 任何有效邮政编码

## 9. 本地开发测试

### 使用ngrok进行本地测试
1. 安装ngrok: `npm install -g ngrok`
2. 启动本地服务器: `npm run dev`
3. 在新终端中运行: `ngrok http 3000`
4. 复制ngrok提供的HTTPS URL
5. 在Stripe Dashboard中将webhook端点URL设置为: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`

### 测试流程
1. 访问个人中心页面
2. 选择积分套餐
3. 使用测试卡号进行支付
4. 检查控制台日志确认webhook接收
5. 验证用户积分是否正确增加

## 10. 生产环境部署

### 切换到生产模式
1. 在Stripe Dashboard中切换到 "Live" 模式
2. 重新创建产品和价格（获取生产环境的价格ID）
3. 更新环境变量为生产环境密钥和价格ID
4. 更新webhook端点URL为生产域名
5. 确保HTTPS已正确配置

### 安全注意事项
1. 永远不要在客户端代码中暴露Secret Key
2. 使用HTTPS保护所有API端点
3. 验证webhook签名以确保请求来自Stripe
4. 定期轮换API密钥
5. 监控异常支付活动

## 11. 常见问题

### Q: 支付成功但积分未增加
A: 检查webhook是否正确配置，确认webhook端点能正常接收请求

### Q: 测试支付失败
A: 确认使用正确的测试卡号，检查API密钥是否正确配置

### Q: Webhook签名验证失败
A: 确认STRIPE_WEBHOOK_SECRET环境变量正确设置

### Q: 支付界面无法加载
A: 检查NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY是否正确配置

### Q: 价格ID无效
A: 确认价格ID是否正确复制，检查测试/生产环境是否匹配

## 12. 监控和日志

### Stripe Dashboard监控
- 查看支付历史和状态
- 监控失败的支付
- 查看webhook日志
- 分析收入报告

### 应用日志
- 检查服务器日志中的支付处理记录
- 监控积分发放的成功/失败情况
- 设置错误报警机制

## 支持

如果遇到问题，请：
1. 检查Stripe Dashboard中的日志
2. 查看应用服务器日志
3. 参考Stripe官方文档
4. 联系技术支持 