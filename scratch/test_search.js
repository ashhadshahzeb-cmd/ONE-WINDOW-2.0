import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearch() {
  const debouncedSearchQuery = "CFO-2026-1042";
  const q = `%${debouncedSearchQuery.toLowerCase()}%`;
  
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .or(`cfo_diary_number.ilike.${q},receiving_number.ilike.${q},subject.ilike.${q},received_from.ilike.${q},tracking_id.ilike.${q}`)
    .limit(10);
    
  console.log("Error:", error);
  console.log("Data length:", data?.length);
  if (data?.length > 0) {
    console.log("First item:", data[0].subject);
  }
}
testSearch();
