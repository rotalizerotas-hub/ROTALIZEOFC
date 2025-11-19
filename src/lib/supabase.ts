import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iuymgwlwaqlvyhwulaod.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eW1nd2x3YXFsdnlod3VsYW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODA2NzgsImV4cCI6MjA3ODY1NjY3OH0.ta3UCvscQTJehFBM-Et027-x2_wG501MHBC5k8ZCVWQ'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})