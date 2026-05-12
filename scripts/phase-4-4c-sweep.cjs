#!/usr/bin/env node
/**
 * Phase 4.4c — Borders/Rings sweep.
 * Mechanical migration of neutral border-/ring-/divide- utilities to semantic
 * divider tokens. Preserves state colors (red, green, blue, etc), opacity
 * overlays, and existing dark: variants.
 *
 * Mapping:
 *   border-gray-(100|200|300|400)  → border-divider          [+ companion dark:border-divider-on-dark]
 *   border-gray-(600|700|800|900)  → border-divider-on-dark
 *   border-slate-(700|800)         → border-divider-on-dark
 *   ring-gray-*, divide-gray-*     → same mapping with ring-/divide- prefix
 *
 * `dark:` prefixed variants map the same way under the `dark:` prefix.
 * Companion dark: only added when the original line has NO `dark:border-*`.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');

const rgOut = execSync(
  `rg -l --pcre2 "(?<![-\\\\w])(?:dark:)?(?:border|ring|divide)-(?:gray|slate|zinc|neutral|stone)-[0-9]+(?![-\\\\w])" src/components src/pages -g '!src/components/Admin/**'`,
  { cwd: repoRoot }
).toString().trim().split('\n').filter(Boolean);

const LIGHT = /^(50|100|200|300|400)$/;
const DARK  = /^(600|700|800|900)$/;
const SLATE_DARK = /^(700|800)$/;

function mapToken(prefix, util, family, shade) {
  // util in {border, ring, divide}
  if (family === 'gray') {
    if (LIGHT.test(shade)) return { token: `${prefix}${util}-divider`,         kind: 'neutral-light' };
    if (DARK.test(shade))  return { token: `${prefix}${util}-divider-on-dark`, kind: 'neutral-dark'  };
    return null;
  }
  if (family === 'slate') {
    if (SLATE_DARK.test(shade)) return { token: `${prefix}${util}-divider-on-dark`, kind: 'neutral-dark' };
    return null;
  }
  return null;
}

const TOKEN_RE = /(?<![-\w])(dark:)?(border|ring|divide)-(gray|slate|zinc|neutral|stone)-(\d+)(?![-\w])/g;
const HAS_DARK_BORDER = /(?<![-\w])dark:border-[\w[(/.-]+/;

const stats = {
  filesChanged: 0,
  totalReplacements: 0,
  companionAdds: 0,
  byKind: { 'neutral-light': 0, 'neutral-dark': 0 },
};

for (const rel of rgOut) {
  const abs = path.join(repoRoot, rel);
  const src = fs.readFileSync(abs, 'utf8');
  const lines = src.split('\n');
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    const hadDarkBorder = HAS_DARK_BORDER.test(original);
    let lineLightBorderHit = false;

    const replaced = original.replace(TOKEN_RE, (match, dark, util, family, shade) => {
      const prefix = dark || '';
      const mapped = mapToken(prefix, util, family, shade);
      if (!mapped) return match;
      stats.totalReplacements++;
      stats.byKind[mapped.kind]++;
      if (!dark && util === 'border' && mapped.kind === 'neutral-light') {
        lineLightBorderHit = true;
      }
      return mapped.token;
    });

    let finalLine = replaced;

    if (lineLightBorderHit && !hadDarkBorder && !HAS_DARK_BORDER.test(replaced)) {
      finalLine = replaced.replace(
        /(\bborder-divider\b)/,
        '$1 dark:border-divider-on-dark'
      );
      stats.companionAdds++;
    }

    if (finalLine !== original) {
      lines[i] = finalLine;
      fileChanged = true;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(abs, lines.join('\n'));
    stats.filesChanged++;
    console.log(`  swept ${rel}`);
  }
}

console.log('\nPhase 4.4c sweep complete.');
console.log(JSON.stringify(stats, null, 2));
