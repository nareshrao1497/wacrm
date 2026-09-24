import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy, shared service-role client for the Flows engine.
// Mirrors src/lib/automations/admin-client.ts — same shape so anyone
// reading either file picks up the convention immediately.
let _adminClient: SupabaseClient | null = null

import { getServerEnv } from '@/lib/server-env'

export function supabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    _adminClient = createClient(
      getServerEnv('NEXT_PUBLIC_SUPABASE_URL'),
      getServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
    )
  }
  return _adminClient
}
