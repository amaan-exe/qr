'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

export interface BusinessSettings {
  id: string
  name: string
  location: string | null
  googleReviewUrl: string | null
  welcomeMessage: any
  primaryColor: string | null
}

interface SettingsTabProps {
  business: BusinessSettings
  onRefresh: () => void
}

export default function SettingsTab({ business, onRefresh }: SettingsTabProps) {
  const [name, setName] = useState(business.name)
  const [location, setLocation] = useState(business.location || '')
  const [googleUrl, setGoogleUrl] = useState(business.googleReviewUrl || '')
  const [welcomeText, setWelcomeText] = useState(
    (typeof business.welcomeMessage === 'object' && business.welcomeMessage?.en) ||
      "Thanks for dining with us! We'd love to hear about your experience today."
  )
  const [primaryColor, setPrimaryColor] = useState(business.primaryColor || '#f43f5e')
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim() || undefined,
          google_review_url: googleUrl.trim() || null,
          welcome_message: { en: welcomeText.trim() },
          primary_color: primaryColor || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        onRefresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update settings')
      }
    } catch {
      setError('Connection error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Restaurant Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure profile, Google review integration, and customer landing preferences
        </p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader className="pb-4 border-b border-slate-800">
            <CardTitle className="text-sm text-white">Profile Details</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Information displayed to guests scanning QR codes
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="sName" className="text-xs font-medium text-slate-300">
                Restaurant Name
              </Label>
              <Input
                id="sName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-950/60 border-slate-800 text-white h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sLoc" className="text-xs font-medium text-slate-300">
                Location
              </Label>
              <Input
                id="sLoc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or branch name"
                className="bg-slate-950/60 border-slate-800 text-white h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sGoogle" className="text-xs font-medium text-slate-300">
                Google Review Page URL
              </Label>
              <Input
                id="sGoogle"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                placeholder="https://g.page/r/... or https://maps.app.goo.gl/..."
                className="bg-slate-950/60 border-slate-800 text-white h-10 text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Customers will be handed off directly to this URL after completing the quiz.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sWelcome" className="text-xs font-medium text-slate-300">
                Welcome Copy on Landing Screen
              </Label>
              <textarea
                id="sWelcome"
                rows={3}
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium text-slate-300">Brand Accent Color</Label>
                <p className="text-[11px] text-slate-400">Used for highlights in QR landing screens</p>
              </div>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ReviewPulse policy guardrails are permanently active for this restaurant.</span>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6 border-t border-slate-800 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold h-10 px-6 rounded-xl shadow-md shadow-rose-500/20 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
