"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Sun, Moon, Menu, X, Globe, User, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import Image from "next/image"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("navbar")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

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
      const homePath = getLocalizedPath("/")
      router.push(`${homePath}#${sectionId}`)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                <Image
                  src="/logo.png"
                  alt="ITSAI Agent Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-coral-600">
                ITSAI Agent
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-charcoal-600 hover:text-coral-600 transition-colors duration-300 font-medium hover:scale-105 transform"
            >
              {t("home")}
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-charcoal-600 hover:text-coral-600 transition-colors duration-300 font-medium hover:scale-105 transform"
            >
              {t("features")}
            </button>
            <Link
              href={getLocalizedPath("/agent")}
              className="text-charcoal-600 hover:text-coral-600 transition-colors duration-300 font-medium hover:scale-105 transform"
            >
              {t("agents")}
            </Link>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-charcoal-600 hover:text-coral-600 transition-colors duration-300 font-medium hover:scale-105 transform"
            >
              {t("pricing")}
            </button>
            <Link
              href={getLocalizedPath("/blog")}
              className="text-charcoal-600 hover:text-coral-600 transition-colors duration-300 font-medium hover:scale-105 transform"
            >
              {t("blog")}
            </Link>
          </div>

          {/* Right side controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 transition-all duration-300">
                  <Globe className="h-4 w-4 mr-2 text-coral-500" />
                  {locale === "zh" ? "中" : "EN"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => switchLocale("zh")} className="hover:bg-coral-50 hover:text-coral-600">中文</DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale("en")} className="hover:bg-coral-50 hover:text-coral-600">English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            {mounted && (
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 transition-all duration-300">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-coral-500" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-coral-500" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Auth Section */}
            {status === "loading" ? (
              <div className="w-8 h-8 animate-pulse bg-almond-200 rounded-full" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 transition-all duration-300">
                    <User className="h-4 w-4 text-coral-500" />
                    <span className="hidden lg:inline">{session.user?.name || session.user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild className="hover:bg-coral-50 hover:text-coral-600">
                    <Link href={getLocalizedPath("/profile")}>
                      <User className="mr-2 h-4 w-4 text-coral-500" />
                      {t("profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-coral-50 hover:text-coral-600">
                    <LogOut className="mr-2 h-4 w-4 text-coral-500" />
                    {t("signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild className="text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 transition-all duration-300">
                  <Link href={getLocalizedPath("/auth/signin")}>{t("signIn")}</Link>
                </Button>
                <Button className="bg-coral-600 text-white hover:bg-coral-700 transition-all duration-300 brand-shadow hover:scale-105 transform" asChild>
                  <Link href={getLocalizedPath("/auth/signup")}>{t("signUp")}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 transition-all duration-300">
              {isMenuOpen ? <X className="h-6 w-6 text-coral-500" /> : <Menu className="h-6 w-6 text-coral-500" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <button
                onClick={() => {
                  scrollToSection("home")
                  setIsMenuOpen(false)
                }}
                className="block px-3 py-2 text-base font-medium text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-all duration-300"
              >
                {t("home")}
              </button>
              <button
                onClick={() => {
                  scrollToSection("features")
                  setIsMenuOpen(false)
                }}
                className="block px-3 py-2 text-base font-medium text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-all duration-300"
              >
                {t("features")}
              </button>
              <Link
                href={getLocalizedPath("/agent")}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-all duration-300"
              >
                {t("agents")}
              </Link>
              <button
                onClick={() => {
                  scrollToSection("pricing")
                  setIsMenuOpen(false)
                }}
                className="block px-3 py-2 text-base font-medium text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-all duration-300"
              >
                {t("pricing")}
              </button>
              <Link
                href={getLocalizedPath("/blog")}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-charcoal-600 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-all duration-300"
              >
                {t("blog")}
              </Link>

              <div className="border-t pt-4 space-y-2">
                {/* Auth Section Mobile */}
                {session ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-foreground/60">
                      {session.user?.name || session.user?.email}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                      <Link href={getLocalizedPath("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        {t("profile")}
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("signOut")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link href={getLocalizedPath("/auth/signin")}>{t("signIn")}</Link>
                    </Button>
                    <Button className="w-full bg-coral-600 text-white hover:bg-coral-700 transition-all duration-300" asChild>
                      <Link href={getLocalizedPath("/auth/signup")}>{t("signUp")}</Link>
                    </Button>
                  </div>
                )}

                {/* Controls Mobile */}
                <div className="flex items-center space-x-2 px-3 py-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300">
                        <Globe className="h-4 w-4 mr-2 text-orange-500" />
                        {locale === "zh" ? "中" : "EN"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => switchLocale("zh")} className="hover:bg-orange-50 hover:text-orange-600">中文</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => switchLocale("en")} className="hover:bg-orange-50 hover:text-orange-600">English</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {mounted && (
                    <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300">
                      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
                      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-orange-500" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
