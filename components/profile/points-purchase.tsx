'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, CreditCard, History, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { POINTS_PRODUCTS } from '@/lib/stripe'

interface PointsPackage {
  id: string
  points: number
  price: number
  priceId: string
  popular?: boolean
}

// 使用配置文件中的积分套餐
const pointsPackages: PointsPackage[] = Object.values(POINTS_PRODUCTS).map(pkg => ({
  id: pkg.id,
  points: pkg.points,
  price: pkg.price,
  priceId: pkg.priceId,
  popular: 'popular' in pkg ? pkg.popular : false,
}))

export function PointsPurchase({ onPointsUpdate }: { onPointsUpdate?: () => void }) {
  const t = useTranslations('profile')
  const [loading, setLoading] = useState<string | null>(null)
  const [userPointsDetail, setUserPointsDetail] = useState<{
    totalPoints: number
    purchasedPoints: number
    giftedPoints: number
    subscriptionStatus?: string
    subscriptionPlan?: string
  }>({
    totalPoints: 0,
    purchasedPoints: 0,
    giftedPoints: 0
  })

  const handlePurchase = async (pkg: PointsPackage) => {
    setLoading(pkg.id)

    try {
      // 创建Stripe Checkout会话
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          points: pkg.points,
          amount: pkg.price * 100, // 转换为分
          priceId: pkg.priceId,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        toast.error(error)
        return
      }

      if (url) {
        // 跳转到Stripe Checkout页面
        window.location.href = url
      }
    } catch (error) {
      console.error('创建支付会话失败:', error)
      toast.error(t('payment_failed'))
    } finally {
      setLoading(null)
    }
  }



  // 获取用户积分详情
  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/points-detail')
      if (response.ok) {
        const data = await response.json()
        setUserPointsDetail(data)
      }
    } catch (error) {
      console.error('获取用户积分失败:', error)
    }
  }

  useEffect(() => {
    fetchUserPoints()
  }, [])

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-slate-800">
          <Star className="h-5 w-5 text-orange-600" />
          <span>{t('points_purchase')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 当前积分显示 - 移到上面 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('current_points')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {userPointsDetail.totalPoints.toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('purchased_points_label')}:</span>
                    <span className="font-medium text-green-600">
                      {userPointsDetail.purchasedPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('gifted_points_label')}:</span>
                    <span className="font-medium text-blue-600">
                      {userPointsDetail.giftedPoints.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 积分购买套餐 - 移到下面 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-800">{t('points_purchase_description')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pointsPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    pkg.popular 
                      ? 'border-orange-500 bg-orange-50 pt-8' 
                      : 'border-slate-200 bg-white hover:border-orange-300'
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-3 py-1 text-xs font-medium shadow-md">
                      {t('recommended')}
                    </Badge>
                  )}
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Star className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-1">
                      {pkg.points.toLocaleString()}
                    </h3>
                    <p className="text-slate-600 mb-4">{t('points')}</p>
                    <div className="text-3xl font-bold text-orange-600 mb-4">
                      ${pkg.price}
                    </div>
                    <Button
                      className="w-full"
                      variant={pkg.popular ? 'default' : 'outline'}
                      onClick={() => handlePurchase(pkg)}
                      disabled={loading === pkg.id}
                    >
                      {loading === pkg.id ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          {t('processing')}
                        </>
                      ) : (
                        t('purchase_now')
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}