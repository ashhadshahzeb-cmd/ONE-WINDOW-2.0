import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { count, error: countErr } = await supabase
    .from('file_tracking_records')
    .select('id', { count: 'estimated', head: true });

  if (countErr) console.error("Count error:", countErr);
  else console.log("Estimated records in DB:", count);

  // Check activity logs
  const { data: logs, error: logsErr } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (logsErr) {
    console.error("Logs error:", logsErr);
  } else {
    console.log(`Fetched ${logs.length} activity logs:`);
    const uniqueActions = [...new Set(logs.map(l => l.action))];
    console.log("Actions in logs:", uniqueActions);
    
    // filter logs from yesterday or related to edits
    logs.forEach(l => {
      if (l.action.includes('EDIT') || l.action.includes('DATE') || l.action.includes('PRINT')) {
        console.log(`Log: ${l.created_at} - User: ${l.user_name} - Action: ${l.action} - Diary: ${l.diary_number} - Details:`, JSON.stringify(l.details));
      }
    });
  }
}

main();
