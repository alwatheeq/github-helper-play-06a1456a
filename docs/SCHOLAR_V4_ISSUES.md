# Scholar v4 — Integration Issues Ledger

Living document. Every UI control from the v4 mockups that has no real backend
or no existing handler gets a row here. As they are wired up, mark them
✅ Done and remove the `todo()` call from the codebase.

## Conventions

- **Status** values: `🟡 Stub` (renders, toast TODO on click), `🔴 Hidden`
  (not yet rendered), `🟢 Live` (real handler).
- Stubs go through `src/utils/todoToast.ts` so QA can find every one
  with: `rg "todo\\(" src/`.

## Phase 0 + 1 (foundation + shell) — known gaps

| # | Page | v4 control | Status | Notes |
|---|------|------------|--------|-------|
| 1 | Dashboard | URL import tab | 🟡 Stub | No edge fn for URL → text extraction yet. |
| 2 | Dashboard | Scan / handwritten OCR confidence | 🟢 Live | `ocr-scan` edge fn handles printed; handwriting accuracy is uncontrolled — show a warning. |
| 3 | Academics · Tutor | Persistent AI tutor chat | 🟡 Stub | Could reuse `chat-assistant` edge fn. Needs a `tutor_sessions` table. |
| 4 | Academics · Exams | Exam-schedule calendar | 🟡 Stub | No `exam_schedule` table. |
| 5 | Academics · SRS | Spaced repetition review queue | 🟡 Stub | `srsAlgorithm.ts` util exists; no `srs_cards` table. |
| 6 | Academics · Analytics | Aggregate study charts | 🟡 Stub | `studyTracking.ts` writes events; no aggregation endpoint. |
| 7 | EduPlay | "Find a Match" matchmaking | 🟡 Stub | Current Brain Rush is invite-only. |
| 8 | Rooms | Group chat (room-wide text) | 🟡 Stub | No `room_messages` table. |
| 9 | Notifications | Pomodoro push wiring | 🟡 Stub | `usePomodoroStore` is local-only. |
| 10 | Achievements | Badge progress | 🟡 Stub | No `achievements` table. |
| 11 | Goals | Weekly targets | 🟡 Stub | No `user_goals` table. |
| 12 | Profile · Billing | "Empty / Failed / Canceled" variants | 🟡 Stub | Wire to existing Stripe subscription status in Phase 3. |
| 13 | Profile · Username | Cooldown timer | 🟡 Stub | No `username_changed_at` column on profiles. |
| 14 | Share | Reactions / comments | 🟡 Stub | Share view exists; v4 adds social affordances. |
| 15 | Content · Mind Map | "Export PNG" | 🟡 Stub | `html-to-image` not installed. |
| 16 | Content · Audio | Floating mini-player drag-to-dock | 🟡 Stub | `useFloatingVideoStore` exists; drag is new. |
| 17 | Dashboard | Workshop meta strip (avg processing time, last upload, storage used) | 🔴 Hidden | No backing data; hidden in code until real numbers wire up. |
| 18 | Dashboard | URL import tab handler | 🟡 Stub | No edge function to fetch+extract URL text. Calls `todo()`. |
| 19 | Dashboard · Rail | Examination & Mind-map outputs from GenerationRail | 🟡 Stub | Toggling either fires `todo()`; real wiring lives in InputForm CTAs. |
| 20 | History | Subject code on `user_history` | 🟡 Stub | Derived from `topics[0]`; needs a real `subject_code` column. |

## Visual deltas to validate during each phase

- **Sidebar background**: v4 always uses the brand-dark color, regardless of
  light/dark mode. Project already does this — good.
- **Card radius**: 6 px in v4 vs `rounded-xl` (12 px) historically. New Scholar
  v4 components use `var(--s4-radius-card)`. Verify legacy `.card-subtle`
  call sites — Phase 6 removes them.
- **Button radius**: 4 px in v4 vs 12 px historically.
- **Headings**: Fraunces. Already loaded. Arabic strings need to stack onto
  `Amiri` (already configured in `tailwind.config.js`).

## Phase tracker

