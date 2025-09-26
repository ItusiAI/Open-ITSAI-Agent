"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { StripeCheckoutButton } from "./stripe-checkout-button"
import { SUBSCRIPTION_PRICE_IDS } from "@/lib/stripe"
import { DiscountPriceDisplay, RegularPriceDisplay } from "./discount-price-display"

export function PricingSection() {
  const locale = useLocale()
  const t = useTranslations("pricing")

  const plans = [
    {
      name: t("free.name"),
      price: t("free.price"),
      description: t("free.description"),
      features: [t("free.features.agents"), t("free.features.generations"), t("free.features.support")],
      cta: t("free.cta"),
      popular: false,
      priceId: null,
      planType: 'free',
    },
    {
      name: t("pro.name"),
      price: t("pro.price"),
      originalPrice: t("pro.originalPrice"),
      discountPercent: t("pro.discountPercent"),
      savings: t("pro.savings"),
      discountBadge: t("pro.discountBadge"),
      description: t("pro.description"),
      features: [
        t("pro.features.agents"),
        t("pro.features.generations"),
        t("pro.features.support"),
      ],
      cta: t("pro.cta"),
      popular: true,
      priceId: SUBSCRIPTION_PRICE_IDS.pro,
      planType: 'pro',
      hasDiscount: true,
    },
    {
      name: t("enterprise.name"),
      price: t("enterprise.price"),
      description: t("enterprise.description"),
      features: [
        t("enterprise.features.agents"),
        t("enterprise.features.custom"),
        t("enterprise.features.support"),
        t("enterprise.features.isolation"),
      ],
      cta: t("enterprise.cta"),
      popular: false,
      priceId: null,
      planType: 'enterprise',
    },
  ]

  return (
    <section id="pricing" className="relative py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{t("title")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular
                  ? plan.hasDiscount
                    ? "border-red-300 dark:border-red-600 shadow-xl scale-105 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30"
                    : "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-coral-600 dark:bg-coral-500 text-white">
                  {t("recommended")}
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>

                {/* 价格显示区域 */}
                <div className="mb-4">
                  {plan.hasDiscount ? (
                    <DiscountPriceDisplay
                      originalPrice={plan.originalPrice}
                      discountedPrice={plan.price}
                      discountPercent={plan.discountPercent}
                      savings={plan.savings}
                      discountBadge={plan.discountBadge}
                    />
                  ) : (
                    <RegularPriceDisplay price={plan.price} />
                  )}
                </div>

                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* 根据计划类型显示不同的按钮 */}
                {plan.planType === 'free' ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => window.location.href = '/auth/signup'}
                  >
                    {plan.cta}
                  </Button>
                ) : plan.planType === 'enterprise' ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => window.location.href = 'mailto:support@itsai-agent.com'}
                  >
                    {plan.cta}
                  </Button>
                ) : (
                  <StripeCheckoutButton
                    priceId={plan.priceId}
                    planType={plan.planType}
                    className={`w-full ${plan.popular ? "bg-coral-600 text-white hover:bg-coral-700" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </StripeCheckoutButton>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
