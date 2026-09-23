'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MessageSquareHeart, User, Phone, Mail, Calendar, ShieldCheck } from 'lucide-react'

export interface PrivateFeedbackItem {
  id: string
  category: string
  message: string
  contactName: string | null
  contactValue: string | null
  contactConsent: boolean
  createdAt: string
}

interface FeedbackTabProps {
  feedbackList: PrivateFeedbackItem[]
}

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  service: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  waiting_time: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  cleanliness: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  billing: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  other: 'bg-slate-800 text-slate-300 border-slate-700',
}

export default function FeedbackTab({ feedbackList }: FeedbackTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Private Feedback Inbox</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Confidential comments submitted directly to management without appearing on Google
        </p>
      </div>

      {feedbackList.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
          <CardContent className="py-16 text-center text-slate-400 space-y-2">
            <MessageSquareHeart className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No private messages yet</p>
            <p className="text-xs max-w-sm mx-auto">
              When diners choose to send confidential operational notes instead of or alongside public reviews, their direct feedback will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((item) => {
            const badgeClass = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other

            return (
              <Card key={item.id} className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
                <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass} uppercase tracking-wider`}>
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {item.contactConsent && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Reply consent granted
                    </span>
                  )}
                </CardHeader>

                <CardContent className="pt-4 space-y-3">
                  <p className="text-sm text-slate-200 leading-relaxed font-normal bg-slate-950/50 p-4 rounded-xl border border-slate-800/60">
                    &ldquo;{item.message}&rdquo;
                  </p>

                  {(item.contactName || item.contactValue) && (
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      {item.contactName && (
                        <span className="flex items-center gap-1.5 font-medium text-slate-300">
                          <User className="w-3.5 h-3.5 text-rose-400" />
                          {item.contactName}
                        </span>
                      )}
                      {item.contactValue && (
                        <span className="flex items-center gap-1.5 text-slate-300">
                          {item.contactValue.includes('@') ? (
                            <Mail className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          {item.contactValue}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
