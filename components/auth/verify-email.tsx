"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function VerifyEmailPage() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("verify")
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [hasVerified, setHasVerified] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  // 根据语言环境构建正确的路径
  const getLocalizedPath = (path: string) => {
    return locale === "en" ? `/en${path}` : `/zh${path}`
  }

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage(t('token_missing'))
      return
    }

    // 防止重复验证
    if (hasVerified) {
      return
    }

    const verifyEmail = async () => {
      try {
        setHasVerified(true)
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
        } else {
          setStatus('error')
          setMessage(data.error || t('failed'))
        }
      } catch (error) {
        setStatus('error')
        setMessage(t('failed_retry'))
      }
    }

    verifyEmail()
  }, [token, hasVerified]) // 移除 t 依赖，添加 hasVerified 依赖

  return (
    <div className="min-h-screen flex items-center justify-center bg-almond-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${
            status === 'loading' || status === 'success' || status === 'error'
              ? 'bg-coral-600'
              : 'bg-white shadow-lg border border-gray-100'
          }`}>
            {status === 'loading' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-white" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-white" />}
            {!status && (
              <Image
                src="/logo.png"
                alt="ITSAI Agent"
                width={48}
                height={48}
                className="object-contain"
              />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-coral-600">
            {t('title')}
          </CardTitle>
          <CardDescription className="text-charcoal-600">
            {status === 'loading' && t('verifying')}
            {status === 'success' && t('success')}
            {status === 'error' && t('failed')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-orange-600 mb-4" />
              <p className="text-slate-600">{t('please_wait')}</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            {status === 'success' && (
              <Button asChild className="w-full bg-coral-600 hover:bg-coral-700">
                <Link href={getLocalizedPath("/auth/signin")}>
                  {t('login_now')}
                </Link>
              </Button>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href={getLocalizedPath("/auth/signup")}>
                    {t('register_again')}
                  </Link>
                </Button>
                <div className="text-sm text-slate-600">
                  {t('or')}{' '}
                  <Link href={getLocalizedPath("/auth/signin")} className="text-orange-600 hover:text-orange-700 font-medium">
                    {t('back_to_login')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 