/**
 * Phase 0 acceptance tests — "honesty pass".
 *
 * Every assertion here would have failed before the honesty pass: dead CTA buttons,
 * a "coming soon" moderation tab, a production test-activity button, an email promise
 * that was never sent, and hardcoded SDG values.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

import { computeSdgImpact, normalizeSdgTag } from '../../lib/sdg-impact';

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), 'utf-8');

describe('Phase 0 — no dead affordances', () => {
  describe('G0.1 teacher dashboard alert CTAs are wired', () => {
    const source = read('client/src/pages/TeacherDashboard.tsx');

    it('routes "Review pending grades" to the assignments tab', () => {
      const cta = source.slice(
        source.indexOf('assignments need grading'),
        source.indexOf('Review pending grades')
      );
      expect(cta).toContain("setSelectedTab('assignments')");
    });

    it('routes "Review flagged content" to the moderation tab', () => {
      const cta = source.slice(
        source.indexOf('discussions flagged for review'),
        source.indexOf('Review flagged content')
      );
      expect(cta).toContain("setSelectedTab('moderation')");
    });

    it('leaves no alert-card button without a handler', () => {
      const alertSection = source.slice(
        source.indexOf('{/* Alert Cards */}'),
        source.indexOf('{/* Main Content Tabs */}')
      );
      const buttons = alertSection.match(/<Button[\s\S]*?>/g) || [];
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => expect(button).toContain('onClick'));
    });
  });

  describe('G0.2 moderation tab is honest', () => {
    const source = read('client/src/pages/TeacherDashboard.tsx');

    it('no longer advertises "coming soon"', () => {
      expect(source.toLowerCase()).not.toContain('coming soon');
    });

    it('renders a real moderation panel', () => {
      expect(source).toContain("import ModerationPanel from '../components/teacher/ModerationPanel'");
      expect(source).toContain('<ModerationPanel />');
    });

    it('the panel has a documented empty state instead of a fake list', () => {
      const panel = read('client/src/components/teacher/ModerationPanel.tsx');
      expect(panel).toContain('Nothing to review');
      expect(panel).toContain('/api/moderation');
    });
  });

  describe('G0.3 live classroom test tooling is dev-only', () => {
    const source = read('client/src/components/teacher/LiveClassroomMonitor.tsx');

    it('gates the test-activity button behind a dev flag', () => {
      expect(source).toContain('showDevTools');
      expect(source).toMatch(/showDevTools\s*&&/);
    });

    it('derives the flag from the build environment', () => {
      expect(source).toContain('import.meta.env?.DEV');
    });
  });

  describe('G0.4 teacher access copy matches reality', () => {
    it('API no longer promises an email notification', () => {
      const source = read('api/teacher.ts');
      const message = source.slice(
        source.indexOf('Teacher access request submitted'),
        source.indexOf('Teacher access request submitted') + 400
      );
      expect(message.toLowerCase()).not.toContain('email notification');
      expect(message.toLowerCase()).not.toContain('24-48');
    });

    it('modal no longer promises an email notification', () => {
      const source = read('client/src/components/TeacherAccessModal.tsx');
      expect(source.toLowerCase()).not.toContain('email notification');
      expect(source).not.toContain('24-48 hours');
    });
  });

  describe('G0.5 SDG impact is computed, not hardcoded', () => {
    it('removes the hardcoded SDG triple from the dashboard API', () => {
      const source = read('api/user-dashboard.ts');
      expect(source).not.toMatch(/primary_sdgs:\s*\[4,\s*16,\s*17\]/);
      expect(source).toContain('computeSdgImpact');
    });

    it('normalises the tag formats used across scenario files', () => {
      expect(normalizeSdgTag('4')).toBe(4);
      expect(normalizeSdgTag('SDG 10')).toBe(10);
      expect(normalizeSdgTag('Quality Education (SDG 4)')).toBe(4);
      expect(normalizeSdgTag('not-an-sdg')).toBeNull();
      expect(normalizeSdgTag(undefined)).toBeNull();
    });

    it('derives SDGs from the scenarios the learner engaged with', () => {
      const scenarios = [
        { id: 1, sdgTags: ['4', '10', '16'] },
        { id: 2, sdgTags: ['4', '9'] },
        { id: 3, sdgTags: ['13'] },
      ];

      const impact = computeSdgImpact([1, 2, 1], scenarios, {
        total_perspectives: 2,
        total_likes_received: 3,
        scenarios_completed: 1,
      });

      // SDG 4 appears in both engaged scenarios, so it ranks first.
      expect(impact.primary_sdgs[0]).toBe(4);
      // Scenario 3 was never engaged, so SDG 13 must not appear.
      expect(impact.primary_sdgs).not.toContain(13);
      expect(impact.sdg_breakdown.find((entry) => entry.sdg === 4)?.scenarios).toBe(2);
    });

    it('returns an empty SDG set for a learner with no engagement', () => {
      const impact = computeSdgImpact([], [{ id: 1, sdgTags: ['4'] }], {
        total_perspectives: 0,
        total_likes_received: 0,
        scenarios_completed: 0,
      });

      expect(impact.primary_sdgs).toEqual([]);
      expect(impact.impact_score).toBe(0);
    });

    it('caps the impact score at 100', () => {
      const impact = computeSdgImpact([], [], {
        total_perspectives: 50,
        total_likes_received: 100,
        scenarios_completed: 20,
      });
      expect(impact.impact_score).toBe(100);
    });
  });

  describe('G0.6 docs declare shipped vs planned', () => {
    const docs = read('docs/FEATURES.md');

    it('has a feature status table', () => {
      expect(docs).toContain('## Feature Status');
    });

    it('marks unbuilt integrations as planned', () => {
      const statusTable = docs.slice(
        docs.indexOf('## Feature Status'),
        docs.indexOf('## Executive Summary')
      );
      ['Gradebook export', 'Parent/guardian portal', 'Bulk CSV roster import', 'LMS passback'].forEach(
        (feature) => {
          const row = statusTable.split('\n').find((line) => line.includes(feature));
          expect(row).toBeDefined();
          expect(row).toContain('Planned');
        }
      );
    });
  });
});
