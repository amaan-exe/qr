import Link from 'next/link'
import { Sparkles, ArrowLeft, Home, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 w-full max-w-md text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-2xl shadow-2xl space-y-6">
          {/* Compass Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Compass className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>404 — Not Found</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Page Not Found
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              The feedback link or dashboard page you are looking for doesn&apos;t exist or may have expired.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard"
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.98] transition"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/login"
              className="flex-1 h-11 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
