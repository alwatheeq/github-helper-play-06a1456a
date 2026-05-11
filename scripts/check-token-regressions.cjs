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
  {
    id: 'serif-direct',
    re: /\bfont-serif\b/g,
    hint: 'Use .s4-h1/.s4-h2/.s4-h3 helper classes (font-family is baked in).',
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
  // Phase 3.15 (library / content / history / share cluster)
  'src/components/Dashboard/LibraryPage.tsx',
  'src/components/Dashboard/ContentViewPage.tsx',
  'src/components/Dashboard/HistoryPage.tsx',
  'src/components/ShareView.tsx',
  // Phase 3.16 (core dashboard surfaces)
  'src/components/Dashboard/Dashboard.tsx',
  'src/components/Dashboard/SummaryDisplay.tsx',
  'src/components/Dashboard/FlashcardViewer.tsx',
  // Phase 3.17 (book-mode toggle / highlight menu / tooltip overlays)
  'src/components/Dashboard/BookMode/FreeFormToggle.tsx',
  'src/components/Dashboard/Highlighting/HighlightMenu.tsx',
  'src/components/Common/Tooltip.tsx',
  // Phase 3.18 (auth + top-level fallbacks)
  'src/components/Auth/Auth.tsx',
  'src/components/AccountSuspended.tsx',
  'src/components/NotFound.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/EnvValidator.tsx',
  // Phase 3.19 (language toggle / skeleton primitive / i18n modal)
  'src/components/LanguageToggle.tsx',
  'src/components/Scholar/ScholarSkeleton.tsx',
  'src/contexts/I18nContext.tsx',
  // Phase 4.1 (typography sweep — 47 files)
  'src/components/AccountSuspended.tsx',
  'src/components/Auth/Auth.tsx',
  'src/components/Dashboard/AIQuestionGenerator.tsx',
  'src/components/Dashboard/AchievementsPage.tsx',
  'src/components/Dashboard/BillingHistoryPage.tsx',
  'src/components/Dashboard/BookMode/WidgetContainer.tsx',
  'src/components/Dashboard/BrainRushGamePlay.tsx',
  'src/components/Dashboard/BrainRushQuestionResults.tsx',
  'src/components/Dashboard/BrainRushResults.tsx',
  'src/components/Dashboard/CreditBalanceWidget.tsx',
  'src/components/Dashboard/Dashboard.tsx',
  'src/components/Dashboard/EduPlayPage.tsx',
  'src/components/Dashboard/FlashcardViewer.tsx',
  'src/components/Dashboard/GameJoinPage.tsx',
  'src/components/Dashboard/GlobalExamDetailModal.tsx',
  'src/components/Dashboard/GoalsAndAchievementsPage.tsx',
  'src/components/Dashboard/InformationalPage.tsx',
  'src/components/Dashboard/InsufficientCreditsModal.tsx',
  'src/components/Dashboard/ManualQuestionBuilder.tsx',
  'src/components/Dashboard/MultiplayerGamePlay.tsx',
  'src/components/Dashboard/MultiplayerLobby.tsx',
  'src/components/Dashboard/MultiplayerMenu.tsx',
  'src/components/Dashboard/MultiplayerResults.tsx',
  'src/components/Dashboard/PomodoroTimer.tsx',
  'src/components/Dashboard/ProfilePage.tsx',
  'src/components/Dashboard/QuizPage.tsx',
  'src/components/Dashboard/QuizTakingComponent.tsx',
  'src/components/Dashboard/Sidebar.tsx',
  'src/components/Dashboard/Social/FriendsPanel.tsx',
  'src/components/Dashboard/Social/GroupsPanel.tsx',
  'src/components/Dashboard/StudyGoalsPage.tsx',
  'src/components/Dashboard/SubscriptionManagementPage.tsx',
  'src/components/Dashboard/SummaryDisplay.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/EnvValidator.tsx',
  'src/components/NotFound.tsx',
  'src/components/Onboarding/LanguageChoicePage.tsx',
  'src/components/Onboarding/OnboardingWizard.tsx',
  'src/components/Onboarding/PageTutorial.tsx',
  'src/components/Pricing/CheckoutPage.tsx',
  'src/components/Pricing/PaymentCancel.tsx',
  'src/components/Pricing/PaymentSuccess.tsx',
  'src/components/Pricing/PricingPage.tsx',
  'src/components/ShareView.tsx',
  'src/components/Subscription/PersistentSubscriptionModal.tsx',
  'src/components/Subscription/SubscriptionGuard.tsx',
  'src/pages/ScholarPreview.tsx',
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
