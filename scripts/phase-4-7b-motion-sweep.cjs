#!/usr/bin/env node
/**
 * Phase 4.7b — Motion-token sweep.
 *
 * Mechanical, token-bounded rewrites:
 *   transition-all                → transition-[background-color,border-color,color,opacity,transform,box-shadow]
 *   duration-(75|100|150)         → duration-[var(--s4-dur-fast)]
 *   duration-(200|250|300)        → duration-[var(--s4-dur-base)]
 *   duration-(400|500|700|1000)   → duration-[var(--s4-dur-slow)]
 *   ease-out                      → ease-[var(--s4-ease-out)]
 *   ease-(in|in-out|linear)       → ease-[var(--s4-ease)]
 *
 * Skips:
 *   - Admin subtree
 *   - Lines where `transition-all` neighbours `filter`/`backdrop-`/`grid-template`/`width`/`height`/`max-w` (logged for review)
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');

const TRANSITION_REPLACEMENT =
  'transition-[background-color,border-color,color,opacity,transform,box-shadow]';

const root = 'src';
const out = execSync(
  `rg -l --hidden -g '!**/Admin/**' -g '*.{ts,tsx}' "transition-all|(?<![-\\w])duration-(75|100|150|200|250|300|400|500|700|1000)(?![-\\w])|(?<![-\\w])ease-(in|out|in-out|linear)(?![-\\w])" ${root} -P`,
  { encoding: 'utf8' }
).trim();
const files = out ? out.split('\n').filter(Boolean) : [];

const reTransAll = /(?<![-\w])transition-all(?![-\w])/g;
const reDurFast = /(?<![-\w])duration-(75|100|150)(?![-\w])/g;
const reDurBase = /(?<![-\w])duration-(200|250|300)(?![-\w])/g;
const reDurSlow = /(?<![-\w])duration-(400|500|700|1000)(?![-\w])/g;
const reEaseOut = /(?<![-\w])ease-out(?![-\w])/g;
const reEaseOther = /(?<![-\w])ease-(in-out|in|linear)(?![-\w])/g;

let edits = 0;
const touched = [];
const logged = [];

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const lines = original.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let next = line;

    // transition-all collision check
    if (reTransAll.test(next)) {
      reTransAll.lastIndex = 0;
      const risky = /(filter|backdrop-|grid-template|(?<![-\w])w-|(?<![-\w])h-|max-w-)/.test(next);
      if (risky) {
        logged.push(`${file}:${i + 1}: ${next.trim().slice(0, 140)}`);
      } else {
        next = next.replace(reTransAll, () => {
          edits++;
          return TRANSITION_REPLACEMENT;
        });
      }
    }

    next = next.replace(reDurFast, () => { edits++; return 'duration-[var(--s4-dur-fast)]'; });
    next = next.replace(reDurBase, () => { edits++; return 'duration-[var(--s4-dur-base)]'; });
    next = next.replace(reDurSlow, () => { edits++; return 'duration-[var(--s4-dur-slow)]'; });
    next = next.replace(reEaseOut, () => { edits++; return 'ease-[var(--s4-ease-out)]'; });
    next = next.replace(reEaseOther, () => { edits++; return 'ease-[var(--s4-ease)]'; });

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

console.log(`Phase 4.7b sweep complete:`);
console.log(`  files touched:      ${touched.length}`);
console.log(`  total replacements: ${edits}`);
if (logged.length) {
  console.log(`\n  manual review (${logged.length} risky transition-all lines, NOT rewritten):`);
  for (const l of logged) console.log(`    ${l}`);
}