- [x] Phase 0 — tokens, fonts, icons, helpers, this doc.
- [x] Phase 1 — header/sidebar shell polish (existing chrome already 80% v4).
- [x] Phase 2 — Dashboard / Workshop full rebuild to v4.
- [ ] Phase 3 — page-by-page restyle (Library, History, Quiz, Academics, EduPlay, Rooms, Profile, Feedback, Notifications, Goals, Achievements, Informational, Content viewers).
- [ ] Phase 4 — Auth & out-of-shell pages.
- [ ] Phase 5 — Active exam runtime & modals.
- [ ] Phase 6 — Cleanup (drop legacy `designSystem.css` rules, remove old shell files).

## Phase 3.8 — Data-driven exemptions preserved
- Notification severity pills (info/warning/error/success) — `rounded-full` retained
- Pomodoro phase colors (work=accent, short-break=green, long-break=blue) — retained
- Low-credit banner severity ramp (>30% neutral, 10–30% amber, <10% red) — retained
- Mini-player drag-handle and close affordances — `rounded-full` retained
- Admin credit-ops status badges (granted/revoked/expired) — retained

## Phase 3.9 — Data-driven exemptions preserved
- Achievement tier colors (bronze/silver/gold/platinum) — palette retained
- Goal progress-bar severity ramp (red <33%, amber 33–66%, green ≥66%) — retained
- Locked vs unlocked achievement opacity treatment — retained
- Tier badges / streak / milestone counter rings — `rounded-full` retained

## Phase 3.9 — Code-health follow-ups (not addressed in this phase)

### Orphaned pages
The following pages were token-swept for forward-compatibility but are **not currently mounted** anywhere in the app (no imports from `Dashboard.tsx`, `App.tsx`, `Sidebar.tsx`, or any other consumer). Wire-up is a layout/feature decision for Phase 4.x:
- `src/components/Dashboard/GoalsAndAchievementsPage.tsx`
- `src/components/Dashboard/StudyGoalsPage.tsx`
- `src/components/Dashboard/AchievementsPage.tsx`

### Duplicate implementations
Two parallel implementations of the same feature exist:
- Combined: `GoalsAndAchievementsPage.tsx`
- Split: `StudyGoalsPage.tsx` + `AchievementsPage.tsx`

Pick one canonical implementation and delete the other during Phase 4.x consolidation. Do not merge or delete during token sweeps.

## Phase 3.10 — Content Viewers Cluster (exemptions & follow-ups)

**Files swept (12 edited):** FlashcardViewer, ShareView, BookModeViewer, NotesWidget, WidgetContainer, MindMapView, AudioUpload, TranscriptView, AudioSummaryGenerator, AudioTtsPlayer, ReadAloudButton, ContentViewPage. Substitutions: 60 (rounded-* → `var(--s4-radius-card)`) + gold gradients → `bg-accent-gold`.

### Data-driven / structural exemptions (preserved byte-identical)
- **FlashcardViewer flip-card faces** (lines 727, 757): `rounded-2xl` kept — flip animation backface depends on matched front/back radius.
- **FlashcardViewer state gradients**: red/pink & blue/indigo (front by correctness), emerald/teal (success bar), red/pink-dark & purple/indigo-dark (quiz feedback) — encode answer state, not brand accent.
- **MindMap indigo accents**: `bg-indigo-600/700`, indigo handles/borders — data-viz palette (continuation of earlier 3.x exemption).
- **Dark floating popovers**: `HighlightMenu` (line 33) and `FreeFormToggle` tooltip (line 48) keep `bg-gray-900 … rounded-xl` — non-card chip surfaces. Defer to Phase 4.x popover-token pass.

### Follow-ups (out of scope, flagged)
- `NotesWidget.tsx:316` uses native `confirm()` for delete-note confirmation. Replace with `useConfirm()` modal in a dedicated UX-polish pass (consistent with prior `alert→toast` migration).
- `src/components/Dashboard/ShareView.tsx` is a re-export of `src/components/ShareView.tsx` — consider consolidating in Phase 4.x.

## Phase 3.11 — Informational / Feedback / Onboarding / Common modals (exemptions & follow-ups)

**Files swept (8 edited):** InformationalPage, OnboardingWizard, FeedbackPage, PageTutorial, LanguageChoicePage, Common/Modal, Common/ConfirmationModal, Common/PromptModal. Substitutions: 69 (`rounded-*` → `var(--s4-radius-card)`) + 8 gold-gradient flattenings.

