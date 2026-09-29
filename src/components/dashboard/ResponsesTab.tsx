'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, MessageSquare, Utensils, ThumbsUp, Calendar, Filter, Phone, MessageCircle, Copy, Check } from 'lucide-react'

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
  customerName?: string | null
  customerPhone?: string | null
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
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

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
            Real-time structured feedback, verified diner phone numbers, and generated review drafts
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
                ? 'bg-amber-500 text-slate-950 font-bold'
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
              Once diners scan your QR codes and complete the feedback quiz, their structured answers, phone numbers, and review drafts will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((item) => (
            <Card key={item.id} className="border-slate-800 bg-slate-900/60 backdrop-blur-xl hover:border-slate-700 transition-colors">
              <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 rounded-xl">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-amber-300">
                      {item.overallRating ?? '—'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm text-white">
                        {item.customerName || item.campaignName}
                      </CardTitle>
                      {item.customerName && (
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                          {item.campaignName}
                        </span>
                      )}
                    </div>
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

                {/* Customer Contact & Sub-Ratings */}
                <div className="flex items-center gap-3 text-xs">
                  {item.customerPhone && (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-emerald-300 text-[11px] font-mono font-semibold">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      <span>+91 {item.customerPhone}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.customerPhone!, item.id)}
                        className="p-0.5 hover:text-white"
                        title="Copy phone"
                      >
                        {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

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
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1"
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
