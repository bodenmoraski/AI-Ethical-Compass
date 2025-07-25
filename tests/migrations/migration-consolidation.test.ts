import { describe, it, expect } from '@jest/globals';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

describe('Migration Consolidation', () => {
  const rootDir = path.join(__dirname, '../../');
  const migrationsDir = path.join(__dirname, '../../server/migrations');

  describe('Redundant SQL scripts removal', () => {
    it('should have removed redundant fix scripts from root directory', async () => {
      const files = await readdir(rootDir);
      
      // These files should no longer exist in the root directory
      const removedFiles = [
        'fix_user_likes_table.sql',
        'fix_all_user_id_consistency.sql',
        'fix_teacher_rls.sql',
        'fix_rls_policies.sql',
        'simple_rls_fix.sql',
        'fix_realtime_uuid.sql',
        'add_user_name_columns.sql',
        'fix_perspectives_table.js'
      ];

      removedFiles.forEach(file => {
        expect(files).not.toContain(file);
      });
    });

    it('should have kept utility scripts in root directory', async () => {
      const files = await readdir(rootDir);
      
      // These files should still exist as they are utility scripts
      const utilityFiles = [
        'grant_teacher_access.sql',
        'quick_teacher_setup.sql',
        'debug_user_data.sql'
      ];

      utilityFiles.forEach(file => {
        expect(files).toContain(file);
      });
    });
  });

  describe('Migration consolidation', () => {
    it('should have migration 010 with user_id consistency fixes', async () => {
      const migrationFiles = await readdir(migrationsDir);
      expect(migrationFiles).toContain('010_fix_user_id_consistency.sql');
      
      const migration010Content = await readFile(
        path.join(migrationsDir, '010_fix_user_id_consistency.sql'),
        'utf8'
      );
      
      // Should contain fixes for user_id consistency
      expect(migration010Content).toContain('ALTER TABLE teacher_access_requests ALTER COLUMN user_id TYPE TEXT');
      expect(migration010Content).toContain('ALTER TABLE role_change_log ALTER COLUMN user_id TYPE TEXT');
      expect(migration010Content).toContain('ALTER TABLE perspectives ALTER COLUMN user_id TYPE TEXT');
    });

    it('should have migration 011 with consolidated remaining fixes', async () => {
      const migrationFiles = await readdir(migrationsDir);
      expect(migrationFiles).toContain('011_consolidate_remaining_fixes.sql');
      
      const migration011Content = await readFile(
        path.join(migrationsDir, '011_consolidate_remaining_fixes.sql'),
        'utf8'
      );
      
      // Should contain user_likes table fix
      expect(migration011Content).toContain('user_likes');
      expect(migration011Content).toContain('ALTER COLUMN user_id TYPE TEXT');
      
      // Should contain realtime_activities table fix
      expect(migration011Content).toContain('realtime_activities');
      expect(migration011Content).toContain('TRUNCATE TABLE realtime_activities');
      
      // Should contain first_name and last_name columns
      expect(migration011Content).toContain('first_name');
      expect(migration011Content).toContain('last_name');
      expect(migration011Content).toContain('SPLIT_PART(name');
      
      // Should contain comprehensive RLS disabling
      expect(migration011Content).toContain('DISABLE ROW LEVEL SECURITY');
      expect(migration011Content).toContain('ALTER TABLE classes DISABLE ROW LEVEL SECURITY');
      expect(migration011Content).toContain('ALTER TABLE assignments DISABLE ROW LEVEL SECURITY');
    });

    it('should have proper migration file naming and ordering', async () => {
      const migrationFiles = await readdir(migrationsDir);
      const sqlFiles = migrationFiles.filter(file => file.endsWith('.sql'));
      
      // Should have sequential numbering
      expect(sqlFiles).toContain('001_update_schema.sql');
      expect(sqlFiles).toContain('010_fix_user_id_consistency.sql');
      expect(sqlFiles).toContain('011_consolidate_remaining_fixes.sql');
      
      // Files should be in order when sorted
      const sortedFiles = sqlFiles.sort();
      expect(sortedFiles[0]).toMatch(/^001_/);
      expect(sortedFiles[sortedFiles.length - 1]).toMatch(/^011_/);
    });

    it('should have migration 011 with proper structure and comments', async () => {
      const migration011Content = await readFile(
        path.join(migrationsDir, '011_consolidate_remaining_fixes.sql'),
        'utf8'
      );
      
      // Should have proper sections
      expect(migration011Content).toContain('-- 1. Fix user_likes table');
      expect(migration011Content).toContain('-- 2. Fix realtime_activities table');
      expect(migration011Content).toContain('-- 3. Add first_name and last_name columns');
      expect(migration011Content).toContain('-- 4. Disable RLS on teacher dashboard tables');
      
      // Should have proper error handling
      expect(migration011Content).toContain('DO $$');
      expect(migration011Content).toContain('IF EXISTS');
      expect(migration011Content).toContain('RAISE NOTICE');
      
      // Should have proper grants
      expect(migration011Content).toContain('GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated');
      expect(migration011Content).toContain('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated');
      
      // Should have proper comments
      expect(migration011Content).toContain('COMMENT ON COLUMN');
      expect(migration011Content).toContain('COMMENT ON MIGRATION');
    });
  });

  describe('Migration integrity', () => {
    it('should have all migration files readable', async () => {
      const migrationFiles = await readdir(migrationsDir);
      const sqlFiles = migrationFiles.filter(file => file.endsWith('.sql'));
      
      // Test that all migration files can be read
      for (const file of sqlFiles) {
        const content = await readFile(path.join(migrationsDir, file), 'utf8');
        expect(content.length).toBeGreaterThan(0);
        expect(content).toContain('--'); // Should have comments
      }
    });

    it('should have migration files with proper SQL syntax structure', async () => {
      const migration011Content = await readFile(
        path.join(migrationsDir, '011_consolidate_remaining_fixes.sql'),
        'utf8'
      );
      
      // Should have balanced DO $$ BEGIN/END $$ blocks (more specific)
      const doBeginCount = (migration011Content.match(/DO \$\$\s*BEGIN/g) || []).length;
      const endDollarCount = (migration011Content.match(/END \$\$/g) || []).length;
      expect(doBeginCount).toBe(endDollarCount);
      
      // Should have proper SQL structure
      expect(migration011Content).toContain('ALTER TABLE');
      expect(migration011Content).toContain('CREATE INDEX');
      expect(migration011Content).toContain('GRANT');
      
      // Should not have obvious syntax errors
      expect(migration011Content).not.toContain(';;'); // Double semicolons
      expect(migration011Content).not.toContain('DRPO'); // Typos
    });
  });
}); 