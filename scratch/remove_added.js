import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const rcsToDelete = [
  'RC-9419-1',
  'RC-4628-1',
  'SG-4647-1',
  'SG-7273-1',
  'SG-6610-2',
  'NT-6232-1',
  'MT-3037-1',
  'RC-9772' // Mr Sabir Masih
];

async function removeAddedFiles() {
  const { data, error } = await supabase
    .from('file_tracking_records')
    .delete()
    .in('receiving_number', rcsToDelete);

  if (error) {
    console.error("Error deleting files:", error);
  } else {
    console.log(`Successfully removed the ${rcsToDelete.length} files that were added manually.`);
  }
}

removeAddedFiles();
