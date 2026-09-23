'use client'

import { Heart, Utensils, RotateCcw } from 'lucide-react'

interface ThankYouCardProps {
  restaurantName: string
  slug?: string
}

export default function ThankYouCard({ restaurantName, slug }: ThankYouCardProps) {
  return (
    <div className="w-full max-w-md mx-auto py-16 px-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-400">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25">
        <Heart className="w-8 h-8 fill-white" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
          Thank you!
        </h1>
        <p className="text-sm text-slate-300 font-medium">
          Thanks for sharing your feedback with {restaurantName}.
        </p>
        <p className="text-xs text-slate-400 max-w-xs mx-auto pt-1 leading-relaxed">
          We hope you had a great time and look forward to welcoming you back again soon!
        </p>
      </div>

      <div className="pt-4 space-y-3">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <Utensils className="w-3.5 h-3.5 text-rose-400" />
            <span>Have a wonderful day</span>
          </div>
        </div>

        {slug && (
          <div>
            <a
              href={`/r/${slug}?new=1`}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Submit another response</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
