"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/database"

interface AuthContextType {
  user: Profile | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string, userData: any) => Promise<{ error?: string }>
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<Profile>) => Promise<{ error?: string }>
  isAuthenticated: boolean
  hasRole: (role: string | string[]) => boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchUserProfile(session.user.id)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("[v0] Fetching profile for user:", userId)
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      console.log("[v0] Profile fetch response:", { profile: !!profile, error: error?.message || null })

      if (error) {
        console.error("[v0] Error fetching user profile:", error)
        return
      }

      console.log("[v0] Profile fetched successfully:", profile?.email || "unknown")
      setUser(profile)
    } catch (error) {
      console.error("[v0] Exception fetching user profile:", error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Login attempt started for:", email)
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data: !!data, error: error?.message || null })

      if (error) {
        console.log("[v0] Login error:", error)
        return { error: error.message }
      }

      if (data.user) {
        console.log("[v0] User authenticated, fetching profile for:", data.user.id)
        await fetchUserProfile(data.user.id)
      } else {
        console.log("[v0] No user data returned from login")
      }

      console.log("[v0] Login completed successfully")
      return {}
    } catch (error) {
      console.log("[v0] Login exception:", error)
      return { error: "Login failed" }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role || "volunteer",
            phone: userData.phone || "",
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      // Profile will be created automatically by the trigger after email confirmation
      console.log("[v0] Signup successful, user needs to confirm email:", data.user?.email)

      return {}
    } catch (error) {
      console.error("[v0] Signup exception:", error)
      return { error: "Signup failed" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      }
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updatedUser: Partial<Profile>) => {
    if (!user) return { error: "No user logged in" }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updatedUser,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        return { error: error.message }
      }

      // Update local state
      setUser({ ...user, ...updatedUser })
      return {}
    } catch (error) {
      return { error: "Failed to update profile" }
    }
  }

  const hasRole = (roles: string | string[]) => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateUser,
        isAuthenticated: !!user,
        hasRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
