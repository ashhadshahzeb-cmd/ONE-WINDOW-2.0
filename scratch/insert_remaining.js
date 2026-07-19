import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const failedRecords = [
  {
    "user": "ASST. CFO-SHAYAN",
    "diary_number": "CFO-2627-3-0070",
    "receiving_number": "RC-9419",
    "subject": "Mr Amjad Ali Khan (C.P. Fund)",
    "amount": 640723,
    "date": "2026-07-17"
  },
  {
    "user": "ASST. CFO-ALI",
    "diary_number": "CFO-2627-1-0015",
    "receiving_number": "RC-4628",
    "subject": "Mr. Mohammad Irfan Aziz (Pension Case)",
    "amount": 0,
    "date": "2026-07-17"
  },
  {
    "user": "SYSTEM ADMINISTRATOR",
    "diary_number": "CFO-2026-80367",
    "receiving_number": "SG-4647",
    "subject": "M/s A2Z Enterprises",
    "amount": 482240,
    "date": "2026-07-16"
  },
  {
    "user": "SYSTEM ADMINISTRATOR",
    "diary_number": "CFO-2026-80366",
    "receiving_number": "SG-7273",
    "subject": "M/s A2Z Enterprises",
    "amount": 390720,
    "date": "2026-07-16"
  },
  {
    "user": "SYSTEM ADMINISTRATOR",
    "diary_number": "CFO-2026-80365",
    "receiving_number": "SG-6610",
    "subject": "M/s A2Z Enterprises",
    "amount": 390720,
    "date": "2026-07-16"
  },
  {
    "user": "SYSTEM ADMINISTRATOR",
    "diary_number": "CFO-2026-80364",
    "receiving_number": "NT-6232",
    "subject": "M/s M Ali Builders Enterprises",
    "amount": 199492,
    "date": "2026-07-16"
  },
  {
    "user": "SYSTEM ADMINISTRATOR",
    "diary_number": "CFO-2026-80363",
    "receiving_number": "MT-3037",
    "subject": "Rabeel Enterprises",
    "amount": 968348,
    "date": "2026-07-16"
  }
];

async function registerRemaining() {
  for (const record of failedRecords) {
    let success = false;
    let suffix = 1;
    let newRc = `${record.receiving_number}-${suffix}`;
    
    while (!success && suffix < 10) {
      const trackingId = `FT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      
      const payload = {
        tracking_id: trackingId,
        cfo_diary_number: record.diary_number,
        receiving_number: newRc,
        subject: record.subject,
        amount: record.amount,
        employee_number: "",
        voucher_code: "",
        vehicle_no: "",
        print_date: record.date,
        history: [{
          date: new Date().toISOString(),
          action: "REGISTERED",
          processed_by: record.user
        }]
      };

      const { data, error } = await supabase
        .from('file_tracking_records')
        .insert(payload);
        
      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          suffix++;
          newRc = `${record.receiving_number}-${suffix}`;
        } else {
          console.error(`Failed to insert ${record.subject}:`, error);
          break;
        }
      } else {
        console.log(`Successfully registered "${record.subject}" | Old RC: ${record.receiving_number} => New RC: ${newRc} | Diary: ${record.diary_number}`);
        success = true;
      }
    }
  }
}
registerRemaining();
