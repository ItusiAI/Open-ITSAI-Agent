'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  CreditCard, 
  Crown, 
  Coins, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'

interface PaymentRecord {
  id: string
  userId: string
  stripeCustomerId: string
  paymentIntentId?: string
  checkoutSessionId?: string
  subscriptionId?: string
  invoiceId?: string
  paymentStatus: 'succeeded' | 'failed' | 'pending' | 'refunded' | 'cancelled'
  paymentType: 'subscription' | 'points_purchase' | 'one_time'
  amount: number
  currency: string
  productName?: string
  productDescription?: string
  priceId?: string
  pointsAmount?: number
  pointsType?: string
  subscriptionPlan?: string
  subscriptionPeriodStart?: string
  subscriptionPeriodEnd?: string
  refundAmount?: number
  refundReason?: string
  refundedAt?: string
  metadata?: any
  webhookEventId?: string
  createdAt: string
  updatedAt: string
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  totalPointsPurchased: number
  successfulPayments: number
  failedPayments: number
  refundedPayments: number
  subscriptionPayments: number
  pointsPayments: number
}

export function PaymentHistory() {
  const t = useTranslations('profile.payment_history_details')
  const profileT = useTranslations('profile')
  const locale = useLocale()
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{
    paymentType: string
    paymentStatus: string
  }>({
    paymentType: 'all',
    paymentStatus: 'all'
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{t('payment_statuses.succeeded')}</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />{t('payment_statuses.failed')}</Badge>
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />{t('payment_statuses.pending')}</Badge>
      case 'refunded':
        return <Badge variant="outline" className="text-orange-600"><AlertCircle className="w-3 h-3 mr-1" />{t('payment_statuses.refunded')}</Badge>
      case 'cancelled':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />{t('payment_statuses.cancelled')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Crown className="w-4 h-4" />
      case 'points_purchase':
        return <Coins className="w-4 h-4" />
      default:
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'subscription':
        return t('payment_types.subscription')
      case 'points_purchase':
        return t('payment_types.points_purchase')
      default:
        return t('payment_types.other')
    }
  }

  const getTranslatedProductName = (productName: string | undefined, paymentType: string) => {
    if (!productName) return ''

    // 如果是积分购买，翻译产品名称
    if (paymentType === 'points_purchase') {
      // 匹配积分数量（中文格式）
      const chinesePointsMatch = productName.match(/(\d+(?:,\d+)*)\s*积分/)
      if (chinesePointsMatch) {
        const points = chinesePointsMatch[1]
        return `${points} ${profileT('points')}`
      }

      // 匹配积分数量（英文格式）
      const englishPointsMatch = productName.match(/(\d+(?:,\d+)*)\s*Points?/)
      if (englishPointsMatch) {
        const points = englishPointsMatch[1]
        return `${points} ${profileT('points')}`
      }

      // 如果都没匹配到，返回通用翻译
      return profileT('points_purchase')
    }

    // 如果是订阅，翻译产品名称
    if (paymentType === 'subscription') {
      if (productName.includes('专业版') || productName.includes('Pro')) {
        return profileT('plan_pro')
      }
      // 如果包含订阅相关关键词，返回通用订阅翻译
      if (productName.includes('订阅') || productName.includes('Subscription')) {
        return profileT('plan_pro')
      }
    }

    // 其他情况直接返回原名称
    return productName
  }

  const getTranslatedProductDescription = (productDescription: string | undefined, paymentType: string) => {
    if (!productDescription) return ''

    // 如果是积分购买，翻译描述
    if (paymentType === 'points_purchase') {
      // 匹配积分数量（中文格式）
      const chineseMatch = productDescription.match(/购买\s*(\d+(?:,\d+)*)\s*积分/)
      if (chineseMatch) {
        const points = chineseMatch[1]
        return locale === 'zh' ? `购买 ${points} ${profileT('points')}` : `Purchase ${points} ${profileT('points')}`
      }

      // 匹配积分数量（英文格式）
      const englishMatch = productDescription.match(/Purchase\s*(\d+(?:,\d+)*)\s*Points?/)
      if (englishMatch) {
        const points = englishMatch[1]
        return locale === 'zh' ? `购买 ${points} ${profileT('points')}` : `Purchase ${points} ${profileT('points')}`
      }

      // 如果包含Purchase和Points关键词，但格式不匹配，返回通用描述
      if (productDescription.includes('Purchase') && productDescription.includes('Points')) {
        return profileT('points_purchase_description')
      }

      // 如果包含中文关键词，返回通用描述
      if (productDescription.includes('购买') && productDescription.includes('积分')) {
        return profileT('points_purchase_description')
      }

      return profileT('points_purchase_description')
    }

    // 如果是订阅，翻译描述
    if (paymentType === 'subscription') {
      // 匹配订阅专业版赠送积分的描述
      if (productDescription.includes('订阅专业版') && productDescription.includes('赠送') && productDescription.includes('积分')) {
        const pointsMatch = productDescription.match(/(\d+(?:,\d+)*)\s*积分/)
        if (pointsMatch) {
          const points = pointsMatch[1]
          return locale === 'zh'
            ? `订阅专业版，赠送 ${points} 积分`
            : `Pro Subscription with ${points} bonus points`
        }
        return locale === 'zh' ? '订阅专业版服务' : 'Pro Subscription Service'
      }

      // 匹配英文订阅描述
      if (productDescription.includes('Pro Subscription') && productDescription.includes('bonus')) {
        const pointsMatch = productDescription.match(/(\d+(?:,\d+)*)\s*bonus points/)
        if (pointsMatch) {
          const points = pointsMatch[1]
          return locale === 'zh'
            ? `订阅专业版，赠送 ${points} 积分`
            : `Pro Subscription with ${points} bonus points`
        }
        return locale === 'zh' ? '订阅专业版服务' : 'Pro Subscription Service'
      }

      // 通用订阅描述翻译
      if (productDescription.includes('订阅') || productDescription.includes('Subscription')) {
        return locale === 'zh' ? '专业版订阅服务' : 'Professional Subscription Service'
      }
    }

    // 其他情况直接返回原描述
    return productDescription
  }

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        includeStats: 'true',
        limit: '50'
      })
      
      if (filter.paymentType !== 'all') {
        params.append('paymentType', filter.paymentType)
      }
      
      if (filter.paymentStatus !== 'all') {
        params.append('paymentStatus', filter.paymentStatus)
      }

      const response = await fetch(`/api/user/payments?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data.data.payments)
        setStats(data.data.stats)
      } else {
        console.error(t('errors.fetch_failed'))
      }
    } catch (error) {
      console.error(t('errors.fetch_failed'), error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [filter])

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (locale === 'zh') {
      return format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
    } else {
      return format(date, 'MMM dd, yyyy HH:mm', { locale: enUS })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('stats.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('stats.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalPayments}</div>
                <div className="text-sm text-gray-600">{t('stats.total_payments')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(stats.totalAmount, 'usd')}
                </div>
                <div className="text-sm text-gray-600">{t('stats.total_amount')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.totalPointsPurchased?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">{t('stats.total_points_purchased')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.successfulPayments}</div>
                <div className="text-sm text-gray-600">{t('stats.successful_payments')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 支付记录 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('title')}
            </CardTitle>
            
            <div className="flex gap-2">
              <Select value={filter.paymentType} onValueChange={(value) => setFilter(prev => ({ ...prev, paymentType: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('filters.type_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all_types')}</SelectItem>
                  <SelectItem value="subscription">{t('payment_types.subscription')}</SelectItem>
                  <SelectItem value="points_purchase">{t('payment_types.points_purchase')}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filter.paymentStatus} onValueChange={(value) => setFilter(prev => ({ ...prev, paymentStatus: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('filters.status_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filters.all_statuses')}</SelectItem>
                  <SelectItem value="succeeded">{t('payment_statuses.succeeded')}</SelectItem>
                  <SelectItem value="failed">{t('payment_statuses.failed')}</SelectItem>
                  <SelectItem value="pending">{t('payment_statuses.pending')}</SelectItem>
                  <SelectItem value="refunded">{t('payment_statuses.refunded')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('empty_state.title')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.type')}</TableHead>
                    <TableHead>{t('table.product')}</TableHead>
                    <TableHead>{t('table.amount')}</TableHead>
                    <TableHead>{t('table.points')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead>{t('table.time')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(payment.paymentType)}
                          <span className="text-sm">{getTypeName(payment.paymentType)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {getTranslatedProductName(payment.productName, payment.paymentType)}
                          </div>
                          {payment.productDescription && (
                            <div className="text-sm text-gray-600">
                              {getTranslatedProductDescription(payment.productDescription, payment.paymentType)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.pointsAmount ? (
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span>{payment.pointsAmount.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(payment.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}