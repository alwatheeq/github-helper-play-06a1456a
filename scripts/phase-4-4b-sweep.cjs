#!/usr/bin/env node
/**
 * Phase 4.4b — Backgrounds sweep.
 * Mechanical migration of neutral / bare bg-white / bare bg-black utilities
 * to semantic tokens. Preserves bg-(white|black)/N opacity overlays,
 * gradients, state colours, and existing dark: variants.
 *
 * Mapping (per plan .lovable/plan.md §Phase 4.4b):
 *   bg-gray-(50|100|200|300|400)       → bg-subtle            [+ companion dark:bg-card-dark]
 *   bg-gray-(600|700|800|900)          → bg-card-dark
 *   bg-slate-(700|800)                 → bg-card-dark
 *   bg-white                           → bg-card-light        [+ companion dark:bg-card-dark]
 *   bg-black                           → bg-page
 *
 * `dark:` prefixed variants of the same tokens map the same way under the
 * `dark:` prefix. Companion dark: is added only when the original line has
 * NO `dark:bg-*` token (collision guard, same logic as 4.4a).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');

// Discover candidate files via ripgrep so the script stays in sync with
// real usage. Admin subtree is excluded per Phase 4.4 scope.
const rgOut = execSync(
  `rg -l --pcre2 "(?<![-\\w])(?:dark:)?bg-(?:gray|slate|zinc|neutral|stone)-[0-9]+(?![-\\w])|(?<![-\\w])(?:dark:)?bg-white(?![-/\\w])|(?<![-\\w])(?:dark:)?bg-black(?![-/\\w])" src/components src/pages -g '!src/components/Admin/**'`,
  { cwd: repoRoot }
).toString().trim().split('\n').filter(Boolean);

const NEUTRAL_LIGHT = /^(50|100|200|300|400)$/;
const NEUTRAL_DARK  = /^(600|700|800|900)$/;
const SLATE_DARK    = /^(700|800)$/;

// Token-level rewriter. `prefix` is '' or 'dark:'.
function mapToken(prefix, body) {
  // body examples: white, black, gray-700, slate-800
  let m;
  if (body === 'white')  return { token: `${prefix}bg-card-light`, kind: 'white' };
  if (body === 'black')  return { token: `${prefix}bg-page`,       kind: 'black' };
  m = body.match(/^gray-(\d+)$/);
  if (m) {
    if (NEUTRAL_LIGHT.test(m[1])) return { token: `${prefix}bg-subtle`,    kind: 'neutral-light' };
    if (NEUTRAL_DARK.test(m[1]))  return { token: `${prefix}bg-card-dark`, kind: 'neutral-dark' };
    return null; // gray-500 etc — leave alone
  }
  m = body.match(/^slate-(\d+)$/);
  if (m) {
    if (SLATE_DARK.test(m[1])) return { token: `${prefix}bg-card-dark`, kind: 'neutral-dark' };
    return null;
  }
  return null;
}

// Match a single utility token (with optional dark: prefix) inside a className-ish context.
// We scan the full file but only inside lines (so collision guard works per line).
const TOKEN_RE = /(?<![-\w])(dark:)?bg-(white|black|gray-\d+|slate-\d+|zinc-\d+|neutral-\d+|stone-\d+)(?![-/\w])/g;
const HAS_DARK_BG = /(?<![-\w])dark:bg-[\w[(/.-]+/;

const stats = {
  filesChanged: 0,
  totalReplacements: 0,
  companionAdds: 0,
  byKind: { white: 0, black: 0, 'neutral-light': 0, 'neutral-dark': 0 },
};

for (const rel of files()) {
  const abs = path.join(repoRoot, rel);
  const src = fs.readFileSync(abs, 'utf8');
  const lines = src.split('\n');
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    // pre-transform dark:bg-* presence (collision guard)
    const hadDarkBg = HAS_DARK_BG.test(original);
    let lineNeutralLightOrWhiteHit = false;

    const replaced = original.replace(TOKEN_RE, (match, dark, body) => {
      const prefix = dark || '';
      const mapped = mapToken(prefix, body);
      if (!mapped) return match;
      stats.totalReplacements++;
      stats.byKind[mapped.kind]++;
      if (!dark && (mapped.kind === 'white' || mapped.kind === 'neutral-light')) {
        lineNeutralLightOrWhiteHit = true;
      }
      return mapped.token;
    });

    let finalLine = replaced;

    if (lineNeutralLightOrWhiteHit && !hadDarkBg && !HAS_DARK_BG.test(replaced)) {
      // Inject `dark:bg-card-dark` immediately after the first new bg-card-light or bg-subtle
      // occurrence, preserving surrounding whitespace inside the className string.
      finalLine = replaced.replace(
        /(\bbg-(?:card-light|subtle)\b)/,
        '$1 dark:bg-card-dark'
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

function files() { return rgOut; }

console.log('\nPhase 4.4b sweep complete.');
console.log(JSON.stringify(stats, null, 2));
