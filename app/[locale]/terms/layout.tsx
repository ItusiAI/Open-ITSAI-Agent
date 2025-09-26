import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

interface TermsLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  // 验证 locale 是否有效
  const locales = ['en', 'zh']
  if (!locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'metadata.terms' })
  
  return {
    title: t('title'),
    description: t('description')
  }
}

export default function TermsLayout({ children, params: { locale } }: TermsLayoutProps) {
  // 验证 locale 是否有效
  const locales = ['en', 'zh']
  if (!locales.includes(locale)) {
    notFound()
  }

  return children
} 