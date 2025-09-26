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
    title: `${t('signup_title')} - ITSAI Agent`,
    description: t('signup_description'),
  }
}

export default function SignUpLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 