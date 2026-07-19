import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDetails() {
  const diaryNo = "CFO-2026-589773";
  
  // Check file tracking records
  const { data: records, error: recordsError } = await supabase
    .from('file_tracking_records')
    .select('*')
    .eq('cfo_diary_number', diaryNo);
    
  if (recordsError) {
    console.error("Error fetching records:", recordsError);
  } else if (records.length > 0) {
    console.log("=== FILE TRACKING RECORDS ===");
    console.log(JSON.stringify(records, null, 2));
  } else {
    console.log(`No records found for ${diaryNo} in file_tracking_records.`);
  }

  // Check activity logs
  const { data: logs, error: logsError } = await supabase
    .from('activity_log')
    .select('*')
    .eq('diary_number', diaryNo)
    .order('created_at', { ascending: false });
    
  if (logsError) {
    console.error("Error fetching activity logs:", logsError);
  } else if (logs.length > 0) {
    console.log("=== ACTIVITY LOGS ===");
    console.log(JSON.stringify(logs, null, 2));
  } else {
    console.log(`No activity logs found for ${diaryNo}.`);
  }
}
checkDetails();
