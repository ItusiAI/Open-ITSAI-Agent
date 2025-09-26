"use client"

import { useTranslations } from "next-intl"
import { Check, Mic, FileText } from "lucide-react"
import { useState, useEffect } from "react"

export function FeaturesSection() {
  const t = useTranslations("features")

  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: FileText,
      title: t("contentSummaryAgent.title"),
      description: t("contentSummaryAgent.description"),
      image: "/gongneng1.png",
    },
    {
      icon: Mic,
      title: t("podcastAgent.title"),
      description: t("podcastAgent.description"),
      image: "/gongneng2.png",
    },
  ]

  // 自动播放功能
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [features.length])

  const IconComponent = features[activeFeature].icon

  return (
    <section id="features" className="relative py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 左侧功能列表 */}
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-6 p-6 rounded-2xl transition-all duration-500 cursor-pointer ${
                    activeFeature === index
                      ? "bg-almond-100 border-2 border-coral-200 brand-shadow"
                      : "bg-background/50 border border-border/50 hover:bg-almond-50/30"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  {/* 图标 */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeFeature === index
                        ? "bg-coral-600 text-white brand-shadow"
                        : index < activeFeature
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index < activeFeature ? (
                      <Check className="w-6 h-6" />
                    ) : activeFeature === index ? (
                      <feature.icon className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                        activeFeature === index ? "text-charcoal-700" : "text-foreground"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-base leading-relaxed transition-colors duration-300 ${
                        activeFeature === index ? "text-charcoal-600" : "text-muted-foreground"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 右侧视觉展示 */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden brand-shadow-lg bg-almond-50/50 border border-almond-200/50 backdrop-blur-sm">
                {/* 装饰性背景 */}
                <div className="absolute inset-0 bg-almond-100/20" />

                {/* 主要内容区域 */}
                <div className="relative p-8 min-h-[400px] flex items-center justify-center">
                  {/* 3D效果容器 */}
                  <div className="relative transform transition-all duration-700 hover:scale-105 w-full max-w-md">
                    {/* 主图片 - 长方形对称布局 */}
                    <div className="relative rounded-xl overflow-hidden shadow-xl aspect-[4/3] bg-almond-100 flex items-center justify-center">
                      <img
                        src={features[activeFeature].image || "/placeholder.svg"}
                        alt={features[activeFeature].title}
                        className="w-full h-full object-cover transition-opacity duration-500"
                      />

                      {/* 覆盖层效果 */}
                      <div className="absolute inset-0 bg-black/20" />
                      
                      {/* 中央图标展示 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                          <IconComponent className="w-10 h-10 text-charcoal-700" />
                        </div>
                      </div>
                    </div>

                    {/* 浮动标签 */}
                    <div className="absolute -top-4 -right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 brand-shadow border border-almond-200/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        <span className="text-xs font-medium text-charcoal-700">
                          {t("liveGeneration")}
                        </span>
                      </div>
                    </div>

                    {/* 底部信息卡片 */}
                    <div className="absolute -bottom-4 -left-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 brand-shadow border border-almond-200/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-coral-600 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-charcoal-700">{features[activeFeature].title}</div>
                          <div className="text-xs text-charcoal-500">{t("aiAgent")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 进度指示器 */}
              <div className="flex justify-center mt-6 gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeFeature === index ? "bg-coral-600 brand-shadow" : "bg-muted hover:bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
