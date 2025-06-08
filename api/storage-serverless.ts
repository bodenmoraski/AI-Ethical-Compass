// Simplified serverless storage without complex initialization
import { type Perspective, type InsertPerspective } from "../shared/schema";

// Simple in-memory storage that gets reset on each function call
// In a real app, this would be a database
let perspectives: Perspective[] = [
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

let currentId = 4; // Start from 4 since we have 3 initial perspectives

export const serverlessStorage = {
  async getPerspectivesByScenarioId(scenarioId: number): Promise<Perspective[]> {
    console.log(`Getting perspectives for scenario ${scenarioId}`);
    return perspectives
      .filter(p => p.scenarioId === scenarioId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createPerspective(insertPerspective: InsertPerspective): Promise<Perspective> {
    console.log('Creating perspective with data:', insertPerspective);
    
    const perspective: Perspective = {
      ...insertPerspective,
      id: currentId++,
      authorName: insertPerspective.authorName || "Anonymous",
      likes: insertPerspective.likes || 0,
      parentId: insertPerspective.parentId || null,
      createdAt: new Date()
    };
    
    perspectives.push(perspective);
    console.log(`Created perspective with ID ${perspective.id}. Total perspectives: ${perspectives.length}`);
    
    return perspective;
  },

  async likePerspective(id: number): Promise<Perspective> {
    console.log(`Liking perspective ${id}`);
    const perspective = perspectives.find(p => p.id === id);
    if (!perspective) {
      throw new Error(`Perspective with id ${id} not found`);
    }
    
    perspective.likes = (perspective.likes || 0) + 1;
    return perspective;
  },

  async getRepliesByPerspectiveId(perspectiveId: number): Promise<Perspective[]> {
    console.log(`Getting replies for perspective ${perspectiveId}`);
    return perspectives
      .filter(p => p.parentId === perspectiveId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  // Mock scenario validation - just return true for IDs 1-10
  async getScenarioById(id: number): Promise<{ id: number; title: string } | null> {
    if (id >= 1 && id <= 10) {
      return { id, title: `Scenario ${id}` };
    }
    return null;
  }
}; 