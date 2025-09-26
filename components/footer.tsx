"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Github, Twitter, Linkedin, Globe, Mail, Send } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import Link from 'next/link'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { SiGithub } from 'react-icons/si'

export function Footer() {
  const locale = useLocale()
  const t = useTranslations("footer")
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  // 获取当前年份
  const currentYear = new Date().getFullYear()

  const switchLocale = (newLocale: string) => {
    if (!pathname) return
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    } else {
      // 如果当前页面没有该元素，跳转到首页
      const homePath = getLocalizedPath("/")
      router.push(`${homePath}#${sectionId}`)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          locale: locale,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(true)
        setEmail("")
        setMessage(t('newsletter.subscribe.successMessage'))
        // 3秒后重置状态
        setTimeout(() => {
          setIsSubscribed(false)
          setMessage("")
        }, 5000)
      } else {
        setMessage(data.error || t('newsletter.subscribe.subscribeError'))
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setMessage(t('newsletter.subscribe.networkError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="relative bg-charcoal-900 border-t border-charcoal-700/50">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-charcoal-900/50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-coral-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-charcoal-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div className="space-y-8">
            {/* Brand */}
            <div className="space-y-4">
              <Link href={getLocalizedPath("/")} className="flex items-center space-x-3">
                <div className="relative w-8 h-8">
                  <Image
                    src="/logo.png"
                    alt="ITSAI Agent Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold text-coral-400">
                  ITSAI Agent
                </span>
              </Link>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                {t("description")}
              </p>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200 text-lg">{t("services.title")}</h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="text-slate-400 hover:text-orange-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300" />
                    {t("services.features")}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="text-slate-400 hover:text-orange-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300" />
                    {t("services.pricing")}
                  </button>
                </li>
                <li>
                  <Link
                    href={getLocalizedPath("/blog")}
                    className="text-slate-400 hover:text-orange-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-orange-400 rounded-full mr-3 group-hover:w-2 transition-all duration-300" />
                    {t("services.blog")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200 text-lg flex items-center">
                <Mail className="w-5 h-5 mr-2 text-orange-400" />
                {t("newsletter.title")}
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t("newsletter.description")}
              </p>
            </div>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:border-orange-400 focus:ring-orange-400/20 pr-12"
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-coral-600 hover:bg-coral-700 text-white border-0 transition-all duration-300 transform hover:scale-105"
                disabled={isLoading || isSubscribed}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {locale === 'zh' ? '订阅中...' : 'Subscribing...'}
                  </>
                ) : isSubscribed ? (
                  <>
                    <span className="animate-pulse">{t("newsletter.success")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t("newsletter.subscribe_button")}
                  </>
                )}
              </Button>

              {/* 消息显示 */}
              {message && (
                <div className={`text-sm text-center p-2 rounded ${
                  isSubscribed 
                    ? 'text-green-400 bg-green-400/10' 
                    : 'text-red-400 bg-red-400/10'
                }`}>
                  {message}
                </div>
              )}
            </form>

            {/* Social Links */}
            <div className="pt-4">
              <div className="flex space-x-3">
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700/50 mt-4 pt-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-2 md:mb-0">
            <p className="text-slate-500 text-sm">
              © {currentYear} {t("copyright")}
            </p>
          </div>

          {/* Social Links & Language Switcher */}
          <div className="flex items-center space-x-4">
            {/* Social Links */}
            <div className="flex space-x-3">
              <a 
                href="https://x.com/zyailive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-orange-400 transition-all duration-300 transform hover:scale-110"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com/ItusiAI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-orange-400 transition-all duration-300 transform hover:scale-110"
              >
                <SiGithub className="h-5 w-5" />
              </a>
            </div>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-orange-400 hover:bg-slate-800/50 transition-all duration-300">
                  <Globe className="h-4 w-4 mr-2" />
                  {locale === "zh" ? "中文" : "English"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-600">
                <DropdownMenuItem 
                  onClick={() => switchLocale("zh")}
                  className="text-slate-300 hover:text-orange-400 hover:bg-slate-700/50"
                >
                  中文
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => switchLocale("en")}
                  className="text-slate-300 hover:text-orange-400 hover:bg-slate-700/50"
                >
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </footer>
  )
}
