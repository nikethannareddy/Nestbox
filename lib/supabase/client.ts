import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_NESTBOXSUPABASE_URL!,
    process.env.NEXT_PUBLIC_NESTBOXSUPABASE_ANON_KEY!,
  )
}
