'use client'

import { usePwa } from './PwaProvider'
import { WifiOff, Wifi } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function OfflineIndicator() {
  const { isOnline } = usePwa()
  const [showReconnected, setShowReconnected] = useState(false)
  const [hasBeenOffline, setHasBeenOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true)
    } else if (hasBeenOffline) {
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
        setHasBeenOffline(false)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [isOnline, hasBeenOffline])

  if (!isOnline) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
        <WifiOff className="w-4 h-4 text-rose-400 animate-pulse" />
        <span>You are offline. Changes will sync when reconnected.</span>
      </div>
    )
  }

  if (showReconnected) {
    return (
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold shadow-xl backdrop-blur-md flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
        <Wifi className="w-4 h-4 text-emerald-400" />
        <span>Back online! Reconnected to ReviewPulse.</span>
      </div>
    )
  }

  return null
}