### Data-driven / structural exemptions (preserved byte-identical)
- **`Common/Tooltip.tsx:25`** — `bg-gray-900 … rounded-xl` global tooltip surface. Same dark-popover exemption rule as `HighlightMenu` / `FreeFormToggle` in 3.10. Defer to Phase 4.x popover-token pass.
- **InformationalPage non-gold semantic gradients** — line 89 (`from-green-500 to-emerald-600` Library section) and line 358 (`from-orange-500 to-red-600` Quiz/warning section). Encode section semantics, not brand accent — only radius substituted.
- **`rounded-full` gold avatars** (OnboardingWizard:130, 186; LanguageChoicePage:46) — circular avatar geometry preserved; inner gold gradient flattened to `bg-accent-gold`.
- **FeedbackPage primary affordances** — dashed dropzone (`border-2 border-dashed`) treatment preserved; `bg-blue-600` upload button color preserved (form primary affordance, not brand-gold candidate).

## Phase 3.12 — Social cluster (exemptions & follow-ups)

**Files swept (6 edited):** GroupsPanel, FriendsPanel, GroupChat, CommentSection, LikeButton, FavoriteButton. Substitutions: 44 (`rounded-*` → `var(--s4-radius-card)`) + 5 gold-gradient flattenings.

### Data-driven / structural exemptions (preserved byte-identical)
- **`rounded-full` gold avatars / pill buttons** — GroupsPanel:435, GroupChat:273, CommentSection:282, FriendsPanel "Add friend" button — circular geometry preserved; inner gold gradient flattened to `bg-accent-gold`.
- **CommentSection primary affordance** — `bg-blue-600` post-comment button color preserved (form primary affordance convention from 3.11 FeedbackPage).
- **FriendsPanel accept / decline icon tints** — `bg-green-500/10` and `bg-red-500/10` preserved as semantic affordances.
- **`bg-white` QR code wrapper** (GroupsPanel) preserved — QR scanability requirement.

## Token regression guard (Phase 3.12 deliverable)

- `scripts/check-token-regressions.cjs` scans every file already migrated by Phases 3.10–3.13 and fails (`exit 1`) if a legacy `rounded-(xl|2xl|lg|[12px])` or `from-accent-gold to-accent-gold-soft` reappears.
- Wired as `npm run check:tokens` and prepended to `quality` / `quality:quick`, so CI and local quality gates block regressions before lint / tsc / vitest / build.
- The script's `SWEPT_FILES` allowlist is the source of truth — **every new phase MUST append its swept paths to that array** as the final step of its sweep.

## Phase 3.13 — ChatAssistant cluster (exemptions & follow-ups)

**Files swept (2 edited):** `ChatAssistant/ChatAssistant.tsx`, `ChatAssistant/GlobalChatAssistant.tsx`. Substitutions: 11 (`rounded-(t-)?lg` → `var(--s4-radius-card)`) + 8 gold-gradient flattenings.

### Data-driven / structural exemptions (preserved byte-identical)
- **FAB `rounded-full`** (both files) — circular floating-action geometry preserved; inner gold gradient flattened to `bg-accent-gold`.
- **Header directional rounding** — `rounded-t-lg` → `rounded-t-[var(--s4-radius-card)]` (top-only rounding kept, value tokenized) to align with the panel's top edge.
- **Resize-handle corner rounding** (`GlobalChatAssistant.tsx` lines 564–576) — `rounded-tl-lg` / `rounded-tr-lg` / `rounded-bl-lg` / `rounded-br-lg` preserved verbatim. These are 3px×3px drag affordances on the panel corners, not card surfaces; their radius hugs the parent panel and is a UX hit-area concern, not a brand token.
- **`focus:ring-accent-gold`** and `bg-blue-500` hover tints on resize handles preserved — semantic affordance / focus-state colors.
- **`ChatAssistant.css` / `GlobalChatAssistant.css`** out of scope: contain only `@keyframes shake`, `.drag-handle` cursors, and `.resize-handle` hover transitions — no radius or color tokens to migrate.

## Phase 3.14 — pricing / subscription / checkout cluster

Files swept (added to `SWEPT_FILES` allowlist in `scripts/check-token-regressions.cjs`):

