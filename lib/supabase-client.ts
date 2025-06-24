import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client-side Supabase configuration (browser only)
// Access environment variables through Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Client Supabase configuration:');
console.log('URL found:', !!supabaseUrl);
console.log('Anon key found:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase client credentials not found. Auth features will be disabled.');
  throw new Error('Missing Supabase environment variables');
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null;

const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    console.log('Supabase client initialized successfully');
  }
  return supabaseInstance;
};

// Create Supabase client for browser authentication
export const supabase = getSupabaseClient();

export default supabase;

if (!supabase) {
  console.warn('Supabase client not available');
} 