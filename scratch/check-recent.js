import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("Fetching all records to see what we have...");
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('cfo_diary_number, created_at, id')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Recent records in DB:");
    console.log(data);
  }
}

main();
