import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthSessionProvider } from "@/components/providers/session-provider"
import { Analytics } from "@/components/seo/analytics"
import './globals.css'

// 移除静态metadata，让子路由自己处理metadata
// export const metadata: Metadata = {
//   title: 'ITSAI Agent - 专业AI智能体服务平台',
//   description: 'ITSAI Agent提供专业的AI智能体服务，包括播客制作、配音生成、视频创作等场景的AI解决方案，开箱即用，专业高效。',
//   generator: 'ITSAI Agent',
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            {children}
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
