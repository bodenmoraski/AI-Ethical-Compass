/**
 * Deep validation — XSS / injection surface around dangerouslySetInnerHTML.
 */
import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');

describe('XSS hardening — Resources search highlight', () => {
  const source = read('client/src/pages/Resources.tsx');

  it('escapes HTML before injecting highlighted markup', () => {
    expect(source).toContain('dangerouslySetInnerHTML');
    expect(source).toContain('escapeHtml');
    expect(source).toMatch(/&amp;|&lt;|&gt;/);
  });

  it('escapes regex metacharacters in the search query', () => {
    expect(source).toContain('escapeRegExp');
  });
});

describe('XSS hardening — no other student-content innerHTML sinks', () => {
  it('perspective and assignment UIs do not use dangerouslySetInnerHTML', () => {
    const files = [
      'client/src/components/PerspectiveCard.tsx',
      'client/src/components/student/StudentAssignmentView.tsx',
      'client/src/components/teacher/SubmissionGradingForm.tsx',
      'client/src/components/ScenarioView.tsx',
    ];
    for (const file of files) {
      const source = read(file);
      expect(source).not.toContain('dangerouslySetInnerHTML');
    }
  });
});
