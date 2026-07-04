import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("Fetching column names for file_tracking_records...");
  // We can just select a single row and log the keys
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No data found to infer columns.");
  }
}

main();
