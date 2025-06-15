import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Direct access to environment variables defined by Vite
const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL || 
                   (globalThis as any).NEXT_PUBLIC_SUPABASE_URL ||
                   process.env?.NEXT_PUBLIC_SUPABASE_URL || 
                   process.env?.SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                       (globalThis as any).NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                       process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                       process.env?.SUPABASE_ANON_KEY;

const databaseUrl = import.meta.env.VITE_DATABASE_URL ||
                   (globalThis as any).DATABASE_URL ||
                   process.env?.DATABASE_URL;

console.log('Supabase configuration check:');
console.log('URL found:', !!supabaseUrl);
console.log('Anon key found:', !!supabaseAnonKey);
console.log('URL value:', supabaseUrl);
console.log('Anon key first 10 chars:', supabaseAnonKey?.substring(0, 10) + '...');
console.log('Available import.meta.env:', Object.keys(import.meta.env || {}));
console.log('Available globalThis vars:', Object.keys(globalThis as any).filter(k => k.includes('SUPABASE') || k.includes('DATABASE')));

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Supabase credentials not found. Auth features will be disabled.');
  console.log('Available import.meta.env:', Object.keys(import.meta.env || {}));
  console.log('Available globalThis vars:', Object.keys(globalThis as any).filter(k => k.includes('SUPABASE') || k.includes('DATABASE')));
}

// Create Supabase client with authentication support
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!supabase) {
  console.warn('Supabase client not available');
}

// Database connection for server-side operations
let dbConnection: any = null;

export async function getDbConnection() {
  if (!dbConnection && databaseUrl) {
    dbConnection = postgres(databaseUrl);
  }
  return dbConnection;
}

export const db = databaseUrl ? drizzle(postgres(databaseUrl)) : null;

// Type exports for the database
export type Database = typeof db; 