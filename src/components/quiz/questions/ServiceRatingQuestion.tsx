'use client'

interface ServiceRatingQuestionProps {
  value: number | null
  onChange: (value: number) => void
}

const SERVICE_OPTIONS = [
  { rating: 1, label: 'Poor', desc: 'Slow, inattentive, or unhelpful' },
  { rating: 2, label: 'Fair', desc: 'Could be friendlier or faster' },
  { rating: 3, label: 'Good', desc: 'Met expectations' },
  { rating: 4, label: 'Very Good', desc: 'Warm, attentive, and helpful' },
  { rating: 5, label: 'Excellent', desc: 'Outstanding hospitality' },
]

export default function ServiceRatingQuestion({ value, onChange }: ServiceRatingQuestionProps) {
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
      <div className="space-y-2">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Required • 3 of 5
        </span>
        <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
          How was the hospitality & service?
        </h2>
        <p className="text-sm text-slate-400">
          Staff attentiveness, friendliness, and speed
        </p>
      </div>

      {/* 5 Vertical/Segmented Pill Cards */}
      <div
        role="radiogroup"
        aria-label="Service and hospitality rating"
        className="py-2 space-y-2.5 max-w-md mx-auto text-left"
      >
        {SERVICE_OPTIONS.map((opt) => {
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
              aria-label={`${opt.label} (${opt.rating} of 5): ${opt.desc}`}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {opt.rating}
                </div>
                <div>
                  <h3
                    className={`text-sm font-semibold transition-colors ${
                      isSelected ? 'text-amber-300' : 'text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </h3>
                  <p className="text-xs text-slate-400">{opt.desc}</p>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? 'border-amber-400 bg-amber-400' : 'border-slate-700'
                }`}
                aria-hidden="true"
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
