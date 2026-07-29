import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export type ScenarioRecord = {
  id: number;
  title: string;
  description: string;
  [key: string]: unknown;
};

function resolveScenariosPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(process.cwd(), 'shared', 'scenarios.json'),
    path.join(process.cwd(), '..', 'shared', 'scenarios.json'),
    path.join(here, '..', 'shared', 'scenarios.json'),
    path.join(here, 'shared', 'scenarios.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `scenarios.json not found. Checked: ${candidates.join(', ')}`
  );
}

let cached: ScenarioRecord[] | null = null;

export function getScenarios(): ScenarioRecord[] {
  if (cached) return cached;
  const raw = fs.readFileSync(resolveScenariosPath(), 'utf8');
  cached = JSON.parse(raw) as ScenarioRecord[];
  return cached;
}

export function getScenarioById(id: number): ScenarioRecord | undefined {
  return getScenarios().find((scenario) => scenario.id === id);
}
