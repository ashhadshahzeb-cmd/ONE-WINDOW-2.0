import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function registerRecord() {
  let success = false;
  let attemptRc = 9772;
  
  while (!success && attemptRc < 9900) {
    const rc = `RC-${attemptRc}`;
    const trackingId = `FT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const payload = {
      tracking_id: trackingId,
      cfo_diary_number: "CFO-2627-3-0069",
      receiving_number: rc,
      subject: "Mr Sabir Masih",
      amount: 288517,
      mark_to: "fund",
      employee_number: "",
      voucher_code: "",
      vehicle_no: "",
      print_date: "2026-07-17",
      history: [{
        date: new Date().toISOString(),
        action: "REGISTERED",
        processed_by: "ASST. CFO-SHAYAN"
      }]
    };

    const { data, error } = await supabase
      .from('file_tracking_records')
      .insert(payload);
      
    if (error) {
      if (error.code === '23505') { // Unique violation
        console.log(`RC ${rc} or tracking_id ${trackingId} exists, retrying...`);
        attemptRc++;
      } else {
        console.error("Unknown error:", error);
        break;
      }
    } else {
      console.log(`Success! Registered with Receiving Number: ${rc} and Tracking ID: ${trackingId}`);
      success = true;
    }
  }
}
registerRecord();
