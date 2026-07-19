import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFileHistory() {
  const fileNo = "0082";
  
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .or(`receiving_number.ilike.%${fileNo}%,cfo_diary_number.ilike.%${fileNo}%,tracking_id.ilike.%${fileNo}%`);
    
  if (error) {
    console.error("Error:", error);
  } else if (data && data.length > 0) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log("No records found with 0082.");
  }
}
checkFileHistory();
