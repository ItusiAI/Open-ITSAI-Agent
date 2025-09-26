"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Voicemail, Clapperboard, ArrowRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname } from "next/navigation"

export function AgentTypesSection() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("agentTypes")

  const agents = [
    {
      icon: Mic,
      title: t("podcastAgent.title"),
      description: t("podcastAgent.description"),
    },
    {
      icon: Voicemail,
      title: t("voiceAgent.title"),
      description: t("voiceAgent.description"),
    },
    {
      icon: Clapperboard,
      title: t("videoAgent.title"),
      description: t("videoAgent.description"),
    },
  ]

  return (
    <section id="agents" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {agents.map((agent, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <agent.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">{agent.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-6 leading-relaxed">{agent.description}</CardDescription>
                <Button variant="ghost" className="group">
                  {t("learnMore")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
