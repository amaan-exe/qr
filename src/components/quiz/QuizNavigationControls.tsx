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
            className="text-xs sm:text-sm font-medium text-slate-400 hover:text-slate-200 py-2 px-3 rounded-lg hover:bg-slate-850 transition-colors cursor-pointer"
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
        className="ml-auto bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold h-11 px-6 rounded-xl shadow-lg shadow-rose-500/20 cursor-pointer min-w-[130px] transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : isLastQuestion ? (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Finish & Review
          </>
        ) : (
          <>
            Next
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </>
        )}
      </Button>
    </div>
  )
}
