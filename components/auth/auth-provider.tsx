"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/types/database"

interface AuthContextType {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  loginWithGoogle: () => Promise<{ error?: string }>
  signup: (email: string, password: string, userData: any) => Promise<{ error?: string }>
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<UserProfile>) => Promise<{ error?: string }>
  isAuthenticated: boolean
  hasRole: (role: string | string[]) => boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log("[v0] Getting initial session...")
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          console.log("[v0] Found existing session for user:", session.user.id)
          await fetchUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("[v0] Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Set up the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", event, session?.user?.id)
      if (event === "SIGNED_IN" && session?.user) {
        await fetchUserProfile(session.user.id)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [supabase])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("[v0] Fetching user profile for:", userId)
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("[v0] Error fetching user profile:", error)

        if (error.code === "PGRST116") {
          // No rows returned - profile doesn't exist yet
          console.log("[v0] Profile not found, attempting to create from auth data...")
          await createProfileFromAuthUser(userId)
          return
        }
        return
      }

      console.log("[v0] Successfully fetched user profile:", profile)
      setUser(profile)
    } catch (error) {
      console.error("[v0] Error fetching user profile:", error)
    }
  }

  const createProfileFromAuthUser = async (userId: string) => {
    try {
      // Get user data from auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("[v0] Error getting auth user:", authError)
        return
      }

      console.log("[v0] Creating profile from auth user data:", user)

      // Create profile manually
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || null,
          role: user.user_metadata?.role || "volunteer",
          is_admin: user.user_metadata?.role === "admin",
          is_superuser: false,
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Error creating profile:", insertError)
        return
      }

      console.log("[v0] Successfully created profile:", newProfile)
      setUser(newProfile)
    } catch (error) {
      console.error("[v0] Error creating profile from auth user:", error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log("[v0] Attempting login for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[v0] Login error:", error)
        return { error: error.message }
      }

      console.log("[v0] Login successful for user:", data.user?.id)
      if (data.user) {
        await fetchUserProfile(data.user.id)
      }

      return {}
    } catch (error) {
      console.error("[v0] Login exception:", error)
      return { error: "Login failed" }
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      console.log("[v0] Attempting Google OAuth login...")

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        console.error("[v0] Google OAuth error:", error)
        return { error: error.message }
      }

      console.log("[v0] Google OAuth initiated successfully")
      return {}
    } catch (error) {
      console.error("[v0] Google OAuth exception:", error)
      return { error: "Google sign-in failed" }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true)
      console.log("[v0] Attempting signup for:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
            first_name: userData.firstName || "",
            last_name: userData.lastName || "",
            phone: userData.phone || null,
            role: userData.role || "volunteer",
          },
        },
      })

      if (error) {
        console.error("[v0] Signup error:", error)
        return { error: error.message }
      }

      console.log("[v0] Signup successful, confirmation email sent")
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
      console.log("[v0] Attempting logout...")

      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("[v0] Logout error:", error)
      } else {
        console.log("[v0] Logout successful")
      }
      setUser(null)
    } catch (error) {
      console.error("[v0] Logout exception:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updatedUser: Partial<UserProfile>) => {
    if (!user) return { error: "No user logged in" }

    try {
      console.log("[v0] Updating user profile:", updatedUser)

      const { error } = await supabase
        .from("profiles")
        .update({
          ...updatedUser,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("[v0] Update user error:", error)
        return { error: error.message }
      }

      // Update local state
      setUser({ ...user, ...updatedUser })
      console.log("[v0] User profile updated successfully")
      return {}
    } catch (error) {
      console.error("[v0] Update user exception:", error)
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
        loginWithGoogle,
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
