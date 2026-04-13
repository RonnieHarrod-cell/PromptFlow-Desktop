import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = SUPABASE_URL
  ? createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: {
        // Electron has no real browser storage — use localStorage polyfill
        storage: window.localStorage,
        persistSession: true,
        autoRefreshToken: true,
        // Tell Supabase this is a desktop app, not a web browser
        flowType: 'pkce',
      },
      global: {
        headers: {
          // Identify as desktop client so Supabase doesn't apply browser-only restrictions
          'X-Client-Info': 'promptflow-studio-electron',
        },
      },
    })
  : null

export const isSupabaseConfigured = () => !!SUPABASE_URL