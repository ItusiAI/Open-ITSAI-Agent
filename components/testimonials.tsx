"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface Testimonial {
  id: number
  name: string
  title: string
  content: string
  rating: number
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Alex Johnson",
    title: "播客主持人",
    content: "ITSAI Agent 的播客总结功能太棒了！我可以快速生成每期节目的精华摘要，为听众提供更好的内容导航。",
    rating: 5,
    avatar: "/avatars/alex.jpg"
  },
  {
    id: 2,
    name: "Sarah Miller",
    title: "Content Creator",
    content: "The AI video generation feature is a game-changer! I can create professional-quality videos for my podcast episodes in minutes, not hours.",
    rating: 5,
    avatar: "/avatars/sarah.jpg"
  },
  {
    id: 3,
    name: "李明",
    title: "音频制作人",
    content: "作为音频制作人，我每天使用 ITSAI Agent 来处理播客音频，自动生成字幕和章节标记，工作效率提升了5倍。",
    rating: 5,
    avatar: "/avatars/liming.jpg"
  },
  {
    id: 4,
    name: "David Chen",
    title: "Video Producer",
    content: "The AI-powered video editing capabilities are outstanding. It automatically creates highlight reels from my podcast recordings with perfect timing.",
    rating: 5,
    avatar: "/avatars/david.jpg"
  },
  {
    id: 5,
    name: "王小雨",
    title: "播客运营经理",
    content: "ITSAI Agent 帮助我们的播客团队自动生成节目摘要、社交媒体内容和视频片段，内容分发效率提升了300%。",
    rating: 5,
    avatar: "/avatars/wangxiaoyu.jpg"
  },
  {
    id: 6,
    name: "Michael Rodriguez",
    title: "Podcast Analytics Specialist",
    content: "Perfect for podcast workflow automation! The AI generates accurate transcripts, summaries, and even suggests optimal clip segments for social media.",
    rating: 5,
    avatar: "/avatars/michael.jpg"
  }
]

export function Testimonials() {
  const t = useTranslations('testimonials')
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">{t('title')}</h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            {t('description')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm border-0 shadow-2xl ring-1 ring-slate-200/50 dark:ring-charcoal-600/50">
            <CardContent className="p-12">
              {/* 星级评分 */}
              <div className="flex justify-center mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* 评价内容 */}
              <blockquote className="text-center mb-8">
                <p className="text-2xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  "{currentTestimonial.content}"
                </p>
              </blockquote>

              {/* 用户信息 */}
              <div className="flex items-center justify-center space-x-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-slate-600 dark:text-slate-200 font-semibold text-lg">
                      {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{currentTestimonial.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 导航控件 */}
          <div className="flex items-center justify-center mt-8 space-x-6">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full w-12 h-12 border-slate-300 bg-white hover:bg-slate-50 text-slate-600 dark:border-white/30 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white backdrop-blur-sm transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* 指示器 */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-orange-500 scale-125'
                      : 'bg-slate-300 hover:bg-slate-400 dark:bg-white/40 dark:hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full w-12 h-12 border-slate-300 bg-white hover:bg-slate-50 text-slate-600 dark:border-white/30 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white backdrop-blur-sm transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
} 