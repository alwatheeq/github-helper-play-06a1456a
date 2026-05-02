## Goal

Restructure pages, cards, and component placement across the entire app to match the editorial layout language shown in the PDF. Themes/tokens are already migrated (Wave 7) and stay untouched. **No italics, no roman numerals, sentence case, current Inter + Fraunces fonts only.** PDFs are visual reference only — we copy structure (eyebrow / title / descriptor / hairline / column rhythm / hairline cards / accent-card inversion) and ignore PDF decoration.

## Non‑negotiable guardrails

- **No backend / schema / RPC / edge-function changes.** Memory rule: never alter Supabase during UI work. Hooks, contexts, stores, routes, auth flow stay intact.
- **No theme/token churn.** Wave 7 is final. We consume existing tokens (`bg-card-light`, `bg-card-dark`, `border-divider`, `border-divider-on-dark`, `text-ink`, `text-secondary-ink`, `text-muted-ink`, `bg-sidebar`, `accent-gold`, `accent-gold-soft`, `bg-page-light`, `bg-page-dark`, `bg-chip`, `bg-subtle`) — no new colors.
- **No font swap.** Keep configured Inter (sans) and Fraunces (display). No `italic` utility added in this work; remove it where it appears in touched files. No `list-roman`, no `i. / ii.` markers — use plain `1. 2. 3.` or unordered hairline rows.
- **i18n + RTL preserved.** Continue using `useI18n()`; every new directional class uses `rtl:` variants or `start/end` logical utilities. All new strings go through `t(...)` keys (added to `en.json`, `ar.json`, `fr.json`, `tr.json`).
- **Auth, routing, role guards, subscription gates, onboarding tutorials, TTS hover, mouse-proximity sidebar, pin mode** all keep working. We restyle, we don't rewire.
- **A11y preserved or improved.** Buttons keep `aria-label`, dialogs keep focus-trap, tab strips become `role="tablist"` with proper `aria-selected`, hairline-only inputs keep visible focus rings.
- **TS strict-off + relaxed config respected.** No new `any` introduced; touched files end ESLint-clean (no new warnings). `tsc --noEmit` green after every wave.

## The structural law (applied everywhere)

### Card

- 1px hairline border using existing divider tokens. No drop shadow in light mode; dark mode keeps the existing subtle elevation token only when content needs separation.
- 4–6px radius (already exposed by `ScholarCard` as `rounded-[6px]` — reuse it; do not introduce new radii).
- Generous padding (24–32px on desktop, 16–20px on mobile via Tailwind responsive).
- No gradient fills. Hover = border steps to a darker divider, no shadow lift.
- New variant `accent`: brand-dark surface inside light pages, cream/light surface inside dark pages — used for the right-rail callout cards (toggle list, "highest mark", "from the editors", quote blocks).

### Page skeleton

```text
[ TopBar: monogram | page eyebrow . tagline . credits . bell . avatar ]
[ Sidebar (always dark, both modes) | -------------- main column -------------- ]
                                    | EYEBROW (uppercase, gold, tracked, tiny)
                                    | Large serif title.        [ right action ]
                                    | One descriptor sentence.
                                    | ───── hairline ─────
                                    | [ tab strip: text + gold underline on active ]
                                    | ┌── main content ───┐  ┌── right rail ──┐
                                    | │ cards / table     │  │ accent cards   │
                                    | └───────────────────┘  └────────────────┘
                                    | ───── hairline ─────  small footer line
```

Right rail collapses below main on `< lg`. Sidebar collapses to icon strip below `md` (existing logic preserved).

## New primitives (under `src/components/Scholar/`)

Pure presentational, no business logic, no theme reads, no italics. Each ships with a TS interface, sensible defaults, and is re-exported from `src/components/Scholar/index.ts`.

