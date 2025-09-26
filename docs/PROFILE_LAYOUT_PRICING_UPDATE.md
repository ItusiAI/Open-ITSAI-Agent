# 个人中心布局调整和积分价格更新

## 概述

本次更新主要包括两个方面：
1. 调整个人中心的导航顺序，将积分购买放在订阅信息上面
2. 更新积分套餐的价格配置

## 修改内容

### 1. 个人中心布局调整

#### 导航顺序变更
```typescript
// 修改前的顺序
const sections = [
  { id: 'subscription', label: t('subscription_info'), icon: CreditCard },
  { id: 'points-purchase', label: t('points_purchase'), icon: Coins },
  { id: 'points-history', label: t('points_history'), icon: History },
  // ...
]

// 修改后的顺序 - 积分购买优先
const sections = [
  { id: 'points-purchase', label: t('points_purchase'), icon: Coins },
  { id: 'subscription', label: t('subscription_info'), icon: CreditCard },
  { id: 'points-history', label: t('points_history'), icon: History },
  // ...
]
```

#### 默认显示页面调整
```typescript
// 修改前：默认显示订阅信息
const [activeSection, setActiveSection] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('profileActiveSection') || 'subscription'
  }
  return 'subscription'
})

// 修改后：默认显示积分购买
const [activeSection, setActiveSection] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('profileActiveSection') || 'points-purchase'
  }
  return 'points-purchase'
})
```

### 2. 积分价格更新

#### 价格调整详情
| 套餐类型 | 积分数量 | 原价格 | 新价格 | 涨幅 |
|----------|----------|--------|--------|------|
| 入门套餐 | 5,000 | $5 | $8 | +60% |
| 热门套餐 | 10,000 | $10 | $15 | +50% |
| 高级套餐 | 100,000 | $100 | $150 | +50% |

#### 配置文件更新
```typescript
// lib/stripe.ts - POINTS_PRODUCTS配置更新
export const POINTS_PRODUCTS = {
  starter: {
    id: 'starter',
    name: '入门套餐',
    points: 5000,
    price: 8,        // 从 5 更新为 8
    priceId: POINTS_PRICE_IDS.starter,
    description: '适合新用户试用',
  },
  popular: {
    id: 'popular',
    name: '热门套餐',
    points: 10000,
    price: 15,       // 从 10 更新为 15
    priceId: POINTS_PRICE_IDS.popular,
    description: '最受欢迎的选择',
    popular: true,
  },
  premium: {
    id: 'premium',
    name: '高级套餐',
    points: 100000,
    price: 150,      // 从 100 更新为 150
    priceId: POINTS_PRICE_IDS.premium,
    description: '适合重度用户',
  },
} as const
```

## 用户体验影响

### 1. 导航体验优化

#### 优先级调整理由
- **积分购买前置**：用户进入个人中心时，首先看到积分购买选项
- **商业价值提升**：将付费功能放在更显眼的位置
- **用户流程优化**：积分不足时，用户可以更快找到充值入口

#### 默认页面变更
- **新用户引导**：首次访问个人中心时，直接展示积分购买页面
- **购买便利性**：减少用户寻找充值功能的步骤
- **状态保持**：用户的选择会保存在localStorage中

### 2. 价格策略调整

#### 价格合理性分析
```
积分单价对比：
- 入门套餐：$8/5000积分 = $0.0016/积分
- 热门套餐：$15/10000积分 = $0.0015/积分 (最优惠)
- 高级套餐：$150/100000积分 = $0.0015/积分

价格梯度设计：
- 入门套餐：略高单价，降低试用门槛
- 热门套餐：最优单价，鼓励中等消费
- 高级套餐：批量优惠，吸引重度用户
```

#### 商业影响预期
- **收入提升**：价格上调50-60%，预期收入显著增长
- **用户筛选**：价格调整可能筛选出更有价值的付费用户
- **产品定位**：向高端AI服务定位靠拢

## 技术实现细节

### 1. 组件自动更新

#### 价格显示自动化
```typescript
// components/profile/points-purchase.tsx
const pointsPackages: PointsPackage[] = Object.values(POINTS_PRODUCTS).map(pkg => ({
  id: pkg.id,
  points: pkg.points,
  price: pkg.price,    // 自动使用新价格
  priceId: pkg.priceId,
  popular: 'popular' in pkg ? pkg.popular : false,
}))
```

#### 界面显示效果
```jsx
<div className="text-3xl font-bold text-orange-600 mb-4">
  ${pkg.price}  {/* 自动显示新价格 */}
</div>
```

### 2. 状态管理优化

#### localStorage集成
- **状态持久化**：用户的导航选择会保存到本地存储
- **跨会话保持**：用户下次访问时会记住上次的选择
- **默认值更新**：新用户默认看到积分购买页面

#### 响应式更新
- **实时价格**：价格变更后，所有相关组件自动更新
- **配置驱动**：通过修改配置文件即可更新所有显示

## 环境变量要求

### Stripe价格ID更新
由于价格变更，需要在Stripe后台创建新的价格ID，并更新环境变量：

```env
# 需要更新的环境变量
STRIPE_POINTS_STARTER_PRICE_ID=price_xxx  # 对应$8的5000积分
STRIPE_POINTS_POPULAR_PRICE_ID=price_xxx  # 对应$15的10000积分
STRIPE_POINTS_PREMIUM_PRICE_ID=price_xxx  # 对应$150的100000积分
```

### 部署注意事项
1. **Stripe配置**：确保新的价格ID在Stripe后台正确配置
2. **测试验证**：在测试环境验证新价格的支付流程
3. **用户通知**：考虑是否需要提前通知用户价格调整

## 用户界面变化

### 1. 个人中心导航
```
修改前的导航顺序：
1. 订阅信息
2. 积分购买
3. 积分历史
4. 支付记录
5. 关联账户
6. 账户状态

修改后的导航顺序：
1. 积分购买 ← 提升到第一位
2. 订阅信息
3. 积分历史
4. 支付记录
5. 关联账户
6. 账户状态
```

### 2. 积分套餐显示
```
入门套餐：
- 5,000积分
- $8 (原$5)
- 适合新用户试用

热门套餐：
- 10,000积分
- $15 (原$10)
- 最受欢迎的选择 [推荐标签]

高级套餐：
- 100,000积分
- $150 (原$100)
- 适合重度用户
```

## 监控和分析

### 1. 关键指标
- **转化率变化**：监控价格调整后的购买转化率
- **用户行为**：分析用户在新布局下的导航行为
- **收入影响**：跟踪价格调整对总收入的影响

### 2. 用户反馈
- **价格接受度**：收集用户对新价格的反馈
- **界面易用性**：评估新布局的用户体验
- **功能发现性**：测试用户是否更容易找到积分购买功能

## 总结

本次更新通过调整个人中心的布局和积分价格，旨在：
1. **提升商业价值**：将积分购买功能置于更显眼位置
2. **优化用户体验**：简化用户的充值流程
3. **调整价格策略**：向高端AI服务定位靠拢
4. **增加收入潜力**：通过价格调整提升单用户价值

这些变更将有助于提升产品的商业表现，同时为用户提供更便捷的服务体验。
