import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serverlessStorage } from "../../storage-serverless";

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
      const { id } = req.query;
      const perspectiveId = parseInt(id as string);
      
      if (isNaN(perspectiveId)) {
        return res.status(400).json({ message: "Invalid perspective ID" });
      }
      
      const perspective = await serverlessStorage.likePerspective(perspectiveId);
      return res.json(perspective);
    } catch (error) {
      return res.status(500).json({ message: "Failed to like perspective" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 