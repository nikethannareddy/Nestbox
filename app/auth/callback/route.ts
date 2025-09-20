import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  const supabase = createRouteHandlerClient({ cookies })

  if (code) {
    try {
      // Exchange the code for a session
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent('Failed to authenticate. Please try again.')}`, request.url))
      }

      if (session?.user) {
        // Ensure the user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile) {
          // Create a new profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              role: 'volunteer', // Default role
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.user.id)

          if (insertError) {
            console.error('Error creating user profile:', insertError)
            return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent('Failed to create user profile.')}`, request.url))
          }
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent('An unexpected error occurred.')}`, request.url))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, request.url))
}
