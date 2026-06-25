const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(url, key);
module.exports = supabase;
