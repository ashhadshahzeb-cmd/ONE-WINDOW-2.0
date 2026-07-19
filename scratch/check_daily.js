import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDailyCollections() {
  const { data, error } = await supabase.from('daily_collections').select('*').limit(1);
  if (error) {
    console.log(`[Error] daily_collections: ${error.message}`);
  } else {
    console.log(`[OK] daily_collections exists.`);
  }
}
checkDailyCollections();
