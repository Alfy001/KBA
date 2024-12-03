// supabase.js

require("dotenv").config();
const { createClient } = require('@supabase/supabase-js');

// Supabase URL and keys
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // Anon public key for user-based operations
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin tasks

// Supabase client for user-based operations (respects RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase client for admin tasks (bypasses RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Export the clients for use in other files
module.exports = { supabase, supabaseAdmin };
