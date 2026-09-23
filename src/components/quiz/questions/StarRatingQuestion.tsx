'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingQuestionProps {
  value: number | null
  onChange: (value: number) => void
}

const RATING_LABELS: Record<number, string> = {
  1: 'Disappointing experience',
  2: 'Could have been better',
  3: 'Good / Average',
  4: 'Very good!',
  5: 'Outstanding experience!',
}

export default function StarRatingQuestion({ value, onChange }: StarRatingQuestionProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const activeRating = hovered ?? value ?? 0

  const handleKeyDown = (e: React.KeyboardEvent, star: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(5, (value ?? star) + 1)
      onChange(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(1, (value ?? star) - 1)
      onChange(prev)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onChange(1)
    } else if (e.key === 'End') {
      e.preventDefault()
      onChange(5)
    }
  }

  return (
    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Required • 1 of 5
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
          How was your overall experience today?
        </h2>
        <p className="text-sm text-slate-400">
          Tap a star to rate your visit
        </p>
      </div>

      {/* Interactive Stars */}
      <div
        role="radiogroup"
        aria-label="Overall experience rating"
        className="py-6 flex items-center justify-center gap-2 sm:gap-4"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating
          const isSelected = star === value

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (!value && star === 1) ? 0 : -1}
              onClick={() => onChange(star)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}: ${RATING_LABELS[star]}`}
              className={`relative min-w-[48px] min-h-[48px] p-2.5 sm:p-3 rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-95 flex items-center justify-center ${
                isSelected
                  ? 'bg-amber-400/15 scale-110 shadow-lg shadow-amber-500/20'
                  : 'hover:bg-slate-800/60 hover:scale-105'
              }`}
            >
              <Star
                className={`w-9 h-9 sm:w-11 sm:h-11 transition-all duration-200 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                    : 'text-slate-600 fill-transparent hover:text-slate-500'
                }`}
              />
            </button>
          )
        })}
      </div>

      {/* Verbal Feedback Label */}
      <div className="h-6" aria-live="polite">
        {activeRating > 0 ? (
          <p className="text-sm font-semibold text-amber-300 animate-in fade-in duration-200">
            {RATING_LABELS[activeRating]}
          </p>
        ) : (
          <p className="text-xs text-slate-400">Select 1 to 5 stars</p>
        )}
      </div>
    </div>
  )
}
