import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { campaignCreateSchema } from '@/lib/validation/schemas'
import { generateRandomSlug } from '@/lib/utils/slug'
import { z } from 'zod'

const patchCampaignSchema = z.object({
  id: z.string().uuid(),
  active: z.boolean().optional(),
  name: z.string().min(1).max(200).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Find business owned by user
    const { data: business } = await admin
      .from('businesses')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!business) {
      return NextResponse.json({ error: 'Restaurant profile not found' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = campaignCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid campaign data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, slug } = parsed.data
    const campaignSlug = slug || generateRandomSlug(8)

    const { data: newCampaign, error: createError } = await admin
      .from('campaigns')
      .insert({
        business_id: business.id,
        name,
        slug: campaignSlug,
        active: true,
      })
      .select()
      .single()

    if (createError || !newCampaign) {
      if (createError?.code === '23505') {
        return NextResponse.json({ error: 'A campaign with this slug already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
    }

    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    console.error('Campaign creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = patchCampaignSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { id, active, name } = parsed.data
    const admin = createAdminClient()

    // Verify ownership
    const { data: campaign } = await admin
      .from('campaigns')
      .select('id, business_id, businesses!inner(owner_id)')
      .eq('id', id)
      .eq('businesses.owner_id', user.id)
      .single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 })
    }

    const updateData: {
      updated_at: string
      active?: boolean
      name?: string
    } = {
      updated_at: new Date().toISOString(),
    }
    if (active !== undefined) updateData.active = active
    if (name !== undefined) updateData.name = name

    const { data: updated, error: updateError } = await admin
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error('Campaign update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
