import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("Checking if transfer_advices table exists...");
  const { data, error } = await supabase.from('transfer_advices').select('id').limit(1);
  
  if (error) {
    console.error("Error accessing table:", error.message, error.code);
  } else {
    console.log("Table exists! Data:", data);
  }
}

main();
