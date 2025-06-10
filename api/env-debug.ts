import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== ENV DEBUG API CALLED ===');
  
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
      // Get the raw environment variable values
      const dbUrl = process.env.DATABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      console.log('Raw environment check:');
      console.log('DATABASE_URL exists:', !!dbUrl);
      console.log('DATABASE_URL length:', dbUrl?.length || 0);
      console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!serviceKey);
      console.log('SUPABASE_SERVICE_ROLE_KEY length:', serviceKey?.length || 0);
      
      // Show first and last few characters for debugging
      const dbUrlPreview = dbUrl ? `${dbUrl.substring(0, 30)}...${dbUrl.substring(dbUrl.length - 30)}` : 'undefined';
      const serviceKeyPreview = serviceKey ? `${serviceKey.substring(0, 30)}...${serviceKey.substring(serviceKey.length - 30)}` : 'undefined';
      
      return res.status(200).json({
        message: 'Environment debug info',
        environment: {
          DATABASE_URL: {
            exists: !!dbUrl,
            length: dbUrl?.length || 0,
            preview: dbUrlPreview
          },
          SUPABASE_SERVICE_ROLE_KEY: {
            exists: !!serviceKey,
            length: serviceKey?.length || 0,
            preview: serviceKeyPreview
          }
        },
        allEnvKeys: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('SUPABASE')),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Environment debug error:', error);
      return res.status(500).json({ 
        message: 'Environment debug failed', 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 