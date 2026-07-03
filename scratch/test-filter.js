import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('id, history')
    .filter('history', 'cs', '[{"action":"BULK_DATE_EDITED"}]');

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Found ${data.length} records using 'cs' filter.`);
  }
}

main();
