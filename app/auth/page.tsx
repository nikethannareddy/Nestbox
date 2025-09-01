"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthForms } from "@/components/auth/auth-forms"
import { useAuth } from "@/components/auth/auth-provider"

export default function AuthPage() {
  const { isAuthenticated, user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") // Check for signup mode

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      console.log("[v0] Redirecting authenticated user:", user.email, "Role:", user.role)

      if (user.role === "admin") {
        console.log("[v0] Redirecting admin to /admin")
        router.push("/admin")
      } else {
        console.log("[v0] Redirecting volunteer to /dashboard")
        router.push("/dashboard")
      }
    }
  }, [isAuthenticated, user, loading, router])

  const handleAuthSuccess = () => {
    // Redirects are now handled by the useEffect above
    console.log("[v0] Auth success callback - redirects handled by useEffect")
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Welcome to NestBox</h1>
          <p className="text-muted-foreground">Protecting birds, one box at a time.</p>
        </div>

        <AuthForms onAuthSuccess={handleAuthSuccess} initialMode={mode} />

        <div className="mt-6 text-center">
          <a href="/" className="text-primary hover:text-primary/80 text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
