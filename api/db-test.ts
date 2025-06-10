import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== DATABASE TEST API CALLED ===');
  
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
      // Test environment variables
      const hasDbUrl = !!process.env.DATABASE_URL;
      const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      console.log('Environment check:', {
        DATABASE_URL: hasDbUrl,
        SUPABASE_SERVICE_ROLE_KEY: hasServiceRoleKey
      });

      // For now, just test environment variables
      // We'll add actual database connection once env vars are set up
      
      return res.status(200).json({
        message: 'Database test endpoint working',
        environment: {
          DATABASE_URL: hasDbUrl ? 'Set' : 'Missing',
          SUPABASE_SERVICE_ROLE_KEY: hasServiceRoleKey ? 'Set' : 'Missing'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database test error:', error);
      return res.status(500).json({ 
        message: 'Database test failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 