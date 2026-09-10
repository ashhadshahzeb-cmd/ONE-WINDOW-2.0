import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphbnhlcG13eW5zaXhodnZtbWJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzAzNzc4MiwiZXhwIjoyMTAyNjEzNzgyfQ.rPNpxiKLR3Q7un-nPvFvxVehjfJdLAhagQSa78lBsNk';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetAllMfa() {
  console.log("Fetching all users...");
  
  try {
    let allUsers = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
        page: page,
        perPage: 100
      });

      if (listError) throw listError;

      if (usersData.users.length > 0) {
        allUsers = allUsers.concat(usersData.users);
        page++;
      } else {
        hasMore = false;
      }
    }

    console.log(`Found ${allUsers.length} users. Removing MFA factors...`);
    let removedCount = 0;

    for (const user of allUsers) {
      // Get factors for this user
      const { data: mfaData, error: mfaError } = await supabase.auth.admin.mfa.listFactors({
        userId: user.id
      });

      if (mfaError) {
        console.error(`Error fetching factors for user ${user.email}:`, mfaError.message);
        continue;
      }

      if (mfaData && mfaData.factors && mfaData.factors.length > 0) {
        console.log(`User ${user.email} has ${mfaData.factors.length} factor(s). Removing...`);
        for (const factor of mfaData.factors) {
          const { error: deleteError } = await supabase.auth.admin.mfa.deleteFactor({
            userId: user.id,
            id: factor.id
          });

          if (deleteError) {
            console.error(`Failed to remove factor ${factor.id} for user ${user.email}:`, deleteError.message);
          } else {
            console.log(`Successfully removed factor ${factor.id} for user ${user.email}`);
            removedCount++;
          }
        }
      }
    }

    console.log(`\nDone! Successfully removed ${removedCount} MFA factor(s) across all users.`);

  } catch (error) {
    console.error("Error during MFA reset:", error);
  }
}

resetAllMfa();
