"use client"

import { NestBoxLogo } from "@/components/nestbox-logo"
import { Button } from "@/components/ui/button"
import { Shield, User, LogOut, Menu } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

export function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      // Force a full page reload to ensure all auth state is cleared
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/map', label: 'Explore' },
    { href: '/learn', label: 'Build' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="border-b border-border/20 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <NestBoxLogo />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className="inline-block">
                <Button 
                  variant="ghost" 
                  className={`${pathname === href ? 'text-emerald-700' : 'text-muted-foreground hover:text-primary'} hover:bg-primary/10`}
                >
                  {label}
                </Button>
              </Link>
            ))}
            
            {isAuthenticated && user?.role === "admin" && (
              <Link href="/admin" className="inline-block">
                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            
            <div className="h-6 w-px bg-border/40 mx-2"></div>
            
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/auth">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 hover:bg-primary/10 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border/20">
            <nav className="flex flex-col gap-2">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${pathname === href ? 'bg-primary/10 text-primary' : ''}`}
                  >
                    {label}
                  </Button>
                </Link>
              ))}
              
              {isAuthenticated && user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Link href="/auth">
                  <Button className="w-full">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
