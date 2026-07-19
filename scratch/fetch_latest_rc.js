import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateNewReceivingNumber() {
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('receiving_number')
    .ilike('receiving_number', 'RC-%')
    .order('receiving_number', { ascending: false })
    .limit(10);
    
  console.log("Latest RC numbers:", JSON.stringify(data, null, 2));
}
generateNewReceivingNumber();
