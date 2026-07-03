import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("Fetching newest records to check sync...");
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('cfo_diary_number, created_at, id, mark_to')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("10 newest records:");
    console.log(data);
  }
}

main();
