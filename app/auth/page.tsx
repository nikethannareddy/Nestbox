"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthForms } from "@/components/auth/auth-forms"
import { useAuth } from "@/components/auth/auth-provider"

export default function AuthPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const { user, isAuthenticated } = useAuth()

  // Set isClient to true on mount (client-side only)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isClient && isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard'
      router.push(redirectPath)
    }
  }, [isClient, isAuthenticated, user, router])

  const handleAuthSuccess = (userData: any) => {
    if (isClient) {
      const redirectPath = userData?.role === 'admin' ? '/admin' : '/dashboard'
      router.push(redirectPath)
    }
  }

  // Show loading state while checking auth status
  if (!isClient || (isClient && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">Loading...</div>
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

        <AuthForms onAuthSuccess={handleAuthSuccess} initialMode="login" />

        <div className="mt-6 text-center">
          <a href="/" className="text-primary hover:text-primary/80 text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
