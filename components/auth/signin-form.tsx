"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { SiGithub, SiGoogle } from 'react-icons/si'
import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'

export function SignInForm() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("auth")
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const router = useRouter()

  // 根据语言环境构建正确的路径
  const getLocalizedPath = (path: string) => {
    return locale === "en" ? `/en${path}` : `/zh${path}`
  }

  // 获取回调URL
  const getCallbackUrl = () => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      return searchParams.get('callbackUrl') || getLocalizedPath('/')
    }
    return getLocalizedPath('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('login_error'))
      } else {
        const callbackUrl = getCallbackUrl()
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError(t('login_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setOauthLoading(provider)
    try {
      await signIn(provider, {
        callbackUrl: getCallbackUrl(),
      })
    } catch (error) {
      setError(t('login_failed'))
    } finally {
      setOauthLoading(null)
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
            {t('welcome_back')}
          </CardTitle>
          <CardDescription className="text-charcoal-600">
            {t('login_description')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* 第三方登录按钮 */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => handleOAuthSignIn('github')}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === 'github' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SiGithub className="h-4 w-4" />
                )}
                <span>GitHub</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => handleOAuthSignIn('google')}
                disabled={oauthLoading !== null}
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SiGoogle className="h-4 w-4" />
                )}
                <span>Google</span>
              </Button>
            </div>
          </div>

          {/* 分割线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                {locale === "en" ? "Or continue with email" : "或使用邮箱登录"}
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email_placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-orange-400 focus:ring-orange-400/20"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('password_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-slate-200 focus:border-orange-400 focus:ring-orange-400/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Link
                href={getLocalizedPath('/auth/forgot-password')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {t('forgot_password')}
              </Link>
            </div>
            
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-coral-600 hover:bg-coral-700 text-white font-medium py-2.5 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('logging_in')}
                </>
              ) : (
                <>
                  {t('login')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
          
          <div className="text-center text-sm text-slate-600">
            {t('no_account')}{' '}
            <Link
              href={(() => {
                const callbackUrl = getCallbackUrl()
                return callbackUrl
                  ? `${getLocalizedPath('/auth/signup')}?callbackUrl=${encodeURIComponent(callbackUrl)}`
                  : getLocalizedPath('/auth/signup')
              })()}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              {t('signup_now')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 