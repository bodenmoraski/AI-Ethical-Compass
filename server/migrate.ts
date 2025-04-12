import { db } from './db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, 'migrations', '001_update_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration...');
    await db.execute(sql.raw(migrationSQL));
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 