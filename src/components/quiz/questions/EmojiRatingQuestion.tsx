'use client'

interface EmojiRatingQuestionProps {
  value: number | null
  onChange: (value: number) => void
}

const EMOJI_OPTIONS = [
  { rating: 1, emoji: '😞', label: 'Bad', color: 'hover:border-rose-500/50 group-hover:text-rose-400' },
  { rating: 2, emoji: '😕', label: 'Fair', color: 'hover:border-amber-500/50 group-hover:text-amber-400' },
  { rating: 3, emoji: '😐', label: 'Okay', color: 'hover:border-yellow-500/50 group-hover:text-yellow-400' },
  { rating: 4, emoji: '🙂', label: 'Good', color: 'hover:border-emerald-500/50 group-hover:text-emerald-400' },
  { rating: 5, emoji: '😍', label: 'Amazing!', color: 'hover:border-emerald-400 group-hover:text-emerald-300' },
]

export default function EmojiRatingQuestion({ value, onChange }: EmojiRatingQuestionProps) {
  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(5, (value ?? rating) + 1)
      onChange(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = Math.max(1, (value ?? rating) - 1)
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
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-300">
            Question 2 of 5
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-slate-400">Required</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          How did you find the{' '}
          <span className="bg-gradient-to-r from-rose-300 via-amber-300 to-rose-200 bg-clip-text text-transparent">
            food & drinks
          </span>
          ?
        </h2>
        <p className="text-sm text-slate-400">
          Taste, freshness, and presentation
        </p>
      </div>

      {/* 5 Emoji Face Buttons */}
      <div
        role="radiogroup"
        aria-label="Food and drink rating"
        className="py-6 flex items-center justify-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap"
      >
        {EMOJI_OPTIONS.map((opt) => {
          const isSelected = value === opt.rating

          return (
            <button
              key={opt.rating}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (!value && opt.rating === 1) ? 0 : -1}
              onClick={() => onChange(opt.rating)}
              onKeyDown={(e) => handleKeyDown(e, opt.rating)}
              aria-label={`${opt.label} (${opt.rating} of 5)`}
              className={`group flex flex-col items-center justify-center w-16 h-22 sm:w-18 sm:h-24 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                isSelected
                  ? 'border-rose-500 bg-rose-500/15 scale-110 shadow-lg shadow-rose-500/25 ring-2 ring-rose-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className="text-3xl sm:text-4xl transition-transform group-hover:scale-115 group-active:scale-95 duration-200" aria-hidden="true">
                {opt.emoji}
              </span>
              <span
                className={`text-xs font-semibold mt-2 transition-colors ${
                  isSelected ? 'text-rose-400 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {opt.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="h-6" aria-live="polite">
        {value ? (
          <p className="text-sm font-semibold text-rose-300 animate-in fade-in duration-200">
            {EMOJI_OPTIONS.find((o) => o.rating === value)?.label}
          </p>
        ) : (
          <p className="text-xs text-slate-400">Select how satisfied you were</p>
        )}
      </div>
    </div>
  )
}
