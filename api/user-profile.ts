import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server.js';

async function requireAuthEmail(
  req: VercelRequest,
  supabase: ReturnType<typeof getSupabaseClient>
): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user?.email) return null;
  return user.email;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  if (req.method === 'POST') {
    try {
      const authEmail = await requireAuthEmail(req, supabase);
      if (!authEmail) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { email, username, institutionName, institutionType } = req.body;

      // Validation
      if (!email || !username) {
        return res.status(400).json({
          message: 'Email and username are required'
        });
      }

      if (email.toLowerCase() !== authEmail.toLowerCase()) {
        return res.status(403).json({ message: "Cannot create or update another user's profile" });
      }

      // Validate username format
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return res.status(400).json({
          message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores'
        });
      }

      // Check if username is already taken by a different email
      const { data: existingUser } = await supabase
        .from('users')
        .select('username, email')
        .eq('username', username)
        .single();

      if (existingUser && existingUser.email?.toLowerCase() !== authEmail.toLowerCase()) {
        return res.status(400).json({
          message: 'Username is already taken'
        });
      }

      // Create or update user profile
      const { data: user, error: upsertError } = await supabase
        .from('users')
        .upsert({
          email: authEmail,
          username,
          institution_name: institutionName || null,
          institution_type: institutionType || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email'
        })
        .select()
        .single();

      if (upsertError) {
        console.error('User profile creation error:', upsertError);
        return res.status(500).json({
          message: 'Failed to create user profile',
          error: upsertError.message
        });
      }

      res.status(201).json({
        id: user.id,
        email: user.email,
        username: user.username,
        institutionName: user.institution_name,
        institutionType: user.institution_type,
        role: user.role
      });

    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to create user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  else if (req.method === 'GET') {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Prefer JWT when present: only allow reading your own profile
      const authEmail = await requireAuthEmail(req, supabase);
      if (authEmail && email.toLowerCase() !== authEmail.toLowerCase()) {
        return res.status(403).json({ message: "Cannot access another user's profile" });
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, username, institution_name, institution_type, role, created_at')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return camelCase to match client Auth UserProfile expectations
      res.status(200).json({
        id: user.id,
        email: user.email,
        username: user.username,
        institutionName: user.institution_name,
        institutionType: user.institution_type,
        role: user.role,
        created_at: user.created_at,
      });

    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to get user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
