import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../lib/supabase-server';
import { z } from 'zod';

// Request schemas
const requestAccessSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2),
  institutionName: z.string().optional(),
  institutionType: z.string().optional(),
  department: z.string().optional(),
  requestReason: z.string().min(10),
});

const updateRoleSchema = z.object({
  userId: z.number(),
  newRole: z.enum(['user', 'teacher', 'moderator', 'admin']),
  updatedBy: z.number(),
  reason: z.string().optional(),
});

// Helper function to get user ID from email
async function getUserIdFromEmail(supabase: any, email: string): Promise<number | null> {
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  
  return userData?.id || null;
}

// Helper function to check if user is admin
async function isUserAdmin(supabase: any, userId: number): Promise<boolean> {
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
  
  return userData?.role === 'admin';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  try {
    switch (req.method) {
      case 'POST':
        return await requestTeacherAccess(req, res, supabase);
      case 'PUT':
        return await updateUserRole(req, res, supabase);
      case 'GET':
        return await getAccessRequests(req, res, supabase);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Teacher Access API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function requestTeacherAccess(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any
) {
  try {
    const validatedData = requestAccessSchema.parse(req.body);
    
    // Check if user already exists
    const userId = await getUserIdFromEmail(supabase, validatedData.email);
    
    if (!userId) {
      return res.status(404).json({ message: 'User not found. Please create an account first.' });
    }

    // Check if user already has teacher access
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userData?.role === 'teacher') {
      return res.status(400).json({ message: 'User already has teacher access' });
    }

    // Create access request
    const { data: request, error } = await supabase
      .from('teacher_access_requests')
      .insert({
        user_id: userId,
        institution_name: validatedData.institutionName,
        institution_type: validatedData.institutionType,
        department: validatedData.department,
        request_reason: validatedData.requestReason,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // For demo purposes, auto-approve the request
    // In production, this would require admin approval
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'teacher',
        department: validatedData.department,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return res.status(201).json({ 
      message: 'Teacher access granted successfully',
      request: request
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors
      });
    }
    throw error;
  }
}

async function updateUserRole(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any
) {
  try {
    const validatedData = updateRoleSchema.parse(req.body);
    
    // Verify admin permission
    const isAdmin = await isUserAdmin(supabase, validatedData.updatedBy);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    // Update user role
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ 
        role: validatedData.newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Log the role change
    await supabase
      .from('role_change_log')
      .insert({
        user_id: validatedData.userId,
        previous_role: updatedUser.role,
        new_role: validatedData.newRole,
        updated_by: validatedData.updatedBy,
        reason: validatedData.reason,
      });

    return res.status(200).json({ 
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: error.errors
      });
    }
    throw error;
  }
}

async function getAccessRequests(
  req: VercelRequest,
  res: VercelResponse,
  supabase: any
) {
  try {
    // Get admin user ID (in production, this would come from JWT)
    const userEmail = req.headers.authorization?.replace('Bearer ', '');
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const adminUserId = await getUserIdFromEmail(supabase, userEmail);
    if (!adminUserId) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Verify admin permission
    const isAdmin = await isUserAdmin(supabase, adminUserId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    // Get pending access requests
    const { data: requests, error } = await supabase
      .from('teacher_access_requests')
      .select(`
        *,
        users (
          id,
          username,
          email,
          institution_name,
          institution_type
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json({ requests });
  } catch (error) {
    throw error;
  }
} 