"use client"

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function OtherPosts() {
  const params = useParams()
  const t = useTranslations('blogPage.otherPosts')
  const locale = params.locale as string

  return (
    <section className="py-16 bg-almond-50 dark:bg-charcoal-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-coral-600 dark:text-coral-400">
            {t('title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* 第一篇文章 - 音频总结智能体是如何工作的 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-charcoal-800/95">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="border-orange-200 text-orange-600">
                  {t('post1.category')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t('post1.date')}
                </span>
              </div>
              <Link href={`/${locale}/blog/audio-summary-how-it-works`} target="_blank" rel="noopener noreferrer" className="block">
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors duration-300 cursor-pointer hover:text-orange-600 line-clamp-2">
                  {t('post1.title')}
                </CardTitle>
              </Link>
              <CardDescription className="text-muted-foreground leading-relaxed mt-3 text-sm line-clamp-3">
                {t('post1.excerpt')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href={`/${locale}/blog/audio-summary-how-it-works`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="group p-0 text-orange-600 dark:text-orange-400 hover:text-white hover:bg-orange-600 dark:hover:bg-orange-500 px-4 py-2 rounded-lg transition-all duration-300">
                  {t('readMore')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 第二篇文章 - ITSAI Agent提供哪些声音AI智能体 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-charcoal-800/95">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="border-orange-200 text-orange-600">
                  {t('post2.category')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t('post2.date')}
                </span>
              </div>
              <Link href={`/${locale}/blog/ai-agent-types`} target="_blank" rel="noopener noreferrer" className="block">
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors duration-300 cursor-pointer hover:text-orange-600 line-clamp-2">
                  {t('post2.title')}
                </CardTitle>
              </Link>
              <CardDescription className="text-muted-foreground leading-relaxed mt-3 text-sm line-clamp-3">
                {t('post2.excerpt')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href={`/${locale}/blog/ai-agent-types`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="group p-0 text-orange-600 dark:text-orange-400 hover:text-white hover:bg-orange-600 dark:hover:bg-orange-500 px-4 py-2 rounded-lg transition-all duration-300">
                  {t('readMore')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 第三篇文章 - 什么是AI智能体 */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm hover:bg-white/95 dark:hover:bg-charcoal-800/95">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="border-orange-200 text-orange-600">
                  {t('post3.category')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t('post3.date')}
                </span>
              </div>
              <Link href={`/${locale}/blog/ai-agent`} target="_blank" rel="noopener noreferrer" className="block">
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors duration-300 cursor-pointer hover:text-orange-600 line-clamp-2">
                  {t('post3.title')}
                </CardTitle>
              </Link>
              <CardDescription className="text-muted-foreground leading-relaxed mt-3 text-sm line-clamp-3">
                {t('post3.excerpt')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href={`/${locale}/blog/ai-agent`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="group p-0 text-orange-600 dark:text-orange-400 hover:text-white hover:bg-orange-600 dark:hover:bg-orange-500 px-4 py-2 rounded-lg transition-all duration-300">
                  {t('readMore')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 