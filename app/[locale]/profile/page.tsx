import { ProfileInfo } from '@/components/profile/profile-info'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <ProfileInfo />
      </main>
      <Footer />
    </div>
  )
} 