1. `Eyebrow.tsx` — small uppercase tracked gold label. Props: `children`, `className`, optional `as`.
2. `PageHeader.tsx` — composes Eyebrow + serif title (forces a trailing period via prop, no italic) + descriptor + hairline divider + optional right-slot for actions. Handles RTL.
3. `SectionTabs.tsx` — text tabs with gold underline on active, keyboard-navigable, `role="tablist"`. Props: `tabs: { id, label, count? }[]`, `activeId`, `onChange`. No pill backgrounds.
4. `EditorialCard.tsx` — thin wrapper over `ScholarCard` adding `variant: 'default' | 'accent'`. Accent flips surface via `bg-sidebar text-ink-on-dark dark:bg-card-light dark:text-ink`.
5. `EditorialTable.tsx` — borderless `<table>` with hairline `border-b border-divider` rows, tracked uppercase column headers, RTL-aware alignment. Accepts a generic row renderer.
6. `RightRail.tsx` — fixed-width column wrapper (`w-full lg:w-[340px] lg:flex-shrink-0`) used in dashboard/quiz/feedback/academics layouts.
7. `WeekStrip.tsx` — 7 day cards in a row, today highlighted with a gold border, prev/today/next ghost buttons. Uses date-fns already in deps.
8. `RoomCard.tsx` — composite for Study Rooms grid (status badge, title, host line, description, hairline, avatar stack + people count + Join/View action).
9. `CourseCard.tsx` — composite for Academics grid (top accent rule, course code + lecturer, big grade letter, title, stat row, ghost open).
10. `MasteryBar.tsx` — single-line topic + course code + percent + thin progress rail.
11. `ChangelogList.tsx` — vertical list of version + title rows for Feedback rail.
12. `NumberedList.tsx` — plain `1. / 2. / 3.` rows with hairline dividers and a right-slot action (replaces the PDF's roman-numeral list — explicitly arabic numerals).
13. `KeyValueRow.tsx` — label-left / value-right hairline row, used in profile, billing, subscription, admin.

All are exported from `src/components/Scholar/index.ts` and unit-tested only via type-check (no Vitest tests added — out of scope to keep diff focused; existing tests stay green).

## Chrome restyle (Wave 8 — touches every page indirectly)

### `src/components/Dashboard/Sidebar.tsx`

- Already on `bg-sidebar` + `border-divider-on-dark`. Keep as-is structurally; tighten:
  - Active row: `border-l-2 border-accent-gold` (RTL → `border-r-2`) — already correct.
  - Item rows show label + descriptor (already present) — drop any italic class if found, normalize to `text-sm` label + `text-xs` descriptor.
  - Footer keeps copyright; remove italic on tagline if any.
- All hover/proximity/pinning logic, mobile drawer, TTS-on-hover, RTL, keyboard scroll-into-view: unchanged.

### `src/components/Dashboard/Header.tsx`

- Layout: monogram (left) · centered tagline · right cluster (credits pill, notification bell, language toggle, avatar/menu).
- Tagline rendered in Fraunces, **not italic**, normal weight, `text-secondary-ink`.
- Credits pill: hairline border, gold value, label in `text-muted-ink`. Keeps existing `useCredits()` wiring.
- All existing buttons (search, chat assistant trigger, notifications, profile menu) preserved with same props.

### `src/components/Admin/AdminHeader.tsx` and `src/components/Admin/AdminSidebar.tsx`

- Mirror the public chrome: dark sidebar in both modes, same eyebrow/title pattern in admin pages. Keeps `useAuth`, `signOut`, role guards.

## Page redesigns

For every page below: replace soft-shadow card containers with `EditorialCard`, mount `PageHeader` at the top, lift action buttons into the header right-slot, convert tab pills to `SectionTabs`, swap any `italic` class for normal, swap `list-[lower-roman]` → arabic / `NumberedList`. Data fetching, mutations, navigation, modals — untouched.

### PDF-anchored pages

- **`Dashboard.tsx` + `InputForm.tsx`** — workshop layout: drop-zone EditorialCard (60%) + right rail accent card with the 4 generation toggles (Summary / Flashcards / Examination / Mind map) + credit cost + Generate button. Recently processed → `NumberedList` below. All existing handlers (`onProcessFile`, `onProcessText`, OCR scan flow, credit checks, subscription gate, tutorials) wired identically.
- **`LibraryPage.tsx`** — left rail: topics list with counts and active highlight; main: filter `SectionTabs` (All / Mine / Community / Liked) + `EditorialTable` (Title · Subject · Format · Catalogued). All existing actions (publish, like, favorite, comments, topics-tags modal, share view) preserved. Keep `LibraryPage` UI improvements analysis already in repo as reference but do not regress fixed bugs.
- **`StudyRoomsPage.tsx`** — header + `SectionTabs` (Browse / My Rooms / Friends / Groups) + search input + "Live now" eyebrow row + 3-column `RoomCard` grid. Keeps Zego integration, room creation, join/leave, friends, auto-end.
- **`Academics/AcademicsPage.tsx`** — header + `WeekStrip` + 2-col `CourseCard` grid + right-rail mastery card with `MasteryBar` rows. Keeps SRS panel, exam scheduler, course tutor, analytics modals as overlay/tabbed content (still routed inside page).
- **`QuizPage.tsx`** — composer EditorialCard with subject input, two `EditorialCard` radio cards (From Library / Submit anew), three control rows (count select, difficulty `SectionTabs` segmented, language select), Compose action. Right rail: accent "Highest mark" card + Recent sittings `NumberedList`. Keeps quiz generation, taking, manual builder, AI generator, global exams.
- **`FeedbackPage.tsx`** — letter card with hairline-only textarea, char counter, attach link, Discard + Send actions. Right rail: accent quote card + `ChangelogList` + "Other ways to write" block. Keeps `send-feedback-email` edge call.

### Non-PDF pages (improvise with the same skeleton)

- **`HistoryPage.tsx`** — header + `SectionTabs` (All / Summaries / Flashcards / Quizzes) + `EditorialTable` of items + right-rail "Cleanup" accent card.
- **`InformationalPage.tsx`** — header + section grid of EditorialCards.
- **`ProfilePage.tsx`** — header + 2-col layout: left main `EditorialCard`s for identity / preferences / palette switcher (palette switcher logic preserved verbatim — uses `useTheme()` legitimately) / language / sidebar mode / TTS. Right rail accent card with current plan. **Theme palette swatches keep their colors; only their wrapper becomes hairline.**
- **`EduPlayPage.tsx`** — header + grid of game-mode EditorialCards. Brain Rush, multiplayer flows untouched in behavior.
- **`AchievementsPage.tsx`, `GoalsAndAchievementsPage.tsx`, `StudyGoalsPage.tsx`** — header + EditorialCard grid + progress rows via `MasteryBar`-style rails.
- **`SubscriptionManagementPage.tsx`, `BillingHistoryPage.tsx`** — header + `KeyValueRow`s + `EditorialTable` of invoices. Stripe/Paddle wiring untouched.
- **`ContentViewPage.tsx`, `SummaryDisplay.tsx`, `FlashcardViewer.tsx`** — header where applicable; reading surfaces become `EditorialCard variant="default"` with comfortable max-width. Highlighting layer, book mode, read-aloud, mind map, audio study, share view: behavior untouched.
- **`NotificationCenter.tsx`** — popover styled as hairline card with `NumberedList`-style rows.
- **`MultiplayerMenu/Lobby/GamePlay/Results`, `BrainRushGamePlay/Results/QuestionResults`, `GameJoinPage`** — restyled to hairline cards + headers; game logic, sockets, scoring untouched.
- **`ManualQuestionBuilder.tsx`, `AIQuestionGenerator.tsx`, `QuizTakingComponent.tsx`** — wrapped in EditorialCards; inputs use existing `ScholarInput`/`ScholarTextarea`; no italic placeholders.
- **`CommentSection.tsx`, `LikeButton.tsx`, `FavoriteButton.tsx`, `ShareView.tsx`, `CreditBalanceWidget.tsx`, `LowCreditBanner.tsx`, `LowCreditWarning.tsx`, `PomodoroTimer.tsx`** — small primitives reskinned to hairline + sentence case.
- **`Pricing/PricingPage.tsx`, `CheckoutPage.tsx`, `PaymentSuccess.tsx`, `PaymentCancel.tsx`** — header + 3 EditorialCards for tiers, accent variant on the recommended tier; existing checkout calls untouched.
- **`Auth/Auth.tsx`** — centered hairline card, header at top of card, segmented sign-in / sign-up via `SectionTabs`. Email/Google/OTP flows untouched.
- **`Onboarding/OnboardingWizard.tsx`, `LanguageChoicePage.tsx`** — full-screen hairline panel with header pattern; step navigation, palette preview, language selection logic untouched. **Tutorial overlays (`PageTutorial.tsx`, `TutorialStep.tsx`) keep their highlight ring; only chrome of the tooltip card becomes hairline.**
- **`AccountSuspended.tsx`, `NotFound.tsx`, `EnvValidator.tsx`, `ErrorBoundary.tsx`** — header pattern + hairline card. Behavior identical.
- **`Common/Modal.tsx`, `Common/ConfirmationModal.tsx`, `Common/PromptModal.tsx`, `InsufficientCreditsModal.tsx`, `UsernameSetupModal.tsx`, `TopicsTagsModal.tsx`, `GlobalExamDetailModal.tsx`, `Subscription/PersistentSubscriptionModal.tsx`, `BlockUserModal.tsx`, `Admin/SubscriptionModal.tsx`** — dialog surface = hairline card, header = mini `PageHeader` (eyebrow + serif title + descriptor + hairline). Focus trap, escape-to-close, scroll lock preserved.
- **`Toast/Toast.tsx`** — hairline cards with left gold rule for info, existing semantic colors for success/warn/error preserved.
- **`Common/Card.tsx`** — already a thin wrapper over `ScholarCard`; updated to forward `variant` so legacy call sites can opt into `accent`.
- **`ChatAssistant/ChatAssistant.tsx`, `GlobalChatAssistant.tsx`** — panel becomes hairline card; bubble styling adopts `bg-chip` + hairline. Streaming, history, RAG calls untouched. CSS files updated only for radii/border, not behavior.
- **All Admin pages** (`AdminDashboard`, `OverviewPage`, `UsersPage`, `AdminUsersManagementPage`, `AnalyticsPage`, `AppSettingsPage`, `AuditLogPage`, `CreditManagementPage`, `FeedbackManagementPage`, `FoldersManagementPage`, `SubscriptionsManagementPage`, `TagsManagementPage`, `TokenUsagePage`, `TransactionsPage`, `UserActivityPage`, `AdminLogin`) — header pattern + `EditorialTable` for tabular pages + `EditorialCard` for forms. RBAC, audit logging, queries via `has_role` untouched.
- **`pages/ScholarPreview.tsx`** — updated only to demo the new primitives in addition to the existing palette demos.

### Files explicitly NOT modified

`hooks/*`, `contexts/*`, `stores/*`, `utils/*`, `lib/supabase.ts`, `locales/*` (only key additions, never key removals), `supabase/**`, `tailwind.config.js` (no token additions), `index.css` / `designSystem.css` (no new variables; existing `--scholar-shadow-*` vars stay), `App.tsx` (route tree untouched), `main.tsx`, `vite.config.ts`, all test files.

## Cross-file safety checklist (run before each wave merges)

1. `rg -n "\bitalic\b" src/components` on touched files → must be 0.
2. `rg -n "list-\[lower-roman\]|list-roman|\\bi\\.\\s|\\bii\\.\\s|\\biii\\.\\s" src/components` on touched files → must be 0.
3. `rg -n "getTheme[A-Z]|getBackgroundGradient" src` → must remain 0 (Wave 7 invariant).
4. `rg -n "useTheme\(" src` → must still resolve to only `ProfilePage`, `OnboardingWizard`, `ScholarPreview`, `App.tsx`, `ThemeContext.tsx`.
5. `rg -n "rounded-(xl|2xl|3xl)" src/components` on touched files → must be 0 (replaced by `rounded-[6px]` from `ScholarCard`).
6. `rg -n "shadow-(lg|xl|2xl)" src/components` on touched files → must be 0 outside dialog overlays and floating video.
7. RTL: every new `ml-/mr-/pl-/pr-/left-/right-/border-l/border-r` paired with its `rtl:` counterpart or replaced with logical `start`/`end` utilities.
8. i18n: every new literal user-facing string has a key in all four locale files (`en`, `ar`, `fr`, `tr`).
9. `tsc --noEmit` → 0 errors.
10. `eslint` on touched files → 0 new warnings (legacy `react-hooks/exhaustive-deps` pre-existing warnings are out of scope).
11. Smoke routes via console logs: `/`, `/dashboard/library`, `/dashboard/study-rooms`, `/dashboard/academics`, `/dashboard/quiz`, `/dashboard/feedback`, `/dashboard/profile`, `/dashboard/history`, `/pricing`, `/auth`, `/admin` — all mount with no runtime errors and no React key/contrast warnings.
12. Subscription gate, onboarding gate, account-suspended gate: still intercept correctly (verified by toggling test flags, not by mocking).

## Execution waves (small, independently shippable)

- **Wave 8 — Primitives + Chrome.** Build the 13 primitives. Restyle `Header.tsx`, `Sidebar.tsx`, `AdminHeader.tsx`, `AdminSidebar.tsx`. Update `Common/Card.tsx` to forward `variant`. No page templates change yet — every page keeps current look but now sits inside the new chrome.
- **Wave 9 — Dashboard + Library.** `Dashboard.tsx`, `InputForm.tsx`, `LibraryPage.tsx` (+ `CommentSection`, `LikeButton`, `FavoriteButton`, `TopicsTagsModal` reskin).
- **Wave 10 — Study Rooms + Academics.** `StudyRoomsPage.tsx`, `Academics/AcademicsPage.tsx` (+ `CourseAnalytics`, `CourseTutor`, `ExamScheduler`, `SRSReviewPanel` reskin).
- **Wave 11 — Quiz + Feedback.** `QuizPage.tsx`, `FeedbackPage.tsx` (+ `QuizTakingComponent`, `ManualQuestionBuilder`, `AIQuestionGenerator`, `GlobalExamDetailModal`).
- **Wave 12 — Reading & content surfaces.** `ContentViewPage`, `SummaryDisplay`, `FlashcardViewer`, `ShareView`, `MindMap/*`, `BookMode/*`, `Highlighting/*`, `AudioStudy/*`, `ReadAloud/*`, `FloatingVideo/*` (chrome only, behavior untouched).
- **Wave 13 — Profile, Plans, Goals, Notifications.** `ProfilePage`, `SubscriptionManagementPage`, `BillingHistoryPage`, `AchievementsPage`, `GoalsAndAchievementsPage`, `StudyGoalsPage`, `NotificationCenter`, `CreditBalanceWidget`, `LowCreditBanner`, `LowCreditWarning`, `PomodoroTimer`.
- **Wave 14 — Multiplayer & EduPlay.** `EduPlayPage`, `MultiplayerMenu/Lobby/GamePlay/Results`, `BrainRushGamePlay/Results/QuestionResults`, `GameJoinPage`, `BrainRushMultiplayerWrapper`.
- **Wave 15 — Auth, Onboarding, Pricing, Errors.** `Auth/Auth.tsx`, `Onboarding/*`, `Pricing/*`, `AccountSuspended`, `NotFound`, `EnvValidator`, `ErrorBoundary`, `pages/ScholarPreview.tsx`.
- **Wave 16 — Modals, Toasts, Chat Assistant.** `Common/Modal`, `ConfirmationModal`, `PromptModal`, `InsufficientCreditsModal`, `UsernameSetupModal`, `Subscription/PersistentSubscriptionModal`, `Toast/Toast`, `ChatAssistant/*`, `GlobalChatAssistant/*`.
- **Wave 17 — Admin surface.** All 18 admin files.
- **Wave 18 — Final sweep.** Run the cross-file checklist project-wide, fix stragglers, lock the layout language. Add a short `docs/EDITORIAL_LAYOUT_GUIDE.md` mapping primitive → usage so future contributors don't regress.

Each wave: `tsc --noEmit` clean, ESLint clean on touched files, manual visual check at 904×583 (current preview viewport) and at 1440 wide for right-rail layouts, RTL spot-check by switching language to Arabic.

## Out of scope

- Any theme/palette/token work.
- Any backend, schema, RPC, edge function, Supabase auth, Stripe wiring.
- Adding/removing routes, features, or product behavior.
- Italic typography, roman numerals, font changes, new shadow tokens, new radii.
- Test additions or test refactors.

Reply **"go"** to start Wave 8 (primitives + chrome), or tell me to merge/reorder waves.