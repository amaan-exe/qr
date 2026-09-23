import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionFromCookie } from '@/lib/session/cookie'
import { privateFeedbackSchema } from '@/lib/validation/schemas'

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

    const body = await request.json().catch(() => ({}))
    const parsed = privateFeedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid private feedback payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { category, message, contact_name, contact_value, contact_consent } = parsed.data
    const supabase = createAdminClient()

    // 2. Insert into private_feedback table
    const { data: feedback, error: feedbackError } = await supabase
      .from('private_feedback')
      .insert({
        session_id: id,
        business_id: cookie.business_id,
        category,
        message,
        contact_name: contact_name || null,
        contact_value: contact_value || null,
        contact_consent,
      })
      .select('id')
      .single()

    if (feedbackError || !feedback) {
      console.error('Private feedback insert error:', feedbackError)
      return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 })
    }

    // 3. Record PRIVATE_FEEDBACK_SUBMITTED event
    await supabase.from('events').insert({
      session_id: id,
      business_id: cookie.business_id,
      event_type: 'PRIVATE_FEEDBACK_SUBMITTED',
      metadata: { category, has_contact: Boolean(contact_value) },
    })

    return NextResponse.json(
      { success: true, message: 'Private feedback received' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Private feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
