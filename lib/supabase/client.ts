import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storageKey: 'sb-auth-token',
      debug: process.env.NODE_ENV === 'development',
    },
    cookies: {
      name: 'sb-auth-token',
      lifetime: 60 * 60 * 24 * 7, // 7 days
      domain: process.env.NODE_ENV === 'production' ? '.nestboxapp.com' : '',
      path: '/',
      sameSite: 'lax',
    },
  })
}

export const supabase = createClient()
