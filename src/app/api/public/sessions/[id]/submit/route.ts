import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionFromCookie } from '@/lib/session/cookie'
import { ratingSchema } from '@/lib/validation/schemas'
import { logEvent } from '@/lib/observability/logger'

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteProps) {
  const startTime = Date.now()
  try {
    const { id } = await params

    // 1. Verify session cookie
    const cookie = await getSessionFromCookie()
    if (!cookie || cookie.session_id !== id) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // 2. Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, business_id, status, completed_at')
      .eq('id', id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // 3. Idempotent check: if already completed, return success immediately
    if (session.status === 'completed') {
      return NextResponse.json(
        { success: true, status: 'completed', message: 'Session already completed' },
        { status: 200 }
      )
    }

    // 4. Fetch stored answers for this session
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('question_key, value')
      .eq('session_id', id)

    if (answersError) {
      return NextResponse.json({ error: 'Failed to retrieve answers' }, { status: 500 })
    }

    const answerMap = new Map((answers || []).map((a) => [a.question_key, a.value]))

    // 5. Validate required core questions: overall_rating, food_rating, service_rating
    const requiredKeys = ['overall_rating', 'food_rating', 'service_rating']
    const missing: string[] = []

    for (const key of requiredKeys) {
      const val = answerMap.get(key)
      const parsed = ratingSchema.safeParse(val)
      if (!parsed.success) {
        missing.push(key)
      }
    }

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: 'Required ratings missing or invalid',
          missing_questions: missing,
        },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // 6. Mark session as completed
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: now,
        last_activity_at: now,
      })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 })
    }

    // 7. Fire QUIZ_COMPLETED event
    await supabase.from('events').insert({
      session_id: id,
      business_id: session.business_id,
      event_type: 'QUIZ_COMPLETED',
      metadata: {
        total_answers: answers?.length || 0,
        overall_rating: answerMap.get('overall_rating'),
      },
    })

    logEvent({
      sessionId: id,
      businessId: session.business_id,
      action: 'QUIZ_COMPLETED',
      latencyMs: Date.now() - startTime,
      metadata: { total_answers: answers?.length || 0 },
    })

    return NextResponse.json({ success: true, status: 'completed' }, { status: 200 })
  } catch (error) {
    console.error('Submit session error:', error)
    logEvent({
      level: 'error',
      action: 'QUIZ_SUBMIT_FAILED',
      latencyMs: Date.now() - startTime,
      metadata: { error: String(error) },
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
