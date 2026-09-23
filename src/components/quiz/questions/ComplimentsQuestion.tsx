'use client'

import { Utensils, HeartHandshake, Sparkles, Scale, Eye, BadgePercent, Check } from 'lucide-react'

interface ComplimentsQuestionProps {
  value: string[]
  onChange: (value: string[]) => void
}

const COMPLIMENT_OPTIONS = [
  { key: 'food', label: 'Great Food', icon: Utensils, desc: 'Delicious flavors & fresh ingredients' },
  { key: 'service', label: 'Warm Hospitality', icon: HeartHandshake, desc: 'Friendly, helpful staff' },
  { key: 'ambience', label: 'Vibe & Ambience', icon: Sparkles, desc: 'Pleasant lighting & music' },
  { key: 'portion_size', label: 'Generous Portions', icon: Scale, desc: 'Filling & satisfying quantity' },
  { key: 'presentation', label: 'Plating & Presentation', icon: Eye, desc: 'Beautifully served' },
  { key: 'value', label: 'Great Value', icon: BadgePercent, desc: 'Worth every rupee/penny' },
]

export default function ComplimentsQuestion({ value, onChange }: ComplimentsQuestionProps) {
  const toggleOption = (key: string) => {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key))
    } else {
      onChange([...value, key])
    }
  }

  return (
    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
            Question 4 of 5
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-slate-400">Optional</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          What did you{' '}
          <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-200 bg-clip-text text-transparent">
            like the most
          </span>
          ?
        </h2>
        <p className="text-sm text-slate-400">
          Select all aspects that stood out during your visit
        </p>
      </div>

      {/* 2-Column Grid of Toggleable Chips/Cards */}
      <div
        role="group"
        aria-label="Compliments and highlights"
        className="py-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left"
      >
        {COMPLIMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = value.includes(opt.key)

          return (
            <button
              key={opt.key}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggleOption(opt.key)}
              aria-label={`${opt.label}: ${opt.desc}`}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 cursor-pointer active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                isSelected
                  ? 'border-rose-500 bg-rose-500/15 shadow-md shadow-rose-500/10 ring-1 ring-rose-500/40'
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3
                    className={`text-sm font-semibold transition-colors ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {opt.label}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-snug">{opt.desc}</p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ml-2 ${
                  isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-slate-400">
        {value.length === 0 ? 'Feel free to select multiple or skip ahead' : `${value.length} selected`}
      </p>
    </div>
  )
}
