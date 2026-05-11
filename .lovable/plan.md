## Phase 4.1 — Typography sweep

Frozen scope from `docs/SCHOLAR_V4_PARITY_AUDIT.md`. One regression rule, one allowlist append, one verification gate. Admin parked.

---

## Prep commit (single edit to `src/styles/scholarV4.css`)

Add the four missing helpers + fix the existing `.s4-h1` RTL regression. Current `.s4-h1` uses `'Fraunces', Georgia, serif` — strips the `'Amiri'` fallback that `src/index.css:251` carefully preserves for Arabic. Replace with the project's canonical cascade.

```css
/* Update existing — RTL Amiri fallback restored */
.s4-h1 { font-family: 'Fraunces', 'Amiri', Georgia, 'Times New Roman', serif;
         font-size: 32px; line-height: 1.1; font-weight: 600;
         letter-spacing: -0.02em; color: var(--s4-ink); }

/* New helpers (Fraunces serif headings, Inter body, tabular-nums for numeric) */
.s4-h2     { font-family: 'Fraunces', 'Amiri', Georgia, 'Times New Roman', serif;
             font-size: 24px; line-height: 1.2; font-weight: 600;
             letter-spacing: -0.015em; color: var(--s4-ink); }
.s4-h3     { font-family: 'Fraunces', 'Amiri', Georgia, 'Times New Roman', serif;
             font-size: 18px; line-height: 1.3; font-weight: 600;
             color: var(--s4-ink); }
.s4-body   { font-family: 'Inter', system-ui, sans-serif;
             font-size: 14px; line-height: 1.55; color: var(--s4-body); }
.s4-small  { font-size: 12px; line-height: 1.45; color: var(--s4-muted); }
.s4-numeric{ font-variant-numeric: tabular-nums; }
```

Note: `.s4-body` and `.s4-small` are **opt-in** helpers — they are not applied by the sweep below (most components inherit the right sans + body color already). Adding them now means consumers can opt in later without a follow-up phase.

---

## Sweep mapping (locked, applied per file)

| Tailwind input | v4 output | Notes |
|---|---|---|
| `text-5xl font-bold` (heading) | `s4-h1 text-[40px]` | Override size to keep hero scale |
| `text-4xl font-bold` (heading) | `s4-h1 text-[36px]` | Above v4's 32px, keep custom size |
| `text-3xl font-bold` (heading) | `s4-h1` | Pure v4 H1 |
| `text-2xl font-bold\|semibold` (heading) | `s4-h2` | Pure v4 H2 |
| `text-xl font-semibold` (heading) | `s4-h3 text-[20px]` | Slight uplift from v4's 18px |
| `tracking-tight` (with new h1/h2) | (drop) | Helpers set letter-spacing |
| `tracking-wide\|wider\|widest` on small uppercase labels | (drop, replace with `s4-eyebrow` if matching the eyebrow recipe) | Only where context is an eyebrow label |

### What we **do not** touch
- `text-sm`, `text-base`, `text-lg` — utilitarian body sizes, kept verbatim.
- `font-medium`, `font-normal` — weight nuances inside body copy.
- `tracking-tight` on body text (non-heading) — kept verbatim.
- `text-2xl`/`text-3xl` inside Admin (cluster parked).
- `Scholar/CourseCard.tsx`, `Scholar/PageHeader.tsx`, `Scholar/ScholarBadge.tsx` — primitives whose typography defines the v4 spec rather than consumes it.
- Numeric counters (credit balance, score, timer) — `s4-numeric` is opt-in; this sweep does not retrofit it.

### Per-line decision rule
A class group sweeps only when **all three** are true on the same element:
1. The element is a heading-role node (`<h1>…<h6>`, `<DialogTitle>`, eyebrow `<span>`, or visually-styled label that semantically heads a section).
2. The size token matches one of the rows in the mapping table.
3. No `dark:`/`hover:`/state variant on the size class itself (variants on color/weight are fine and preserved).

If any condition fails, the line is **left untouched** and logged in the results block as "deferred — non-heading context."

---

## Frozen file list (47 files, Admin + 3 primitives excluded)

