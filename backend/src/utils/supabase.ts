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

// Client for AUTH operations only - this one can create sessions
export const supabaseAuth = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Client for DATABASE operations - NEVER use this for auth operations
// This client always uses service role and bypasses RLS
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
})

// Verify service role by checking admin capabilities and RLS bypass
async function verifyServiceRole() {
  try {
    // Test 1: Check admin API access
    const { data: users, error: adminError } = await supabase.auth.admin.listUsers()
    if (adminError) {
      console.error('[SUPABASE] FAILED to verify service role (admin API):', adminError.message)
    } else {
      console.log('[SUPABASE] Service role VERIFIED - can access admin API')
      console.log('[SUPABASE] Number of users:', users?.users.length || 0)
    }

    // Test 2: Direct test on profiles table with RLS bypass
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      if (profileError) {
        console.error('[SUPABASE] Failed to read profiles:', profileError.message)
      } else {
        console.log('[SUPABASE] Successfully read profiles:', profiles?.length || 0)
      }
    } catch (err) {
      console.error('[SUPABASE] Error reading profiles:', err)
    }

  } catch (err) {
    console.error('[SUPABASE] Error verifying service role:', err)
  }
}

// Run verification on startup
verifyServiceRole()