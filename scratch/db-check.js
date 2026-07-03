import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('id, cfo_diary_number, receiving_number, history, created_at, print_date, inward_date')
    .limit(100);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Total records checked: ${data.length}`);
  const withHistory = data.filter(r => r.history && r.history.length > 0);
  console.log(`Records with history: ${withHistory.length}`);
  withHistory.forEach(r => {
    console.log(`Record ${r.cfo_diary_number} / ${r.receiving_number}:`, JSON.stringify(r.history));
  });

  const modified = data.filter(r => {
    if (!r.history) return false;
    return JSON.stringify(r.history).includes('EDITED') || JSON.stringify(r.history).includes('DATE');
  });
  console.log(`Records with modified action: ${modified.length}`);
}

main();
