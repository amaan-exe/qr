import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 selection:bg-rose-500 selection:text-white">
      {/* Subtle background ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20 mb-3">
            <span className="font-black text-xl tracking-wider">RP</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ReviewPulse</h1>
          <p className="text-sm text-slate-400 mt-1">Restaurant Experience & Authentic Reviews</p>
        </div>
        {children}
      </div>
    </div>
  )
}
