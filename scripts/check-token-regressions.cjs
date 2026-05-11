#!/usr/bin/env node
/**
 * Token regression guard for the Scholar v4 design-system sweep.
 *
 * Each phase of the sweep migrates a fixed set of files from legacy Tailwind
 * radius classes and the gold-gradient pair to the new design tokens.
 * Once a file is on the allowlist below it must stay clean — this script
 * scans every listed path and fails the build if forbidden patterns return.
 *
 * Run: `npm run check:tokens` (wired into `quality` / `quality:quick`).
 */
const fs = require('fs');
const path = require('path');

// Forbidden patterns. Keep regexes anchored to className-style usage so we
// don't false-positive on prose, comments, or unrelated identifiers.
const FORBIDDEN = [
  {
    id: 'legacy-radius',
    // rounded-xl, rounded-2xl, rounded-lg, rounded-[12px] — but NOT rounded-t-*, rounded-md, rounded-full, rounded-r-*, etc.
    re: /(?<![-\w])rounded-(?:xl|2xl|lg|\[12px\])(?![-\w])/g,
    hint: 'Use rounded-[var(--s4-radius-card)] instead.',
  },
  {
    id: 'gold-gradient',
    re: /from-accent-gold\s+to-accent-gold-soft/g,
    hint: 'Flatten to bg-accent-gold (drop the bg-gradient-to-* prefix as well).',
  },
];

// Files already swept. Append per phase — never remove.
const SWEPT_FILES = [
  // Phase 3.10 (cards / dashboard surfaces)
  // Phase 3.11 (informational / onboarding / common modals + buttons)
  'src/components/Common/ConfirmationModal.tsx',
  'src/components/Common/Modal.tsx',
  'src/components/Common/PromptModal.tsx',
  'src/components/Dashboard/FeedbackPage.tsx',
  'src/components/Dashboard/InformationalPage.tsx',
  'src/components/Onboarding/LanguageChoicePage.tsx',
  'src/components/Onboarding/OnboardingWizard.tsx',
  'src/components/Onboarding/PageTutorial.tsx',
  // Phase 3.12 (social cluster)
  'src/components/Dashboard/Social/GroupsPanel.tsx',
  'src/components/Dashboard/Social/FriendsPanel.tsx',
  'src/components/Dashboard/Social/GroupChat.tsx',
  'src/components/Dashboard/CommentSection.tsx',
  'src/components/Dashboard/LikeButton.tsx',
  'src/components/Dashboard/FavoriteButton.tsx',
  // Phase 3.13 (ChatAssistant cluster)
  'src/components/ChatAssistant/ChatAssistant.tsx',
  'src/components/ChatAssistant/GlobalChatAssistant.tsx',
  // Phase 3.14 (pricing / subscription / checkout cluster)
  'src/components/Pricing/PricingPage.tsx',
  'src/components/Pricing/CheckoutPage.tsx',
  'src/components/Pricing/PaymentSuccess.tsx',
  'src/components/Pricing/PaymentCancel.tsx',
  'src/components/Subscription/PersistentSubscriptionModal.tsx',
];

const repoRoot = path.resolve(__dirname, '..');
let violations = 0;
const missing = [];

for (const rel of SWEPT_FILES) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) {
    missing.push(rel);
    continue;
  }
  const src = fs.readFileSync(abs, 'utf8');
  const lines = src.split('\n');
  for (const rule of FORBIDDEN) {
    lines.forEach((line, idx) => {
      rule.re.lastIndex = 0;
      if (rule.re.test(line)) {
        violations++;
        console.error(
          `\u2716 ${rel}:${idx + 1}  [${rule.id}]  ${line.trim()}`
        );
        console.error(`    \u2192 ${rule.hint}`);
      }
    });
  }
}

if (missing.length) {
  console.error('\n\u2716 Allowlisted files missing from disk:');
  for (const m of missing) console.error(`    ${m}`);
  violations += missing.length;
}

if (violations > 0) {
  console.error(
    `\nToken regression guard: ${violations} violation(s) across ${SWEPT_FILES.length} swept file(s).`
  );
  process.exit(1);
}

console.log(
  `\u2713 Token regression guard: ${SWEPT_FILES.length} swept file(s) clean.`
);
