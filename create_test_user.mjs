import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
  const { data, error } = await supabase.from('hrms_employees').insert([
    {
      name: 'Ali Raza',
      email: 'ali@kwsb.com',
      password: 'password123',
      designation: 'Software Engineer',
      department: 'IT',
      basic_salary: 50000,
      join_date: '2024-01-01'
    }
  ]);
  
  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('Successfully created test user!');
  }
}

createUser();
