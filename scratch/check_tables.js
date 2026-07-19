import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTables() {
  const tablesToCheck = [
    'file_tracking_records', 'messages', 'activity_log', 'department_users_settings',
    'admin_config', 'users', 'collections', 'bill_dispatch', 'cheque_records',
    'contingency_billings', 'contractor_billings', 'medical_billings', 'pol_billings',
    'pol_settings', 'security_deposits', 'transfer_advices', 'transfer_advice_items',
    'hrms_attendance', 'hrms_employees', 'hrms_announcements', 'hrms_leave_requests',
    'hrms_payroll', 'contractors'
  ];
  
  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`[Error] Table '${table}': ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`[OK] Table '${table}' exists.`);
    }
  }
}
analyzeTables();
