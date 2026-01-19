import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

/**
 * Copy SQL to clipboard and open Supabase dashboard
 */
const copySQL = async () => {
  try {
    console.log('📋 Preparing SQL for migration...\n');

    // Read SQL schema
    const schemaPath = join(__dirname, '../../supabase-schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('✅ SQL schema loaded\n');

    // Try to copy to clipboard (Windows)
    try {
      if (process.platform === 'win32') {
        // Windows: use clip command
        await execAsync(`echo "${sql.replace(/"/g, '\\"')}" | clip`);
        console.log('✅ SQL copied to clipboard!\n');
      } else if (process.platform === 'darwin') {
        // macOS: use pbcopy
        await execAsync(`echo "${sql.replace(/"/g, '\\"')}" | pbcopy`);
        console.log('✅ SQL copied to clipboard!\n');
      } else {
        // Linux: use xclip or xsel
        try {
          await execAsync(`echo "${sql.replace(/"/g, '\\"')}" | xclip -selection clipboard`);
          console.log('✅ SQL copied to clipboard!\n');
        } catch {
          console.log('⚠️  Could not copy to clipboard automatically\n');
        }
      }
    } catch (error) {
      console.log('⚠️  Could not copy to clipboard automatically\n');
    }

    // Open Supabase dashboard
    const supabaseUrl = 'https://lbtzrworenlwecbktlpq.supabase.co';
    const sqlEditorUrl = `${supabaseUrl}/project/lbtzrworenlwecbktlpq/sql/new`;

    console.log('='.repeat(60));
    console.log('🚀 QUICK MIGRATION STEPS');
    console.log('='.repeat(60));
    console.log('\n1. SQL is copied to your clipboard (if supported)');
    console.log('2. Opening Supabase SQL Editor...\n');

    // Try to open browser
    try {
      if (process.platform === 'win32') {
        await execAsync(`start ${sqlEditorUrl}`);
      } else if (process.platform === 'darwin') {
        await execAsync(`open ${sqlEditorUrl}`);
      } else {
        await execAsync(`xdg-open ${sqlEditorUrl}`);
      }
      console.log('✅ Browser opened to SQL Editor\n');
    } catch (error) {
      console.log('⚠️  Could not open browser automatically');
      console.log(`💡 Manually open: ${sqlEditorUrl}\n`);
    }

    console.log('3. Paste SQL (Ctrl+V or Cmd+V)');
    console.log('4. Click "Run" button\n');
    console.log('✅ Tables will be created!\n');

    console.log('='.repeat(60));
    console.log('\n📄 SQL Preview (first 300 chars):');
    console.log('-'.repeat(60));
    console.log(sql.substring(0, 300) + '...');
    console.log('-'.repeat(60));
    console.log(`\n📝 Full SQL file: ${schemaPath}\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  copySQL();
}

export default copySQL;
