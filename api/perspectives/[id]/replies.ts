import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseClient } from '../../../lib/supabase-server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVE REPLIES API CALLED ===');
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

  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ 
          message: 'Perspective ID is required' 
        });
      }
      
      console.log(`Processing GET request for replies to perspective ${id}...`);
      
      const supabase = getSupabaseClient();
      
      // Fetch replies from the database
      const { data: replies, error } = await supabase
        .from('replies')
        .select('id, content, author_name, likes, created_at, updated_at')
        .eq('perspective_id', id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({
          message: 'Failed to fetch replies',
          error: error.message
        });
      }
      
      console.log(`Found ${replies?.length || 0} replies for perspective ${id}`);
      
      // Format replies to match expected format
      const formattedReplies = replies?.map(reply => ({
        id: reply.id,
        content: reply.content,
        authorName: reply.author_name,
        likes: reply.likes || 0,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at
      })) || [];
      
      res.status(200).json(formattedReplies);
      
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to fetch replies',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { id } = req.query;
      const { content, authorName } = req.body;
      
      if (!id) {
        return res.status(400).json({ 
          message: 'Perspective ID is required' 
        });
      }
      
      if (!content || !authorName) {
        return res.status(400).json({ 
          message: 'content and authorName are required' 
        });
      }
      
      if (content.trim().length < 5) {
        return res.status(400).json({ 
          message: 'Reply content is too short (minimum 5 characters)' 
        });
      }
      
      if (content.trim().length > 1000) {
        return res.status(400).json({ 
          message: 'Reply content exceeds maximum length of 1000 characters' 
        });
      }
      
      console.log(`Processing POST request for reply to perspective ${id}...`);
      
      const supabase = getSupabaseClient();
      
      // Verify perspective exists
      const { data: perspectiveCheck, error: perspectiveError } = await supabase
        .from('perspectives')
        .select('id')
        .eq('id', id)
        .single();
      
      if (perspectiveError || !perspectiveCheck) {
        console.error('Perspective check error:', perspectiveError);
        return res.status(400).json({ 
          message: `Perspective with ID ${id} does not exist` 
        });
      }
      
      // Insert the reply
      const { data: reply, error: insertError } = await supabase
        .from('replies')
        .insert({
          perspective_id: id,
          author_name: authorName.trim(),
          content: content.trim(),
          moderation_status: 'approved'
        })
        .select('id, content, author_name, likes, created_at, updated_at')
        .single();
      
      if (insertError) {
        console.error('Insert error:', insertError);
        return res.status(500).json({
          message: 'Failed to create reply',
          error: insertError.message
        });
      }
      
      console.log(`Reply created successfully with ID: ${reply.id} for perspective ${id}`);
      
      // Format the response to match expected format
      res.status(201).json({
        id: reply.id,
        content: reply.content,
        authorName: reply.author_name,
        likes: reply.likes || 0,
        createdAt: reply.created_at,
        updatedAt: reply.updated_at
      });
      
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({
        message: 'Failed to create reply',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 