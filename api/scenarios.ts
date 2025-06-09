import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple scenario data for serverless demo
const scenarios = [
  {
    id: 1,
    title: "Student Essay Enhancement",
    description: "A teacher notices that an ESL student's essay has dramatically improved in quality, raising questions about AI assistance.",
    options: ["AI was definitely used", "No AI was used", "Unclear - need more information"],
    aiUseAnswer: "Unclear - need more information",
    sdgTags: ["Quality Education"],
    sdgDetails: [],
    relatedResources: [],
    order: 1
  },
  {
    id: 2,
    title: "Facial Recognition at School",
    description: "A school implements facial recognition for security, but parents and students raise privacy concerns.",
    options: ["Implement with safeguards", "Don't implement", "Seek community input first"],
    aiUseAnswer: "Seek community input first",
    sdgTags: ["Quality Education", "Peace and Justice"],
    sdgDetails: [],
    relatedResources: [],
    order: 2
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
      console.log("GET /api/scenarios - Fetching all scenarios");
      console.log(`Found ${scenarios.length} scenarios`);
      scenarios.forEach(s => {
        console.log(`- Scenario ${s.id}: ${s.title}`);
      });
      return res.json(scenarios);
    } catch (error) {
      console.error("Error retrieving scenarios:", error);
      return res.status(500).json({ message: "Failed to retrieve scenarios" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 