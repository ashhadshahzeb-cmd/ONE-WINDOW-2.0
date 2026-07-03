import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data: logs, error: logsErr } = await supabase
    .from('activity_log')
    .select('*')
    .in('action', ['BULK_EDIT_DATE'])
    .order('created_at', { ascending: false })
    .limit(20);

  if (logsErr) {
    console.error("Logs error:", logsErr);
    return;
  }
  
  console.log(`Fetched ${logs.length} BULK_EDIT_DATE activity logs:`);
  
  logs.forEach(l => {
    console.log(`Log: ${l.created_at} - User: ${l.user_name} - Diary: ${l.diary_number} - Receiving: ${l.receiving_number} - RecordId: ${l.record_id}`);
  });
}

main();
