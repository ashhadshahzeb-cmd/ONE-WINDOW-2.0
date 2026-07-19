import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFileTracking() {
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log("Database Error:", error);
    return;
  }
  
  const dbColumns = Object.keys(data[0] || {});
  console.log("DB Columns:", dbColumns);
  
  // Read FileTracking.tsx to find expected payload structure
  const fileTrackingCode = fs.readFileSync('src/pages/book-section/FileTracking.tsx', 'utf8');
  
  // Check useSyncManager.ts to see what fields are stripped out
  const syncManagerCode = fs.readFileSync('src/hooks/useSyncManager.ts', 'utf8');
  
  // Try to find the newEntry definition
  const newEntryMatch = fileTrackingCode.match(/const newEntry\s*=\s*\{([\s\S]*?)\};/);
  if (newEntryMatch) {
    console.log("\nFound newEntry structure in FileTracking.tsx...");
    // Just show a snippet of it
    console.log(newEntryMatch[0].substring(0, 500) + '...');
  }
}
checkFileTracking();