| File | radius substitutions | gold-gradient flattens | exemptions |
|---|---:|---:|---|
| `src/components/Pricing/PricingPage.tsx` | 1 (`rounded-t-2xl` → `rounded-t-[var(--s4-radius-card)]` @ L126) | 0 | 1× `rounded-full` (theme toggle) |
| `src/components/Pricing/CheckoutPage.tsx` | 0 | 0 | 1× `rounded-full` (error icon halo) |
| `src/components/Pricing/PaymentSuccess.tsx` | 0 | 0 | 1× `rounded-full` (success icon halo) |
| `src/components/Pricing/PaymentCancel.tsx` | 0 | 0 | 1× `rounded-full` (cancel icon halo) |
| `src/components/Subscription/PersistentSubscriptionModal.tsx` | 0 | 0 | 1× `rounded-md` (icon backdrop pill, distinct medium-radius affordance) |

**Audit gate**: `npm run check:tokens` → `✓ 21 swept file(s) clean.`

### Exemption rationale
- **Icon halos `rounded-full`** — circular by design (status badges around `CheckCircle`, `XCircle`, error icon, theme toggle button); not card surfaces.
- **`rounded-md` on `PersistentSubscriptionModal:54`** — explicit medium-radius affordance for the icon backdrop, intentionally distinct from card-radius; out of the forbidden-pattern set.
- **Semantic state colors** (`bg-red-100`, `bg-blue-50`, `bg-orange-50`, `bg-green-100` + dark variants) preserved — affordance/intent colors, not brand-gradient candidates.
- **Business logic** (`useSubscription`, `useCredits`, `verifySubscriptionCreditsAfterCheckout`, `SUBSCRIPTION_PROCESSING_PAYWALL_SESSION_KEY`, `ErrorLogger`) — not touched.
- **Edge-function payloads** (`create-checkout-session`, `stripe-webhook`) and routes (`/pricing`, `/profile/subscription`, success/cancel return URLs) — unchanged.

The cluster was largely pre-conformed in earlier passes; the durable win this phase is closing the regression-guard gap so any future contributor edit re-introducing `rounded-xl`/gradient pairs fails CI.

## Phase 3.15 — library / content / history / share cluster

Files added to `SWEPT_FILES` allowlist in `scripts/check-token-regressions.cjs`:

| File | radius substitutions | gold-gradient flattens | exemptions |
|---|---:|---:|---|
| `src/components/Dashboard/LibraryPage.tsx` | 0 | 0 | 8× `rounded-full` (avatars, status pills, spinner ring, dot indicators) |
| `src/components/Dashboard/ContentViewPage.tsx` | 0 | 0 | none |
| `src/components/Dashboard/HistoryPage.tsx` | 0 | 0 | none |
| `src/components/ShareView.tsx` | 0 | 0 | 2× `rounded-full` (spinner geometry, tag-chip pill) |

**Audit gate**: `npm run check:tokens` → `✓ 25 swept file(s) clean.`

### Findings
All four files were already fully tokenized in earlier passes but were never on the regression-guard allowlist. Phase 3.15 is a **zero-substitution, guard-extension phase** — the durable win is enforcement, not churn.

### Exemption rationale
- `rounded-full` cases are circular-by-design (avatars, status badges, spinner rings, tag pills) — not card surfaces.
- Semantic state colors (red/green/blue/orange tints) and `bg-accent-gold` / `bg-accent-gold-soft/30` chip tints preserved — affordance/intent, not brand-gradient candidates.
- No `rounded-md` in this cluster.
- Business logic (`useAuth`, `useSubscription`, `useNotifications`, Supabase reads on history/content/share-link tables, `generate-share-link` edge function, routes `/library` `/history` `/content/:id` `/share/:token`, `ErrorLogger` calls, i18n keys) — not touched.

### Why "Folders" is not a separate file
Folder management is composed inside `LibraryPage.tsx` — there is no standalone user-facing Folders component. Admin's `FoldersManagementPage.tsx` is part of a separate Admin cluster (to be addressed in a later phase).

## Phase 3.16 — core dashboard surfaces (Dashboard / SummaryDisplay / FlashcardViewer)

**Scope**: trio of central dashboard surfaces, ~30 legacy radius hits.

