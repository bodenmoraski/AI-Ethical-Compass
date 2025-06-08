import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== TEST API CALLED ===');
  console.log('Method:', req.method);
  console.log('Node version:', process.version);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Current working directory:', process.cwd());
  
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
      // Test basic functionality
      console.log('Testing basic functionality...');
      
      // Test if we can import zod
      const { z } = await import('zod');
      console.log('Zod imported successfully');
      
      // Test if we can access shared schema
      try {
        const schemaModule = await import("../shared/schema");
        console.log('Schema module imported:', Object.keys(schemaModule));
      } catch (importError) {
        console.error('Failed to import schema:', importError);
      }
      
      // Test if we can access server storage
      try {
        const storageModule = await import("../server/storage");
        console.log('Storage module imported:', Object.keys(storageModule));
        console.log('Storage instance:', !!storageModule.storage);
      } catch (importError) {
        console.error('Failed to import storage:', importError);
      }
      
      return res.status(200).json({
        message: 'Test API working',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error in test API:', error);
      return res.status(500).json({
        message: 'Test API failed',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 