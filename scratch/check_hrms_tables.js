import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHRMSTables() {
  const tables = [
    'hrms_attendance',
    'hrms_shifts',
    'hrms_employees',
    'hrms_announcements',
    'hrms_leave_requests',
    'hrms_payroll'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`[Error] ${table}: ${error.message}`);
    } else {
      console.log(`[OK] ${table} exists.`);
    }
  }
}
checkHRMSTables();
