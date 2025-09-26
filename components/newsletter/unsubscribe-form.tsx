"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle, XCircle } from 'lucide-react'

export function UnsubscribeForm() {
  const t = useTranslations('footer')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')
  
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [autoUnsubscribed, setAutoUnsubscribed] = useState(false)

  // 如果URL中有token，自动取消订阅
  useEffect(() => {
    if (token && !autoUnsubscribed) {
      handleUnsubscribeWithToken(token)
      setAutoUnsubscribed(true)
    }
  }, [token, autoUnsubscribed])

  const handleUnsubscribeWithToken = async (unsubToken: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/newsletter/unsubscribe?token=${unsubToken}&locale=${locale}`)
      const data = await response.json()
      
      if (response.ok) {
        setIsSuccess(true)
        setMessage(data.message)
      } else {
        setMessage(data.error || t('newsletter.unsubscribe.unsubscribeError'))
      }
    } catch (error) {
      setMessage(t('newsletter.unsubscribe.networkError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribeWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
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
        setIsSuccess(true)
        setMessage(data.message)
        setEmail('')
      } else {
        setMessage(data.error || t('newsletter.unsubscribe.unsubscribeError'))
      }
    } catch (error) {
      setMessage(t('newsletter.unsubscribe.networkError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToHome = () => {
    window.location.href = `/${locale}`
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800">
          {t('newsletter.unsubscribe.title')}
        </CardTitle>
        <CardDescription>
          {t('newsletter.unsubscribe.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-slate-600">{t('newsletter.unsubscribe.loadingText')}</p>
          </div>
        )}

        {message && !isLoading && (
          <div className={`text-center p-4 rounded-lg ${
            isSuccess 
              ? 'text-green-700 bg-green-50 border border-green-200' 
              : 'text-red-700 bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-center mb-2">
              {isSuccess ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <p>{message}</p>
          </div>
        )}

        {!token && !isSuccess && (
          <form onSubmit={handleUnsubscribeWithEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('newsletter.unsubscribe.emailLabel')}
              </label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder={t('newsletter.unsubscribe.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-coral-600 hover:bg-coral-700"
              disabled={isLoading}
            >
              {isLoading ? t('newsletter.unsubscribe.processing') : t('newsletter.unsubscribe.button')}
            </Button>
          </form>
        )}

        {isSuccess && (
          <div className="text-center space-y-4">
            <p className="text-slate-600">
              {t('newsletter.unsubscribe.successMessage')}
            </p>
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="border-coral-200 text-coral-700 hover:bg-coral-50"
            >
              {t('newsletter.unsubscribe.backToHome')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 