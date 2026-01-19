/**
 * Fix Approval Status for Existing Users
 * Sets approval_status to 'approved' for existing users that don't have it set
 * Usage: node scripts/fix-approval-status.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixApprovalStatus() {
  console.log('🔧 Fixing approval status for existing users...\n');

  try {
    // First, check if the approval_status column exists
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('approval_status')
      .limit(1);

    if (testError && testError.message.includes('does not exist')) {
      console.error('❌ Error: The approval_status column does not exist!');
      console.log('\n📋 You need to run the database migration first:');
      console.log('   1. Open Supabase SQL Editor');
      console.log('   2. Run the migration: backend/migrations/add-user-approval-fields.sql');
      console.log('   3. Then run this script again\n');
      return;
    }

    // Get all users without approval_status or with NULL approval_status
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, role, approval_status')
      .or('approval_status.is.null,approval_status.eq.');

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('✅ All users already have approval_status set.');
      return;
    }

    console.log(`📋 Found ${users.length} users without approval_status\n`);

    // Update each user
    let updated = 0;
    let failed = 0;

    for (const user of users) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error(`❌ Error updating ${user.name} (${user.email}):`, updateError.message);
        failed++;
      } else {
        console.log(`✅ Updated ${user.name} (${user.role}) - set to approved`);
        updated++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total: ${users.length}`);

    // Also check for car washes specifically
    const { data: carWashes, error: cwError } = await supabase
      .from('users')
      .select('id, name, email, approval_status, is_active')
      .eq('role', 'carwash');

    if (!cwError && carWashes) {
      console.log(`\n🧼 Car Washes Status:`);
      console.log(`   Total: ${carWashes.length}`);
      const active = carWashes.filter(cw => cw.is_active).length;
      const approved = carWashes.filter(cw => cw.approval_status === 'approved').length;
      const pending = carWashes.filter(cw => cw.approval_status === 'pending').length;
      console.log(`   Active: ${active}`);
      console.log(`   Approved: ${approved}`);
      console.log(`   Pending: ${pending}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixApprovalStatus()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
