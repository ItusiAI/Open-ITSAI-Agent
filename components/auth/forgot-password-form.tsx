"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function ForgotPasswordForm() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("forgot_password")
  
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // 根据语言环境构建正确的路径
  const getLocalizedPath = (path: string) => {
    return locale === "en" ? `/en${path}` : `/zh${path}`
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setStatus('error')
      setMessage(t('email_required'))
      return
    }

    if (!validateEmail(email)) {
      setStatus('error')
      setMessage(t('email_invalid'))
      return
    }

    setIsLoading(true)
    setStatus('idle')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, locale }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(t('success_message'))
      } else {
        setStatus('error')
        setMessage(data.error || t('send_failed'))
      }
    } catch (error) {
      setStatus('error')
      setMessage(t('send_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-almond-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-100">
            <Image
              src="/logo.png"
              alt="ITSAI Agent"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-coral-600">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-charcoal-600">
            {t('description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>
              <p className="text-slate-600 text-sm">
                {t('check_email')}
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href={getLocalizedPath("/auth/signin")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('back_to_login')}
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('email_label')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  className="bg-white/50 border-slate-200 focus:border-orange-400 focus:ring-orange-400"
                  disabled={isLoading}
                />
              </div>

              {status === 'error' && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-coral-600 hover:bg-coral-700 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? t('sending') : t('send_reset_link')}
              </Button>

              <div className="text-center">
                <Link
                  href={getLocalizedPath("/auth/signin")}
                  className="text-slate-500 hover:text-slate-700 text-sm font-medium inline-flex items-center"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  {t('back_to_login')}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 