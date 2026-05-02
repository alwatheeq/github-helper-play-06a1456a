import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use placeholder values when env vars are missing so module load doesn't throw.
// The EnvValidator component (mounted in App.tsx) then renders the friendly
// "Configuration Error" screen at render time instead of a hard crash.
const effectiveUrl = supabaseUrl || 'https://placeholder.supabase.co'
const effectiveKey = supabaseAnonKey || 'placeholder-anon-key'

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
