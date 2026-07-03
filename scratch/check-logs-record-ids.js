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
  
  const recordIds = [];
  logs.forEach(l => {
    console.log(`Log: ${l.created_at} - User: ${l.user_name} - Diary: ${l.diary_number} - RecordId: ${l.record_id}`);
    if (l.record_id) recordIds.push(l.record_id);
  });

  if (recordIds.length > 0) {
    const { data: records, error: recErr } = await supabase
      .from('file_tracking_records')
      .select('id, cfo_diary_number, receiving_number, history, created_at, print_date, inward_date')
      .in('id', recordIds);
      
    if (recErr) {
        console.error("Records error:", recErr);
    } else {
        console.log(`\nFetched ${records.length} corresponding records:`);
        records.forEach(r => {
            console.log(`Diary: ${r.cfo_diary_number}, Created: ${r.created_at}, Inward: ${r.inward_date}, Print: ${r.print_date}`);
            console.log(`History:`, JSON.stringify(r.history, null, 2));
        });
    }
  }
}

main();