`src/components/AccountSuspended.tsx`, `src/components/Auth/Auth.tsx`, `src/components/Dashboard/AIQuestionGenerator.tsx`, `src/components/Dashboard/AchievementsPage.tsx`, `src/components/Dashboard/BillingHistoryPage.tsx`, `src/components/Dashboard/BookMode/WidgetContainer.tsx`, `src/components/Dashboard/BrainRushGamePlay.tsx`, `src/components/Dashboard/BrainRushQuestionResults.tsx`, `src/components/Dashboard/BrainRushResults.tsx`, `src/components/Dashboard/CreditBalanceWidget.tsx`, `src/components/Dashboard/Dashboard.tsx`, `src/components/Dashboard/EduPlayPage.tsx`, `src/components/Dashboard/FlashcardViewer.tsx`, `src/components/Dashboard/GameJoinPage.tsx`, `src/components/Dashboard/GlobalExamDetailModal.tsx`, `src/components/Dashboard/GoalsAndAchievementsPage.tsx`, `src/components/Dashboard/InformationalPage.tsx`, `src/components/Dashboard/InsufficientCreditsModal.tsx`, `src/components/Dashboard/ManualQuestionBuilder.tsx`, `src/components/Dashboard/MultiplayerGamePlay.tsx`, `src/components/Dashboard/MultiplayerLobby.tsx`, `src/components/Dashboard/MultiplayerMenu.tsx`, `src/components/Dashboard/MultiplayerResults.tsx`, `src/components/Dashboard/PomodoroTimer.tsx`, `src/components/Dashboard/ProfilePage.tsx`, `src/components/Dashboard/QuizPage.tsx`, `src/components/Dashboard/QuizTakingComponent.tsx`, `src/components/Dashboard/Sidebar.tsx`, `src/components/Dashboard/Social/FriendsPanel.tsx`, `src/components/Dashboard/Social/GroupsPanel.tsx`, `src/components/Dashboard/StudyGoalsPage.tsx`, `src/components/Dashboard/SubscriptionManagementPage.tsx`, `src/components/Dashboard/SummaryDisplay.tsx`, `src/components/ErrorBoundary.tsx`, `src/components/EnvValidator.tsx`, `src/components/NotFound.tsx`, `src/components/Onboarding/LanguageChoicePage.tsx`, `src/components/Onboarding/OnboardingWizard.tsx`, `src/components/Onboarding/PageTutorial.tsx`, `src/components/Pricing/CheckoutPage.tsx`, `src/components/Pricing/PaymentCancel.tsx`, `src/components/Pricing/PaymentSuccess.tsx`, `src/components/Pricing/PricingPage.tsx`, `src/components/ShareView.tsx`, `src/components/Subscription/PersistentSubscriptionModal.tsx`, `src/components/Subscription/SubscriptionGuard.tsx`, `src/pages/ScholarPreview.tsx`.

Execution order: smallest files first (`EnvValidator`, `NotFound`, `AccountSuspended`, `ErrorBoundary` — already Phase 3.18-swept for radius, low ripple) → Onboarding cluster → Pricing cluster → Subscription cluster → Dashboard surfaces (largest last). Allows incremental verification.

---

## Cross-file safety (must hold for every file)

- **No `t()` calls / i18n keys** touched. Sweep edits classNames on JSX that wraps existing `{t('...')}` calls; the call itself is preserved character-for-character.
- **No prop / state / handler / hook** logic changed. Only `className=` string mutations.
- **No `dark:` variants** on colour or size touched. Helpers carry the colour token (`var(--s4-ink)`) which already flips per `[data-theme]` × `.dark`.
- **Eyebrow detection** — only when the line *already* expresses the eyebrow recipe (small uppercase + tracking + gold/accent colour). Free-floating `tracking-wide` on body text stays untouched.
- **RTL** — new helpers' font-family chain (`'Fraunces','Amiri',Georgia,…`) matches the existing global serif cascade. Arabic users see the same font today and after the sweep.
- **Preserve attributes on heading elements** — `id`, `aria-*`, `data-*`, ref forwarding stays intact.

---

## Regression-guard delta

```js
// scripts/check-token-regressions.cjs — append to FORBIDDEN
{ id: 'serif-direct',
  re: /\bfont-serif\b/g,
  hint: 'Use .s4-h1/.s4-h2/.s4-h3 helper classes (font-family is baked in)' }
```
Audit confirmed 0 current `font-serif` hits → defensive rule, prevents regression.

Append the 47 files to `SWEPT_FILES` under a `// Phase 4.1 (typography)` block. Final allowlist count after phase: **86 files** (39 + 47).

---

## Verification gate (blocking — must pass before phase exit)

```
npm run check:tokens                       # 86 swept files clean, 4.1 rule + prior rules pass
npx tsc -p tsconfig.app.json --noEmit      # 0 errors required
npx eslint <47 touched files>              # 0 errors; 3 pre-existing warnings tolerated
bunx vitest run                            # 73/73 tests required
```

Plus visual smoke pass on these critical surfaces:
- `/auth` heading + form
- `/dashboard` hero + section titles
- `/pricing` plan cards
- `/library` page header
- `/quiz` question prompts
- RTL toggle (`<html dir="rtl">`) → confirm Amiri rendering on `s4-h1/h2/h3` consumers
- Light + dark mode under at least 2 palettes (navy-gold, oxblood-cream)

---

## Phase exit deliverables

1. **47 files swept** — only className edits.
2. **`src/styles/scholarV4.css`** — `.s4-h1` font-family corrected for RTL; `.s4-h2`, `.s4-h3`, `.s4-body`, `.s4-small`, `.s4-numeric` added.
3. **`scripts/check-token-regressions.cjs`** — `serif-direct` rule + 47 files appended.
4. **`docs/SCHOLAR_V4_ISSUES.md`** — Phase 4.1 results appendix (files touched, edit count, regression delta, visual sweep summary, cross-file safety statement).
5. **`.lovable/plan.md`** — Phase 4.1 RESULTS block.

Estimated edits: ~120 className mutations across 47 files + 1 CSS file + 1 script file + 2 docs.

---

## Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| `text-3xl` on a non-heading wrapper (e.g. icon-only badge) | Medium | Per-line decision rule above; deferred lines logged |
| Eyebrow false-positive on body text with `tracking-wide` | Low | Restrict to elements that already pair tracking+uppercase+small+accent colour |
| `Sidebar.tsx` icon-text baseline shift after font swap | Medium | Visual smoke pass on dashboard route mandatory |
| RTL Arabic renders in Fraunces instead of Amiri | Mitigated by prep | New helper cascade includes Amiri |
| ScholarSkeleton-style placeholder using `text-2xl` for sizing only | Low | Decision rule #1 (heading-role) excludes; deferred |

Awaiting approval to begin.
