import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Optional: Add route protection logic here
    // For now, we'll just continue with the request
  } catch (error) {
    console.error("Auth error in middleware:", error)
  }

  return response
}
