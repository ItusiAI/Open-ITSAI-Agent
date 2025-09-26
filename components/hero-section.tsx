"use client"

import { Badge } from "@/components/ui/badge"
import { Zap, Code, Cpu, Sparkles } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "next/navigation"

export function HeroSection() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("hero")

  // 处理标题分行 - 从翻译文件获取
  const titleText = t("title")
  const titleLines = titleText.split('\n')

  return (
    <section id="home" className="relative pt-24 pb-12 md:pt-32 md:pb-20">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* 顶部标签 */}
          <div className="flex justify-center mb-6">
            <Badge
              variant="outline"
              className="px-4 py-2 text-sm font-medium bg-almond-100 border-almond-200 text-charcoal-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t("badge")}
            </Badge>
          </div>

          {/* 主标题 - 使用品牌渐变色 */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.2] sm:leading-[1.2] md:leading-[1.2] lg:leading-[1.2] xl:leading-[1.2]">
              {titleLines.map((line: string, index: number) => (
                <div
                  key={index}
                  className="text-coral-600 py-1 px-1"
                  style={{
                    display: "block",
                    minHeight: "1.2em",
                    overflow: "visible",
                  }}
                >
                  {line}
                </div>
              ))}
            </h1>
          </div>

          {/* 副标题 */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-4xl mx-auto">
            {t("description")}
          </p>

          {/* 服务特性标签 */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: Zap, text: t("features.readyToUse") },
              { icon: Cpu, text: t("features.multiScenario") },
              { icon: Code, text: t("features.professionalOutput") },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 bg-almond-100/80 rounded-full border border-almond-200/50 hover:border-coral-300/50 transition-colors"
              >
                <item.icon className="w-4 h-4 text-coral-600" />
                <span className="text-sm font-medium text-charcoal-700">{item.text}</span>
              </div>
            ))}
          </div>




        </div>
      </div>

      {/* 自定义动画 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
