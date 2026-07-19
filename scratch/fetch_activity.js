import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkActivityLog() {
  const fileNo = "CFO-2627-3-0069";
  
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .ilike('details', `%${fileNo}%`); // or context, but let's just query everything if possible
    
  if (error) {
    console.error("Error:", error);
  } else if (data && data.length > 0) {
    console.log("Found in activity_log:", JSON.stringify(data, null, 2));
  } else {
    // Try searching all text columns in activity_log
    const { data: allData, error: err2 } = await supabase
        .from('activity_log')
        .select('*')
        .or(`action.ilike.%${fileNo}%,details.ilike.%${fileNo}%`); // Check schema
        
    console.log("Or search:", allData);
  }
}

// Let's just do a blanket fetch and filter in JS to be safe
async function blanketCheck() {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (data) {
        const found = data.filter(d => JSON.stringify(d).includes("2627-3-0069"));
        console.log("Activity log exact matches:", JSON.stringify(found, null, 2));
    }
}
blanketCheck();
