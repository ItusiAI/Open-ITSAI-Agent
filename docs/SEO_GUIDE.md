# SEO 功能指南

本项目已集成完整的SEO优化功能，包括元标签优化、结构化数据、站点地图、面包屑导航等。

## 功能特性

### 1. 元标签优化
- 动态生成页面标题和描述
- 多语言支持（中文/英文）
- Open Graph 和 Twitter Card 支持
- 规范链接和多语言链接
- 移动端优化标签

### 2. 结构化数据 (JSON-LD)
- 网站信息 (WebSite)
- 组织信息 (Organization)
- 服务信息 (Service)
- 常见问题 (FAQPage)
- 面包屑导航 (BreadcrumbList)
- 网页信息 (WebPage)

### 3. 站点地图
- 自动生成 XML 站点地图
- 支持多语言版本
- 包含所有公开页面
- 设置适当的优先级和更新频率

### 4. Robots.txt
- 允许搜索引擎爬取
- 禁止访问敏感路径
- 指定站点地图位置
- 设置爬取延迟

### 5. 面包屑导航
- 自动生成面包屑
- 包含结构化数据
- 提升用户体验和SEO

## 使用方法

### 1. 基础配置

在 `.env` 文件中配置基础信息：

```env
NEXT_PUBLIC_BASE_URL=https://itsaiagent.com
GOOGLE_SITE_VERIFICATION=your_verification_code
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 2. 页面SEO配置

使用 `PageSEO` 组件为页面添加SEO功能：

```tsx
import { PageSEO } from '@/components/seo/page-seo'

export default function MyPage() {
  const breadcrumbItems = [
    { label: '博客', href: '/blog' },
    { label: '当前页面', current: true }
  ]

  return (
    <div>
      <PageSEO 
        page="blog"
        title="自定义标题"
        description="自定义描述"
        breadcrumbItems={breadcrumbItems}
        structuredDataTypes={['website', 'organization']}
      />
      {/* 页面内容 */}
    </div>
  )
}
```

### 3. 自定义SEO配置

在 `lib/seo-config.ts` 中添加新页面的SEO配置：

```typescript
export const seoConfig = {
  pages: {
    myPage: {
      zh: {
        title: '我的页面标题',
        description: '我的页面描述',
        keywords: '关键词1,关键词2,关键词3'
      },
      en: {
        title: 'My Page Title',
        description: 'My page description',
        keywords: 'keyword1,keyword2,keyword3'
      }
    }
  }
}
```

### 4. 结构化数据

使用 `StructuredData` 组件添加特定的结构化数据：

```tsx
import { StructuredData } from '@/components/seo/structured-data'

<StructuredData type="faq" />
<StructuredData type="service" />
```

### 5. 面包屑导航

使用 `Breadcrumb` 组件添加面包屑导航：

```tsx
import { Breadcrumb } from '@/components/seo/breadcrumb'

const breadcrumbItems = [
  { label: '首页', href: '/' },
  { label: '博客', href: '/blog' },
  { label: '文章标题', current: true }
]

<Breadcrumb items={breadcrumbItems} />
```

## 文件结构

```
components/seo/
├── analytics.tsx          # 分析工具组件
├── breadcrumb.tsx         # 面包屑导航组件
├── page-seo.tsx          # 页面SEO主组件
├── seo-head.tsx          # SEO头部组件
└── structured-data.tsx    # 结构化数据组件

lib/
└── seo-config.ts         # SEO配置文件

app/
├── sitemap.ts           # 站点地图生成器
└── robots.txt           # 爬虫规则文件
```

## 最佳实践

### 1. 标题优化
- 保持标题在50-60个字符以内
- 包含主要关键词
- 每个页面使用唯一标题

### 2. 描述优化
- 保持描述在150-160个字符以内
- 包含相关关键词
- 提供有价值的页面摘要

### 3. 关键词优化
- 使用相关的长尾关键词
- 避免关键词堆砌
- 根据页面内容选择合适的关键词

### 4. 结构化数据
- 确保数据准确性
- 使用适当的Schema.org类型
- 定期验证结构化数据

### 5. 多语言SEO
- 为每种语言提供独特的内容
- 使用正确的hreflang标签
- 确保URL结构清晰

## 验证工具

### Google Search Console
- 提交站点地图
- 监控索引状态
- 检查结构化数据

### Google Rich Results Test
- 验证结构化数据
- 检查富媒体搜索结果

### PageSpeed Insights
- 检查页面加载速度
- 优化Core Web Vitals

## 监控和维护

1. 定期检查Google Search Console
2. 监控关键词排名
3. 更新过时的内容
4. 优化页面加载速度
5. 检查死链接和404错误

## 注意事项

1. 确保所有环境变量正确配置
2. 定期更新站点地图
3. 保持内容的原创性和相关性
4. 遵循搜索引擎指南
5. 避免过度优化

通过以上配置，您的网站将具备完整的SEO功能，有助于提升搜索引擎排名和用户体验。
