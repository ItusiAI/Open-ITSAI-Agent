import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

const locales = ['en', 'zh']

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale
  
  if (!locales.includes(locale)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'metadata.cookies' })
  
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default function CookieLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale)) {
    notFound()
  }

  return children
} 