"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, Crown, Gift, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface SubscriptionData {
  subscriptionStatus: string | null
  subscriptionPlan: string | null
  subscriptionCurrentPeriodEnd: string | null
  stripeCustomerId: string | null
}

interface PointsDetail {
  totalPoints: number
  purchasedPoints: number
  giftedPoints: number
  subscriptionStatus?: string
  subscriptionPlan?: string
}

export function PaymentSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = useLocale()
  const { data: session, status } = useSession()
  const t = useTranslations('dashboard')
  const [loading, setLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [pointsData, setPointsData] = useState<PointsDetail | null>(null)
  const [verificationComplete, setVerificationComplete] = useState(false)

  const sessionId = searchParams.get('session_id')

  // 构建本地化路径
  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      handlePaymentSuccess()
    } else if (status === 'unauthenticated') {
      router.push(getLocalizedPath('/auth/signin'))
    }
  }, [status, session, sessionId])

  const handlePaymentSuccess = async () => {
    if (!sessionId) {
      // 移除自动跳转逻辑，显示提示信息
      setLoading(false)
      toast.info(t('payment_success.no_session_toast'))
      return
    }

    try {
      // 等待一下让webhook有时间处理
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 获取最新的订阅信息
      const [subscriptionResponse, pointsResponse] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/user/points-detail')
      ])

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setSubscriptionData(subscriptionData)
      }

      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json()
        setPointsData(pointsData)
      }

      setVerificationComplete(true)
      setLoading(false)

      // 显示成功消息
      toast.success(t('payment_success.success_toast'))

      // 清除URL参数
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('session_id')
        window.history.replaceState({}, '', url.toString())
      }

    } catch (error) {
      console.error('获取订阅信息失败:', error)
      setLoading(false)
      toast.error(t('error.fetch_failed'))
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('payment_success.processing_title')}</h2>
              <p className="text-gray-600">{t('payment_success.processing_description')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!verificationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('payment_success.verifying_title')}</h2>
              <p className="text-gray-600">{t('payment_success.verifying_description')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isProSubscription = subscriptionData?.subscriptionPlan === 'pro' && subscriptionData?.subscriptionStatus === 'active'

  return (
    <div className="min-h-screen bg-almond-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 成功页面 */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-slate-800">
              🎉 {t('payment_success.title')}
            </CardTitle>
            <CardDescription className="text-lg">
              {t('payment_success.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 订阅信息 */}
              {isProSubscription && (
                <div className="bg-coral-50 rounded-lg p-6 border border-coral-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="h-6 w-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-slate-800">{t('subscription_info.title')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">{t('subscription_info.status_label')}</span>
                      <span className="font-medium text-green-700 ml-2">
                        {subscriptionData?.subscriptionStatus === 'active' ? t('subscription_info.status_active') : t('subscription_info.status_processing')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">{t('subscription_info.plan_label')}</span>
                      <span className="font-medium text-slate-800 ml-2">{t('subscription_info.plan_pro')}</span>
                    </div>
                    {subscriptionData?.subscriptionCurrentPeriodEnd && (
                      <div className="md:col-span-2">
                        <span className="text-slate-600">{t('subscription_info.expires_label')}</span>
                        <span className="font-medium text-slate-800 ml-2">
                          {new Date(subscriptionData.subscriptionCurrentPeriodEnd).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 积分信息 */}
              {pointsData && (
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Gift className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">{t('points_reward.title')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {pointsData.totalPoints.toLocaleString()}
                      </div>
                      <div className="text-slate-600">{t('points_reward.total_points')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {pointsData.purchasedPoints.toLocaleString()}
                      </div>
                      <div className="text-slate-600">{t('points_reward.purchased_points')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {pointsData.giftedPoints.toLocaleString()}
                      </div>
                      <div className="text-slate-600">{t('points_reward.gifted_points')}</div>
                    </div>
                  </div>
                  {pointsData.giftedPoints > 0 && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm text-blue-800">
                        {t('points_reward.gift_notice', { points: pointsData.giftedPoints.toLocaleString() })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 下一步操作 */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                  <Link href={getLocalizedPath('/profile')} className="flex items-center justify-center gap-2">
                    {t('actions.view_profile')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href={getLocalizedPath('/')} className="flex items-center justify-center gap-2">
                    {t('actions.back_home')}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 