import fs from 'fs';
import path from 'path';

/**
 * Static translation-coverage helpers.
 *
 * The language switcher offers seven locales, so something has to keep the
 * bundles honest: every key the UI renders must resolve in every offered locale,
 * otherwise switching language silently falls back to English mid-page.
 */

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'client/src');
const localesDir = path.join(srcDir, 'locales');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'locales' || entry.name === '__tests__') continue;
      walk(full, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name) && !entry.name.includes('.test.')) {
      out.push(full);
    }
  }
  return out;
}

/** Literal `t('a.b')` calls only; dynamic keys cannot be checked statically. */
export function usedKeys(): string[] {
  const keys = new Set<string>();
  for (const file of walk(srcDir)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\bt\(\s*['"]([A-Za-z0-9_.]+)['"]/g)) {
      keys.add(match[1]);
    }
  }
  return [...keys].sort();
}

export function localeCodes(): string[] {
  return fs
    .readdirSync(localesDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

export function loadLocale(code: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(localesDir, `${code}.json`), 'utf8'));
}

export function lookup(bundle: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, bundle);
}

export function missingKeys(code: string, keys: string[]): string[] {
  const bundle = loadLocale(code);
  return keys.filter((key) => typeof lookup(bundle, key) !== 'string');
}
