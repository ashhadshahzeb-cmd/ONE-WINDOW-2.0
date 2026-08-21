import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lhnogjmeyqbuoiruykpw.supabase.co';
const supabaseKey = 'sb_publishable_t4svZ8krxb9VqkPA0epoDQ_s-av_vnE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFile() {
  const { data, error } = await supabase
    .from('file_tracking_records')
    .select('*')
    .or('subject.ilike.%abdul raqeeb%,received_from.ilike.%abdul raqeeb%,handover_person_name.ilike.%abdul raqeeb%');
    
  if (data) {
    console.log('Found:', data.length, 'records');
    if (data.length > 0) {
      console.log('First match:', data[0]);
    }
    return;
  }
  
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Result:', JSON.stringify(data, null, 2));
  }
}

checkFile();
