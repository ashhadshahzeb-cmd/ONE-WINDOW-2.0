import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const diaryNumber = 'CFO-TEST-BULK-' + Date.now();
  
  // Insert into file_tracking_records
  const { data: recordData, error: recordError } = await supabase
    .from('file_tracking_records')
    .insert([
      {
        tracking_id: 'TRK-' + Date.now(),
        cfo_diary_number: diaryNumber,
        receiving_number: 'RC-' + Date.now(),
        subject: 'Test Bulk Modified',
        created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        inward_date: new Date(Date.now() - 86400000).toLocaleDateString('en-GB'),
        print_date: new Date().toISOString(), // Today
        history: [{ action: 'BULK_DATE_EDITED', date: new Date().toISOString() }],
        main_category: 'General',
        sub_category: 'Other'
      }
    ])
    .select();

  if (recordError) {
    console.error("Failed to insert record:", recordError);
    return;
  }
  
  console.log("Inserted test record:", recordData[0].cfo_diary_number);

  // Insert into activity_log
  const { error: logError } = await supabase
    .from('activity_log')
    .insert([
      {
        user_role: 'system_admin',
        user_name: 'System Admin',
        action: 'BULK_EDIT_DATE',
        diary_number: diaryNumber,
        receiving_number: recordData[0].receiving_number,
        record_id: recordData[0].id
      }
    ]);

  if (logError) {
    console.error("Failed to insert log:", logError);
    return;
  }
  
  console.log("Inserted activity log for:", diaryNumber);
}

main();
