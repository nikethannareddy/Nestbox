"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"
import { useRouter } from 'next/navigation'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  is_admin: boolean;
}

interface AuthContextType {
  user: Profile | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ error?: string, user?: Profile }>
  loginWithGoogle: () => Promise<{ error?: string }>
  signup: (email: string, password: string, userData: any) => Promise<{ error?: string }>
  logout: () => Promise<void>
  updateUser: (updatedUser: Partial<Profile>) => Promise<{ error?: string }>
  hasRole: (role: string | string[]) => boolean
  loading: boolean
  error: string | null
  setError: (error: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Helper to check if user has required role(s)
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!user || !user.role) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role)
  }, [user])

  // Fetch user profile from database with retry logic and auto-create if missing
  const fetchUserProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!userId) return null;
    
    const MAX_RETRIES = 3;
    let retryCount = 0;
    
    while (retryCount < MAX_RETRIES) {
      try {
        // First try to get the profile
        let { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        // If no profile exists, create one
        if (error?.code === 'PGRST116' || !profile) {
          console.log('[Auth] No profile found, creating new one for user:', userId);
          
          // Get user data from auth
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return null;
          
          // Create new profile
          const newProfile = {
            id: userId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          
          const { data: insertedProfile, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
            
          if (insertError) {
            console.error('[Auth] Error creating profile:', insertError);
            return null;
          }
          
          console.log('[Auth] Created new profile:', insertedProfile);
          return insertedProfile;
        }
        
        if (error) throw error;
        return profile;
        
      } catch (error) {
        console.error(`[Auth] Error fetching profile (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        // Wait before retrying
        if (retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        } else {
          console.error('[Auth] Max retries reached, giving up');
          return null;
        }
      }
    }
    
    return null;
  }, [supabase]);

  // Debug log when user state changes
  useEffect(() => {
    console.log('[Auth] User state updated:', { 
      user: user ? { id: user.id, email: user.email, role: user.role } : null, 
      isAuthenticated: !!user,
      loading 
    });
  }, [user, loading]);

  // Enhanced auth state change handler
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    console.log('[Auth] Auth state changed:', { event, session: session ? 'Session exists' : 'No session' });
    
    setLoading(true);
    
    try {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('[Auth] User signed in, fetching profile...', { userId: session.user.id });
        const profile = await fetchUserProfile(session.user.id);
        
        if (profile) {
          console.log('[Auth] Profile loaded successfully:', { 
            userId: profile.id, 
            email: profile.email, 
            role: profile.role 
          });
          setUser(profile);
        } else {
          console.error('[Auth] Failed to load profile for user:', session.user.id);
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out');
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Error in auth state change handler:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Initialize auth state
  useEffect(() => {
    console.log('[Auth] Initializing auth state...');
    
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log('[Auth] Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting session:', error);
          return;
        }
        
        console.log('[Auth] Session check result:', { 
          hasSession: !!session, 
          userId: session?.user?.id 
        });
        
        if (session?.user) {
          console.log('[Auth] Found existing session, fetching profile...');
          const profile = await fetchUserProfile(session.user.id);
          console.log('[Auth] Profile from session:', profile ? 'Exists' : 'Not found');
          setUser(profile);
        } else {
          console.log('[Auth] No active session found');
          setUser(null);
        }
      } catch (error) {
        console.error('[Auth] Session check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      console.log('[Auth] Cleaning up auth listener');
      subscription?.unsubscribe();
    };
  }, [handleAuthChange, fetchUserProfile]);

  // Login with email and password
  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('[Auth] Attempting login for:', email);
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error('[Auth] Login error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from sign in');
      }

      console.log('[Auth] User signed in, fetching profile...', data.user);
      
      // Ensure the user profile exists
      const profile = await fetchUserProfile(data.user.id);
      
      if (!profile) {
        console.error('[Auth] Failed to create/fetch user profile');
        throw new Error('Failed to initialize user profile');
      }

      console.log('[Auth] User profile:', profile);
      setUser(profile);
      
      return { user: profile };
    } catch (error) {
      console.error('[Auth] Login exception:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      return { error: error instanceof Error ? error.message : 'Failed to sign in' };
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
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
      
      if (error) throw error;
      return { error: undefined };
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      return { error: error.message || 'Failed to sign in with Google' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup
  const signup = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      console.log("[Auth] Attempting signup for:", email);

      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("[Auth] Signup error:", signUpError);
        return { error: signUpError.message };
      }

      // 2. If signup was successful, create a profile in the database
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              first_name: userData.firstName,
              last_name: userData.lastName,
              phone: userData.phone,
              role: 'volunteer',
              created_at: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          console.error('[Auth] Error creating user profile:', profileError);
          // We don't want to fail the signup if profile creation fails, as the user is already created in auth
          // The profile can be created later when the user verifies their email
        }
      }

      console.log("[Auth] Signup successful, confirmation email sent");
      return {};
    } catch (error) {
      console.error("[Auth] Signup exception:", error);
      return { error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      
      // Force a refresh to ensure all components get the updated auth state
      window.location.href = '/';
      
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

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
    error,
    setError,
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
