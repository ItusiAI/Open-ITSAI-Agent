"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle, AlertCircle, Loader2, Rocket, Bell, Star } from 'lucide-react'

interface SubscribeFormProps {
  className?: string
}

export function SubscribeForm({ className }: SubscribeFormProps) {
  const heroT = useTranslations('hero.subscribe')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus('error')
      setMessage(heroT('invalid_email'))
      return
    }

    setStatus('loading')

    try {
      // 使用现有的newsletter订阅API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          locale: locale,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
        setEmail('')

        // 5秒后重置状态
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 5000)
      } else {
        setStatus('error')
        setMessage(data.error || heroT('error'))
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setStatus('error')
      setMessage(heroT('error'))

      // 3秒后重置状态
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    }
  }

  return (
    <div className={`max-w-lg mx-auto ${className}`}>
      {/* Coming Soon Badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-coral-100 px-4 py-2 rounded-full mb-4 animate-pulse">
          <Rocket className="w-4 h-4 text-coral-600" />
          <span className="text-sm font-semibold text-coral-700">
            {heroT('coming_soon')}
          </span>
          <Star className="w-4 h-4 text-coral-600" />
        </div>

        <h3 className="text-3xl font-bold text-slate-800 mb-2">
          {heroT('title')}
        </h3>
        <div className="text-lg font-medium text-orange-600 mb-3">
          {heroT('subtitle')}
        </div>
        <p className="text-slate-600 leading-relaxed">
          {heroT('description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Bell className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
          <Input
            type="email"
            placeholder={heroT('placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 pr-4 py-4 text-base border-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl bg-white shadow-sm"
            disabled={status === 'loading'}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={status === 'loading' || status === 'success'}
          className="w-full text-lg py-4 bg-coral-600 text-white hover:bg-coral-700 brand-shadow-lg transition-all duration-300 rounded-xl font-semibold"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {heroT('button_loading')}
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              {heroT('button_success')}
            </>
          ) : (
            <>
              <Bell className="mr-2 h-5 w-5" />
              {heroT('button')}
            </>
          )}
        </Button>

        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${
            status === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {status === 'success' ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <Rocket className="w-4 h-4" />
              </div>
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{status === 'success' ? heroT('success') : message}</span>
          </div>
        )}

        {/* Additional info for coming soon */}
        {!message && (
          <div className="text-center">
            <p className="text-xs text-charcoal-500 leading-relaxed">
              {heroT('development_notice')}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
