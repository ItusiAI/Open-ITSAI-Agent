"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Building,
  User
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

interface SubscriptionData {
  subscriptionStatus: string | null
  subscriptionPlan: string | null
  subscriptionCurrentPeriodEnd: string | null
  stripeCustomerId: string | null
}

export function SubscriptionInfo() {
  const locale = useLocale()
  const t = useTranslations("profile")
  const { data: session, status } = useSession()
  
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [managingSubscription, setManagingSubscription] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchSubscriptionData()
    }
  }, [status, session])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('获取订阅信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSubscriptionData()
    setRefreshing(false)
  }

  const handleManageSubscription = async () => {
    try {
      setManagingSubscription(true)

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/${locale}/profile`
        })
      })

      if (response.ok) {
        const { url } = await response.json()
        window.open(url, '_blank')
      } else {
        const errorData = await response.json()
        console.error('Failed to create customer portal session:', errorData)
        alert(t('error.manage_subscription_failed'))
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error)
      alert(t('error.manage_subscription_failed'))
    } finally {
      setManagingSubscription(false)
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('subscription_active')}
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            {t('subscription_cancelled')}
          </Badge>
        )
      case 'past_due':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t('subscription_past_due')}
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <User className="h-3 w-3 mr-1" />
            {t('subscription_free')}
          </Badge>
        )
    }
  }

  const getPlanIcon = (plan: string | null) => {
    switch (plan) {
      case 'pro':
        return <Crown className="h-5 w-5 text-orange-600" />
      case 'enterprise':
        return <Building className="h-5 w-5 text-purple-600" />
      default:
        return <User className="h-5 w-5 text-gray-600" />
    }
  }

  const getPlanName = (plan: string | null) => {
    switch (plan) {
      case 'pro':
        return t('plan_pro')
      case 'enterprise':
        return t('plan_enterprise')
      default:
        return t('plan_free')
    }
  }

  const getPlanDescription = (plan: string | null) => {
    switch (plan) {
      case 'pro':
        return t('plan_pro_description')
      case 'enterprise':
        return t('plan_enterprise_description')
      default:
        return t('plan_free_description')
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimeToExpiry = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === 'zh' ? zhCN : enUS
    })
  }

  const isExpiringSoon = (dateString: string | null) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffInDays <= 7 && diffInDays > 0
  }

  const isExpired = (dateString: string | null) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const now = new Date()
    return date.getTime() < now.getTime()
  }

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-800">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <span>{t('subscription_info')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-slate-800">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <span>{t('subscription_info')}</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 px-3"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          {t('subscription_info_description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 当前订阅状态 */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getPlanIcon(subscriptionData?.subscriptionPlan || null)}
            <div>
              <p className="font-semibold text-slate-800">
                {getPlanName(subscriptionData?.subscriptionPlan || null)}
              </p>
              <p className="text-sm text-slate-600">
                {getPlanDescription(subscriptionData?.subscriptionPlan || null)}
              </p>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(subscriptionData?.subscriptionStatus || null)}
          </div>
        </div>

        {/* 订阅详情 */}
        {subscriptionData?.subscriptionPlan && subscriptionData?.subscriptionPlan !== 'free' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* 到期时间 */}
              {subscriptionData?.subscriptionCurrentPeriodEnd && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-600">{t('subscription_expires')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-slate-800">
                        {formatDate(subscriptionData.subscriptionCurrentPeriodEnd)} 
                        <span className="text-sm text-slate-500 ml-2">
                          ({formatTimeToExpiry(subscriptionData.subscriptionCurrentPeriodEnd)})
                        </span>
                      </span>
                    </div>
                  </div>
                  {isExpiringSoon(subscriptionData.subscriptionCurrentPeriodEnd) && (
                    <div className="flex items-center space-x-1 mt-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700">{t('subscription_expiring_soon')}</span>
                    </div>
                  )}
                  {isExpired(subscriptionData.subscriptionCurrentPeriodEnd) && (
                    <div className="flex items-center space-x-1 mt-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">{t('subscription_expired')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 订阅管理按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {subscriptionData?.subscriptionStatus === 'active' && (
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                  onClick={handleManageSubscription}
                  disabled={managingSubscription}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{managingSubscription ? t('loading') : t('manage_subscription')}</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 