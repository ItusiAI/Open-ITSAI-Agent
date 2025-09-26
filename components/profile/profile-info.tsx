"use client"

import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Mail, 
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  Loader2,
  Coins,
  TrendingUp,
  TrendingDown,
  Gift,
  UserPlus,
  Award,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  CreditCard,
  MessageSquare,
  History,
  Link,
  Activity
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, enUS } from 'date-fns/locale'
import { ConnectedAccounts } from './connected-accounts'
import { SubscriptionInfo } from './subscription-info'
import { PointsPurchase } from './points-purchase'
import { PaymentHistory } from './payment-history'
import { toast } from 'sonner'

interface PointsHistoryItem {
  id: string
  points: number
  action: string
  description: string
  createdAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

interface UserDetails {
  id: string
  name: string | null
  email: string
  image: string | null
  emailVerified: Date | null
  createdAt: Date
  role: string
}

export function ProfileInfo() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const t = useTranslations("profile")
  const tAudio = useTranslations("audioSummary")
  const { data: session, status } = useSession()
  
  // 积分相关状态
  const [points, setPoints] = useState<number | null>(null)
  const [pointsLoading, setPointsLoading] = useState(false)
  const [history, setHistory] = useState<PointsHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // 用户详情状态
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)
  
  // 当前选中的分类 - 使用 localStorage 保持状态，默认显示积分购买
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profileActiveSection') || 'points-purchase'
    }
    return 'points-purchase'
  })

  // 更新 setActiveSection 来同时保存到 localStorage
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveSection', sectionId)
    }
  }

  // 分类配置 - 积分购买放在订阅信息上面
  const sections = [
    { id: 'points-purchase', label: t('points_purchase'), icon: Coins },
    { id: 'subscription', label: t('subscription_info'), icon: CreditCard },
    { id: 'points-history', label: t('points_history'), icon: History },
    { id: 'payment-history', label: t('payment_history'), icon: History },
    { id: 'connected-accounts', label: t('connected_accounts'), icon: Link },
    { id: 'account-status', label: t('account_status'), icon: Activity }
  ]

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchPoints()
      fetchHistory(currentPage)
      fetchUserDetails()
    }
  }, [status, session, currentPage])

  // 处理支付状态
  useEffect(() => {
    const payment = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    
    if (payment === 'success') {
      toast.success('积分购买成功！积分已添加到您的账户')
      // 刷新积分和历史记录
      fetchPoints()
      fetchHistory(currentPage)
      // 清除URL参数
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('payment')
        url.searchParams.delete('session_id')
        window.history.replaceState({}, '', url.toString())
      }
    } else if (payment === 'cancelled') {
      toast.error('支付已取消')
      // 清除URL参数
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('payment')
        window.history.replaceState({}, '', url.toString())
      }
    }
  }, [searchParams, currentPage])

  const fetchUserDetails = async () => {
    setUserDetailsLoading(true)
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setUserDetails(data.user)
      }
    } catch (error) {
      console.error('获取用户详情失败:', error)
    } finally {
      setUserDetailsLoading(false)
    }
  }

  const fetchPoints = async () => {
    setPointsLoading(true)
    try {
      const response = await fetch('/api/points')
      if (response.ok) {
        const data = await response.json()
        setPoints(data.points)
      }
    } catch (error) {
      console.error('获取积分失败:', error)
    } finally {
      setPointsLoading(false)
    }
  }

  const fetchHistory = async (page: number = 1) => {
    setHistoryLoading(true)
    try {
      const response = await fetch(`/api/points/history?page=${page}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('获取积分历史失败:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'register':
        return <Gift className="h-4 w-4" />
      case 'email_verify':
        return <Mail className="h-4 w-4" />
      case 'daily_login':
        return <Calendar className="h-4 w-4" />
      case 'referral':
        return <UserPlus className="h-4 w-4" />
      case 'manual':
        return <Award className="h-4 w-4" />
      case 'purchase':
        return <Coins className="h-4 w-4" />
      case 'subscription_gift':
        return <Gift className="h-4 w-4" />
      case 'subscription_expired':
        return <X className="h-4 w-4" />
      case 'interview_generation':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Coins className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'register':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'email_verify':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'daily_login':
        return 'bg-coral-100 text-coral-800 border-coral-200'
      case 'referral':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manual':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'purchase':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'subscription_gift':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'subscription_expired':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'interview_generation':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActionDescription = (action: string, description?: string) => {
    // 从原描述中提取金额信息
    const extractAmount = (desc: string) => {
      const match = desc.match(/(\d+(?:,\d{3})*|\d+)/);
      return match ? match[0] : '';
    };

    // 从描述中提取分钟数
    const extractMinutes = (desc: string) => {
      // 匹配中文格式：5分钟 或 英文格式：5 minutes, 5 minute
      const match = desc.match(/(\d+)\s*(?:分钟|minutes?)/i);
      return match ? match[1] : '';
    };

    switch (action) {
      case 'register':
        return t('points_actions.register')
      case 'email_verify':
        return t('points_actions.email_verify')
      case 'daily_login':
        return t('points_actions.daily_login')
      case 'referral':
        return t('points_actions.referral')
      case 'manual':
        return t('points_actions.manual')
      case 'purchase':
        return t('points_actions.purchase')
      case 'subscription_gift':
        return t('points_actions.subscription_gift')
      case 'subscription_renewal_gift':
        return t('points_actions.subscription_renewal_gift')
      case 'subscription_expired':
        return t('points_actions.subscription_expired')
      case 'interview_generation':
        return t('points_actions.interview_generation')
      default:
        // 特殊处理音频总结服务和访谈播客服务
        if (description) {
          const lowerDesc = description.toLowerCase();

          // 检测是否为音频总结服务
          if (description.includes('音频总结服务') || lowerDesc.includes('audio summary service')) {
            const minutes = extractMinutes(description);
            if (minutes) {
              // 检测是否为中文版或全球版
              if (description.includes('中文版') || lowerDesc.includes('chinese')) {
                return tAudio('billing.chineseVersionService', { minutes });
              } else if (description.includes('全球版') || lowerDesc.includes('global')) {
                return tAudio('billing.globalVersionService', { minutes });
              } else {
                // 通用音频总结服务
                return tAudio('billing.audioSummaryService', { minutes });
              }
            }
          }

          // 检测是否为访谈播客生成服务
          if (description.includes('访谈播客生成服务') || lowerDesc.includes('interview podcast generation service')) {
            // 从描述中提取字符数
            const extractCharacters = (desc: string) => {
              const match = desc.match(/(\d+(?:,\d{3})*|\d+)\s*(?:字符|characters?)/i);
              return match ? match[1] : '';
            };

            const characters = extractCharacters(description);
            if (characters) {
              return t('points_actions.interview_generation_with_characters', { characters });
            }
          }
        }
        return description || t('points_actions.unknown')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateLocale = locale === 'zh' ? zhCN : enUS
    
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: dateLocale 
    })
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'subscription':
        return <SubscriptionInfo />
      
      case 'points-purchase':
        return <PointsPurchase onPointsUpdate={fetchPoints} />
      
      case 'points-history':
        return (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-charcoal-800">
                <Coins className="h-5 w-5 text-coral-600" />
                <span>{t('points_history')}</span>
              </CardTitle>
              <CardDescription>
                {t('points_history_description')}
                {pagination && (
                  <span className="ml-2 text-sm text-charcoal-500">
                    （{t('pagination.total_records', { total: pagination.totalItems })}）
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 mx-auto mb-4 text-charcoal-400" />
                  <p className="text-charcoal-600">{t('no_points_history')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getActionColor(item.action)}`}>
                          {getActionIcon(item.action)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getActionDescription(item.action, item.description)}
                          </p>
                          <p className="text-sm text-gray-500">{formatTime(item.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={item.points > 0 ? 'default' : 'secondary'}
                          className={`flex items-center gap-1 ${
                            item.points > 0 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {item.points > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {item.points > 0 ? '+' : ''}{item.points}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {/* 分页控件 */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-charcoal-600">
                        {t('pagination.page_info', { current: pagination.currentPage, total: pagination.totalPages })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={!pagination.hasPreviousPage}
                          className="h-8 px-3"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          {t('pagination.previous')}
                        </Button>
                        
                        {/* 页码显示 */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            const totalPages = pagination.totalPages;
                            const currentPage = pagination.currentPage;
                            
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNum}
                                variant={pageNum === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="h-8 w-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={!pagination.hasNextPage}
                          className="h-8 px-3"
                        >
                          {t('pagination.next')}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      
      case 'connected-accounts':
        return <ConnectedAccounts />
      
      case 'account-status':
        return (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-charcoal-800">
                <CheckCircle className="h-5 w-5 text-coral-600" />
                <span>{t('account_status')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">
                    {t('email_verified')}
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-700 font-medium">
                    {t('account_secure')}
                  </p>
                </div>
                <div className="text-center p-4 bg-coral-50 rounded-lg">
                  <User className="h-8 w-8 text-coral-600 mx-auto mb-2" />
                  <p className="text-sm text-coral-700 font-medium">
                    {t('profile_complete')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      
      case 'payment-history':
        return <PaymentHistory />
      
      default:
        return <SubscriptionInfo />
    }
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert>
          <AlertDescription>
            {t('please_login')}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 页面标题 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-coral-600 mb-2">
          {t('title')}
        </h1>
        <p className="text-charcoal-600">{t('description')}</p>
      </div>

      {/* 主要布局：左边栏 + 右侧内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧边栏 */}
        <div className="lg:col-span-1">
          {/* 个人信息框 */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-16 w-16 ring-3 ring-coral-100 mb-3">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback className="text-lg bg-coral-600 text-white">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-bold text-charcoal-800 mb-1">
                  {session.user.name || t('no_name_set')}
                </h2>
                <p className="text-sm text-charcoal-600 mb-3 break-all">{session.user.email}</p>
                
                {/* 验证状态单独一行 */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-200 rounded-full">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700 text-xs font-medium">
                      {t('verified')}
                    </span>
                  </div>
                </div>
                
                {/* 积分数值单独一行 */}
                <div className="w-full text-center mb-3">
                  <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Coins className="h-4 w-4 text-yellow-600" />
                      <span className="text-xs text-yellow-600 font-medium">{t('points')}</span>
                    </div>
                    {pointsLoading ? (
                      <div className="text-yellow-600 text-sm">{t('loading')}</div>
                    ) : (
                      <div className="text-yellow-800 font-bold text-lg">
                        {points?.toLocaleString() || 0}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 分类导航 */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-charcoal-800 text-base">
                <Settings className="h-4 w-4 text-coral-600" />
                <span>{t('menu')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-coral-50 ${
                        activeSection === section.id
                          ? 'bg-coral-50 text-coral-700 border-r-2 border-coral-500'
                          : 'text-charcoal-600 hover:text-coral-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* 右侧内容区域 */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}