import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // 支持的语言
  locales: ['en', 'zh'],
  // 默认语言
  defaultLocale: 'en',
  // 在路径中总是显示语言前缀
  localePrefix: 'always'
})

export const config = {
  // 匹配所有路径，但排除以下路径：
  // - api: API路径（包括NextAuth）
  // - _next: Next.js内部文件和静态资源
  // - _vercel: Vercel部署文件
  // - 静态文件（包含点的文件，如.ico, .png等）
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
} 