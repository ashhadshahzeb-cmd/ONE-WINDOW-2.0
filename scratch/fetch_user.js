import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const rc = "RC-9937";
  const tid = "FT-2026-49136";
  const { data: logs, error: logsError } = await supabase
    .from('activity_log')
    .select('*')
    .or(`receiving_number.eq.${rc},record_id.eq.${tid}`)
    .order('created_at', { ascending: false });
    
  if (logsError) {
    console.error("Error:", logsError);
  } else {
    console.log("Activity logs:", JSON.stringify(logs, null, 2));
  }
}
checkUser();
