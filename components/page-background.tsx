"use client"

import { ReactNode } from 'react'
import { Cpu, Code, Zap, Sparkles } from 'lucide-react'

interface PageBackgroundProps {
  children: ReactNode
  className?: string
}

export function PageBackground({ children, className = "" }: PageBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* 主背景 - 纯色设计 */}
      <div className="absolute inset-0 bg-white dark:bg-charcoal-900" />

      {/* 次级背景层 - 杏色装饰 */}
      <div className="absolute inset-0 bg-almond-50/30 dark:bg-charcoal-800/30" />
      
      {/* 大型装饰圆形 */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-charcoal-400/10 dark:bg-charcoal-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-coral-400/15 dark:bg-coral-600/25 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-charcoal-300/8 dark:bg-charcoal-500/15 rounded-full blur-3xl animate-pulse delay-2000" />
      <div className="absolute bottom-10 right-1/3 w-64 h-64 bg-coral-300/12 dark:bg-coral-700/20 rounded-full blur-3xl animate-pulse delay-3000" />

      {/* 中型装饰圆形 */}
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-coral-200/20 dark:bg-coral-800/30 rounded-full blur-2xl animate-pulse delay-1500" />
      <div className="absolute top-3/4 left-1/6 w-32 h-32 bg-charcoal-300/15 dark:bg-charcoal-600/25 rounded-full blur-xl animate-pulse delay-2500" />
      
      {/* 浮动装饰元素 */}
      <div className="absolute top-32 left-1/4 animate-bounce delay-300">
        <div className="w-8 h-8 bg-charcoal-400/20 dark:bg-charcoal-500/30 rounded-lg rotate-45" />
      </div>
      <div className="absolute top-48 right-1/3 animate-bounce delay-700">
        <Cpu className="w-6 h-6 text-coral-500/60 dark:text-coral-400/70" />
      </div>
      <div className="absolute top-2/3 left-1/3 animate-bounce delay-500">
        <Code className="w-7 h-7 text-charcoal-500/60 dark:text-charcoal-400/70" />
      </div>
      <div className="absolute top-1/4 right-1/4 animate-bounce delay-1000">
        <Zap className="w-5 h-5 text-coral-600/50 dark:text-coral-300/60" />
      </div>
      <div className="absolute bottom-1/3 right-1/6 animate-bounce delay-1200">
        <Sparkles className="w-6 h-6 text-charcoal-600/50 dark:text-charcoal-300/60" />
      </div>
      <div className="absolute bottom-1/4 left-1/5 animate-bounce delay-800">
        <div className="w-6 h-6 bg-coral-400/30 dark:bg-coral-500/40 rounded-full" />
      </div>
      
      {/* 网格背景 - 可选 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
      
      {/* 内容区域 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
