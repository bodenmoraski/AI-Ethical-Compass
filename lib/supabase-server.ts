import { createClient } from '@supabase/supabase-js';

// Server-side Supabase configuration (Node.js only)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const databaseUrl = process.env.DATABASE_URL;

console.log('Server Supabase configuration:');
console.log('URL found:', !!supabaseUrl);
console.log('Anon key found:', !!supabaseAnonKey);
console.log('Database URL found:', !!databaseUrl);

// Create Supabase client for server-side operations
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to get Supabase client with error handling
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client not configured. Please check environment variables.');
  }
  return supabase;
}

// Database types for TypeScript support
export interface User {
  id: number;
  email: string;
  name: string | null;
  username: string;
  institutionName: string | null;
  institutionType: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Perspective {
  id: number;
  scenario_id: number;
  author_name: string;
  content: string;
  likes: number;
  moderation_status: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  scenario_id: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
} 