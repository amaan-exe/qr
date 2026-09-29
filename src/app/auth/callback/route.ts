import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      console.error('Supabase auth callback exchange error:', error)
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
    }
  }

  // If code exchange failed or no code was provided, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
