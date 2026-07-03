import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("Checking Supabase for CFO-2627-3-%...");
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('cfo_diary_number, created_at, id')
    .like('cfo_diary_number', 'CFO-2627-3-%');

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Found ${data.length} records:`);
    console.log(data);
  }
}

main();
