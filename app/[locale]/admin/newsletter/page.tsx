import { requireAdmin } from '@/lib/auth-utils'
import { NewsletterStats } from '@/components/newsletter/newsletter-stats'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default async function NewsletterAdminPage() {
  // 验证管理员权限
  await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">邮件订阅统计</h1>
        <NewsletterStats />
      </div>
      <Footer />
    </div>
  )
} 