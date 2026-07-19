import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .eq('cfo_diary_number', 'CFO-2026-589773')
    .limit(1);
    
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
  }
}
checkSchema();
