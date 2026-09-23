'use client'

import { Frown, Meh, Smile, Heart, Crown, Check } from 'lucide-react'

interface ServiceRatingQuestionProps {
  value: number | null
  onChange: (value: number) => void
}

const SERVICE_OPTIONS = [
  {
    rating: 1,
    label: 'Poor',
    desc: 'Slow, inattentive, or unhelpful',
    icon: Frown,
    activeBorder: 'border-rose-500/80',
    activeBg: 'bg-rose-500/15',
    activeGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/50',
    badgeActive: 'bg-rose-500 text-white shadow-md shadow-rose-500/30',
    badgeInactive: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20',
    labelActive: 'text-rose-200',
    labelInactive: 'text-slate-200 group-hover:text-white',
    indicatorActive: 'border-rose-500 bg-rose-500 text-white',
  },
  {
    rating: 2,
    label: 'Fair',
    desc: 'Could be friendlier or faster',
    icon: Meh,
    activeBorder: 'border-amber-500/80',
    activeBg: 'bg-amber-500/15',
    activeGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50',
    badgeActive: 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30',
    badgeInactive: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20',
    labelActive: 'text-amber-200',
    labelInactive: 'text-slate-200 group-hover:text-white',
    indicatorActive: 'border-amber-500 bg-amber-500 text-slate-950',
  },
  {
    rating: 3,
    label: 'Good',
    desc: 'Attentive & met expectations',
    icon: Smile,
    activeBorder: 'border-sky-500/80',
    activeBg: 'bg-sky-500/15',
    activeGlow: 'shadow-[0_0_20px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/50',
    badgeActive: 'bg-sky-500 text-white shadow-md shadow-sky-500/30',
    badgeInactive: 'bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-500/20',
    labelActive: 'text-sky-200',
    labelInactive: 'text-slate-200 group-hover:text-white',
    indicatorActive: 'border-sky-500 bg-sky-500 text-white',
  },
  {
    rating: 4,
    label: 'Very Good',
    desc: 'Warm, attentive, and helpful',
    icon: Heart,
    activeBorder: 'border-emerald-500/80',
    activeBg: 'bg-emerald-500/15',
    activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50',
    badgeActive: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30',
    badgeInactive: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20',
    labelActive: 'text-emerald-200',
    labelInactive: 'text-slate-200 group-hover:text-white',
    indicatorActive: 'border-emerald-500 bg-emerald-500 text-white',
  },
  {
    rating: 5,
    label: 'Excellent',
    desc: 'Outstanding hospitality & care',
    icon: Crown,
    activeBorder: 'border-amber-400',
    activeBg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/10',
    activeGlow: 'shadow-[0_0_25px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/60',
    badgeActive: 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-bold shadow-md shadow-amber-400/40',
    badgeInactive: 'bg-amber-400/10 text-amber-300 border border-amber-400/25 group-hover:bg-amber-400/20',
    labelActive: 'text-amber-200 font-bold',
    labelInactive: 'text-slate-200 group-hover:text-white',
    indicatorActive: 'border-amber-400 bg-amber-400 text-slate-950',
  },
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
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-300">
            Question 3 of 5
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-slate-400">Required</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          How was the{' '}
          <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-amber-200 bg-clip-text text-transparent">
            hospitality & service
          </span>
          ?
        </h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Staff attentiveness, friendliness, and speed of service
        </p>
      </div>

      {/* 5 Polished Service Option Cards */}
      <div
        role="radiogroup"
        aria-label="Service and hospitality rating"
        className="py-1 space-y-2.5 max-w-md mx-auto text-left"
      >
        {SERVICE_OPTIONS.map((opt) => {
          const isSelected = value === opt.rating
          const Icon = opt.icon

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
              className={`group relative w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.985] text-left flex items-center justify-between ${
                isSelected
                  ? `${opt.activeBorder} ${opt.activeBg} ${opt.activeGlow} scale-[1.01]`
                  : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-850/90 hover:border-slate-700/80 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3.5">
                {/* Expressive Icon Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                    isSelected ? opt.badgeActive : opt.badgeInactive
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm sm:text-base font-semibold tracking-tight transition-colors ${
                        isSelected ? opt.labelActive : opt.labelInactive
                      }`}
                    >
                      {opt.label}
                    </h3>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium transition-colors ${
                        isSelected
                          ? 'bg-white/15 text-white/90 font-bold'
                          : 'bg-slate-800/90 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {opt.rating}/5
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug mt-0.5 group-hover:text-slate-300 transition-colors">
                    {opt.desc}
                  </p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0 ml-3 ${
                  isSelected
                    ? `${opt.indicatorActive} shadow-sm scale-110`
                    : 'border-slate-700/80 bg-slate-800/40 group-hover:border-slate-600'
                }`}
                aria-hidden="true"
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
