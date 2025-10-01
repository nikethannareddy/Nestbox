import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const error = requestUrl.searchParams.get('error');

  // If there's an error, redirect to login with the error message
  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth?error=${encodeURIComponent(error)}`
    );
  }

  // If no code, redirect to login with error
  if (!code) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth?error=${encodeURIComponent('No authentication code provided')}`
    );
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  try {
    const { error: authError, data: { session } } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      console.error('Error exchanging code for session:', authError);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=${encodeURIComponent('Authentication failed. Please try again.')}`
      );
    }

    if (!session) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=${encodeURIComponent('No session found after authentication')}`
      );
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=${encodeURIComponent('Failed to load user data')}`
      );
    }

    // Determine redirect URL based on user role
    let redirectPath = next;
    
    if (user.user_metadata?.role === 'admin') {
      redirectPath = '/admin';
    } else if (next === '/auth' || next === '/') {
      redirectPath = '/dashboard';
    }

    // Ensure the redirect URL is safe and local
    const safeRedirectUrl = new URL(redirectPath, requestUrl.origin);
    
    return NextResponse.redirect(safeRedirectUrl);
    
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(
      `${requestUrl.origin}/auth?error=${encodeURIComponent('An unexpected error occurred')}`
    );
  }
}
