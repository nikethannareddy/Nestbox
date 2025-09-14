"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthForms } from "@/components/auth/auth-forms"
import { useAuth } from "@/components/auth/auth-provider"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const { user, isAuthenticated } = useAuth()

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard'
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router])

  const handleAuthSuccess = (userData: any) => {
    // This will be called after successful authentication
    const redirectPath = userData?.role === 'admin' ? '/admin' : '/dashboard'
    router.push(redirectPath)
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
