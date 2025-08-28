"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserProfile } from "@/components/auth/user-profile"
import { useAuth } from "@/components/auth/auth-provider"

export default function ProfilePage() {
  const { user, updateUser, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <header className="border-b border-amber-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-amber-900">My Profile</h1>
              <p className="text-sm text-amber-700">Manage your account and preferences</p>
            </div>
            <a href="/dashboard" className="text-amber-600 hover:text-amber-800 transition-colors">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <UserProfile user={user} onUpdateProfile={updateUser} />
      </main>
    </div>
  )
}
