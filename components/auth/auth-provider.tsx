"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Database } from "@/lib/types/database"

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<{ error: Error | null }>
  logout: () => Promise<void>
  hasRole: (role: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)
  const supabase = createClient()
  const router = useRouter()

  // Check if user has required role(s)
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user?.role) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }, [user?.role])

  // Handle user login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      // User is now signed in, the auth state change will handle the rest
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Login failed. Please try again.')
      throw error
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  // Handle Google OAuth login
  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      return { error };
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Google login failed. Please try again.');
      return { error };
    }
  };

  // Handle user logout
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      
      // Clear all auth-related items from localStorage
      if (typeof window !== 'undefined') {
        const itemsToRemove = [
          'sb-pquafubwzmdmesghxxyq-auth-token',
          'sb-pquafubwzmdmesghxxyq-auth-token-expires-at',
          'sb-pquafubwzmdmesghxxyq-refresh-token',
          'sb-pquafubwzmdmesghxxyq-user'
        ];
        
        itemsToRemove.forEach(item => {
          window.localStorage.removeItem(item);
        });
        
        // Force redirect to home page with cache busting
        window.location.href = `/?t=${Date.now()}`;
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Logout failed. Please try again.');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;
    
    const handleAuthChange = async (event: string, session: any) => {
      if (!mounted) return;

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserProfile(session.user.id, session.user.email || '');
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
          router.replace('/auth');
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            await handleUserProfile(session.user.id, session.user.email || '');
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error handling auth change:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await handleAuthChange('INITIAL_SESSION', session);
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  // Handle user profile data
  const handleUserProfile = async (userId: string, email: string) => {
    if (!isMounted.current) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load user profile');
      }

      const profile = await response.json();
      
      if (!profile?.role) {
        throw new Error('Invalid profile data received');
      }

      if (!isMounted.current) return;
      
      setUser(profile);
      setError(null);

      // Handle redirects
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.startsWith('/auth');
      const isAdminPath = currentPath.startsWith('/admin');
      const isDashboardPath = currentPath.startsWith('/dashboard');
      
      const shouldRedirect = isAuthPage || 
        (isAdminPath && profile.role !== 'admin') || 
        (isDashboardPath && profile.role === 'admin');
      
      if (shouldRedirect) {
        const redirectTo = profile.role === 'admin' ? '/admin' : '/dashboard';
        if (currentPath !== redirectTo) {
          router.replace(redirectTo);
        }
      }
    } catch (err) {
      console.error('Error handling user profile:', err);
      if (!isMounted.current) return;
      
      try {
        await supabase.auth.signOut();
        router.replace('/auth');
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
