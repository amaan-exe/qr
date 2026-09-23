'use client'

import { ArrowLeft, Utensils } from 'lucide-react'

interface QuizProgressHeaderProps {
  restaurantName: string
  logoUrl?: string | null
  currentStep: number
  totalSteps: number
  onBack: () => void
  canGoBack: boolean
}

export default function QuizProgressHeader({
  restaurantName,
  logoUrl,
  currentStep,
  totalSteps,
  onBack,
  canGoBack,
}: QuizProgressHeaderProps) {
  const progressPercent = Math.round(((currentStep) / totalSteps) * 100)

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {/* Top row with restaurant info & back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canGoBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Previous question"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 shadow-sm">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={restaurantName} className="w-full h-full object-cover" />
              ) : (
                <Utensils className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-sm font-semibold text-slate-200 truncate max-w-[180px] sm:max-w-xs">
              {restaurantName}
            </span>
          </div>
        </div>

        <div className="text-xs font-medium text-slate-400">
          Question <span className="text-white font-bold">{currentStep}</span> of {totalSteps}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
