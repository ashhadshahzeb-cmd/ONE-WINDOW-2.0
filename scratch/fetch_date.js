import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDate() {
  const rcNo = "RC-9771";
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('id, created_at, subject')
    .eq('receiving_number', rcNo);
    
  console.log("Date for RC-9771:", JSON.stringify(data, null, 2));
}
checkDate();
