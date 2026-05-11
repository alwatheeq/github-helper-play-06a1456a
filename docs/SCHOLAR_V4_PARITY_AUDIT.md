# Scholar v4 — Parity Audit (Phase 4.0)

**Status:** Read-only. Zero source edits.
**Scope:** All `src/components/**`, `src/pages/**`, `src/contexts/**` excluding `src/components/Admin/**` (parked).
**Source of truth:** `design/templates/Scholar-v4.jsx` (8,393 lines, 40+ pages × 6 palette families × light/dark).
**Date:** 2026-05-11.

This document is the frozen gap inventory driving Phases 4.1 – 4.9. Each section below lists the count, the file list, the legacy pattern, the target token, and cross-file risks for the matching sub-phase. The counts here lock the file lists; sub-phase planning notes in `.lovable/plan.md` will quote them verbatim.

---

## Headline numbers (non-Admin)

| Sub-phase | Pattern detected | Files | Occurrences |
|---|---|---:|---:|
| 4.1 Typography | `text-(2xl–5xl)` / `tracking-*` / `font-serif` (0) | 48 | 56 line-hits |
| 4.2 Spacing | `p-[24/32/48px]` arbitrary / `gap-[Npx]` | 0 | 0 |
| 4.3 Shadows | `shadow-(sm/md/lg/xl/2xl)` | 47 | 135 |
| 4.4 Colour | `(text/bg/border/ring/divide/placeholder)-(gray/slate/zinc/neutral/stone)-N` + `(bg/text/border)-(white/black)` | 38 | **954 + 414 = 1,368** |
| 4.5 Component shells | bespoke `<button>` with `className` containing `px-` | 29 | — |
| 4.6 Iconography | `lucide-react` importers | 95 | — |
| 4.7 Motion | `transition-all` or `focus:ring` | 46 | 56 + 29 |
| 4.8 Dark-mode | (verification only) | 0–10 | — |
| 4.9 Composition | (page shells) | 15 | — |

