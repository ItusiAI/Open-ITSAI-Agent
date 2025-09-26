"use client"

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { UnsubscribeForm } from '@/components/newsletter/unsubscribe-form'

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <UnsubscribeForm />
      </main>
      <Footer />
    </div>
  )
} 