import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExact() {
  const rcNo = "RC-9771";
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('id, tracking_id, cfo_diary_number, receiving_number')
    .eq('receiving_number', rcNo);
    
  console.log("Root fields for RC-9771:", JSON.stringify(data, null, 2));
}
checkExact();
