'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Star, MessageSquare, Utensils, ThumbsUp, Calendar, Filter } from 'lucide-react'

export interface ResponseItem {
  id: string
  campaignName: string
  status: string
  completedAt: string | null
  overallRating: number | null
  foodRating: number | null
  serviceRating: number | null
  liked: string[]
  ordered: string[]
  draftText: string | null
  draftEdited: boolean
}

interface ResponsesTabProps {
  responses: ResponseItem[]
}

const EMOJIS: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😍',
}

export default function ResponsesTab({ responses }: ResponsesTabProps) {
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')

  const filteredResponses = responses.filter((r) => {
    if (filterRating === 'all') return true
    return r.overallRating === filterRating
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Customer Responses Feed</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time structured feedback and generated review drafts from dining guests
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <button
            type="button"
            onClick={() => setFilterRating('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filterRating === 'all'
                ? 'bg-rose-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({responses.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterRating(s)}
              className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                filterRating === s ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}★
            </button>
          ))}
        </div>
      </div>

      {/* Responses List */}
      {filteredResponses.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
          <CardContent className="py-16 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No responses recorded yet</p>
            <p className="text-xs max-w-sm mx-auto">
              Once diners scan your QR codes and complete the 5-question quiz, their structured answers and review drafts will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((item) => (
            <Card key={item.id} className="border-slate-800 bg-slate-900/60 backdrop-blur-xl hover:border-slate-750 transition-colors">
              <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 rounded-xl">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-amber-300">
                      {item.overallRating ?? '—'}
                    </span>
                  </div>

                  <div>
                    <CardTitle className="text-sm text-white">{item.campaignName}</CardTitle>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {item.completedAt
                          ? new Date(item.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'In progress'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Ratings */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-300">
                    <span>Food:</span>
                    <span className="text-base">{item.foodRating ? EMOJIS[item.foodRating] : '—'}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300">
                    Hospitality: <span className="font-semibold text-white">{item.serviceRating ?? '—'}/5</span>
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                {/* Compliments & Dishes */}
                <div className="flex flex-wrap items-center gap-2">
                  {item.liked.map((l) => (
                    <span
                      key={l}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {l}
                    </span>
                  ))}

                  {item.ordered.map((dish) => (
                    <span
                      key={dish}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"
                    >
                      <Utensils className="w-3 h-3 text-amber-400" />
                      {dish}
                    </span>
                  ))}
                </div>

                {/* Review Draft Text */}
                {item.draftText && (
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <span>Generated Review Draft</span>
                      {item.draftEdited && <span className="text-amber-400">Edited by diner</span>}
                    </div>
                    <p className="italic leading-relaxed">&ldquo;{item.draftText}&rdquo;</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
