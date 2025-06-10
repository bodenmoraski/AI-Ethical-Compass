import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== PROGRESS DB API CALLED ===');
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
      // Dynamic import to avoid module resolution issues
      const postgres = (await import('postgres')).default;
      
      const connectionString = process.env.DATABASE_URL!;
      const client = postgres(connectionString, { prepare: false });
      
      // Basic validation
      const { userId, scenarioId, completed } = req.body;
      
      if (!scenarioId) {
        return res.status(400).json({ 
          message: 'scenarioId is required' 
        });
      }
      
      const id = parseInt(scenarioId);
      if (isNaN(id)) {
        return res.status(400).json({ 
          message: 'scenarioId must be a valid number' 
        });
      }
      
      // Verify scenario exists
      const scenarioCheck = await client`
        SELECT id FROM scenarios WHERE id = ${id} AND is_active = true
      `;
      
      if (scenarioCheck.length === 0) {
        await client.end();
        return res.status(400).json({ 
          message: `Scenario with ID ${id} does not exist` 
        });
      }
      
      console.log(`Updating progress for scenario ${id}`);
      
      // Insert progress record (simple approach for now)
      const now = new Date().toISOString();
      
      const result = await client`
        INSERT INTO user_progress (user_id, scenario_id, completed, completed_at)
        VALUES (${userId || null}, ${id}, ${completed || true}, ${completed ? now : null})
        RETURNING id, user_id, scenario_id, completed, completed_at, created_at, updated_at
      `;
      
      const progress = result[0];
      
      console.log(`Progress updated for scenario ${id}`);
      
      await client.end();
      
      // Format the response to match the expected format
      res.status(200).json({
        id: progress.id,
        userId: progress.user_id,
        scenarioId: progress.scenario_id,
        completed: progress.completed,
        completedAt: progress.completed_at,
        createdAt: progress.created_at,
        updatedAt: progress.updated_at
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        message: 'Failed to update progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 