import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionFromCookie } from '@/lib/session/cookie'
import QuizFlow from '@/components/quiz/QuizFlow'
import { AlertTriangle, Clock, Sparkles } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ new?: string }>
}

export default async function CustomerLandingPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { new: forceNew } = await searchParams
  const supabase = createAdminClient()

  // 1. Look up campaign by slug
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, active, business_id, google_review_url_override, businesses(id, name, logo_url, primary_color, welcome_message, google_review_url)')
    .eq('slug', slug)
    .single()

  // Invalid slug fallback screen (White Classy)
  if (!campaign) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">QR Code Not Found</h1>
          <p className="text-sm text-stone-500">
            This QR code is not valid or has been removed. Please ask your server at Biryani Charminar for assistance.
          </p>
        </div>
      </div>
    )
  }

  // Inactive campaign fallback screen (White Classy)
  if (!campaign.active) {
    return (
      <div className="min-h-screen bg-stone-50 text-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">QR Code Inactive</h1>
          <p className="text-sm text-stone-500">
            This QR campaign is currently inactive. Thank you for visiting Biryani Charminar!
          </p>
        </div>
      </div>
    )
  }

  const business = campaign.businesses as {
    id: string
    name: string
    logo_url: string | null
    primary_color: string | null
    welcome_message: any
    google_review_url: string | null
  }

  const googleReviewUrl = campaign.google_review_url_override || business?.google_review_url || null

  // 2. Fetch active menu items for this restaurant
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('business_id', campaign.business_id)
    .eq('active', true)
    .order('position', { ascending: true })

  // 3. Check for existing session and answers from cookie (unless ?new=1 is requested)
  let existingSessionId: string | null = null
  let existingStatus: string | null = null
  let existingDraftText: string | null = null
  const existingAnswers: Record<string, any> = {}

  if (forceNew !== '1') {
    const cookie = await getSessionFromCookie()
    if (cookie && cookie.campaign_id === campaign.id) {
      const { data: session } = await supabase
        .from('sessions')
        .select('id, status')
        .eq('id', cookie.session_id)
        .single()

      if (session) {
        existingSessionId = session.id
        existingStatus = session.status

        // Load stored answers if session exists
        const { data: answers } = await supabase
          .from('answers')
          .select('question_key, value')
          .eq('session_id', session.id)

        if (answers) {
          for (const a of answers) {
            existingAnswers[a.question_key] = a.value
          }
        }

        // Pre-fetch draft if session is completed to avoid loading spinner
        if (session.status === 'completed') {
          const { data: draftRecord } = await supabase
            .from('review_drafts')
            .select('final_text, original_text')
            .eq('session_id', session.id)
            .single()

          if (draftRecord) {
            existingDraftText = draftRecord.final_text || draftRecord.original_text || null
          }
        }
      }
    }
  }

  const restaurantName = business?.name ?? 'Biryani Charminar'
  const welcomeText =
    (business?.welcome_message?.en as string | undefined) ??
    'Welcome to Biryani Charminar! We would love to hear about your experience today.'

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-amber-50/30 to-stone-100 text-stone-900 flex flex-col justify-between p-4 sm:p-6 selection:bg-amber-600 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient warm gold & saffron glows */}
      <div className="fixed -top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-yellow-200/25 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center pt-2">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-stone-200/90 shadow-xs backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span className="text-[11px] font-bold text-amber-950">Guest Feedback Survey</span>
        </div>
      </header>

      {/* Quiz Flow Orchestration */}
      <QuizFlow
        slug={slug}
        restaurantName={restaurantName}
        logoUrl={business?.logo_url}
        primaryColor={business?.primary_color}
        welcomeMessage={welcomeText}
        googleReviewUrl={googleReviewUrl}
        initialSessionId={existingSessionId}
        initialStatus={existingStatus}
        initialAnswers={existingAnswers}
        initialDraftText={existingDraftText}
        menuItems={menuItems || []}
      />

      {/* Footer */}
      <footer className="relative z-10 text-center py-3 text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
        <span>Powered by</span>
        <span className="font-bold text-stone-700">ReviewPulse</span>
        <span>•</span>
        <span>Biryani Charminar, Patna</span>
      </footer>
    </div>
  )
}
