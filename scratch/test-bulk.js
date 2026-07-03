import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("Fetching diary numbers from activity_log...");
  const { data: logData, error: logError } = await supabase
    .from('activity_log')
    .select('diary_number')
    .eq('action', 'BULK_EDIT_DATE');

  if (logError) {
    console.error("Log error:", logError);
    return;
  }
  
  if (!logData || logData.length === 0) {
    console.log("No BULK_EDIT_DATE logs found.");
    return;
  }
  
  const diaryNumbers = [...new Set(logData.map(l => l.diary_number).filter(Boolean))];
  console.log(`Found ${diaryNumbers.length} unique diary numbers.`);

  console.log("Fetching corresponding records from file_tracking_records...");
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .in('cfo_diary_number', diaryNumbers)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Records error:", error);
    return;
  }

  console.log(`Fetched ${data.length} records from Supabase.`);
  if (data.length > 0) {
    console.log("Found records:", data.map(d => d.cfo_diary_number));
  }
}

main();
