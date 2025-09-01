import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_NESTBOXSUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_NESTBOXSUPABASE_ANON_KEY!

  // Get session from cookies
  const sessionCookie = request.cookies.get("sb-access-token")
  let user = null

  if (sessionCookie) {
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${sessionCookie.value}`,
          apikey: supabaseKey,
        },
      })

      if (response.ok) {
        user = await response.json()
      }
    } catch (error) {
      console.error("User validation error:", error)
    }
  }

  // Only redirect to auth for protected routes
  if (
    !user &&
    (request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/dashboard") ||
      request.nextUrl.pathname.startsWith("/nest-check"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
