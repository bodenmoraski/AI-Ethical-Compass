import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../../../lib/supabase-server';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVE LIKE API CALLED ===');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ 
          message: 'Perspective ID is required' 
        });
      }
      
      console.log(`Processing like for perspective ${id}...`);
      
      const supabase = getSupabaseClient();
      
      // First get the current perspective to increment likes
      const { data: currentPerspective, error: fetchError } = await supabase
        .from('perspectives')
        .select('likes')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Fetch error:', fetchError);
        return res.status(404).json({
          message: 'Perspective not found',
          error: fetchError.message
        });
      }
      
      // Increment the likes count
      const { data: perspective, error } = await supabase
        .from('perspectives')
        .update({ 
          likes: (currentPerspective.likes || 0) + 1
        })
        .eq('id', id)
        .select('id, likes')
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({
          message: 'Failed to like perspective',
          error: error.message
        });
      }
      
      if (!perspective) {
        return res.status(404).json({
          message: 'Perspective not found'
        });
      }
      
      console.log(`Perspective ${id} liked successfully. New likes count: ${perspective.likes}`);
      
      res.status(200).json({
        id: perspective.id,
        likes: perspective.likes,
        message: 'Perspective liked successfully'
      });
      
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to like perspective',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 