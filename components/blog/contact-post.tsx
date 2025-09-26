"use client"

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, User, Twitter, Mail } from 'lucide-react'
import Link from 'next/link'

export function ContactPost() {
  const t = useTranslations('blogPage.contactPost')

  return (
    <article className="mb-16">
      <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-charcoal-800">
        <div className="bg-coral-600 dark:bg-coral-700 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-sm text-white/90">
              <Calendar className="w-4 h-4 mr-1" />
              2025.7.1
            </div>
            <div className="flex items-center text-sm text-white/90">
              <User className="w-4 h-4 mr-1" />
              {t('author')}
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4 text-white">
            {t('title')}
          </h2>
          <p className="text-lg text-white/90 mb-6">
            {t('description')}
          </p>
        </div>
        
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            <div className="mb-12">
              <h3 className="text-2xl font-semibold mb-6 text-center text-coral-600 dark:text-coral-400">
                {t('contactMethods.title')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Twitter */}
                <div className="text-center p-6 rounded-lg bg-charcoal-50 dark:bg-charcoal-700 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-charcoal-600 dark:bg-charcoal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Twitter className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('contactMethods.twitter.title')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('contactMethods.twitter.description')}
                  </p>
                  <Link
                    href="https://x.com/itusi2024"
                    target="_blank"
                    className="text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-800 dark:hover:text-charcoal-100 font-medium"
                  >
                    {t('contactMethods.twitter.handle')}
                  </Link>
                </div>

                {/* Email */}
                <div className="text-center p-6 rounded-lg bg-coral-50 dark:bg-coral-900/30 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-coral-600 dark:bg-coral-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">{t('contactMethods.email.title')}</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t('contactMethods.email.description')}
                  </p>
                  <Link
                    href="mailto:app@itusi.cn"
                    className="text-coral-600 dark:text-coral-400 hover:text-coral-800 dark:hover:text-coral-300 font-medium"
                  >
                    {t('contactMethods.email.address')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  )
} 