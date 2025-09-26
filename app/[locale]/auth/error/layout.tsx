import type React from "react"
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  
  const t = await getTranslations({ locale, namespace: 'auth' })
  
  return {
    title: `${t('error_title')} - ITSAI Agent`,
    description: t('error_description'),
  }
}

export default function AuthErrorLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 