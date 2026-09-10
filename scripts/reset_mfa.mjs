import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetMfa(email) {
  const { data: users, error: err } = await supabaseAdmin.auth.admin.listUsers();
  if (err) throw err;
  
  const user = users.users.find(u => u.email === email);
  if (!user) {
    console.log('User not found:', email);
    return;
  }
  
  const { data: factors, error: factorsErr } = await supabaseAdmin.auth.admin.mfa.listFactors({
    userId: user.id
  });
  
  if (factorsErr) throw factorsErr;
  
  if (!factors || factors.factors.length === 0) {
    console.log('No MFA factors found for', email);
    return;
  }
  
  for (const f of factors.factors) {
    const { error: delErr } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
      userId: user.id,
      id: f.id
    });
    if (delErr) {
      console.error('Failed to delete factor:', f.id, delErr);
    } else {
      console.log('Deleted factor', f.id, 'for', email);
    }
  }
  console.log('Done!');
}

resetMfa('superadmin@kwsb.gov.pk').catch(console.error);
