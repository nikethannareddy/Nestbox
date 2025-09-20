import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('[API] Profile endpoint hit')
    const { userId, email } = await request.json()
    
    console.log('[API] Request data:', { userId, email })
    
    if (!userId) {
      console.error('[API] Error: User ID is required')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get cookies asynchronously
    const cookieStore = await cookies()
    
    // Create a server client with service role key to bypass RLS
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    try {
      // Try to get existing profile
      console.log('[API] Fetching profile for user:', userId)
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('[API] Error fetching profile:', fetchError)
        throw fetchError
      }

      // If profile exists, return it
      if (existingProfile) {
        console.log('[API] Found existing profile:', existingProfile.id)
        return NextResponse.json(existingProfile)
      }

      // If no profile exists, create one
      console.log('[API] No existing profile found, creating new one')
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email || `${userId}@user.com`,
            full_name: email?.split('@')[0] || 'New User',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) {
        console.error('[API] Error creating profile:', createError)
        throw createError
      }

      console.log('[API] Created new profile:', newProfile.id)
      return NextResponse.json(newProfile)

    } catch (error) {
      console.error('[API] Error in profile operation:', error)
      return NextResponse.json(
        { error: 'Failed to process profile' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[API] Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
