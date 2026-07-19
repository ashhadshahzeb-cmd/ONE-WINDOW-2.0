import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTime() {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .gte('created_at', '2026-06-19T11:25:00Z')
    .lte('created_at', '2026-06-19T11:27:00Z');
    
  if (data && data.length > 0) {
    console.log(`Found ${data.length} logs around that time.`);
    console.log(data.slice(0, 5));
  } else {
    console.log("No logs found at that time.");
  }
}
checkTime();
