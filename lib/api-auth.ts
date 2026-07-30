import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cached: SupabaseClient | null = null;

/**
 * Server-side client. Prefers the service role so trusted API routes can write
 * audit-style rows (notifications, moderation queue, activity feed) regardless of RLS.
 */
export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const key = serviceKey || anonKey;
  if (!supabaseUrl || !key) {
    throw new Error('Supabase server credentials are not configured');
  }

  cached = createClient(supabaseUrl, key);
  return cached;
}

export interface AppUser {
  /** Integer primary key from the `users` table — the app's identity everywhere. */
  id: number;
  email: string;
  role: string;
  /** Display name; falls back to the local part of the email. */
  username: string;
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.substring(7).trim();
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
}

/**
 * Resolves the authenticated Supabase user to the integer `users` row.
 * Returns null when the request is anonymous or the token is invalid.
 */
export async function resolveAppUser(
  req: VercelRequest,
  client: SupabaseClient = getServiceClient()
): Promise<AppUser | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user?.email) return null;

  const { data: profile, error: profileError } = await client
    .from('users')
    .select('id, email, role, username')
    .eq('email', data.user.email)
    .single();

  if (profileError || !profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role || 'student',
    username: profile.username || profile.email.split('@')[0],
  };
}

/** Throws AuthError(401) when the request is not authenticated. */
export async function requireAppUser(
  req: VercelRequest,
  client?: SupabaseClient
): Promise<AppUser> {
  const user = await resolveAppUser(req, client);
  if (!user) {
    throw new AuthError('Authentication required', 401);
  }
  return user;
}

/** Throws AuthError(401/403) unless the caller holds one of the allowed roles. */
export async function requireRole(
  req: VercelRequest,
  roles: string[],
  client?: SupabaseClient
): Promise<AppUser> {
  const user = await requireAppUser(req, client);
  if (!roles.includes(user.role)) {
    throw new AuthError(`Requires role: ${roles.join(' or ')}`, 403);
  }
  return user;
}

export function authErrorStatus(error: unknown): number {
  return error instanceof AuthError ? error.status : 500;
}

export function setCors(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
}
