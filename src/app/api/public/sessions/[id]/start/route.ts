import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionFromCookie } from '@/lib/session/cookie'

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  try {
    const { id } = await params

    // 1. Verify session cookie
    const cookie = await getSessionFromCookie()
    if (!cookie || cookie.session_id !== id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // 2. Fetch session
    const { data: session, error } = await supabase
      .from('sessions')
      .select('id, business_id, status, started_at')
      .eq('id', id)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // 3. If already in_progress or completed, return current status (idempotent)
    if (session.status !== 'landed') {
      return NextResponse.json({ success: true, status: session.status }, { status: 200 })
    }

    const now = new Date().toISOString()

    // 4. Update session status
    await supabase
      .from('sessions')
      .update({
        status: 'in_progress',
        started_at: now,
        last_activity_at: now,
      })
      .eq('id', id)

    // 5. Fire QUIZ_STARTED event
    await supabase.from('events').insert({
      session_id: id,
      business_id: session.business_id,
      event_type: 'QUIZ_STARTED',
      metadata: {},
    })

    return NextResponse.json({ success: true, status: 'in_progress' }, { status: 200 })
  } catch (error) {
    console.error('Quiz start error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
