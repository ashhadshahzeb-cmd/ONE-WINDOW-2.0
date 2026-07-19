import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findPendingSyncs() {
  console.log("Fetching recent REGISTER activity logs...");
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

  // Fetch ALL receiving numbers from file_tracking_records in one go to save time
  const { data: files, error: filesError } = await supabase
    .from('file_tracking_records')
    .select('created_at, cfo_diary_number, receiving_number');

  if (filesError) {
    console.error("Error fetching files:", filesError);
    return;
  }

  const fileMap = new Map();
  for (const f of files) {
    fileMap.set(f.receiving_number, f);
  }

  const pendingFiles = [];

  for (const log of logs) {
    const rc = log.receiving_number;
    const diary = log.diary_number;
    
    let isPending = false;
    let reason = "";
    
    const file = fileMap.get(rc);

    if (!file) {
      isPending = true;
      reason = "Not saved in database";
    } else {
      const fileDate = new Date(file.created_at);
      const logDate = new Date(log.created_at);
      
      const diffHours = (logDate - fileDate) / (1000 * 60 * 60);
      if (diffHours > 24) {
        isPending = true;
        reason = `Duplicate RC. RC-${rc} already used on ${fileDate.toISOString().split('T')[0]}`;
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
  console.log(JSON.stringify(pendingFiles.slice(0, 8), null, 2)); // Limit to first 8 to match the "8 PENDING SYNC"
  console.log(`Total Pending Files Found: ${pendingFiles.length}`);
}

findPendingSyncs();
