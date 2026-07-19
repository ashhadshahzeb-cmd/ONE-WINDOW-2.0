import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExact() {
  const fileNo = "0069";
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .or(`receiving_number.ilike.%${fileNo}%,cfo_diary_number.ilike.%${fileNo}%,tracking_id.ilike.%${fileNo}%`);
    
  console.log("file_tracking_records:", JSON.stringify(data, null, 2));
}
checkExact();
