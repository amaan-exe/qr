'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

interface QuizNavigationControlsProps {
  isOptional: boolean
  isLastQuestion: boolean
  canAdvance: boolean
  isSubmitting: boolean
  onNext: () => void
  onSkip?: () => void
}

export default function QuizNavigationControls({
  isOptional,
  isLastQuestion,
  canAdvance,
  isSubmitting,
  onNext,
  onSkip,
}: QuizNavigationControlsProps) {
  return (
    <div className="w-full max-w-lg mx-auto pt-6 flex items-center justify-between gap-4">
      {/* Skip Button for optional questions */}
      <div>
        {isOptional && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmitting}
            className="text-xs sm:text-sm font-semibold text-stone-500 hover:text-stone-900 py-2.5 px-3.5 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* Primary Next / Finish Button */}
      <Button
        type="button"
        onClick={onNext}
        disabled={!canAdvance || isSubmitting}
        className="ml-auto bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 cursor-pointer min-w-[140px] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Finishing...
          </>
        ) : isLastQuestion ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Review Draft
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </>
        )}
      </Button>
    </div>
  )
}
