export type SdgScenario = {
  id: number;
  sdgTags?: unknown;
  sdg_tags?: unknown;
};

export interface SdgImpact {
  primary_sdgs: number[];
  sdg_breakdown: Array<{ sdg: number; scenarios: number }>;
  impact_score: number;
}

/** Tags appear as "4", "SDG 4" or "Quality Education (SDG 4)" depending on locale file. */
export function normalizeSdgTag(tag: unknown): number | null {
  if (typeof tag === 'number' && Number.isFinite(tag)) return tag;
  if (typeof tag !== 'string') return null;

  const trimmed = tag.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);

  const match = trimmed.match(/SDG\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}

function tagsFor(scenario: SdgScenario): number[] {
  const raw = scenario.sdgTags ?? scenario.sdg_tags;
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeSdgTag)
    .filter((value): value is number => value !== null);
}

/**
 * Derives the SDGs a learner has actually engaged with from the scenarios they
 * participated in, rather than assuming a fixed set.
 */
export function computeSdgImpact(
  engagedScenarioIds: Array<number | string | null | undefined>,
  scenarios: SdgScenario[],
  stats: { total_perspectives: number; total_likes_received: number; scenarios_completed: number }
): SdgImpact {
  const byId = new Map<number, SdgScenario>();
  for (const scenario of scenarios) {
    byId.set(Number(scenario.id), scenario);
  }

  const uniqueIds = new Set<number>();
  for (const id of engagedScenarioIds) {
    const numeric = Number(id);
    if (Number.isFinite(numeric)) uniqueIds.add(numeric);
  }

  const counts = new Map<number, number>();
  for (const id of uniqueIds) {
    const scenario = byId.get(id);
    if (!scenario) continue;
    for (const sdg of new Set(tagsFor(scenario))) {
      counts.set(sdg, (counts.get(sdg) || 0) + 1);
    }
  }

  const breakdown = Array.from(counts.entries())
    .map(([sdg, scenarioCount]) => ({ sdg, scenarios: scenarioCount }))
    .sort((a, b) => (b.scenarios - a.scenarios) || (a.sdg - b.sdg));

  const impactScore = Math.min(
    stats.total_perspectives * 10 +
      stats.total_likes_received * 2 +
      stats.scenarios_completed * 5,
    100
  );

  return {
    primary_sdgs: breakdown.slice(0, 5).map((entry) => entry.sdg),
    sdg_breakdown: breakdown,
    impact_score: impactScore,
  };
}
