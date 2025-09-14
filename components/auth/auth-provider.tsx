"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile as UserProfile } from "@/lib/types/database"
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  loginWithGoogle: () => Promise<{ error?: string }>
  signup: (email: string, password: string, userData: any) => Promise<{ error?: string }>
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<UserProfile>) => Promise<{ error?: string }>
  hasRole: (role: string | string[]) => boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  // Helper to check if user has required role(s)
  const hasRole = (role: string | string[]): boolean => {
    if (!user || !user.role) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }

  // Handle auth state changes
  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          // Clear any sensitive data from localStorage
          localStorage.removeItem('supabase.auth.token')
          localStorage.removeItem('supabase.auth.latest')
        }
      }
    )

    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('[Auth] Error checking session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase])

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('[Auth] Fetching profile for user:', userId)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[Auth] Error fetching profile:', error)
        
        if (error.code === 'PGRST116') { // No rows returned
          console.log('[Auth] Profile not found, creating new profile...')
          await createProfileFromAuthUser(userId)
          return
        }
        
        throw error
      }

      console.log('[Auth] Profile loaded:', profile)
      setUser(profile)
      
      // Redirect based on role if needed
      if (profile.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      
      return profile
    } catch (error) {
      console.error('[Auth] Error in fetchUserProfile:', error)
      throw error
    }
  }

  // Create profile from auth user
  const createProfileFromAuthUser = async (userId: string) => {
    try {
      // Get user data from auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        console.error("[Auth] Error getting auth user:", authError)
        throw new Error("Failed to get user information")
      }

      console.log("[Auth] Creating profile from auth user data:", authUser)

      // Prepare profile data with all required fields
      const profileData: Omit<UserProfile, 'created_at' | 'updated_at'> & { 
        created_at: string 
        updated_at: string 
      } = {
        id: userId,
        full_name: authUser.user_metadata?.full_name || 
                   authUser.user_metadata?.name || 
                   "New User",
        email: authUser.email || "",
        phone: authUser.user_metadata?.phone || "",
        role: "volunteer",
        bio: "",
        location: "",
        emergency_contact: "",
        emergency_phone: "",
        volunteer_since: new Date().toISOString().split('T')[0],
        total_observations: 0,
        total_maintenance_tasks: 0,
        preferred_contact_method: "email",
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Create profile
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert(profileData)
        .select()
        .single()

      if (insertError) {
        console.error("[Auth] Error creating profile:", insertError)
        throw new Error(insertError.message)
      }

      console.log("[Auth] Successfully created profile:", newProfile)
      setUser(newProfile)
      return newProfile
    } catch (error) {
      console.error("[Auth] Error creating profile from auth user:", error)
      throw error
    }
  }

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('[Auth] Attempting login for:', email)

      // Clear any existing session first
      await supabase.auth.signOut()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (error) {
        console.error('[Auth] Login error:', error)
        return { error: error.message }
      }

      if (!data.user) {
        console.error('[Auth] No user returned after login')
        return { error: 'Authentication failed. Please try again.' }
      }

      console.log('[Auth] Login successful for user:', data.user.id)
      
      // Fetch user profile (this will handle redirection)
      await fetchUserProfile(data.user.id)
      return {}
      
    } catch (error) {
      console.error('[Auth] Login exception:', error)
      return { 
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred during login.' 
      }
    } finally {
      if (!user) {
        setLoading(false)
      }
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      console.log("[Auth] Attempting Google OAuth login...")

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_SITE_URL + '/auth/callback',
        },
      })

      if (error) {
        console.error("[Auth] Google OAuth error:", error)
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error("[Auth] Google OAuth exception:", error)
      return { error: 'Google sign-in failed' }
    } finally {
      setLoading(false)
    }
  }

  // Signup
  const signup = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true)
      console.log("[Auth] Attempting signup for:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone,
          },
        },
      })

      if (error) {
        console.error("[Auth] Signup error:", error)
        return { error: error.message }
      }

      console.log("[Auth] Signup successful, confirmation email sent")
      return {}
    } catch (error) {
      console.error("[Auth] Signup exception:", error)
      return { error: 'Signup failed' }
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      router.push('/auth')
    } catch (error) {
      console.error('[Auth] Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateUser = async (updatedUser: Partial<UserProfile>) => {
    if (!user) return { error: "No user logged in" }

    try {
      console.log("[Auth] Updating user profile:", updatedUser)

      const { error } = await supabase
        .from("profiles")
        .update({
          ...updatedUser,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("[Auth] Update user error:", error)
        return { error: error.message }
      }

      setUser({ ...user, ...updatedUser })
      console.log("[Auth] User profile updated successfully")
      return {}
    } catch (error) {
      console.error("[Auth] Update user exception:", error)
      return { error: 'Failed to update profile' }
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateUser,
    hasRole,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
