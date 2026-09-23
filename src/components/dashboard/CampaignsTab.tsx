'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  QrCode,
  Download,
  Copy,
  Plus,
  Check,
  PauseCircle,
  PlayCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'

export interface CampaignItem {
  id: string
  name: string
  slug: string
  active: boolean
  created_at: string
}

interface CampaignsTabProps {
  campaigns: CampaignItem[]
  onRefresh: () => void
}

export default function CampaignsTab({ campaigns, onRefresh }: CampaignsTabProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCampaignName, setNewCampaignName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const copyCampaignUrl = (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2500)
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/business/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive }),
      })
      if (res.ok) onRefresh()
    } catch (e) {
      console.error('Toggle campaign error:', e)
    }
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCampaignName.trim()) return

    setIsCreating(true)
    setError(null)

    try {
      const res = await fetch('/api/business/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCampaignName.trim() }),
      })

      if (res.ok) {
        setNewCampaignName('')
        setIsModalOpen(false)
        onRefresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create campaign')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and New Campaign CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">QR Campaigns Studio</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage table tents, bill cards, counters, and takeaway packaging QR codes
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs h-10 px-4 rounded-xl shadow-md shadow-rose-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <Card
            key={camp.id}
            className={`border-slate-800 bg-slate-900/70 backdrop-blur-xl transition-all duration-200 ${
              !camp.active ? 'opacity-70 border-slate-850' : 'hover:border-slate-700'
            }`}
          >
            <CardHeader className="pb-3 border-b border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-white">{camp.name}</CardTitle>
                <CardDescription className="text-xs text-slate-400 font-mono mt-0.5">
                  /r/{camp.slug}
                </CardDescription>
              </div>
              <button
                type="button"
                onClick={() => handleToggleActive(camp.id, camp.active)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all active:scale-95 ${
                  camp.active
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
                title={camp.active ? 'Click to pause this QR code' : 'Click to activate this QR code'}
              >
                {camp.active ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px]">Active</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[11px]">Paused (Click to enable)</span>
                  </>
                )}
              </button>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* QR Image Preview */}
              <div className="p-4 rounded-2xl bg-white flex items-center justify-center mx-auto max-w-[200px] shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/business/qr?slug=${camp.slug}&format=png`}
                  alt={`QR for ${camp.name}`}
                  className="w-36 h-36 object-contain"
                />
              </div>

              {/* Actions: Copy Link, Download PNG, Download SVG */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => copyCampaignUrl(camp.slug)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {copiedSlug === camp.slug ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedSlug === camp.slug ? 'Link Copied!' : 'Copy Direct Link'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`/api/business/qr?slug=${camp.slug}&format=png&download=true`}
                    download={`reviewpulse-qr-${camp.slug}.png`}
                    className="py-2 px-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-400" />
                    <span>PNG (Print)</span>
                  </a>

                  <a
                    href={`/api/business/qr?slug=${camp.slug}&format=svg&download=true`}
                    download={`reviewpulse-qr-${camp.slug}.svg`}
                    className="py-2 px-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>SVG (Vector)</span>
                  </a>
                </div>

                <a
                  href={`/r/${camp.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-[11px] text-slate-400 hover:text-slate-200 pt-1"
                >
                  <span className="inline-flex items-center gap-1">
                    Preview Landing Page <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-slate-100 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create New QR Campaign</h3>
            <p className="text-xs text-slate-400">
              Each campaign gets a unique QR code and slug for performance tracking.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="campName" className="text-xs font-medium text-slate-300">
                  Campaign Name
                </Label>
                <Input
                  id="campName"
                  placeholder="e.g. Indoor Dining, Rooftop, Bill Folder"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  required
                  className="bg-slate-950/60 border-slate-800 text-white h-10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-slate-300 border-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !newCampaignName.trim()}
                  className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold h-10 px-4 rounded-xl shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Generate QR Campaign'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
