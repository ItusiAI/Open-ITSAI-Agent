"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useLocale, useTranslations } from "next-intl"
import { HelpCircle, Settings, Lightbulb } from "lucide-react"

export function FAQSection() {
  const locale = useLocale()
  const t = useTranslations("faq")

  const categories = [
    {
      title: t("categories.usage"),
      icon: HelpCircle,
      questions: [
        {
          question: t("usage.howToStart.question"),
          answer: t("usage.howToStart.answer"),
        },
        {
          question: t("usage.voiceQuality.question"),
          answer: t("usage.voiceQuality.answer"),
        },
        {
          question: t("usage.contentOwnership.question"),
          answer: t("usage.contentOwnership.answer"),
        },
        {
          question: t("usage.dataPrivacy.question"),
          answer: t("usage.dataPrivacy.answer"),
        },
      ],
    },
    {
      title: t("categories.pricing"),
      icon: Lightbulb,
      questions: [
        {
          question: t("pricing.pointsExpiry.question"),
          answer: t("pricing.pointsExpiry.answer"),
        },
        {
          question: t("pricing.upgradeAnytime.question"),
          answer: t("pricing.upgradeAnytime.answer"),
        },
        {
          question: t("pricing.enterpriseFeatures.question"),
          answer: t("pricing.enterpriseFeatures.answer"),
        },
      ],
    },
  ]

  return (
    <section className="relative py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {categories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-background/50 backdrop-blur-sm rounded-2xl p-8 border border-yellow-200/30 dark:border-yellow-600/30 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-coral-600 dark:bg-coral-500 rounded-lg flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`${categoryIndex}-${index}`}
                    className="border border-yellow-200/50 dark:border-yellow-600/50 rounded-xl px-6 bg-gradient-to-r from-yellow-50/30 to-orange-50/30 dark:from-yellow-900/20 dark:to-orange-900/20 hover:from-yellow-50/50 hover:to-orange-50/50 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left font-semibold text-orange-700 hover:text-orange-800 py-4">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