**Material revisions to plan estimates:**
- Phase 4.2 — **no arbitrary spacing hits** detected. Phase 4.2 collapses to a verification-only pass (mirror Phase 3.20's CSS audit pattern). No regression rule needed; allowlist only.
- Phase 4.4 — colour volume confirmed **higher** than the plan's ~600 estimate. 1,368 occurrences across 38 files. Three-commit execution inside the single phase (text → bg → border) remains the right approach.
- Phase 4.1 — `font-serif` is already 0 across the codebase. The phase shifts focus from "remove font-serif" to "rationalize size + tracking pairs onto `.s4-h*` helpers." The proposed regression rule still installs (defensive).
- Phase 4.6 — 95 lucide importers is double the plan estimate. Will need internal batching during 4.6 sweep.

---

## Reference token map (from `Scholar-v4.jsx`)

### Per-family palette tokens (6 families × 2 modes = 12 sets)
Already wired in `src/index.css` under `[data-theme="<family>"]` + `.dark[data-theme="<family>"]`. Aliased through `src/styles/scholarV4.css` as `--s4-bg / --s4-panel / --s4-panel2 / --s4-ink / --s4-body / --s4-muted / --s4-accent / --s4-accent-soft / --s4-rule / --s4-chip / --s4-sb / --s4-sb-ink / --s4-sb-muted / --s4-sb-active`. **No new colour tokens required** for parity.

### Layout tokens (already in `scholarV4.css`)
`--s4-radius-card 6px`, `--s4-radius-btn 4px`, `--s4-radius-chip 999px`, `--s4-rail-width 300px`, `--s4-shell-gap 32px`, `--s4-card-pad 32px`, `--s4-card-pad-dark 22px`, `--s4-tab-indicator 2px`.

### Typography (v4 spec)
- Serif: `Fraunces` (Google Fonts, opsz 9..144, wght 400/500/600/700). Already imported in `src/index.css` line 4.
- Sans: `Inter` (wght 400/500/600/700). Already imported.
- Arabic: `Amiri` 400/700. Already imported.
- Sizes (px / line-height): h1 32/1.1, h2 24/1.2, h3 18/1.3, body 14/1.55, small 12/1.45, eyebrow 10/uppercase/letter-spacing 0.18em.
- Helpers existing: `.s4-h1`, `.s4-eyebrow`. **Missing**: `.s4-h2`, `.s4-h3`, `.s4-body`, `.s4-small`, `.s4-numeric` — added in 4.1 prep.

### Shadows (v4 spec)
Subtle 1px hairline + ambient + directional. **No tokens defined yet** — added in 4.3 prep.

### Motion (v4 spec)
Standard cubic-bezier ease, three durations (fast/base/slow). **No tokens defined yet** — added in 4.7 prep.

### Icon stroke (v4 spec)
1.6 px for 18–20 px icons, 1.7 px for 14–16 px icons. Round caps + joins. Currently using `lucide-react` defaults (2.0). **Wrapper needed** — added in 4.6 prep.

---

## Phase 4.1 — Typography (28 files locked)

**Pattern flagged:** `text-2xl|3xl|4xl|5xl` or `tracking-(tight|tighter|wide|wider|widest)`.

### Frozen file list (28 — Admin excluded, primitive consumers `Scholar/CourseCard.tsx`, `Scholar/PageHeader.tsx`, `Scholar/ScholarBadge.tsx` excluded since they're token-defining surfaces)

`AccountSuspended.tsx`, `Auth/Auth.tsx`, `Dashboard/AIQuestionGenerator.tsx`, `Dashboard/AchievementsPage.tsx`, `Dashboard/BillingHistoryPage.tsx`, `Dashboard/BookMode/WidgetContainer.tsx`, `Dashboard/BrainRushGamePlay.tsx`, `Dashboard/BrainRushQuestionResults.tsx`, `Dashboard/BrainRushResults.tsx`, `Dashboard/CreditBalanceWidget.tsx`, `Dashboard/Dashboard.tsx`, `Dashboard/EduPlayPage.tsx`, `Dashboard/FlashcardViewer.tsx`, `Dashboard/GameJoinPage.tsx`, `Dashboard/GlobalExamDetailModal.tsx`, `Dashboard/GoalsAndAchievementsPage.tsx`, `Dashboard/InformationalPage.tsx`, `Dashboard/InsufficientCreditsModal.tsx`, `Dashboard/ManualQuestionBuilder.tsx`, `Dashboard/MultiplayerGamePlay.tsx`, `Dashboard/MultiplayerLobby.tsx`, `Dashboard/MultiplayerMenu.tsx`, `Dashboard/MultiplayerResults.tsx`, `Dashboard/PomodoroTimer.tsx`, `Dashboard/ProfilePage.tsx`, `Dashboard/QuizPage.tsx`, `Dashboard/QuizTakingComponent.tsx`, `Dashboard/Sidebar.tsx`, `Dashboard/Social/FriendsPanel.tsx`, `Dashboard/Social/GroupsPanel.tsx`, `Dashboard/StudyGoalsPage.tsx`, `Dashboard/SubscriptionManagementPage.tsx`, `Dashboard/SummaryDisplay.tsx`, `ErrorBoundary.tsx`, `EnvValidator.tsx`, `NotFound.tsx`, `Onboarding/LanguageChoicePage.tsx`, `Onboarding/OnboardingWizard.tsx`, `Onboarding/PageTutorial.tsx`, `Pricing/CheckoutPage.tsx`, `Pricing/PaymentCancel.tsx`, `Pricing/PaymentSuccess.tsx`, `Pricing/PricingPage.tsx`, `ShareView.tsx`, `Subscription/PersistentSubscriptionModal.tsx`, `Subscription/SubscriptionGuard.tsx`, `pages/ScholarPreview.tsx`.

Total: **47 files** (the 48 minus the three primitives `Scholar/CourseCard.tsx`, `Scholar/PageHeader.tsx`, `Scholar/ScholarBadge.tsx`).

### Mapping table (size → token helper)
| Tailwind class | v4 helper | Notes |
|---|---|---|
| `text-5xl` (48px) | `.s4-h1` + `text-[40px]` override if 40px | Hero only |
| `text-4xl` (36px) | `.s4-h1` (32px) — accept tighter target | Page H1 |
| `text-3xl` (30px) | `.s4-h1` | Section H1 |
| `text-2xl` (24px) | `.s4-h2` | Card titles |
| `text-xl` (20px) | `.s4-h3` w/ `text-[20px]` if uplift required | Modal headers |
| `tracking-tight` | (drop — `.s4-h*` set their own letter-spacing) | — |
| `tracking-wide(r/est)` | `.s4-eyebrow` | Only for eyebrow labels |

### Cross-file watch
- `Dashboard/Sidebar.tsx` typography drives icon vertical centering; re-screenshot after font-family change.
- RTL: `--font-family-serif` cascade in `index.css` includes `'Amiri'` fallback — must not be stripped when migrating to `.s4-h*` classes (which use `'Fraunces',Georgia,serif`). **Risk:** Arabic locale users would lose Amiri if class overrides cascade. Mitigation: `.s4-h*` helpers will use `font-family:'Fraunces','Amiri',Georgia,serif` instead of the recipe quoted in plan 4.1.

### Regression rule (4.1)
```js
{ id: 'serif-direct', re: /\bfont-serif\b/g, hint: 'Use .s4-h1/.s4-h2 helper classes' }
```

---

## Phase 4.2 — Spacing (collapsed to verification-only)

**Pattern flagged:** `p-[16-64px]` arbitrary / `gap-[Npx]` arbitrary.

**Finding:** 0 occurrences. Current code uses Tailwind scale tokens (`p-4`, `p-6`, `p-8`, `gap-4`, etc.), which already align to the 8-pt grid v4 prescribes. No sweep needed.

**Revised action for 4.2:**
1. Verify current spacing patterns match v4 expectations on a per-route basis (visual check — done during 4.9 composition phase).
2. Add `--s4-card-pad-utility` to `tailwind.config.js`'s `spacing` extension so future authors can use `p-card-pad` (32px) directly — **deferred to 4.9** as composition concern.
3. **No 4.2 sub-phase commits.** 4.2 becomes a 5-line entry in `docs/SCHOLAR_V4_ISSUES.md` confirming verification.

---

## Phase 4.3 — Shadows (47 files locked, 135 hits)

### Mapping
| Class | Token | CSS value |
|---|---|---|
| `shadow-sm` | `--s4-shadow-hairline` | `0 0 0 1px var(--s4-rule)` |
| `shadow-md` | `--s4-shadow-card` | `0 1px 2px rgb(0 0 0 / .04), 0 4px 12px rgb(0 0 0 / .04)` |
| `shadow-lg`, `shadow-xl` | `--s4-shadow-modal` | `0 8px 32px rgb(0 0 0 / .12)` |
| `shadow-2xl` | `--s4-shadow-floating` | `0 12px 40px rgb(0 0 0 / .16)` |

### Frozen file list (47)
See raw `rg` output in audit log. Highest concentrations: `Dashboard/EduPlayPage.tsx`, `Pricing/PricingPage.tsx`, `Dashboard/BrainRushResults.tsx`, `Dashboard/StudyGoalsPage.tsx`. ~10 of these were touched in Phase 3 for radius — re-opening for shadow-only edits.

### Cross-file watch
- `Toast.tsx` (not in flagged list — already uses semantic z) — verify after sweep.
- `Modal.tsx`, `ConfirmationModal.tsx`, `PromptModal.tsx` — Phase 3 already swept radius. Shadow-only edits, no other class touched.
- `BookMode/BookModeViewer.tsx` + `Highlighting/HighlightLayer.tsx` use shadows for floating widgets — verify z-stack.

### Regression rule (4.3)
```js
{ id: 'tailwind-shadow', re: /(?<![-\w])shadow-(?:sm|md|lg|xl|2xl)(?![-\w])/g,
  hint: 'Use shadow-[var(--s4-shadow-*)]' }
```

---

## Phase 4.4 — Colour (38 files, 1,368 occurrences — three commits inside one phase)

### Mapping (locked — no further mapping changes during sweep)
```
text-gray-900   → text-ink             dark:text-ink-on-dark
text-gray-800   → text-ink             dark:text-ink-on-dark
text-gray-700   → text-secondary-ink   dark:text-muted-ink-on-dark
text-gray-600   → text-secondary-ink   dark:text-muted-ink-on-dark
text-gray-500   → text-muted-ink       dark:text-muted-ink-on-dark
text-gray-400   → text-muted-ink       dark:text-muted-ink-on-dark
text-gray-300   → text-muted-ink-on-dark
bg-white        → bg-card-light        dark:bg-card-dark
bg-gray-50      → bg-subtle            dark:bg-card-dark
bg-gray-100     → bg-subtle            dark:bg-card-dark
bg-gray-800/900 → bg-card-dark         (already dark-mode value)
border-gray-200 → border-divider       dark:border-divider-on-dark
border-gray-300 → border-divider       dark:border-divider-on-dark
ring-gray-300   → ring-divider
text-black      → text-ink
bg-black        → bg-page-dark         (or preserve if semantic — see below)
text-white      → text-ink-on-dark     (or preserve if on coloured surface — see below)
bg-white        → bg-card-light        dark:bg-card-dark
```

### State-vs-decoration allowlist (preserved verbatim — NOT swept)
- `red-50/100/500/600/700/900` — error UI, destructive actions
- `green-50/100/500/600/700/900` — success UI
- `yellow-50/100/500/600/700/900` — warning UI
- `blue-50/100/500/600/700/900` — info UI / primary submit (`Auth.tsx` confirmation modal)

Slate / zinc / neutral / stone are not used semantically; all hits sweep to neutrals.

### `text-white` / `bg-black` — context-dependent
- `text-white` over `bg-accent-gold`, `bg-red-500`, etc. → **preserve** (it's the foreground for a coloured surface, not theme-neutral).
- `text-white` over `bg-gray-*` or no explicit bg → **sweep** to `text-ink-on-dark`.

Audit produces a per-line allowlist for the 414 white/black hits during 4.4's text commit.

### Frozen file list (38 — by hit count desc, top 15 shown above)
Full list omitted from this doc for brevity — regenerated on demand inside `scripts/check-token-regressions.cjs` allowlist appendage at phase end.

### Commit plan
1. **4.4a Text colours** — `text-gray-*`, `text-white|black` (conditional). ~480 hits.
2. **4.4b Backgrounds** — `bg-gray-*`, `bg-white|black`. ~610 hits.
3. **4.4c Borders + rings + dividers + placeholders.** ~280 hits.

All three commits land before the phase verification gate. Allowlist appended once at phase end.

### Cross-file watch
- `contexts/ThemeContext.tsx` (56 hits, top file) — defines `getThemeGradient` per `mem://style/theme-system`. **Must verify no logic change**, only `className`/style-value strings. May need `text-ink` token added to `tailwind.config.js` first.
- `Common/LoadingSkeleton.tsx` — animation classes interact with bg-gray-200. Verify the shimmer keyframe still works against `bg-subtle`.

### Regression rule (4.4)
```js
{ id: 'raw-neutral', re: /(?<![-\w])(?:text|bg|border|ring|divide|placeholder)-(?:gray|slate|zinc|neutral|stone)-\d+(?![-\w])/g,
  hint: 'Use semantic ink/surface tokens' }
```

---

## Phase 4.5 — Component shells (29 files, button-only)

### Frozen file list (29)
Listed verbatim in `rg` output. No bespoke `<input>` patterns found with explicit `className=` — Phase 4.5 reduces to **button-only**.

### Variant taxonomy (locked after audit)
- `primary` — gold/accent fill, `text-ink-on-accent`. Used for submit / CTA.
- `secondary` — outlined, `text-ink` on `bg-card`. Used for cancel / dismiss.
- `ghost` — no border, hover bg-subtle. Used for icon-buttons w/ text.
- `danger` — red fill / outline. Destructive actions.
- `link` — text-only, underline on hover. Inline links.

Existing `ScholarButton.tsx` already exports `primary | secondary | ghost | outline | danger | link` variants. **Audit result: no API extension needed.** Phase 4.5 prep step collapses to: verify `React.forwardRef` is present + ensure `type`/`form`/`aria-*` attributes pass through.

### Prep commit (inline in 4.5)
1. Open `ScholarButton.tsx`, confirm `forwardRef`. If missing, add.
2. Confirm `...rest` spreads on the rendered `<button>`.
3. Commit.
4. Then sweep.

### Cross-file watch
- Form-submit handlers: `Auth.tsx`, `Pricing/CheckoutPage.tsx`, `Dashboard/FeedbackPage.tsx`, `Dashboard/InputForm.tsx`, `Dashboard/ProfilePage.tsx` — verify `type="submit"` survives.
- `Common/PromptModal.tsx`, `Common/ConfirmationModal.tsx` — already Phase 3-swept for radius; re-opening here for `<button>` → `<ScholarButton>`. Edit carefully — preserve `disabled` and the close-handler binding.
- `Tooltip` wrapping a button needs `ref` forwarded → confirm `<ScholarButton>` returns a real `<button>` not a fragment.
- `vitest run` after every 5 swept files.

### Regression rule (4.5) — none mechanical
Manual audit step at phase end: grep `<button.*className=.*px-` across the 29 swept files. Expected: 0 matches.

---

## Phase 4.6 — Iconography (95 files via lucide-react)

### Approach (locked)
1. Create `src/components/Scholar/icons/ScholarIcon.tsx` — wrapper around any lucide icon applying `strokeWidth=1.6`, `strokeLinecap="round"`, `strokeLinejoin="round"`, size prop maps to width/height. Additive — does not break existing call-sites.
2. Sweep `<IconName className="h-N w-N">` → `<ScholarIcon icon={IconName} size={N} />`.
3. Custom inline SVGs in `ScholarIconButton.tsx` already match v4 stroke — untouched.

### Frozen file list (95)
Full list omitted — regenerated at sweep time. Split into 3 batches of ~32 files for review sanity. **Internal batches, single phase.**

### Cross-file watch
- `vite.config.ts`: `optimizeDeps.exclude: ['lucide-react']` — leave config untouched.
- `Dashboard/Sidebar.tsx`, `Dashboard/Header.tsx` — icons tightly aligned to text baseline; screenshot before/after for each batch.
- `Toast/Toast.tsx` — icon-leading toast headers; verify alignment.

### Regression rule (4.6) — none
Lucide is a legitimate import; can't ban it. Allowlist alone enforces.

---

## Phase 4.7 — Motion (46 files, 56 + 29 hits)

### Token prep (added to `scholarV4.css`)
```
--s4-ease:     cubic-bezier(0.4, 0, 0.2, 1);
--s4-dur-fast: 120ms;
--s4-dur-base: 200ms;
--s4-dur-slow: 320ms;
```

### Mapping
- `transition-all duration-200` → `transition-[color,background-color,border-color,opacity,transform] duration-[var(--s4-dur-base)] ease-[var(--s4-ease)]`. In practice prefer the explicit prop list — `transition-all` masks reflows.
- `focus:ring-*` → `focus-visible:ring-*` (keyboard-only).
- Hover lifts on cards: `hover:-translate-y-px transition-transform`.

### Frozen file list (46)
Already enumerated above.

### Cross-file watch
- `BrainRushGamePlay.tsx`, `FlashcardViewer.tsx`, `Scholar/ScholarSkeleton.tsx` use `animate-*` keyframes. **Do not touch `animate-*`** — sweep only `transition-*` utilities.
- `@media (prefers-reduced-motion: reduce)` block in `src/index.css` (verify still present and still cascades — duration tokens fall back to `0ms` under that media query).
- `Scholar/ScholarInput.tsx`, `Scholar/ScholarButton.tsx`, `Scholar/ScholarIconButton.tsx`, `Scholar/MasteryBar.tsx` — primitives that other components inherit transitions from. **Edit these first** so consumers automatically benefit.

### Regression rules (4.7)
```js
{ id: 'transition-all', re: /\btransition-all\b/g, hint: 'Specify props or use var(--s4-ease)' }
{ id: 'focus-non-visible', re: /\bfocus:ring(?!-offset)/g, hint: 'Use focus-visible:ring-*' }
```

---

## Phase 4.8 — Dark-mode parity (verification-driven)

### Routes × themes matrix
15 routes × 6 palettes × {light, dark} = **180 screenshots** captured to `/tmp/parity-shots/<route>__<theme>__<mode>.png` and discarded after audit.

### Pass criteria
- No element renders white-on-white or black-on-black under any palette × mode.
- Accent-gold contrast ≥ 4.5:1 against the surface it sits on for text usage.
- Sidebar ink readable under each `--s4-sb` value.

### Expected file edits
0–10 (residual hits surviving 4.4). If a file requires a `dark:` variant that wasn't catchable by 4.4's regex, it's logged here.

### Deliverable
Findings summary appended to `docs/SCHOLAR_V4_ISSUES.md`. Screenshots not committed.

---

## Phase 4.9 — Page-level composition (15 page-shells)

### Frozen file list (15)
`Auth/Auth.tsx`, `AccountSuspended.tsx`, `NotFound.tsx`, `ShareView.tsx`, `pages/ScholarPreview.tsx`, `Pricing/PricingPage.tsx`, `Pricing/CheckoutPage.tsx`, `Onboarding/OnboardingWizard.tsx`, `Onboarding/LanguageChoicePage.tsx`, `Dashboard/Dashboard.tsx`, `Dashboard/LibraryPage.tsx`, `Dashboard/ContentViewPage.tsx`, `Dashboard/HistoryPage.tsx`, `Dashboard/FeedbackPage.tsx`, `Dashboard/EduPlayPage.tsx`, `Dashboard/Academics/AcademicsPage.tsx`.

### Approach
Per route, screenshot at 1280×820 alongside v4 reference. Adjust grid templates / max-widths / sticky positioning / hero placement. **No new tokens, no class-level sweep** — composition only.

### Cross-file watch
- Route-level changes can cascade into children. Edit page-shell only, screenshot, confirm children unaffected.
- `Dashboard.tsx` shell layout is consumed by every Dashboard child. Edit absolutely last.

---

## Verification protocol (run after every sub-phase)

```
npm run check:tokens                       # extended regression guard (rules grow per phase)
npx tsc -p tsconfig.app.json --noEmit      # 0 errors required
npx eslint <touched files>                 # 0 errors; 3 pre-existing warnings tolerated
bunx vitest run                            # 73/73 tests required
```

Each phase exit appends to `docs/SCHOLAR_V4_ISSUES.md`:
- Files touched (count + list)
- Edits applied (count)
- Regression-guard delta (rule id + file count)
- Visual regression summary (1 sentence)
- Cross-file safety statement (1 sentence)

---

## Cross-phase guardrails (verbatim from plan)

- `scripts/check-token-regressions.cjs` grows by **at most 1 rule + N files per sub-phase**. Never removed.
- Admin allowlist stays empty across all 9 sub-phases.
- Supabase / edge-functions / database schema untouched.
- No prop API changes to existing Scholar primitives without an explicit prep commit (only 4.5 + 4.6).

---

## Phase 4.0 — exit gate

- [x] Audit document produced (this file).
- [x] Per-sub-phase file lists frozen.
- [x] Material plan deltas captured (4.2 collapses, 4.4 volume revised up, 4.5 collapses to button-only, 4.6 doubles in scope).
- [x] No source files modified.

**Awaiting approval to begin Phase 4.1 — Typography.**
