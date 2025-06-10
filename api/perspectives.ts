import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PERSPECTIVES DB API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
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
      console.log('Processing POST request...');
      
      // Dynamic import to avoid module resolution issues
      const postgres = (await import('postgres')).default;
      
      const connectionString = process.env.DATABASE_URL!;
      const client = postgres(connectionString, { prepare: false });
      
      // Basic validation
      const { scenarioId, content, authorName } = req.body;
      
      if (!scenarioId || !content) {
        return res.status(400).json({ 
          message: 'scenarioId and content are required' 
        });
      }
      
      if (!authorName || authorName.trim().length === 0) {
        return res.status(400).json({ 
          message: 'authorName is required' 
        });
      }
      
      if (content.trim().length < 5) {
        return res.status(400).json({ 
          message: 'Perspective content is too short (minimum 5 characters)' 
        });
      }
      
      if (content.trim().length > 2000) {
        return res.status(400).json({ 
          message: 'Perspective content exceeds maximum length of 2000 characters' 
        });
      }
      
      // Verify scenario exists
      const scenarioCheck = await client`
        SELECT id FROM scenarios WHERE id = ${scenarioId} AND is_active = true
      `;
      
      if (scenarioCheck.length === 0) {
        await client.end();
        return res.status(400).json({ 
          message: `Scenario with ID ${scenarioId} does not exist` 
        });
      }
      
      console.log(`Verified scenario ${scenarioId} exists`);
      
      // Insert the perspective
      const result = await client`
        INSERT INTO perspectives (scenario_id, author_name, content, moderation_status)
        VALUES (${scenarioId}, ${authorName.trim()}, ${content.trim()}, 'approved')
        RETURNING id, scenario_id, author_name, content, likes, moderation_status, created_at, updated_at
      `;
      
      const perspective = result[0];
      
      console.log(`Perspective created successfully with ID: ${perspective.id} for scenario ${perspective.scenario_id}`);
      
      await client.end();
      
      // Format the response to match the expected format
      res.status(201).json({
        id: perspective.id,
        scenarioId: perspective.scenario_id,
        authorName: perspective.author_name,
        content: perspective.content,
        likes: perspective.likes,
        moderationStatus: perspective.moderation_status,
        createdAt: perspective.created_at,
        updatedAt: perspective.updated_at
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        message: 'Failed to create perspective',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 