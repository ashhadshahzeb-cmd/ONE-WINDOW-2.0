import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

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

// Since we cannot easily import the TS file here without a bundler, we will extract it or hardcode the list.
// The list from AuthContext.tsx
const DEFAULT_DEPARTMENT_USERS = [
  { email: 'superadmin@kwsb.gov.pk',       password: 'super@12345',  roleId: 'super_admin',       displayName: 'SUPER ADMIN' },
  { email: 'hr.admin@kwsb.gov.pk',         password: 'hradmin',      roleId: 'hr_admin',          displayName: 'HR ADMIN' },
  { email: 'admin@kwsb.gov.pk',            password: 'admin',        roleId: 'admin',             displayName: 'SYSTEM ADMINISTRATOR' },
  { email: 'cfo@kwsb.gov.pk',              password: 'cfo@12345',    roleId: 'cfo',              displayName: 'CFO' },
  { email: 'cia@kwsb.gov.pk',              password: 'cia@12345',    roleId: 'cia',              displayName: 'CIA' },
  { email: 'budget@kwsb.gov.pk',           password: 'budget@12345', roleId: 'budget',            displayName: 'BUDGET' },
  { email: 'pension@kwsb.gov.pk',          password: 'pension@12345',roleId: 'pension',           displayName: 'PENSION' },
  { email: 'fund@kwsb.gov.pk',             password: 'fund@12345',   roleId: 'fund',              displayName: 'FUND' },
  { email: 'audit1@kwsb.gov.pk',           password: 'audit1@12345', roleId: 'internal_audit_1',  displayName: 'INTERNAL AUDIT-1' },
  { email: 'director.account@kwsb.gov.pk', password: 'da@12345',     roleId: 'director_account',  displayName: 'DIRECTOR ACCOUNT' },
  { email: 'director.finance@kwsb.gov.pk', password: 'df@12345',     roleId: 'director_finance',  displayName: 'DIRECTOR FINANCE' },
  { email: 'director.it@kwsb.gov.pk',      password: 'dit@12345',    roleId: 'director_it',       displayName: 'DIRECTOR IT' },
  { email: 'subcfo@kwsb.gov.pk',           password: 'sub@12345',     roleId: 'sub_cfo',           displayName: 'ASST. CFO' },
  { email: 'books@kwsb.gov.pk',            password: 'books@12345',   roleId: 'books',             displayName: 'BOOKS' },
  { email: 'establishment@kwsb.gov.pk',    password: 'est@12345',     roleId: 'establishment',     displayName: 'ESTABLISHMENT' },
  { email: 'director.audit@kwsb.gov.pk',   password: 'daudit@12345',  roleId: 'director_audit',    displayName: 'DIRECTOR AUDIT' },
  { email: 'audit2@kwsb.gov.pk',           password: 'audit2@12345',  roleId: 'internal_audit_2',  displayName: 'INTERNAL AUDIT-2' },
  { email: 'law@kwsb.gov.pk',              password: 'law@12345',     roleId: 'law_department',    displayName: 'LAW DEPARTMENT' },
  { email: 'chro@kwsb.gov.pk',             password: 'chro@12345',    roleId: 'chro',              displayName: 'CHRO' },
  { email: 'asst.cfo1@kwsb.gov.pk',        password: 'acfo1@12345',  roleId: 'sub_cfo_1',         displayName: 'ASST. CFO-1' },
  { email: 'asst.cfo2@kwsb.gov.pk',        password: 'acfo2@12345',  roleId: 'sub_cfo_2',         displayName: 'ASST. CFO-2' },
  { email: 'asst.cfo3@kwsb.gov.pk',        password: 'acfo3@12345',  roleId: 'sub_cfo_3',         displayName: 'ASST. CFO-3' },
  { email: 'asst.cfo4@kwsb.gov.pk',        password: 'acfo4@12345',  roleId: 'sub_cfo_4',         displayName: 'ASST. CFO-4' },
  { email: 'asst.cfo5@kwsb.gov.pk',        password: 'acfo5@12345',  roleId: 'sub_cfo_5',         displayName: 'ASST. CFO-5' },
  { email: 'mdoffice@kwsb.gov.pk',         password: 'md@12345',      roleId: 'md_office',         displayName: 'MD OFFICE' },
  { email: 'emp1@kwsb.gov.pk',             password: 'emp1@12345',    roleId: 'emp_operator',      displayName: 'EMPLOYEE REGISTRY 1' },
  { email: 'transfer@kwsb.gov.pk',         password: 'transfer@12345',roleId: 'transfer_user',   displayName: 'TRANSFER ADVICE' },
  { email: 'emp2@kwsb.gov.pk',             password: 'emp2@12345',    roleId: 'emp_operator',      displayName: 'EMPLOYEE REGISTRY 2' },
  { email: 'viewer@kwsb.gov.pk',           password: 'viewer@12345',  roleId: 'file_viewer',       displayName: 'FILE VIEWER' },
  { email: 'entry@kwsb.gov.pk',            password: 'gmqaBhK6',      roleId: 'entry_operator',    displayName: 'ENTRY OPERATOR' },
];

async function migrateUsers() {
  console.log("Starting migration...");

  for (const user of DEFAULT_DEPARTMENT_USERS) {
    try {
      console.log(`Processing ${user.email}...`);
      
      // Check if user already exists
      const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
      if (searchError) {
         console.error("Error listing users:", searchError);
         continue;
      }
      
      let targetUser = existingUsers.users.find(u => u.email === user.email);

      if (!targetUser) {
        // Create user
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            role_id: user.roleId,
            display_name: user.displayName
          }
        });

        if (error) {
          console.error(`Failed to create ${user.email}:`, error.message);
          continue;
        }
        console.log(`Created Auth User: ${user.email}`);
        targetUser = data.user;
      } else {
         console.log(`Auth User already exists: ${user.email}. Updating metadata...`);
         // Optional: Update password and metadata to ensure sync
         await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
            password: user.password,
            user_metadata: {
               role_id: user.roleId,
               display_name: user.displayName
            }
         });
      }

      // Upsert into department_users_settings
      const { error: dbError } = await supabaseAdmin
        .from('department_users_settings')
        .upsert({
          email: user.email,
          role_id: user.roleId,
          display_name: user.displayName,
          allow_override_dates: (user.roleId === 'super_admin' || user.roleId === 'cfo' || user.roleId === 'admin')
        }, { onConflict: 'role_id' });

      if (dbError) {
        console.error(`Failed to update department_users_settings for ${user.email}:`, dbError.message);
      } else {
        console.log(`Successfully configured settings for ${user.email}`);
      }

    } catch (err) {
      console.error(`Unexpected error processing ${user.email}:`, err);
    }
  }

  console.log("Migration complete!");
}

migrateUsers();
