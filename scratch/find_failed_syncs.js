import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findPendingSyncs() {
  console.log("Fetching recent REGISTER activity logs...");
  // Get all REGISTER activities in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: logs, error: logError } = await supabase
    .from('activity_log')
    .select('*')
    .eq('action', 'REGISTER')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (logError) {
    console.error("Error fetching logs:", logError);
    return;
  }
  
  console.log(`Found ${logs.length} total REGISTER activities.`);

  const pendingFiles = [];

  for (const log of logs) {
    const rc = log.receiving_number;
    const diary = log.diary_number;
    
    // Check if a record exists with this receiving number
    const { data: files, error: fileError } = await supabase
      .from('file_tracking_records')
      .select('id, created_at, cfo_diary_number, receiving_number')
      .eq('receiving_number', rc);
      
    if (fileError) {
      console.error(fileError);
      continue;
    }
    
    // Check if the receiving number actually matches THIS log
    // A log is "orphaned" (pending sync) if:
    // 1. The receiving number doesn't exist in file_tracking_records at all
    // 2. The receiving number exists but its created_at is significantly before the log's created_at
    //    (Meaning the user tried to register with an already used receiving number).
    
    let isPending = false;
    let reason = "";
    
    if (!files || files.length === 0) {
      isPending = true;
      reason = "Not saved in database";
    } else {
      // Check date difference
      const fileDate = new Date(files[0].created_at);
      const logDate = new Date(log.created_at);
      
      // If the file was created more than 1 day before the log, it means the RC number was reused
      // and this log failed to insert.
      const diffHours = (logDate - fileDate) / (1000 * 60 * 60);
      if (diffHours > 24) {
        isPending = true;
        reason = `Duplicate Receiving Number. RC-${rc} was already used on ${fileDate.toISOString().split('T')[0]}`;
      } else if (files[0].cfo_diary_number !== diary && Math.abs(diffHours) > 1) {
         // Maybe diary number mismatch and time mismatch
         // But let's mainly rely on duplicate RC
      }
    }
    
    if (isPending) {
      pendingFiles.push({
        log_date: log.created_at,
        user: log.user_name,
        diary_number: diary,
        receiving_number: rc,
        subject: log.subject,
        amount: log.details?.amount,
        reason: reason
      });
    }
  }
  
  console.log("\n====== ORPHANED / PENDING SYNC FILES ======");
  console.log(JSON.stringify(pendingFiles, null, 2));
  console.log(`Total Pending Files Found: ${pendingFiles.length}`);
}

findPendingSyncs();
