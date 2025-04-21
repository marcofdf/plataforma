import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://igrwcnubdtablwzpeskx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncndjbnViZHRhYmx3enBlc2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MTA0MTcsImV4cCI6MjA2MDQ4NjQxN30.kqJrHeAYcdQzhrJ_dwK5-Zr6is7OK-_BEOdvPxtaVBs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
