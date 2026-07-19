import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHistory() {
  const rcNo = "RC-9771";
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('history')
    .eq('receiving_number', rcNo);
    
  console.log("History for RC-9771:", JSON.stringify(data[0].history, null, 2));
}
checkHistory();
