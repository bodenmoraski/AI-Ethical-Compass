import { Scenario, Perspective } from '@shared/schema';
import fs from 'fs';
import path from 'path';

class ScenarioStorage {
  private scenarios: Scenario[] = [];
  private perspectives: Perspective[] = [];
  private readonly scenariosPath: string;

  constructor() {
    this.scenariosPath = path.resolve(import.meta.dirname, '../shared/scenarios.json');
    this.loadScenarios();
  }

  private loadScenarios(): void {
    try {
      const data = fs.readFileSync(this.scenariosPath, 'utf-8');
      this.scenarios = JSON.parse(data);
      console.log(`Loaded ${this.scenarios.length} scenarios from file`);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      this.scenarios = [];
    }
  }

  async getAllScenarios(): Promise<Scenario[]> {
    console.log('Fetching all scenarios');
    return this.scenarios;
  }

  async getScenarioById(id: number): Promise<Scenario | null> {
    console.log(`Fetching scenario with ID: ${id}`);
    const scenario = this.scenarios.find(s => s.id === id);
    if (!scenario) {
      console.warn(`Scenario with ID ${id} not found`);
    }
    return scenario || null;
  }

  async getPerspectivesByScenarioId(scenarioId: number): Promise<Perspective[]> {
    console.log(`Fetching perspectives for scenario ID: ${scenarioId}`);
    return this.perspectives.filter(p => p.scenarioId === scenarioId);
  }

  async createPerspective(data: Omit<Perspective, 'id' | 'likes'>): Promise<Perspective> {
    console.log('Creating new perspective');
    const newPerspective: Perspective = {
      ...data,
      id: this.perspectives.length + 1,
      likes: 0
    };
    this.perspectives.push(newPerspective);
    return newPerspective;
  }

  async likePerspective(id: number): Promise<Perspective | null> {
    console.log(`Liking perspective with ID: ${id}`);
    const perspective = this.perspectives.find(p => p.id === id);
    if (perspective) {
      perspective.likes += 1;
      return perspective;
    }
    return null;
  }

  async getUserProgress(userId: string): Promise<any> {
    console.log(`Getting progress for user: ${userId}`);
    // For now, return empty progress
    return {
      completedScenarios: [],
      currentScenario: null
    };
  }

  async updateUserProgress(userId: string, progress: any): Promise<void> {
    console.log(`Updating progress for user: ${userId}`);
    // For now, just log the progress
    console.log('Progress update:', progress);
  }
}

export const storage = new ScenarioStorage(); 