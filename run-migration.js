// Run migration 013 using Supabase client
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔧 Running migration 013: Add notification columns...');
  
  try {
    // Add priority column
    const { error: priorityError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notifications' AND column_name = 'priority'
            ) THEN
                ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'medium';
                ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check 
                  CHECK (priority IN ('low', 'medium', 'high'));
            END IF;
        END $$;
      `
    });
    
    if (priorityError) {
      console.log('Trying alternative approach...');
      // Direct SQL through supabase
      const { error: e1 } = await supabase.from('notifications').select('priority').limit(1);
      if (e1 && e1.message.includes('priority')) {
        console.log('✅ Priority column needs to be added via Supabase Dashboard');
        console.log('   Go to: Database → Tables → notifications → Add Column');
        console.log('   Column name: priority');
        console.log('   Type: text');
        console.log('   Default: medium');
      } else {
        console.log('✅ Priority column already exists!');
      }
    }
    
    // Check for read_at column
    const { error: e2 } = await supabase.from('notifications').select('read_at').limit(1);
    if (e2 && e2.message.includes('read_at')) {
      console.log('✅ read_at column needs to be added via Supabase Dashboard');
      console.log('   Go to: Database → Tables → notifications → Add Column');
      console.log('   Column name: read_at');
      console.log('   Type: timestamp');
      console.log('   Nullable: yes');
    } else {
      console.log('✅ read_at column already exists!');
    }
    
    console.log('\n📋 Manual Steps Required:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Database → Tables → notifications');
    console.log('4. Add these columns if missing:');
    console.log('   - priority (type: text, default: \'medium\')');
    console.log('   - read_at (type: timestamp, nullable)');
    
  } catch (error) {
    console.error('Migration error:', error.message);
  }
}

runMigration();

