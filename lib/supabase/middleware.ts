import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Simple middleware that doesn't require Supabase SSR
  // In a real implementation, this would handle session refresh
  console.log("[v0] Mock middleware processing request:", request.nextUrl.pathname)

  // For now, just pass through all requests
  return NextResponse.next({
    request,
  })
}
