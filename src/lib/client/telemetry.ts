/**
 * Client-side telemetry helper
 * Dispatches client events with UUID idempotency to the session events endpoint.
 */
export async function trackClientEvent(
  sessionId: string,
  eventType:
    | 'QR_SCANNED'
    | 'LANDING_VIEWED'
    | 'QUIZ_STARTED'
    | 'QUESTION_ANSWERED'
    | 'QUIZ_COMPLETED'
    | 'DRAFT_GENERATED'
    | 'DRAFT_EDITED'
    | 'GOOGLE_CLICKED'
    | 'PRIVATE_FEEDBACK_SUBMITTED',
  metadata: Record<string, unknown> = {}
): Promise<boolean> {
  try {
    const clientEventId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const res = await fetch(`/api/public/sessions/${sessionId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        client_event_id: clientEventId,
        metadata,
      }),
    })

    return res.ok
  } catch (error) {
    // Non-blocking telemetry failure
    console.warn('Telemetry event failed to send:', error)
    return false
  }
}
