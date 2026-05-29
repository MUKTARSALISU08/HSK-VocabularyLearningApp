import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Debug logging
console.log('[SUPABASE] URL:', supabaseUrl ? 'Loaded' : 'MISSING')
console.log('[SUPABASE] Service Role Key:', supabaseServiceRoleKey ? `Loaded (${supabaseServiceRoleKey.substring(0, 10)}...)` : 'MISSING')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('[SUPABASE] ERROR: Missing required environment variables!')
  console.error('[SUPABASE] SUPABASE_URL:', supabaseUrl ? 'Set' : 'UNSET')
  console.error('[SUPABASE] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? 'Set' : 'UNSET')
}

// Create Supabase client with service role key - bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})