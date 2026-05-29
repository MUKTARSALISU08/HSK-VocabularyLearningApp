import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
// Accept either SUPABASE_SERVICE_ROLE_KEY or hsk_backend_service_role
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.hsk_backend_service_role || ''

// Debug logging
console.log('[SUPABASE] URL:', supabaseUrl ? 'Loaded' : 'MISSING')
console.log('[SUPABASE] Service Role Key:', supabaseServiceRoleKey ? `Loaded (${supabaseServiceRoleKey.substring(0, 10)}...)` : 'MISSING')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('[SUPABASE] ERROR: Missing required environment variables!')
  console.error('[SUPABASE] SUPABASE_URL:', supabaseUrl ? 'Set' : 'UNSET')
  console.error('[SUPABASE] SUPABASE_SERVICE_ROLE_KEY or hsk_backend_service_role:', supabaseServiceRoleKey ? 'Set' : 'UNSET')
}

// Create Supabase client with service role key - bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
})

// Verify service role by checking admin capabilities
async function verifyServiceRole() {
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers()
    if (error) {
      console.error('[SUPABASE] FAILED to verify service role:', error.message)
    } else {
      console.log('[SUPABASE] Service role VERIFIED - can access admin API')
      console.log('[SUPABASE] Number of users:', users?.users.length || 0)
    }
  } catch (err) {
    console.error('[SUPABASE] Error verifying service role:', err)
  }
}

// Run verification on startup
verifyServiceRole()