import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow for all environments
      debug: process.env.NODE_ENV === 'development',
    },
    global: {
      // Ensure we include the auth token in all requests
      headers: {
        'X-Client-Info': 'nestbox-web/1.0.0'
      }
    }
  })
}

// Create a single supabase client for client-side usage
export const supabase = createClient()
