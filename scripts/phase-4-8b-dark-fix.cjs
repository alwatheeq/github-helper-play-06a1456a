#!/usr/bin/env node
/**
 * Phase 4.8b — Conservative bg/border dark-orphan fix.
 *
 * Targets only the unambiguous subset:
 *   bg-{color}-50      → add dark:bg-{color}-950/40
 *   bg-{color}-100     → add dark:bg-{color}-900/30
 *   border-{color}-200 → add dark:border-{color}-800
 *   border-{color}-300 → add dark:border-{color}-700
 *   border-{color}-600 → add dark:border-{color}-400
 *   border-{color}-700 → add dark:border-{color}-400
 *   border-{color}-800 → add dark:border-{color}-300
 *
 * Skips:
 *   - Admin subtree
 *   - Saturated bg shades 500/600/700 (intentional CTA/badge surfaces)
 *   - Already-dark bg shades 800/900 (intentional dark accents)
 *   - className strings that already have ANY dark:bg-* (or dark:border-* respectively)
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');

const palette = '(red|green|blue|amber|yellow|orange|purple|pink|indigo|cyan|teal|emerald|rose|sky|fuchsia|violet|lime)';

const bgMap = {
  '50':  (c) => `dark:bg-${c}-950/40`,
  '100': (c) => `dark:bg-${c}-900/30`,
};
const borderMap = {
  '200': (c) => `dark:border-${c}-800`,
  '300': (c) => `dark:border-${c}-700`,
  '600': (c) => `dark:border-${c}-400`,
  '700': (c) => `dark:border-${c}-400`,
  '800': (c) => `dark:border-${c}-300`,
};

const reBg = new RegExp(`(?<![-\\w])bg-${palette}-(50|100)(?![-\\w])`, 'g');
const reBorder = new RegExp(`(?<![-\\w])border-${palette}-(200|300|600|700|800)(?![-\\w])`, 'g');

const out = execSync(
  `rg -l --hidden -g '!src/components/Admin/**' -g '*.{ts,tsx}' "(bg-${palette}-(50|100)|border-${palette}-(200|300|600|700|800))" src -P`,
  { encoding: 'utf8' }
).trim();
const files = out ? out.split('\n').filter(Boolean) : [];

const classRe = /(class(?:Name)?\s*=\s*)("([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{['"]([^'"]*)['"]\})/g;

let edits = 0;
const touched = [];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const updated = original.replace(classRe, (full, prefix, _wrap, dq, sq, tpl, je) => {
    const cls = dq ?? sq ?? tpl ?? je ?? '';
    const additions = new Set();

    const hasDarkBg = /(?<![-\w])dark:bg-/.test(cls);
    const hasDarkBorder = /(?<![-\w])dark:border-/.test(cls);

    if (!hasDarkBg) {
      let m;
      reBg.lastIndex = 0;
      while ((m = reBg.exec(cls)) !== null) {
        const fn = bgMap[m[2]];
        if (fn) additions.add(fn(m[1]));
      }
    }
    if (!hasDarkBorder) {
      let m;
      reBorder.lastIndex = 0;
      while ((m = reBorder.exec(cls)) !== null) {
        const fn = borderMap[m[2]];
        if (fn) additions.add(fn(m[1]));
      }
    }

    if (additions.size === 0) return full;
    edits += additions.size;
    const newCls = (cls + ' ' + Array.from(additions).join(' ')).trim();

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

console.log(`Phase 4.8b dark fix:`);
console.log(`  files touched:        ${touched.length}`);
console.log(`  dark siblings added:  ${edits}`);
