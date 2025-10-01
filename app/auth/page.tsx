"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import Link from "next/link"
import { AuthForms } from "@/components/auth/auth-forms"
import { useAuth } from "@/components/auth/auth-provider"

export default function AuthPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()

  // Set isClient to true on mount (client-side only)
  useEffect(() => {
    setIsClient(true)
    
    // Clean up the URL if it has redirect parameters
    const redirectedFrom = searchParams.get('redirectedFrom')
    if (redirectedFrom && window.history.replaceState) {
      // Remove the query parameters without adding to history
      window.history.replaceState({}, document.title, pathname)
    }
  }, [pathname, searchParams])

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isClient && !isLoading && isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard'
      router.replace(redirectPath)
    }
  }, [isClient, isAuthenticated, user, isLoading, router])

  const handleAuthSuccess = (userData: any) => {
    if (isClient) {
      const redirectPath = userData?.role === 'admin' ? '/admin' : '/dashboard'
      router.replace(redirectPath)
    }
  }

  // Show loading state while checking auth status
  if (!isClient || isLoading) {
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
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        <AuthForms onAuthSuccess={handleAuthSuccess} />
        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              // Force a hard redirect to home page, bypassing any client-side routing
              if (typeof window !== 'undefined') {
                // Clear any auth state
                const itemsToRemove = [
                  'sb-pquafubwzmdmesghxxyq-auth-token',
                  'sb-pquafubwzmdmesghxxyq-auth-token-expires-at',
                  'sb-pquafubwzmdmesghxxyq-refresh-token',
                  'sb-pquafubwzmdmesghxxyq-user'
                ];
                itemsToRemove.forEach(item => window.localStorage.removeItem(item));
                
                // Force a hard redirect to home with cache busting
                window.location.replace(`/?t=${Date.now()}`);
              }
            }}
            className="text-primary hover:text-primary/80 text-sm bg-transparent border-none cursor-pointer flex items-center justify-center w-full py-2 px-4 rounded-md hover:bg-accent/10 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth?mode=signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
