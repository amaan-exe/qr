interface LogPayload {
  level?: 'info' | 'warn' | 'error'
  sessionId?: string | null
  businessId?: string | null
  action: string
  latencyMs?: number
  metadata?: Record<string, unknown>
}

export function logEvent({
  level = 'info',
  sessionId = null,
  businessId = null,
  action,
  latencyMs,
  metadata = {},
}: LogPayload) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    session_id: sessionId,
    business_id: businessId,
    action,
    latency_ms: latencyMs,
    ...metadata,
  }

  const json = JSON.stringify(entry)

  if (level === 'error') {
    console.error(json)
  } else if (level === 'warn') {
    console.warn(json)
  } else {
    console.log(json)
  }
}
