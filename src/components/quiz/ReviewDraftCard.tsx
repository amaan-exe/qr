'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, ExternalLink, MessageSquareHeart, Sparkles, Loader2, ArrowRight, RotateCcw } from 'lucide-react'
import { trackClientEvent } from '@/lib/client/telemetry'

interface ReviewDraftCardProps {
  sessionId: string
  slug?: string
  restaurantName: string
  googleReviewUrl?: string | null
  initialDraftText?: string
  onOpenPrivateFeedback: () => void
  onDone: () => void
}

export default function ReviewDraftCard({
  sessionId,
  slug,
  restaurantName,
  googleReviewUrl,
  initialDraftText = '',
  onOpenPrivateFeedback,
  onDone,
}: ReviewDraftCardProps) {
  const [draft, setDraft] = useState(initialDraftText)
  const [isLoadingDraft, setIsLoadingDraft] = useState(!initialDraftText)
  const [hasCopied, setHasCopied] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch draft from API if not pre-populated
  useEffect(() => {
    if (!draft && sessionId) {
      setIsLoadingDraft(true)
      fetch(`/api/public/sessions/${sessionId}/draft`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.final_text || data?.original_text) {
            setDraft(data.final_text || data.original_text)
          } else {
            setDraft('Had a great visit today! The food was delicious and the hospitality was warm and attentive.')
          }
        })
        .catch((err) => {
          console.warn('Draft load error:', err)
          setDraft('Had a great visit today! The food was delicious and the hospitality was warm and attentive.')
        })
        .finally(() => setIsLoadingDraft(false))
    }
  }, [sessionId, draft])

  // Save changes with 1s debounce
  const handleDraftChange = (newText: string) => {
    setDraft(newText)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      fetch(`/api/public/sessions/${sessionId}/draft`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_text: newText }),
      }).catch((e) => console.warn('Draft auto-save error:', e))
    }, 1000)
  }

  // Copy text helper
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(draft)
      setIsCopied(true)
      setHasCopied(true)
      setToastMessage('Review copied! You can now open Google Reviews.')
      setTimeout(() => {
        setIsCopied(false)
        setToastMessage(null)
      }, 3500)
    } catch {
      // Fallback if browser clipboard permission prompt or error
      setHasCopied(true)
      setToastMessage('Ready to post on Google!')
    }
  }

  // Primary Action: Share on Google (only accessible after copying)
  const handleShareOnGoogle = async () => {
    // 1. Ensure latest draft is saved
    try {
      await fetch(`/api/public/sessions/${sessionId}/draft`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_text: draft }),
      })
    } catch {}

    // 2. Ensure clipboard has current draft text
    try {
      await navigator.clipboard.writeText(draft)
    } catch {}

    // 3. Track GOOGLE_CLICKED event
    trackClientEvent(sessionId, 'GOOGLE_CLICKED')

    // 4. Open Google review link
    if (googleReviewUrl) {
      window.open(googleReviewUrl, '_blank', 'noopener,noreferrer')
    }

    // 5. Advance to ThankYou
    onDone()
  }

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0

  return (
    <div className="relative z-10 w-full max-w-md mx-auto py-6 px-4 sm:px-0 space-y-5 animate-in fade-in zoom-in-95 duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 border border-slate-700 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Card Header & Disclaimer */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Assisted Review</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
          Your review draft
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Draft based on your answers — edit or replace it. Posting a review is optional.
        </p>
      </div>

      {/* Editable Draft Text Area */}
      <div className="p-5 rounded-3xl bg-slate-900/85 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-3">
        {isLoadingDraft ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-7 h-7 mx-auto animate-spin text-rose-500" />
            <p className="text-xs">Preparing your custom review draft...</p>
          </div>
        ) : (
          <>
            <textarea
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              placeholder="Write or edit your review..."
              rows={4}
              aria-label="Edit review draft"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 resize-none transition-all leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>{wordCount} words</span>
              <span>Tap text to edit freely</span>
            </div>
          </>
        )}

        {/* 2-Step Copy & Redirect Action Flow */}
        <div className="pt-2 space-y-3">
          {/* Step indicator badges */}
          <div className="flex items-center justify-center gap-2 text-xs py-1">
            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                hasCopied
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold shadow-sm'
              }`}
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Step 1: Copied</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>Step 1: Copy Review</span>
                </>
              )}
            </span>

            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />

            <span
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                hasCopied
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-sm animate-pulse'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-700/50'
              }`}
            >
              <span>Step 2: Paste on Google</span>
            </span>
          </div>

          {!hasCopied ? (
            /* STEP 1: Copy Button MUST be clicked first */
            <div className="space-y-2 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={isLoadingDraft}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 bg-[length:200%_auto] hover:bg-right hover:scale-[1.01] active:scale-[0.99] text-white font-semibold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-sm"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Review Text</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 py-0.5">
                <span>📋 Tap above to copy — Google review button will unlock next.</span>
              </p>
            </div>
          ) : (
            /* STEP 2: Google Review button ONLY shown after copying */
            <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {googleReviewUrl ? (
                <button
                  type="button"
                  onClick={handleShareOnGoogle}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 bg-[length:200%_auto] hover:bg-right hover:scale-[1.01] active:scale-[0.99] text-white font-semibold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-sm"
                >
                  <span>Share on Google</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onDone}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Done</span>
                </button>
              )}

              {/* Helper notice */}
              <p className="text-[11px] text-emerald-400 text-center flex items-center justify-center gap-1.5 py-0.5 font-medium">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Text copied! Just paste (tap & hold or Ctrl+V) on Google.</span>
              </p>

              {/* Secondary button to re-copy if edited */}
              <button
                type="button"
                onClick={copyToClipboard}
                className="w-full h-9 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 font-medium flex items-center justify-center gap-2 cursor-pointer text-xs transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied again!' : 'Copy text again'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Secondary Link: Send Private Feedback */}
      <div className="text-center pt-1 space-y-3">
        <button
          type="button"
          onClick={onOpenPrivateFeedback}
          className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium hover:underline underline-offset-4 cursor-pointer transition-all"
        >
          <MessageSquareHeart className="w-3.5 h-3.5" />
          <span>Send private feedback directly to the restaurant</span>
        </button>

        {/* 4. Tertiary: No thanks, I'm done */}
        <div>
          <button
            type="button"
            onClick={onDone}
            className="text-xs text-slate-400 hover:text-slate-300 py-1 px-3 rounded-lg hover:bg-slate-850 cursor-pointer transition-colors"
          >
            No thanks, I&apos;m done
          </button>
        </div>

        {/* 5. Start a new review */}
        {slug && (
          <div className="pt-2 border-t border-slate-800/60">
            <a
              href={`/r/${slug}?new=1`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Submit another review</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

