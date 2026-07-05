import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  console.log("Testing insert into transfer_advices...");
  const adviceId = crypto.randomUUID();
  
  const { data, error: headerErr } = await supabase.from('transfer_advices').insert({
    id: adviceId,
    advice_no: 'TEST-123',
    date: new Date().toISOString().split('T')[0],
    bank_name: 'TEST BANK',
    subject: 'TEST SUBJECT',
    total_amount: 100,
    created_by: 'test@example.com',
    created_at: new Date().toISOString()
  });

  if (headerErr) {
    console.error("Header Insert Error:", headerErr);
    return;
  }
  
  console.log("Header inserted. Testing items insert...");
  
  const { error: itemsErr } = await supabase.from('transfer_advice_items').insert([{
    id: crypto.randomUUID(),
    transfer_advice_id: adviceId,
    s_no: 1,
    transfer_amount: 100,
    amount_in_words: 'One Hundred',
    ac_no_debit: '123',
    ac_no_credit: '456',
    in_respect_of: 'TEST',
    created_at: new Date().toISOString()
  }]);
  
  if (itemsErr) {
    console.error("Items Insert Error:", itemsErr);
    return;
  }
  
  console.log("Insert successful!");
}

main();
