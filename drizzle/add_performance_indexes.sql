-- 性能优化索引 - 解决Discord超时问题
-- 创建时间: 2024-12-19

-- 1. users 表性能索引
-- 邮箱查询索引 (Discord OAuth 登录时频繁使用)
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");

-- 用户ID查询索引 (各种用户操作)
CREATE INDEX IF NOT EXISTS "idx_users_id" ON "users" ("id");

-- 订阅状态查询索引 (订阅相关操作)
CREATE INDEX IF NOT EXISTS "idx_users_subscription_status" ON "users" ("subscriptionStatus");

-- Stripe客户ID查询索引 (webhook处理)
CREATE INDEX IF NOT EXISTS "idx_users_stripe_customer_id" ON "users" ("stripeCustomerId");

-- 订阅ID查询索引 (订阅更新)
CREATE INDEX IF NOT EXISTS "idx_users_subscription_id" ON "users" ("subscriptionId");

-- 组合索引：订阅状态和到期时间 (订阅验证)
CREATE INDEX IF NOT EXISTS "idx_users_subscription_status_end" ON "users" ("subscriptionStatus", "subscriptionCurrentPeriodEnd");

-- 2. accounts 表性能索引
-- 用户ID外键索引 (关联账户查询)
CREATE INDEX IF NOT EXISTS "idx_accounts_user_id" ON "accounts" ("userId");

-- 提供商查询索引 (Discord/GitHub/Google登录)
CREATE INDEX IF NOT EXISTS "idx_accounts_provider" ON "accounts" ("provider");

-- 提供商账户ID索引 (OAuth回调验证)
CREATE INDEX IF NOT EXISTS "idx_accounts_provider_account_id" ON "accounts" ("providerAccountId");

-- 组合索引：用户ID和提供商 (检查用户关联的OAuth账户)
CREATE INDEX IF NOT EXISTS "idx_accounts_user_provider" ON "accounts" ("userId", "provider");

-- 3. sessions 表性能索引
-- 用户ID外键索引 (session查询)
CREATE INDEX IF NOT EXISTS "idx_sessions_user_id" ON "sessions" ("userId");

-- 过期时间索引 (清理过期session)
CREATE INDEX IF NOT EXISTS "idx_sessions_expires" ON "sessions" ("expires");

-- 组合索引：用户ID和过期时间 (获取用户最新session)
CREATE INDEX IF NOT EXISTS "idx_sessions_user_expires" ON "sessions" ("userId", "expires" DESC);

-- 4. pointsHistory 表性能索引
-- 用户ID外键索引 (积分历史查询)
CREATE INDEX IF NOT EXISTS "idx_points_history_user_id" ON "pointsHistory" ("userId");

-- 创建时间索引 (时间排序查询)
CREATE INDEX IF NOT EXISTS "idx_points_history_created_at" ON "pointsHistory" ("createdAt" DESC);

-- 操作类型索引 (按操作类型筛选)
CREATE INDEX IF NOT EXISTS "idx_points_history_action" ON "pointsHistory" ("action");

-- 积分类型索引 (按积分类型筛选)
CREATE INDEX IF NOT EXISTS "idx_points_history_points_type" ON "pointsHistory" ("pointsType");

-- 组合索引：用户ID和创建时间 (用户积分历史)
CREATE INDEX IF NOT EXISTS "idx_points_history_user_created" ON "pointsHistory" ("userId", "createdAt" DESC);

-- 5. emailVerificationTokens 表性能索引
-- token索引 (邮箱验证)
CREATE INDEX IF NOT EXISTS "idx_email_verification_token" ON "emailVerificationTokens" ("token");

-- 邮箱索引 (通过邮箱查找验证记录)
CREATE INDEX IF NOT EXISTS "idx_email_verification_email" ON "emailVerificationTokens" ("email");

-- 过期时间索引 (清理过期token)
CREATE INDEX IF NOT EXISTS "idx_email_verification_expires" ON "emailVerificationTokens" ("expires");

-- 6. newsletterSubscriptions 表性能索引
-- 邮箱索引 (订阅查询)
CREATE INDEX IF NOT EXISTS "idx_newsletter_email" ON "newsletterSubscriptions" ("email");

-- 激活状态索引 (统计活跃订阅)
CREATE INDEX IF NOT EXISTS "idx_newsletter_is_active" ON "newsletterSubscriptions" ("isActive");

-- 语言偏好索引 (按语言筛选)
CREATE INDEX IF NOT EXISTS "idx_newsletter_locale" ON "newsletterSubscriptions" ("locale");

-- 取消订阅token索引 (取消订阅操作)
CREATE INDEX IF NOT EXISTS "idx_newsletter_unsubscribe_token" ON "newsletterSubscriptions" ("unsubscribeToken");

-- 组合索引：激活状态和语言 (统计查询)
CREATE INDEX IF NOT EXISTS "idx_newsletter_active_locale" ON "newsletterSubscriptions" ("isActive", "locale");

-- 7. verificationTokens 表性能索引
-- identifier索引 (验证token查询)
CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verificationTokens" ("identifier");

-- token索引 (token验证)
CREATE INDEX IF NOT EXISTS "idx_verification_token" ON "verificationTokens" ("token");

-- 过期时间索引 (清理过期token)
CREATE INDEX IF NOT EXISTS "idx_verification_expires" ON "verificationTokens" ("expires");

-- 统计信息更新 (PostgreSQL特定)
-- 这将帮助查询优化器做出更好的执行计划
ANALYZE "users";
ANALYZE "accounts";
ANALYZE "sessions";
ANALYZE "pointsHistory";
ANALYZE "emailVerificationTokens";
ANALYZE "newsletterSubscriptions";
ANALYZE "verificationTokens";

-- 完成
-- 这些索引将显著提升以下操作的性能：
-- 1. Discord OAuth登录和回调
-- 2. 用户认证和session管理
-- 3. 积分历史查询
-- 4. 订阅状态验证
-- 5. 邮箱验证流程
-- 6. Stripe webhook处理 