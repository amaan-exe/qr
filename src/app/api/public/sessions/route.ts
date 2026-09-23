import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionFromCookie, setSessionCookie } from '@/lib/session/cookie'
import { hashIp, hashUserAgent } from '@/lib/utils/hash'
import { slugSchema } from '@/lib/validation/schemas'
import { z } from 'zod'

const createSessionSchema = z.object({
  slug: slugSchema,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = createSessionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid campaign slug', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { slug } = parsed.data
    const supabase = createAdminClient()

    // 1. Look up campaign & business
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, active, business_id, businesses(id, name, logo_url, primary_color, welcome_message, google_review_url)')
      .eq('slug', slug)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (!campaign.active) {
      return NextResponse.json({ error: 'Campaign is inactive' }, { status: 410 })
    }

    const business = campaign.businesses as {
      id: string
      name: string
      logo_url: string | null
      primary_color: string | null
      welcome_message: any
      google_review_url: string | null
    }

    // 2. Check for existing active session from cookie
    const existingCookie = await getSessionFromCookie()
    if (existingCookie && existingCookie.campaign_id === campaign.id) {
      const { data: existingSession } = await supabase
        .from('sessions')
        .select('id, status')
        .eq('id', existingCookie.session_id)
        .single()

      if (existingSession && existingSession.status !== 'completed') {
        return NextResponse.json(
          {
            session_id: existingSession.id,
            business_name: business.name,
            logo_url: business.logo_url,
            primary_color: business.primary_color,
            welcome_message: business.welcome_message,
            google_review_url_exists: Boolean(business.google_review_url),
          },
          { status: 200 }
        )
      }
    }

    // 3. Extract and hash client metadata
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const ua = request.headers.get('user-agent')

    // 4. Create new session
    const { data: newSession, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        campaign_id: campaign.id,
        business_id: campaign.business_id,
        status: 'landed',
        ip_hash: hashIp(ip),
        ua_hash: hashUserAgent(ua),
      })
      .select('id')
      .single()

    if (sessionError || !newSession) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // 5. Set signed session cookie
    await setSessionCookie({
      session_id: newSession.id,
      campaign_id: campaign.id,
      business_id: campaign.business_id,
    })

    // 6. Log QR_SCANNED and LANDING_VIEWED events
    await supabase.from('events').insert([
      {
        session_id: newSession.id,
        business_id: campaign.business_id,
        event_type: 'QR_SCANNED',
        metadata: { slug },
      },
      {
        session_id: newSession.id,
        business_id: campaign.business_id,
        event_type: 'LANDING_VIEWED',
        metadata: {},
      },
    ])

    return NextResponse.json(
      {
        session_id: newSession.id,
        business_name: business.name,
        logo_url: business.logo_url,
        primary_color: business.primary_color,
        welcome_message: business.welcome_message,
        google_review_url_exists: Boolean(business.google_review_url),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
