import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      // Just return a mock perspective without any storage or validation
      const mockPerspective = {
        id: Math.floor(Math.random() * 1000),
        scenarioId: req.body?.scenarioId || 1,
        content: req.body?.content || "Test content",
        authorName: "Anonymous",
        likes: 0,
        parentId: null,
        createdAt: new Date().toISOString()
      };
      
      return res.status(201).json(mockPerspective);
    } catch (error) {
      return res.status(500).json({ 
        message: "Simple test failed", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'Simple perspectives endpoint working',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 