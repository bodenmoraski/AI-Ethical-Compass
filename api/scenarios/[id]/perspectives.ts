import type { VercelRequest, VercelResponse } from '@vercel/node';

// Same in-memory storage as the main perspectives endpoint
let perspectives: Array<{
  id: number;
  scenarioId: number;
  content: string;
  authorName: string;
  likes: number;
  parentId: number | null;
  createdAt: Date;
}> = [
  {
    id: 1,
    scenarioId: 1,
    content: "I believe AI was definitely used in this scenario. The sudden improvement in writing quality, especially from a student who speaks English as a second language, is a telltale sign. Educators need to establish clear guidelines on acceptable AI use for editing vs. generating content.",
    authorName: "Teacher23",
    likes: 0,
    parentId: null,
    createdAt: new Date('2024-01-01T10:00:00Z')
  },
  {
    id: 2,
    scenarioId: 1,
    content: "As someone who struggled with English growing up, I think we should consider that the student might have worked extra hard on this assignment. Before assuming AI was used, the teacher should have a conversation with the student about their process.",
    authorName: "ESL_Advocate",
    likes: 0,
    parentId: null,
    createdAt: new Date('2024-01-01T11:00:00Z')
  },
  {
    id: 3,
    scenarioId: 2,
    content: "Facial recognition in schools raises serious privacy concerns. While security is important, students shouldn't have to sacrifice their biometric data just to attend class. There are less invasive security measures that could be implemented instead.",
    authorName: "PrivacyFirst",
    likes: 0,
    parentId: null,
    createdAt: new Date('2024-01-01T12:00:00Z')
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== SCENARIO PERSPECTIVES API CALLED ===');
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
      const { id } = req.query;
      const scenarioId = parseInt(id as string);
      
      if (isNaN(scenarioId)) {
        return res.status(400).json({ message: "Invalid scenario ID" });
      }
      
      console.log(`Fetching perspectives for scenario ID: ${scenarioId}`);
      
      // Get perspectives for this scenario
      const scenarioPerspectives = perspectives
        .filter(p => p.scenarioId === scenarioId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log(`Found ${scenarioPerspectives.length} perspectives for scenario ${scenarioId}`);
      scenarioPerspectives.forEach(p => {
        console.log(`- Perspective ID ${p.id}, author: ${p.authorName}`);
      });
      
      return res.json(scenarioPerspectives);
    } catch (error) {
      console.error("Error retrieving perspectives:", error);
      return res.status(500).json({ message: "Failed to retrieve perspectives" });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 