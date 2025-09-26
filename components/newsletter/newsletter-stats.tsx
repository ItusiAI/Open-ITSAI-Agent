"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Mail, Globe, Calendar, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface Subscription {
  id: string
  email: string
  locale: string
  isActive: boolean
  subscribedAt: string
  unsubscribedAt: string | null
}

interface Stats {
  total: number
  zh: number
  en: number
}

export function NewsletterStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/newsletter/subscribe?action=stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError('获取统计数据失败')
      console.error('Error fetching stats:', err)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/newsletter/subscribe?action=list')
      if (!response.ok) throw new Error('Failed to fetch subscriptions')
      const data = await response.json()
      setSubscriptions(data.subscriptions)
    } catch (err) {
      setError('获取订阅列表失败')
      console.error('Error fetching subscriptions:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    await Promise.all([fetchStats(), fetchSubscriptions()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive)
  const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总订阅数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              活跃订阅用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">中文订阅</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.zh || 0}</div>
            <p className="text-xs text-muted-foreground">
              中文用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">英文订阅</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.en || 0}</div>
            <p className="text-xs text-muted-foreground">
              英文用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总注册数</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              包括已取消订阅
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 订阅列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>订阅列表</CardTitle>
            <CardDescription>所有邮件订阅用户的详细信息</CardDescription>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">
                活跃订阅 ({activeSubscriptions.length})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                已取消订阅 ({inactiveSubscriptions.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              <SubscriptionTable subscriptions={activeSubscriptions} />
            </TabsContent>
            
            <TabsContent value="inactive" className="space-y-4">
              <SubscriptionTable subscriptions={inactiveSubscriptions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function SubscriptionTable({ subscriptions }: { subscriptions: Subscription[] }) {
  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无数据
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>邮箱地址</TableHead>
            <TableHead>语言</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>订阅时间</TableHead>
            <TableHead>取消订阅时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                {subscription.email}
              </TableCell>
              <TableCell>
                <Badge variant={subscription.locale === 'zh' ? 'default' : 'secondary'}>
                  {subscription.locale === 'zh' ? '中文' : 'English'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={subscription.isActive ? 'default' : 'destructive'}>
                  {subscription.isActive ? '活跃' : '已取消'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {format(new Date(subscription.subscribedAt), 'yyyy-MM-dd HH:mm')}
                </div>
              </TableCell>
              <TableCell>
                {subscription.unsubscribedAt ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {format(new Date(subscription.unsubscribedAt), 'yyyy-MM-dd HH:mm')}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 