"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { VolunteerDashboard } from "@/components/volunteer-dashboard"
import { useAuth } from "@/components/auth/auth-provider"
import { AppHeader } from "@/components/layout/header"

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth")
      return
    }
    
    // Redirect admin users to the admin dashboard
    if (!loading && isAuthenticated && user?.role === "admin") {
      router.push("/admin")
    }
  }, [isAuthenticated, user, router, loading])

  if (loading || !isAuthenticated || !user) {
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
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <VolunteerDashboard user={user} />
      </main>
    </div>
  )
}
