import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFileHistory() {
  const fileNo = "CFO-2627-4-0078";
  
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .or(`receiving_number.eq.${fileNo},cfo_diary_number.eq.${fileNo}`);
    
  if (error) {
    fs.writeFileSync('file_history_output.json', JSON.stringify({error}));
  } else if (data && data.length > 0) {
    fs.writeFileSync('file_history_output.json', JSON.stringify(data[0], null, 2));
  } else {
    // try searching with ILIKE
    const { data: looseData } = await supabase
      .from('file_tracking_records')
      .select('*')
      .ilike('cfo_diary_number', `%${fileNo}%`);
      
    if (looseData && looseData.length > 0) {
      fs.writeFileSync('file_history_output.json', JSON.stringify(looseData[0], null, 2));
    } else {
      const { data: looseData2 } = await supabase
        .from('file_tracking_records')
        .select('*')
        .ilike('receiving_number', `%${fileNo}%`);
      fs.writeFileSync('file_history_output.json', JSON.stringify(looseData2 || [], null, 2));
    }
  }
}
checkFileHistory();
