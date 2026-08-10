import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhnogjmeyqbuoiruykpw.supabase.co';
const supabaseKey = 'sb_publishable_t4svZ8krxb9VqkPA0epoDQ_s-av_vnE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFile() {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .ilike('diary_number', '%0054%');
  
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Result:', JSON.stringify(data, null, 2));
  }
}

checkFile();
