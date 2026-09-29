'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, LogIn, AlertCircle, Utensils, KeyRound, UserCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Resolve alias 'admin' or 'owner' to the registered Biryani Charminar owner account
      let resolvedEmail = email.trim()
      if (
        resolvedEmail.toLowerCase() === 'admin' ||
        resolvedEmail.toLowerCase() === 'owner' ||
        resolvedEmail.toLowerCase() === 'biryani' ||
        resolvedEmail.toLowerCase() === 'charminar'
      ) {
        resolvedEmail = 'invincibleperson9@gmail.com'
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const rawMsg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(rawMsg)
      setLoading(false)
    }
  }

  return (
    <Card className="border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl text-slate-100 rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-amber-500/20">
            <Utensils className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Biryani Charminar Admin
          </span>
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
          <LogIn className="w-5 h-5 text-amber-500" />
          Welcome back
        </CardTitle>
        <CardDescription className="text-slate-400 text-sm">
          Sign in to view guest responses, customer phone numbers, &amp; analytics
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-2">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-500" />
              Username or Email
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="e.g. admin or owner@biryanicharminar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              className="bg-slate-950/60 border-slate-800 focus:border-amber-500 text-white placeholder:text-slate-500 h-11 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="bg-slate-950/60 border-slate-800 focus:border-amber-500 text-white placeholder:text-slate-500 h-11 pr-10 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-4 pb-6">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold h-11 rounded-lg shadow-lg shadow-amber-600/25 transition-all duration-200 cursor-pointer text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in to Dashboard'
            )}
          </Button>

          <p className="text-xs text-center text-slate-500">
            Biryani Charminar Admin Portal • Owner Access Only
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
