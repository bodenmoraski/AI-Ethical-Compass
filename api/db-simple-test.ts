import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== SIMPLE DB TEST API CALLED ===');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Check environment variables
    const hasDbUrl = !!process.env.DATABASE_URL;
    console.log('DATABASE_URL exists:', hasDbUrl);
    
    if (!hasDbUrl) {
      return res.status(500).json({
        message: 'DATABASE_URL not found',
        env: process.env.DATABASE_URL ? 'set' : 'missing'
      });
    }
    
    // Try to import postgres and create connection
    const postgres = (await import('postgres')).default;
    console.log('postgres imported successfully');
    
    const connectionString = process.env.DATABASE_URL!;
    console.log('Connection string exists, length:', connectionString.length);
    
    const client = postgres(connectionString, { prepare: false });
    console.log('Postgres client created');
    
    // Simple query test
    const result = await client`SELECT NOW() as current_time, version() as pg_version`;
    console.log('Query executed successfully:', result[0]);
    
    await client.end();
    console.log('Connection closed');
    
    res.status(200).json({
      message: 'Database connection successful',
      data: result[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
} 