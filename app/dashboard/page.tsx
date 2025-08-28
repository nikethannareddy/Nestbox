"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { VolunteerDashboard } from "@/components/volunteer-dashboard"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { NestBoxLogo } from "@/components/nestbox-logo"
import { User, LogOut } from "lucide-react"

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-emerald-900">Loading...</h2>
          <p className="text-emerald-700">Please wait while we load your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="hover:opacity-80 transition-opacity">
              <NestBoxLogo />
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/map" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                Explore
              </a>
              <a href="/learn" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                Build
              </a>
              <a href="/nest-check" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                Monitor
              </a>
              <a href="/about" className="text-emerald-700 hover:text-emerald-900 transition-colors">
                About
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <a href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  {user.firstName}
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user.role === "volunteer" || user.role === "admin" ? (
          <VolunteerDashboard />
        ) : (
          <div className="text-center py-16">
            <h2 className="font-serif text-2xl font-bold mb-4 text-emerald-900">Welcome to NestBox!</h2>
            <p className="text-emerald-700 mb-8">
              {user.role === "sponsor"
                ? "Explore sponsorship opportunities and track your conservation impact."
                : "Discover nest boxes in your community and learn about local birds."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <a href="/map">Explore Map</a>
              </Button>
              <Button
                variant="outline"
                asChild
                className="bg-white/80 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <a href="/learn">Learn More</a>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
