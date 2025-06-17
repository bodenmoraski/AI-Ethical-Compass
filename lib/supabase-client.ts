import { createClient } from '@supabase/supabase-js';

// Client-side Supabase configuration (browser only)
// Access environment variables through Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL || (globalThis as any).NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY || (globalThis as any).NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Client Supabase configuration:');
console.log('URL found:', !!supabaseUrl);
console.log('Anon key found:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase client credentials not found. Auth features will be disabled.');
}

// Create Supabase client for browser authentication
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
} else {
  console.log('Supabase client initialized successfully');
} 