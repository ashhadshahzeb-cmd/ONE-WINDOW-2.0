import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';

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

function generatePassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$*';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

async function randomizePasswords() {
  const { data: users, error: err } = await supabaseAdmin.auth.admin.listUsers();
  if (err) {
    console.error("Failed to list users:", err);
    process.exit(1);
  }
  
  const credentials = [];
  
  for (const user of users.users) {
    // Skip superadmin if needed, but they asked for all users. We can do it for everyone.
    // Wait, superadmin needs a password too, it's better to reset it as well and give the user the list.
    const newPass = generatePassword(10);
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPass
    });
    
    if (updateErr) {
      console.error(`Failed to update password for ${user.email}:`, updateErr);
    } else {
      console.log(`Updated password for ${user.email}`);
      credentials.push({ email: user.email, password: newPass, role: user.user_metadata?.role_id || 'unknown' });
    }
  }
  
  // Write to a JSON file so the agent can read it and format it as an artifact
  fs.writeFileSync(path.resolve(__dirname, 'new_credentials.json'), JSON.stringify(credentials, null, 2));
  console.log('Done! Passwords saved to new_credentials.json');
}

randomizePasswords().catch(console.error);
