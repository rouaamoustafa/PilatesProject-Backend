import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'    // ← makes process.env.SUPABASE_* available

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// at startup you should see this log and its prefix should match your service key,
// not the anon key (anon keys start with "eyJhbGc…", service_role keys also start with eyJ but are much longer).
console.log('Using service key prefix:', SUPABASE_SERVICE_ROLE_KEY.slice(0,10), '…')

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase credentials – check your .env')
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)
