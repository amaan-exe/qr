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

  // Invalid slug fallback screen
  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">QR Code Not Found</h1>
          <p className="text-sm text-slate-400">
            This QR code is not valid or has been removed. Please ask your server for assistance.
          </p>
        </div>
      </div>
    )
  }

  // Inactive campaign fallback screen
  if (!campaign.active) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">QR Code Inactive</h1>
          <p className="text-sm text-slate-400">
            This QR code is no longer active. Thank you for your interest!
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

  const restaurantName = business?.name ?? 'Restaurant'
  const welcomeText =
    (business?.welcome_message?.en as string | undefined) ??
    "Thanks for dining with us! We'd love to hear about your experience today."

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-rose-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center pt-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-medium text-slate-300">Quick Guest Feedback</span>
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
      <footer className="relative z-10 text-center py-3 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <span>Powered by</span>
        <span className="font-semibold text-slate-400">ReviewPulse</span>
      </footer>
    </div>
  )
}