**Substitutions** (30 total):
- `src/components/Dashboard/Dashboard.tsx` — 12 plain radius (`rounded-lg` / `rounded-xl` → `rounded-[var(--s4-radius-card)]`) on icon badge, language selector, action menu trigger, dropdown panel, six menu items, error card, error CTA button (L1542, 1560, 1607, 1617, 1622, 1635, 1644, 1652, 1665, 1699, 1728, 1737).
- `src/components/Dashboard/SummaryDisplay.tsx` — 15 plain + 1 directional. Plain: card shells, action buttons, language/format pickers, modal shell `rounded-2xl`, modal inputs. Directional: L1078 `rounded-r-lg` → `rounded-r-[var(--s4-radius-card)]` on medical-mode error notice strip.
- `src/components/Dashboard/FlashcardViewer.tsx` — 2 plain (`rounded-2xl` on flashcard front L727 and back L757 faces). Flip-animation classes (`backface-hidden`, `rotate-y-180`, `transform-style-preserve-3d`) preserved.

**Exemptions preserved verbatim** (31 total):
- `rounded-full` (25): avatars, status dots, spinner rings, circular action buttons, progress pills, tag chips — circular by design.
- `rounded-md` (6): SummaryDisplay icon backdrops (L843, L916) + FlashcardViewer rating cards (L818, L893, L964, L1025). Chip/sub-element radius, distinct from `--s4-radius-card`. Same convention as Phases 3.11 and 3.14.
- Semantic state colors (red/green/orange/indigo/purple/emerald tints) on error notices, action buttons, rating cards — affordance/intent.
- Non-gold gradients on FlashcardViewer accent bars (`from-red-400 to-pink-500`, `from-blue-400 to-indigo-500`, `from-emerald-400 to-teal-500`) — not the forbidden gold-gradient pair.

**Cross-file safety**: no edits to hooks (`useAuth`, `useSubscription`, `useCredits`, `useFeatureAccess`, `useNotifications`, `useOnboarding`, `usePageTutorial`, `useBookMode`, `useHighlights`), contexts (Chat, PersistentModal, Theme, SubscriptionUpsellGate), Supabase queries, edge-function payloads (`generate-summary-and-flashcards`, `generate-share-link`, `translate-text`, `translate-quiz-bulk`), routes, i18n keys, ErrorLogger calls, or shared components.

**Regression guard**: 3 files added under `// Phase 3.16 (core dashboard surfaces)` in `scripts/check-token-regressions.cjs`.

**Audit gate**: `npm run check:tokens` → `✓ 28 swept file(s) clean.`; all forbidden-pattern greps return 0; exemption counts match plan (25 `rounded-full`, 6 `rounded-md`); exactly 4 source files changed.

## Phase 3.17 — BookMode / Highlighting / Tooltip overlays (DONE)

**Files swept (3):**
- `src/components/Dashboard/BookMode/FreeFormToggle.tsx` — L48 `rounded-xl` → `rounded-[var(--s4-radius-card)]`
- `src/components/Dashboard/Highlighting/HighlightMenu.tsx` — L33 `rounded-xl` → `rounded-[var(--s4-radius-card)]`
- `src/components/Common/Tooltip.tsx` — L25 `rounded-xl` → `rounded-[var(--s4-radius-card)]`

**Substitutions:** 3 plain radius (all dark-chip overlay surfaces). 0 directional, 0 gold gradients.

**Exemptions preserved:** 3× `rounded-full` (2 in FreeFormToggle circular pill, 1 in HighlightMenu icon-button). Dark-chip `bg-gray-900` palette intentionally retained — out of scope for radius sweep.

**Cross-file safety:** Tooltip public API (`title`/`children`/`position`) unchanged; HighlightMenu/FreeFormToggle consumer props unchanged; no hooks, contexts, Supabase, edge functions, routes, locale keys, animations, or business logic touched.

**Regression guard:** 3 files appended to `SWEPT_FILES` under `// Phase 3.17` block. `npm run check:tokens` → ✓ 31 swept file(s) clean.

**Audit gate:** legacy=0, directional=0, gold=0, rounded-full=3, rounded-md=0. Exactly 4 files changed.

## Phase 3.18 — Auth + top-level error/empty states (DONE)

**Files swept (5):**
- `src/components/Auth/Auth.tsx` — 7 radius (L114, 116, 132, 142, 173, 188, 198: `rounded-lg` → `rounded-[var(--s4-radius-card)]`) + 2 gold-gradient removals (L104 logo badge, L198 submit button: `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`).
- `src/components/AccountSuspended.tsx` — 5 radius (L76 `rounded-xl`, L91/107/126/137 `rounded-lg` → `rounded-[var(--s4-radius-card)]`).
- `src/components/NotFound.tsx` — 3 radius (L10, 30, 38).
- `src/components/ErrorBoundary.tsx` — 4 radius (L70, 86, 102, 110).
- `src/components/EnvValidator.tsx` — 3 radius (L11, 26, 34).

