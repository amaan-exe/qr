'use client'

import { useState } from 'react'
import QuizProgressHeader from './QuizProgressHeader'
import QuizNavigationControls from './QuizNavigationControls'
import ReviewDraftCard from './ReviewDraftCard'
import PrivateFeedbackModal from './PrivateFeedbackModal'
import ThankYouCard from './ThankYouCard'
import OfflineBanner from './OfflineBanner'
import StarRatingQuestion from './questions/StarRatingQuestion'
import EmojiRatingQuestion from './questions/EmojiRatingQuestion'
import ServiceRatingQuestion from './questions/ServiceRatingQuestion'
import ComplimentsQuestion from './questions/ComplimentsQuestion'
import OrderedItemsQuestion, { type MenuItemData } from './questions/OrderedItemsQuestion'
import { trackClientEvent } from '@/lib/client/telemetry'
import { Clock, ShieldCheck, ArrowRight, Utensils, Loader2 } from 'lucide-react'

interface QuizFlowProps {
  slug: string
  restaurantName: string
  logoUrl?: string | null
  primaryColor?: string | null
  welcomeMessage?: string
  googleReviewUrl?: string | null
  initialSessionId?: string | null
  initialStatus?: string | null
  initialAnswers?: Record<string, any>
  initialDraftText?: string | null
  menuItems: MenuItemData[]
}

type QuestionKey = 'overall_rating' | 'food_rating' | 'service_rating' | 'liked' | 'ordered'

