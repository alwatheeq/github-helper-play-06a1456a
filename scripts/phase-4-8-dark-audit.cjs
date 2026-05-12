#!/usr/bin/env node
/**
 * Phase 4.8 — Dark-mode parity audit.
 *
 * Scans src/** (excluding Admin) for state-colored text/bg classes that
 * have no sibling `dark:` companion on the same className attribute.
 * Reports likely orphans for manual review.
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');

const palette = '(red|green|blue|amber|yellow|orange|purple|pink|indigo|cyan|teal|emerald|rose|sky|fuchsia|violet|lime)';
const propRe = new RegExp(`(?<![-\\w])(text|bg|border)-${palette}-(\\d+)(?![-\\w])`, 'g');

const out = execSync(
  `rg -l --hidden -g '!**/Admin/**' -g '*.{ts,tsx}' "(text|bg|border)-(red|green|blue|amber|yellow|orange|purple|pink|indigo|cyan|teal|emerald|rose|sky|fuchsia|violet|lime)-" src`,
  { encoding: 'utf8' }
).trim();
const files = out ? out.split('\n').filter(Boolean) : [];

const orphans = [];
const classRe = /class(?:Name)?\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\}|\{['"]([^'"]*)['"]\})/g;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    classRe.lastIndex = 0;
    while ((m = classRe.exec(line)) !== null) {
      const cls = m[1] || m[2] || m[3] || m[4] || '';
      let pm;
      propRe.lastIndex = 0;
      while ((pm = propRe.exec(cls)) !== null) {
        const [, prop, color, shade] = pm;
        // skip if a dark: companion exists for the same prop
        const darkRe = new RegExp(`(?<![-\\w])dark:${prop}-`);
        if (!darkRe.test(cls)) {
          orphans.push({ file, line: i + 1, prop, color, shade, snippet: cls.trim().slice(0, 100) });
        }
      }
    }
  }
}

// Group by file
const byFile = {};
for (const o of orphans) {
  byFile[o.file] = (byFile[o.file] || 0) + 1;
}

console.log(`Phase 4.8 dark-mode parity audit:`);
console.log(`  files scanned: ${files.length}`);
console.log(`  total orphan occurrences: ${orphans.length}`);
console.log(`  files with orphans: ${Object.keys(byFile).length}`);
console.log(`\nTop 20 files by orphan count:`);
const top = Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 20);
for (const [f, n] of top) console.log(`  ${n.toString().padStart(4)}  ${f}`);

// Write detailed report
const report = orphans.map(o => `${o.file}:${o.line}  ${o.prop}-${o.color}-${o.shade}  | ${o.snippet}`).join('\n');
fs.writeFileSync('docs/audit/4.8-dark-orphans.txt', report);
console.log(`\nFull report: docs/audit/4.8-dark-orphans.txt`);
