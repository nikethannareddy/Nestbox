"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/types/database"

interface AuthContextType {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<{ error?: string }>
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
        if (!supabase) {
          console.error("Supabase client not initialized - missing environment variables")
          setLoading(false)
          return
        }

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

    if (!supabase) {
      return
    }

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
    if (!supabase) {
      console.error("Cannot fetch user profile - Supabase client not initialized")
      return
    }

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return
      }

      setUser(profile)
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const login = async (email: string, password: string) => {
    if (!supabase) {
      return { error: "Authentication service not available - missing configuration" }
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        await fetchUserProfile(data.user.id)
      }

      return {}
    } catch (error) {
      return { error: "Login failed" }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, userData: any) => {
    if (!supabase) {
      return { error: "Authentication service not available - missing configuration" }
    }

    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        // Create user profile in user_profiles table
        const { error: profileError } = await supabase.from("user_profiles").insert({
          user_id: data.user.id,
          email: email,
          first_name: userData.firstName || "",
          last_name: userData.lastName || "",
          phone: userData.phone || null,
          role: userData.role || "volunteer",
          bio: userData.bio || null,
          location: userData.location || null,
        })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
          return { error: "Failed to create user profile" }
        }

        await fetchUserProfile(data.user.id)
      }

      return {}
    } catch (error) {
      return { error: "Signup failed" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    if (!supabase) {
      setUser(null)
      setLoading(false)
      return
    }

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

  const updateUser = async (updatedUser: Partial<UserProfile>) => {
    if (!user) return { error: "No user logged in" }

    if (!supabase) {
      return { error: "Database service not available - missing configuration" }
    }

    try {
      const { error } = await supabase
        .from("user_profiles")
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
