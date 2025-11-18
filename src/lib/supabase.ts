import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iuymgwlwaqlvyhwulaod.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eW1nd2x3YXFsdnlod3VsYW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODA2NzgsImV4cCI6MjA3ODY1NjY3OH0.ta3UCvscQTJehFBM-Et027-x2_wG501MHBC5k8ZCVWQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})