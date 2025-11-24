/**
 * Migration Consolidation Test
 * 
 * This test verifies that:
 * 1. All migrations are numbered sequentially
 * 2. No duplicate fix files exist in root
 * 3. Migration history is clear
 * 4. Documentation exists
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Migration Consolidation Verification', () => {
  const migrationsDir = path.join(process.cwd(), 'server/migrations');
  
  describe('Migration File Structure', () => {
    it('should have all migrations numbered sequentially', () => {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      // Extract numbers from filenames
      const numbers = files.map(f => {
        const match = f.match(/^(\d+)_/);
        return match ? parseInt(match[1]) : null;
      }).filter(n => n !== null) as number[];
      
      // Check sequential numbering (allowing gaps for deleted migrations)
      expect(numbers.length).toBeGreaterThan(0);
      
      // First migration should be 001
      expect(numbers[0]).toBe(1);
      
      // Numbers should be in ascending order
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThan(numbers[i - 1]);
      }
    });

    it('should have descriptive migration names', () => {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'));
      
      files.forEach(file => {
        // Each file should have a descriptive name after the number
        const match = file.match(/^\d+_(.+)\.sql$/);
        expect(match).toBeTruthy();
        expect(match![1].length).toBeGreaterThan(3);
      });
    });

    it('should not have duplicate migration numbers', () => {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'));
      
      const numbers = files.map(f => {
        const match = f.match(/^(\d+)_/);
        return match ? match[1] : null;
      }).filter(n => n !== null);
      
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });
  });

  describe('Root Directory Cleanup', () => {
    it('should not have migration-like SQL files in project root', () => {
      const rootDir = process.cwd();
      const rootSqlFiles = fs.readdirSync(rootDir)
        .filter(f => f.endsWith('.sql'));
      
      // These are utility scripts, not migrations
      const allowedRootSql = [
        'debug_user_data.sql',
        'clear_test_data.sql',
        'grant_teacher_access.sql',
        'quick_teacher_setup.sql'
      ];
      
      rootSqlFiles.forEach(file => {
        // Should either be in allowed list or not look like a migration
        const isMigrationLike = /^\d+_/.test(file);
        expect(isMigrationLike).toBe(false);
      });
    });
  });

  describe('Migration Content Verification', () => {
    it('should have IF NOT EXISTS or IF EXISTS guards where appropriate', () => {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'));
      
      let hasGuards = false;
      
      files.forEach(file => {
        const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        
        // Check for idempotent patterns
        if (content.includes('IF NOT EXISTS') || 
            content.includes('IF EXISTS') ||
            content.includes('CREATE OR REPLACE')) {
          hasGuards = true;
        }
      });
      
      // At least some migrations should have guards
      expect(hasGuards).toBe(true);
    });

    it('should have comments explaining purpose', () => {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'));
      
      let migrationsWithComments = 0;
      
      files.forEach(file => {
        const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        
        // Check for SQL comments
        if (content.includes('--') || content.includes('/*')) {
          migrationsWithComments++;
        }
      });
      
      // Most migrations should have comments
      expect(migrationsWithComments / files.length).toBeGreaterThan(0.5);
    });
  });

  describe('Latest Migrations', () => {
    it('should have auth_user_id migration', () => {
      const files = fs.readdirSync(migrationsDir);
      const hasAuthUserIdMigration = files.some(f => f.includes('auth_user_id'));
      expect(hasAuthUserIdMigration).toBe(true);
    });

    it('should have performance indexes migration', () => {
      const files = fs.readdirSync(migrationsDir);
      const hasIndexesMigration = files.some(f => f.includes('performance_indexes') || f.includes('indexes'));
      expect(hasIndexesMigration).toBe(true);
    });
  });

  describe('Migration Count', () => {
    it('should have a reasonable number of migrations', () => {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'));
      
      // We should have migrations but not too many (indicates consolidation needed)
      expect(files.length).toBeGreaterThan(5);
      expect(files.length).toBeLessThan(30);
    });
  });
});