**Substitutions:** 22 plain radius, 2 gold-gradient removals → solid `bg-accent-gold` (canonical replacement from Phases 3.10–3.13). 0 directional.

**Exemptions preserved:** 6× `rounded-full` (avatar/icon circles, loading spinner ring), 1× `rounded-md` (Auth.tsx L104 logo badge — chip sub-element, distinct from card radius).

**Cross-file safety:** Auth state machine (Supabase `signInWithOAuth` / `signUp` / `signInWithPassword`, redirect URLs, retry flow, error/success messaging) untouched. ErrorBoundary lifecycle methods (`componentDidCatch`, `getDerivedStateFromError`, ErrorLogger integration) untouched. EnvValidator env-var detection logic (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) untouched. All semantic state palettes (red/green/blue/gray + dark variants) preserved verbatim. Focus-ring utilities preserved.

**Regression guard:** 5 files appended under `// Phase 3.18 (auth + top-level fallbacks)`.

**Audit gate:** `npm run check:tokens` → ✓ 39 swept file(s) clean (combined with 3.19).

## Phase 3.19 — Primitives + i18n confirmation modal (DONE)

**Files swept (3):**
- `src/components/LanguageToggle.tsx` — 2 radius (L44 trigger button, L64 dropdown panel).
- `src/components/Scholar/ScholarSkeleton.tsx` — 1 radius inside internal `roundedMap` (L16 value only; `lg` key + public prop API `rounded?: 'none'|'sm'|'md'|'lg'|'full'` preserved).
- `src/contexts/I18nContext.tsx` — 3 radius on language-refresh modal (L151 dialog shell, L161 cancel button, L171 confirm button).

**Substitutions:** 6 plain radius → `rounded-[var(--s4-radius-card)]`. 0 gold, 0 directional.

**Exemptions preserved:** 1× `rounded-full` (ScholarSkeleton size variant).

**Cross-file safety:** I18nContext provider value (`t()`, `language`, `setLanguage`, `showRefreshPrompt`, `dismissRefreshPrompt`, `useI18n` hook) untouched. ScholarSkeleton prop signature unchanged — callers (`ScholarPreview.tsx`, `HistoryPage.tsx`) use default `size=md` and remain unaffected. LanguageToggle public props unchanged. No Supabase, edge functions, locale keys, or business logic touched.

**Regression guard:** 3 files appended under `// Phase 3.19 (language toggle / skeleton primitive / i18n modal)`.

**Audit gate:** `npm run check:tokens` → ✓ 39 swept file(s) clean.

## Phase 3.20 — CSS audit (DONE, verification-only)

**Files audited (2):**
- `src/index.css` — L358 `border-radius: 0.75rem; /* rounded-xl by default */` (global `button` selector), L365 `border-radius: 0.5rem; /* rounded-lg */` (global `input, textarea, select`).
- `src/styles/designSystem.css` — L45 `.card-subtle`, L72 `.btn-soft-primary`, L98 `.btn-soft-secondary`.

**Findings:** All 5 `rounded-(lg|xl)` matches are inline CSS comments (`/* rounded-xl */` annotations) inside CSS rule bodies that set `border-radius` in rem units. They document the Tailwind-utility equivalent of the rem value for designer/maintainer clarity. They are **not** utility classes and cannot leak into compiled output. No edits required.

**Note (not blocking 3.20):** `index.css` lines 357–367 establish global element-default radii (`button`, `input`, `textarea`, `select`) using literal rem values rather than `var(--s4-radius-card)`. This is a pre-token-system fallback. Tokenising those defaults belongs to a future global-element pass, not the per-component sweep tracked by Phases 3.10–3.19.

**Regression guard:** CSS files intentionally NOT added to `SWEPT_FILES` allowlist — the current regex would flag the comment lines and the guard is not comment-aware. Adding a comment-aware mode is deferred (low value vs. risk of silencing real future regressions).

**Final state:** Non-Admin codebase fully tokenised for radius + gold gradients. Allowlist: 39 files. Admin cluster (17 files, 6 gold gradients) remains parked until those pages are designed.
