import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
  const fileNo = "0069";
  
  const tables = [
    { name: 'contingencies', col: 'serial_no' },
    { name: 'contingencies', col: 'party_code' },
    { name: 'pol_bills', col: 'serial_no' },
    { name: 'security_deposits', col: 'serial_no' },
    { name: 'contractor_billings', col: 'serial_no' },
    { name: 'medical_billings', col: 'serial_no' },
    { name: 'cheque_records', col: 'serial_no' },
    { name: 'regular_employees', col: 'employee_no' },
    { name: 'retired_employees', col: 'pension_no' },
  ];
  
  for (const {name, col} of tables) {
    const { data, error } = await supabase
      .from(name)
      .select('*')
      .ilike(col, `%${fileNo}%`);
      
    if (data && data.length > 0) {
        console.log(`Found in ${name} column ${col}:`, data.length);
        console.log(data[0]);
    }
  }
}
checkAll();
