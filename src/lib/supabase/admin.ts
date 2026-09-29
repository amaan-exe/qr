import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

let cachedAdminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createAdminClient() {
  if (!cachedAdminClient) {
    cachedAdminClient = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return cachedAdminClient
}
