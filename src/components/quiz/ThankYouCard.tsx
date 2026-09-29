'use client'

import { Heart, Utensils, RotateCcw, Calendar, ExternalLink, Sparkles } from 'lucide-react'

interface ThankYouCardProps {
  restaurantName: string
  slug?: string
}

export default function ThankYouCard({ restaurantName, slug }: ThankYouCardProps) {
  return (
    <div className="w-full max-w-md mx-auto py-12 px-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-400">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-xl shadow-amber-600/25 border-2 border-white">
        <Heart className="w-8 h-8 fill-white" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-900 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Shukriya! धन्यवाद</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight sm:text-3xl">
          Thank you for dining with us!
        </h1>
        <p className="text-sm text-stone-600 font-medium">
          Your honest thoughts help the chef and team at {restaurantName} maintain the highest standard.
        </p>
      </div>

      {/* Appreciation Note */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80 text-left space-y-2 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
          <Utensils className="w-4 h-4 text-amber-600" />
          <span>We Value Your Feedback</span>
        </div>
        <p className="text-[12px] text-stone-600 leading-relaxed">
          Your response has been recorded successfully. The chef and staff will review your feedback to keep improving the dining experience. We hope to see you again soon!
        </p>
      </div>

      {/* Useful Restaurant Links */}
      <div className="pt-2 space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href="https://www.google.com/maps/reserve/v/dine/c/XvYn-6P8yQQ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Reserve Table</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61557653526564"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition-colors shadow-xs"
          >
            <span>Facebook Page</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>

        {slug && (
          <div className="pt-3">
            <a
              href={`/r/${slug}?new=1`}
              className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-900 font-semibold transition-colors"
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
