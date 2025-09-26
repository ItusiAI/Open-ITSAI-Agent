import type React from "react"
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  
  const t = await getTranslations({ locale, namespace: 'forgot_password' })
  
  return {
    title: `${t('meta_title')} - ITSAI Agent`,
    description: t('meta_description'),
  }
}

export default function ForgotPasswordLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 