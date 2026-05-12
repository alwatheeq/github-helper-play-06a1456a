#!/usr/bin/env node
/**
 * Phase 4.8 — Conservative dark-mode orphan fix.
 *
 * Targets ONLY `text-{color}-{600|700|800|900}` orphans (dark inks without a
 * dark-mode sibling) — the highest-confidence subset where a sibling is
 * almost always correct.
 *
 * Skips:
 *   - Admin subtree
 *   - Lines whose className already contains ANY dark:text-* token
 *   - bg-* and border-* state colors (contextual; manual review only)
 *
 * Mapping:
 *   600 → dark:text-{color}-400
 *   700 → dark:text-{color}-300
 *   800 → dark:text-{color}-200
 *   900 → dark:text-{color}-200
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');

const palette = '(red|green|blue|amber|yellow|orange|purple|pink|indigo|cyan|teal|emerald|rose|sky|fuchsia|violet|lime)';
const targetRe = new RegExp(`(?<![-\\w])text-${palette}-(600|700|800|900)(?![-\\w])`, 'g');

const map = { '600': '400', '700': '300', '800': '200', '900': '200' };

const out = execSync(
  `rg -l --hidden -g '!src/components/Admin/**' -g '*.{ts,tsx}' "text-(red|green|blue|amber|yellow|orange|purple|pink|indigo|cyan|teal|emerald|rose|sky|fuchsia|violet|lime)-(600|700|800|900)" src`,
  { encoding: 'utf8' }
).trim();
const files = out ? out.split('\n').filter(Boolean) : [];

const classRe = /(class(?:Name)?\s*=\s*)("([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{['"]([^'"]*)['"]\})/g;

let edits = 0;
const touched = [];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(classRe, (full, prefix, valueWrap, dq, sq, tpl, je) => {
    const cls = dq ?? sq ?? tpl ?? je ?? '';
    // Skip if any dark:text-* exists on this className
    if (/(?<![-\w])dark:text-/.test(cls)) return full;

    const additions = new Set();
    let pm;
    targetRe.lastIndex = 0;
    while ((pm = targetRe.exec(cls)) !== null) {
      const [, color, shade] = pm;
      additions.add(`dark:text-${color}-${map[shade]}`);
    }
    if (additions.size === 0) return full;

    edits += additions.size;
    const newCls = (cls + ' ' + Array.from(additions).join(' ')).trim();

    // Re-emit using same wrapper style
    if (dq !== undefined) return `${prefix}"${newCls}"`;
    if (sq !== undefined) return `${prefix}'${newCls}'`;
    if (tpl !== undefined) return `${prefix}{\`${newCls}\`}`;
    if (je !== undefined) return `${prefix}{'${newCls}'}`;
    return full;
  });

  if (updated !== original) {
    fs.writeFileSync(file, updated);
    touched.push(file);
  }
}

console.log(`Phase 4.8 conservative fix:`);
console.log(`  files touched: ${touched.length}`);
console.log(`  dark siblings added: ${edits}`);
