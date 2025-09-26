import type React from "react"
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  
  const t = await getTranslations({ locale, namespace: 'profile' })
  
  return {
    title: `${t('title')} - ITSAI Agent`,
    description: t('description'),
  }
}

export default function ProfileLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 