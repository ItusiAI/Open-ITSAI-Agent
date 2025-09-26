"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ShieldX } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

export function UnauthorizedContent() {
  const [isMounted, setIsMounted] = useState(false)
  const params = useParams()
  const t = useTranslations('unauthorized')
  const locale = useLocale()
  const paramLocale = params.locale as string

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 调试信息
  console.log('Unauthorized Page - Current locale (useLocale):', locale)
  console.log('Unauthorized Page - Param locale:', paramLocale)
  console.log('Unauthorized Page - Title translation:', t('title'))
  console.log('Unauthorized Page - Description translation:', t('description'))
  console.log('Unauthorized Page - Is mounted:', isMounted)

  if (!isMounted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ShieldX className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldX className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              {t('errorMessage')}
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href={`/${paramLocale || locale}`}>{t('backToHome')}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/${paramLocale || locale}/auth/signin`}>{t('signInAgain')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 