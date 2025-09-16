"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  is_admin: boolean;
}

interface AuthContextType {
  user: Profile | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  loginWithGoogle: () => Promise<{ error?: string }>
  signup: (email: string, password: string, userData: any) => Promise<{ error?: string }>
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<Profile>) => Promise<{ error?: string }>
  hasRole: (role: string | string[]) => boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [routerReady, setRouterReady] = useState(false)
  const supabase = createClient()
  
  // Initialize router in a state that can be updated after mount
  const [router, setRouter] = useState<any>(null)

  // Load router only after component mounts
  useEffect(() => {
    // Import router dynamically to ensure it's only loaded on client-side
    import('next/navigation').then(({ useRouter }) => {
      setRouter(useRouter())
      setRouterReady(true)
    })
  }, [])

  // Helper to check if user has required role(s)
  const hasRole = (role: string | string[]): boolean => {
    if (!user || !user.role) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }

  // Fetch user profile from database with retry logic
  const fetchUserProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!userId) return null;
    
    const MAX_RETRIES = 3;
    let retryCount = 0;
    
    while (retryCount < MAX_RETRIES) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;
        
        if (data) {
          const userData = {
            ...data,
            is_admin: data.role === 'admin',
          };
          setUser(userData);
          return userData;
        }
      } catch (error: any) {
        if (error.message?.includes('Too Many Requests') && retryCount < MAX_RETRIES - 1) {
          // Wait for an increasing amount of time before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          retryCount++;
          continue;
        }
        console.error('[Auth] Error fetching profile:', error);
        await supabase.auth.signOut();
        setUser(null);
        return null;
      }
    }
    
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const handleAuthChange = async (event: any, session: any) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    };

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    authSubscription = subscription;

    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Session check error:', error);
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  // Login with email and password
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clear any existing session first
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('[Auth] Login error:', error);
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Authentication failed. Please try again.' };
      }

      // Fetch user profile with retry logic
      const profile = await fetchUserProfile(data.user.id);
      if (!profile) {
        return { error: 'Failed to load user profile. Please try again.' };
      }
      
      // Only navigate if router is ready
      if (routerReady && router) {
        router.push('/dashboard')
      }
      
      return {};
      
    } catch (error: any) {
      console.error('[Auth] Login exception:', error);
      return { 
        error: error.message?.includes('Too Many Requests') 
          ? 'Too many login attempts. Please wait a moment and try again.' 
          : 'An unexpected error occurred. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  }, [router, routerReady]);

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
      if (routerReady && router) {
        router.push('/auth')
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update user profile
  const updateUser = async (updatedUser: Partial<Profile>) => {
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
