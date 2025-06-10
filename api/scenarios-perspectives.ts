import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== SCENARIOS PERSPECTIVES DB API CALLED ===');
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
      const { scenarioId } = req.query;
      
      if (!scenarioId) {
        return res.status(400).json({ 
          message: 'scenarioId query parameter is required' 
        });
      }
      
      const id = parseInt(scenarioId as string);
      if (isNaN(id)) {
        return res.status(400).json({ 
          message: 'scenarioId must be a valid number' 
        });
      }
      
      // Dynamic import to avoid module resolution issues
      const postgres = (await import('postgres')).default;
      
      const connectionString = process.env.DATABASE_URL!;
      const client = postgres(connectionString, { prepare: false });
      
      console.log(`Fetching perspectives for scenario ID: ${id}`);
      
      // Get all approved perspectives for the scenario
      const perspectives = await client`
        SELECT 
          id,
          scenario_id,
          author_name,
          content,
          likes,
          moderation_status,
          created_at,
          updated_at
        FROM perspectives 
        WHERE scenario_id = ${id} 
          AND moderation_status = 'approved'
        ORDER BY created_at DESC
      `;
      
      console.log(`Found ${perspectives.length} perspectives for scenario ${id}`);
      
      // Format the response to match the expected format
      const formattedPerspectives = perspectives.map(perspective => ({
        id: perspective.id,
        scenarioId: perspective.scenario_id,
        authorName: perspective.author_name,
        content: perspective.content,
        likes: perspective.likes,
        moderationStatus: perspective.moderation_status,
        createdAt: perspective.created_at,
        updatedAt: perspective.updated_at
      }));
      
      await client.end();
      
      res.status(200).json(formattedPerspectives);
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        message: 'Failed to fetch perspectives from database',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 