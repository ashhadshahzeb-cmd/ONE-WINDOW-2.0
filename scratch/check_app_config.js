import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppConfig() {
  const { data, error } = await supabase.from('app_config').select('*').limit(1);
  if (error) {
    console.log(`[Error] app_config: ${error.message}`);
  } else {
    console.log(`[OK] app_config exists.`);
  }
}
checkAppConfig();
