'use client'

import { useState } from 'react'
import { X, Send, Loader2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { trackClientEvent } from '@/lib/client/telemetry'

interface PrivateFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  restaurantName: string
}

const CATEGORIES = [
  { key: 'food', label: 'Food quality' },
  { key: 'service', label: 'Hospitality / Service' },
  { key: 'waiting_time', label: 'Waiting time' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'billing', label: 'Billing / Price' },
  { key: 'other', label: 'Other' },
]

export default function PrivateFeedbackModal({
  isOpen,
  onClose,
  sessionId,
  restaurantName,
}: PrivateFeedbackModalProps) {
  const [category, setCategory] = useState<string>('food')
  const [message, setMessage] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactValue, setContactValue] = useState('')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/public/sessions/${sessionId}/private-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message,
          contact_name: contactName || null,
          contact_value: contactValue || null,
          contact_consent: Boolean(contactValue && consent),
        }),
      })

      if (res.ok) {
        trackClientEvent(sessionId, 'PRIVATE_FEEDBACK_SUBMITTED', { category })
        setIsSuccess(true)
        setTimeout(() => {
          setIsSuccess(false)
          onClose()
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit feedback')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Feedback Sent</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Your message has been privately forwarded to the management of {restaurantName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Private Message to Management
              </h2>
              <p className="text-xs text-slate-400">
                Direct, confidential feedback seen only by restaurant owners
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                      category === cat.key
                        ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share any issue, suggestion, or specific praise with the owner..."
                rows={3}
                maxLength={1000}
                required
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Optional Contact Details */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium">
                Optional: Request a follow-up from management
              </p>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
                <input
                  type="text"
                  placeholder="Phone or Email"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {contactValue && (
                <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
                  />
                  <span>The restaurant may use this info to reply to you.</span>
                </label>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 text-xs shadow-md shadow-rose-500/20 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending feedback...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Private Message
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
