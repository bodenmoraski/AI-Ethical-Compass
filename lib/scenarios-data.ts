import scenariosJson from '../shared/scenarios.json';

export type ScenarioRecord = (typeof scenariosJson)[number];

export function getScenarios(): ScenarioRecord[] {
  return scenariosJson as ScenarioRecord[];
}

export function getScenarioById(id: number): ScenarioRecord | undefined {
  return getScenarios().find((scenario) => scenario.id === id);
}
