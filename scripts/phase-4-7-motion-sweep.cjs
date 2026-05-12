#!/usr/bin/env node
/**
 * Phase 4.7 — Motion + focus-visible sweep.
 *
 * Conservative, token-bounded rewrites:
 *   focus:ring-(\d+)         → focus-visible:ring-$1
 *   focus:ring-offset-(\d+)  → focus-visible:ring-offset-$1
 *   focus:ring-(named)       → focus-visible:ring-$1
 *   focus:ring-offset-(named)→ focus-visible:ring-offset-$1
 *
 * Skips:
 *   - lines that already contain `focus-visible:ring` (collision guard)
 *   - the Admin subtree (out of scope)
 *
 * Logs (does not rewrite) any line containing `transition-all` next to
 * `filter:` / `backdrop-` / `grid-` for manual review in Phase 4.7b.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');

const root = 'src';
const out = execSync(
  `rg -l --hidden -g '!**/Admin/**' -g '*.{ts,tsx}' "focus:ring(-offset)?-" ${root}`,
  { encoding: 'utf8' }
).trim();
const files = out ? out.split('\n').filter(Boolean) : [];

const namedRingTokens = '(focus|divider|divider-on-dark|accent-gold|page|primary|secondary|destructive|input|ring|background|border|red-\\d+|blue-\\d+|amber-\\d+|emerald-\\d+|rose-\\d+|sky-\\d+|indigo-\\d+|violet-\\d+|fuchsia-\\d+|pink-\\d+|cyan-\\d+|teal-\\d+|orange-\\d+|yellow-\\d+|green-\\d+|purple-\\d+|gray-\\d+|slate-\\d+|zinc-\\d+|neutral-\\d+|stone-\\d+|white|black)';
const reRing = new RegExp(`(?<![-\\w])focus:ring-(\\d+|${namedRingTokens})(?![-\\w])`, 'g');
const reRingOffset = new RegExp(`(?<![-\\w])focus:ring-offset-(\\d+|${namedRingTokens})(?![-\\w])`, 'g');

let totalEdits = 0;
const touched = [];
const logged = [];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const lines = original.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let next = line;

    // Collision guard: if line already has focus-visible:ring or focus-visible:ring-offset
    // for the same utility, skip rewriting that utility on that line.
    const hasFvRing = /focus-visible:ring(?!-offset)/.test(line);
    const hasFvRingOffset = /focus-visible:ring-offset/.test(line);

    if (!hasFvRingOffset) {
      next = next.replace(reRingOffset, (m, tok) => {
        totalEdits++;
        return `focus-visible:ring-offset-${tok}`;
      });
    }
    if (!hasFvRing) {
      next = next.replace(reRing, (m, tok) => {
        totalEdits++;
        return `focus-visible:ring-${tok}`;
      });
    }

    // Manual-review log for transition-all next to non-trivial properties
    if (/transition-all/.test(next) && /(filter|backdrop-|grid-template)/.test(next)) {
      logged.push(`${file}:${i + 1}: ${next.trim().slice(0, 140)}`);
    }

    if (next !== line) {
      lines[i] = next;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, lines.join('\n'));
    touched.push(file);
  }
}

console.log(`Phase 4.7 sweep complete:`);
console.log(`  files touched: ${touched.length}`);
console.log(`  total replacements: ${totalEdits}`);
if (logged.length) {
  console.log(`\n  manual-review (${logged.length} lines with transition-all + non-trivial property):`);
  for (const l of logged) console.log(`    ${l}`);
}
