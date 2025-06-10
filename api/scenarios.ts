import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== SCENARIOS DB API CALLED ===');
  console.log('Method:', req.method);
  
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
      // Dynamic import to avoid module resolution issues
      const postgres = (await import('postgres')).default;
      
      const connectionString = process.env.DATABASE_URL!;
      const client = postgres(connectionString, { prepare: false });
      
      console.log('Fetching scenarios from database...');
      
      // Fetch all active scenarios
      const scenarios = await client`
        SELECT 
          id,
          title,
          description,
          context,
          dilemma,
          stakeholders,
          created_at,
          updated_at
        FROM scenarios 
        WHERE is_active = true
        ORDER BY id
      `;
      
      console.log(`Found ${scenarios.length} scenarios in database`);
      
      // Parse stakeholders JSON for each scenario
      const formattedScenarios = scenarios.map(scenario => ({
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        context: scenario.context,
        dilemma: scenario.dilemma,
        stakeholders: scenario.stakeholders, // Already parsed by postgres
        createdAt: scenario.created_at,
        updatedAt: scenario.updated_at
      }));
      
      await client.end();
      
      res.status(200).json(formattedScenarios);
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        message: 'Failed to fetch scenarios from database',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 