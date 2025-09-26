import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { UnauthorizedContent } from '@/components/unauthorized/unauthorized-content'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <UnauthorizedContent />
      </main>
      <Footer />
    </div>
  )
} 