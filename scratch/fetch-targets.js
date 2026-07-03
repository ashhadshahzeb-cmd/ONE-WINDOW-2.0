import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const receivingNumbers = ['CFO-2627-4-0001', 'CFO-2627-000412', 'CFO-2627-0002CFO-2627-0002', '234234'];
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('id, cfo_diary_number, receiving_number, history, created_at, print_date, inward_date')
    .in('receiving_number', receivingNumbers);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Fetched ${data.length} records:`);
  data.forEach(r => {
    console.log(`\nDiary: ${r.cfo_diary_number}`);
    console.log(`ID: ${r.id}`);
    console.log(`Created At: ${r.created_at}`);
    console.log(`Inward Date: ${r.inward_date}`);
    console.log(`Print Date: ${r.print_date}`);
    console.log(`History:`, JSON.stringify(r.history, null, 2));
  });
}

main();
