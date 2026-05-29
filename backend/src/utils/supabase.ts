import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Debug: Verify environment variables are loaded
console.log('[SUPABASE] URL loaded:', supabaseUrl ? 'Yes' : 'No')
console.log('[SUPABASE] Service Role Key loaded:', supabaseServiceRoleKey ? 'Yes' : 'No')
console.log('[SUPABASE] Key starts with sb_secret:', supabaseServiceRoleKey?.startsWith('sb_secret_') ? 'Yes' : 'No')

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