export default function QuizFlow({
  slug,
  restaurantName,
  logoUrl,
  welcomeMessage = "Thanks for dining with us! We'd love to hear about your experience today.",
  googleReviewUrl = null,
  initialSessionId = null,
  initialStatus = null,
  initialAnswers = {},
  initialDraftText = null,
  menuItems = [],
}: QuizFlowProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId)
  const isInitiallyCompleted = initialStatus === 'completed'
  const isInitiallyInProgress = initialStatus === 'in_progress'

  const [view, setView] = useState<'landing' | 'quiz' | 'draft' | 'thank_you'>(
    isInitiallyCompleted ? 'draft' : isInitiallyInProgress ? 'quiz' : 'landing'
  )

  const [isPrivateFeedbackOpen, setIsPrivateFeedbackOpen] = useState(false)
  const [hasSyncError, setHasSyncError] = useState(false)
  const [pendingSync, setPendingSync] = useState<{ key: string; value: any } | null>(null)

  // Active question keys (Q5 is omitted if 0 menu items)
  const questionKeys: QuestionKey[] = [
    'overall_rating',
    'food_rating',
    'service_rating',
    'liked',
    ...(menuItems.length > 0 ? (['ordered'] as QuestionKey[]) : []),
  ]

  // Find first unanswered question if resuming
  const getInitialStepIndex = () => {
    for (let i = 0; i < questionKeys.length; i++) {
      const key = questionKeys[i]
      if (initialAnswers[key] === undefined || initialAnswers[key] === null) {
        return i
      }
    }
    return 0
  }

  const [stepIndex, setStepIndex] = useState(getInitialStepIndex())
  const [answers, setAnswers] = useState<Record<string, any>>({
    overall_rating: initialAnswers.overall_rating ?? null,
    food_rating: initialAnswers.food_rating ?? null,
    service_rating: initialAnswers.service_rating ?? null,
    liked: initialAnswers.liked ?? [],
    ordered: initialAnswers.ordered ?? [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  // Save an individual answer via API
  const persistAnswer = async (sId: string, key: string, value: any) => {
    try {
      const res = await fetch(`/api/public/sessions/${sId}/answers/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })
      if (!res.ok) {
        setHasSyncError(true)
        setPendingSync({ key, value })
      } else {
        setHasSyncError(false)
        setPendingSync(null)
      }
    } catch (err) {
      console.warn('Failed to save answer:', err)
      setHasSyncError(true)
      setPendingSync({ key, value })
    }
  }

  const handleRetry = async () => {
    if (!sessionId) return
    setHasSyncError(false)
    if (pendingSync) {
      await persistAnswer(sessionId, pendingSync.key, pendingSync.value)
    }
  }

  // Handle starting the quiz
  const handleStart = async () => {
    try {
      let activeSessionId = sessionId

      // 1. Create or ensure session
      if (!activeSessionId) {
        setIsStarting(true)
        const res = await fetch('/api/public/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        })
        const data = await res.json()
        if (data?.session_id) {
          activeSessionId = data.session_id
          setSessionId(activeSessionId)
        }
      }

      // 2. Immediately transition to quiz view for instant UI responsiveness
      setView('quiz')

      if (activeSessionId) {
        // Fire start & event asynchronously in background without blocking customer
        fetch(`/api/public/sessions/${activeSessionId}/start`, { method: 'POST' }).catch(console.warn)
        trackClientEvent(activeSessionId, 'QUIZ_STARTED')
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
      setView('quiz')
    } finally {
      setIsStarting(false)
    }
  }

  // Set an answer for a question with auto-save
  const handleSetAnswer = (key: QuestionKey, value: any, autoAdvance = false) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))

    if (sessionId) {
      persistAnswer(sessionId, key, value)
    }

    if (autoAdvance && stepIndex < questionKeys.length - 1) {
      setTimeout(() => {
        setStepIndex((prev) => Math.min(prev + 1, questionKeys.length - 1))
      }, 350)
    }
  }

  // Next / Submit action
  const handleNext = async () => {
    const isLast = stepIndex === questionKeys.length - 1

    if (isLast) {
      await handleSubmit()
    } else {
      setStepIndex((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    if (stepIndex < questionKeys.length - 1) {
      setStepIndex((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1)
    }
  }

  // Submit quiz completion -> proceeds directly to Draft screen (Phase 3)
  const handleSubmit = async () => {
    if (!sessionId) return
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/public/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        trackClientEvent(sessionId, 'QUIZ_COMPLETED')
        setView('draft')
      } else {
        const errorData = await res.json()
        console.error('Submission failed:', errorData)
        if (errorData?.missing_questions?.[0]) {
          const missingKey = errorData.missing_questions[0]
          const targetIdx = questionKeys.indexOf(missingKey)
          if (targetIdx !== -1) setStepIndex(targetIdx)
        }
      }
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==========================================
  // VIEW 1: LANDING SCREEN
  // ==========================================
  if (view === 'landing') {
    return (
      <>
        <OfflineBanner hasSyncError={hasSyncError} onRetry={handleRetry} />
        <main className="relative z-10 w-full max-w-md mx-auto my-auto py-8">
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-2xl shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 overflow-hidden">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={restaurantName} className="w-full h-full object-cover" />
              ) : (
                <Utensils className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {restaurantName}
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">{welcomeMessage}</p>
            </div>

            <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Takes ~30 seconds</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Anonymous</span>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleStart}
                disabled={isStarting}
                className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-rose-500/25 group transition-all duration-200 cursor-pointer text-base active:scale-[0.98] disabled:opacity-80 disabled:cursor-wait"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Quick Quiz
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400">
                Feedback and reviews are optional. Your honest opinion helps us improve.
              </p>
            </div>
          </div>
        </main>
      </>
    )
  }

  // ==========================================
  // VIEW 2: DRAFT SCREEN (PHASE 3)
  // ==========================================
  if (view === 'draft' && sessionId) {
    return (
      <>
        <OfflineBanner hasSyncError={hasSyncError} onRetry={handleRetry} />
        <ReviewDraftCard
          sessionId={sessionId}
          slug={slug}
          restaurantName={restaurantName}
          googleReviewUrl={googleReviewUrl}
          initialDraftText={initialDraftText || ''}
          onOpenPrivateFeedback={() => setIsPrivateFeedbackOpen(true)}
          onDone={() => setView('thank_you')}
        />

        <PrivateFeedbackModal
          isOpen={isPrivateFeedbackOpen}
          onClose={() => setIsPrivateFeedbackOpen(false)}
          sessionId={sessionId}
          restaurantName={restaurantName}
        />
      </>
    )
  }

  // ==========================================
  // VIEW 3: THANK YOU SCREEN (PHASE 3)
  // ==========================================
  if (view === 'thank_you') {
    return (
      <>
        <OfflineBanner hasSyncError={hasSyncError} onRetry={handleRetry} />
        <ThankYouCard restaurantName={restaurantName} slug={slug} />
        <PrivateFeedbackModal
          isOpen={isPrivateFeedbackOpen}
          onClose={() => setIsPrivateFeedbackOpen(false)}
          sessionId={sessionId || ''}
          restaurantName={restaurantName}
        />
      </>
    )
  }

  // ==========================================
  // VIEW 4: ACTIVE QUIZ STEPS
  // ==========================================
  const currentKey = questionKeys[stepIndex]
  const isCurrentOptional = currentKey === 'liked' || currentKey === 'ordered'
  const isLastQuestion = stepIndex === questionKeys.length - 1

  let canAdvance = true
  if (currentKey === 'overall_rating') canAdvance = Boolean(answers.overall_rating)
  if (currentKey === 'food_rating') canAdvance = Boolean(answers.food_rating)
  if (currentKey === 'service_rating') canAdvance = Boolean(answers.service_rating)

  return (
    <>
      <OfflineBanner hasSyncError={hasSyncError} onRetry={handleRetry} />
      <div className="relative z-10 w-full max-w-lg mx-auto py-6 px-4 sm:px-0 flex flex-col justify-between min-h-[580px]">
      <QuizProgressHeader
        restaurantName={restaurantName}
        logoUrl={logoUrl}
        currentStep={stepIndex + 1}
        totalSteps={questionKeys.length}
        onBack={handleBack}
        canGoBack={stepIndex > 0}
      />

      <div className="my-auto py-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/85 border border-slate-800/80 backdrop-blur-2xl shadow-2xl">
          {currentKey === 'overall_rating' && (
            <StarRatingQuestion
              value={answers.overall_rating}
              onChange={(val) => handleSetAnswer('overall_rating', val, true)}
            />
          )}

          {currentKey === 'food_rating' && (
            <EmojiRatingQuestion
              value={answers.food_rating}
              onChange={(val) => handleSetAnswer('food_rating', val, true)}
            />
          )}

          {currentKey === 'service_rating' && (
            <ServiceRatingQuestion
              value={answers.service_rating}
              onChange={(val) => handleSetAnswer('service_rating', val, true)}
            />
          )}

          {currentKey === 'liked' && (
            <ComplimentsQuestion
              value={answers.liked || []}
              onChange={(val) => handleSetAnswer('liked', val, false)}
            />
          )}

          {currentKey === 'ordered' && (
            <OrderedItemsQuestion
              menuItems={menuItems}
              value={answers.ordered || []}
              onChange={(val) => handleSetAnswer('ordered', val, false)}
            />
          )}
        </div>

        <QuizNavigationControls
          isOptional={isCurrentOptional}
          isLastQuestion={isLastQuestion}
          canAdvance={canAdvance}
          isSubmitting={isSubmitting}
          onNext={handleNext}
          onSkip={handleSkip}
        />
      </div>
    </div>
    </>
  )
}
