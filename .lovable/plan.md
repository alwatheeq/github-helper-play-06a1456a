## Phase 2 verification

### What I checked

- `WorkshopPanel.tsx`, `WorkshopHeader.tsx`, `InputForm.tsx`, `GenerationRail.tsx`, `RecentlyProcessedList.tsx` all parse and HMR cleanly — vite logs show only normal `hmr update` lines, no compile errors.
- All 33 `t('workshop.*')` look-ups in Dashboard code have matching keys in `en.json`, `ar.json`, `fr.json`, `tr.json` (all 4 JSONs validated with `node -e "JSON.parse(...)"`).
- `todo()` import in `InputForm.tsx` and `GenerationRail.tsx` resolves to `src/utils/todoToast.ts`. The `TodoToastListener` is mounted exactly once in `App.tsx` inside `ToastProvider`; no duplicate mount.
- `Globe` icon added to the lucide import set — used by the URL tab; no orphaned imports.
- `urlInput` state, `setUrlInput`, and `handleUrlSubmit` are all consumed; `previewMode` still short-circuits where it should.
- 4-tab strip carries proper `role="tablist"` / `role="tab"` / `aria-selected` (a11y improvement vs Phase 0).
- Responsive grid in `WorkshopPanel` uses Tailwind `lg:grid-cols-[minmax(0,1fr)_300px]` — confirmed in code, inline style block removed.
- `SCHOLAR_V4_ISSUES.md` ledger has new rows #17–#20 and Phase 2 marked done.

### Phase 2 mishaps to clean up at the start of Phase 3

| # | Issue | Severity | Fix |
|---|-------|---------|-----|
| A | `src/components/Dashboard/WorkshopHeader.tsx` duplicates the already-shipped `src/components/Scholar/PageHeader.tsx` (same gold-eyebrow + serif-H1 + hairline pattern, already used by 14 other pages). | Medium — code duplication, two sources of truth for headers. | Delete `WorkshopHeader.tsx`; switch `WorkshopPanel.tsx` to `<PageHeader eyebrow={t('workshop.eyebrow')} title={t('workshop.title')} hideRule />`. |
| B | `WorkshopHeader.tsx` applies `borderRadius` to an `<hr>` (no visual effect on a 1px border). | Cosmetic. | Removed when A lands. |
| C | `todo(t('workshop.url_cta') || 'URL import')` — `t()` returns the key string on miss, so the `||` fallback never fires. | Minor. | Drop the `||` clause; `t()` is already the canonical source. |
| D | The hidden `{false && inputMode === 'file' && ...}` meta-strip block sits in source as dead JSX. | Hygiene. | Move it behind a real `dashboardMeta` prop (default `undefined`) or delete entirely and reintroduce when item #17 is implemented. |

These four fixes are tiny and land as the first commit of Phase 3.

Phase 2 is otherwise clean and professional. Proceeding to Phase 3.

---

## Phase 3 — page-by-page restyle

### What Phase 3 actually has to deliver

For **every** authenticated page outside the Workshop, deliver:

1. A `PageHeader` (eyebrow + serif H1 + hairline) at the top — consistent with Workshop.
2. Replacement of ad-hoc cards/buttons/inputs with `src/components/Scholar/*` primitives that already exist (`EditorialCard`, `EditorialTable`, `SectionTabs`, `RightRail`, `ScholarCard`, `ScholarButton`, `ScholarInput`, `ScholarBadge`, `ScholarAlert`, `ScholarSkeleton`, `RoomCard`, `CourseCard`, `MasteryBar`, `NumberedList`, `KeyValueRow`, `FeatureDarkCard`, `ChangelogList`).
3. All radii/padding via `--s4-*` tokens (radius-card 6 px, radius-btn 4 px, card-pad 32 px, card-pad-dark 22 px) — no `rounded-xl`, `rounded-lg`, `rounded-2xl`, or hard-coded `padding: 24px`.
4. Removal of any `bg-gradient-to-r from-accent-gold to-accent-gold-soft` button — replaced with `<ScholarButton variant="primary">`.
5. Every clickable affordance has a real handler **or** a `todo('<feature>')` call routed through `utils/todoToast.ts` (no inline sonner/alerts/console.warn placeholders).
6. Responsive contract: page-level horizontal scroll = bug; tab strips overflow inside their card under `sm`; multi-column layouts collapse under `lg`.
7. RTL parity for Arabic (only the few pages with custom positioning need checking — Scholar primitives are already RTL-safe).
8. i18n: every new visible string lives in all 4 locale files (`en/ar/fr/tr`).

Pages in scope:

```text
LibraryPage.tsx               1278 lines
HistoryPage.tsx                326
QuizPage.tsx                  1808
QuizTakingComponent.tsx        646  (visual chrome only; runtime in Phase 5)
EduPlayPage.tsx               1103
BrainRushGamePlay/Results/MultiplayerWrapper/QuestionResults
MultiplayerLobby/Menu/Results
StudyRoomsPage.tsx            1285
ZegoVideoRoom.tsx              (chrome only)
ProfilePage.tsx               1632
SubscriptionManagementPage    552
BillingHistoryPage             377
FeedbackPage                   540
NotificationCenter             243
GoalsAndAchievementsPage       914
AchievementsPage               323
StudyGoalsPage
InformationalPage              602
ContentViewPage                208
BookMode/* AudioStudy/* MindMap/*
Academics/AcademicsPage + CourseTutor/ExamScheduler/SRSReviewPanel/CourseAnalytics
```

### Sub-phases (each ships as a reviewable commit)

#### 3.0 — Phase 2 cleanup (≤30 min)
- Apply mishaps A–D above. No other changes.

#### 3.1 — Library + History (lead pages)
- `LibraryPage.tsx`: convert ~20 `rounded-*` legacy classes to `rounded-[var(--s4-radius-card)]`, swap top section to `PageHeader`, gradient action buttons → `ScholarButton`, file grid items → `EditorialCard`/`RoomCard` where they fit, empty/loading states → `ScholarSkeleton`/`ScholarAlert`.
- `HistoryPage.tsx`: already uses ScholarCard; consolidate to `EditorialTable` for the list, `PageHeader`, `SectionTabs` for filters, remove the gradient icon bubble at line 180.
- Add any `todo()` for missing handlers (export, bulk-delete, share with cooldown).

#### 3.2 — Examinations hub
- `QuizPage.tsx` (1808 lines): split visually into the v4 sub-pages (Create / My Quizzes / Explore / History / Global / Preview) using `SectionTabs`. **No** routing changes — same internal tab state.
- `QuizTakingComponent.tsx`: only the wrapper chrome (`PageHeader` slot, exit-confirm modal, timer pill). Active-exam runtime logic stays untouched (that's Phase 5).
- `AIQuestionGenerator.tsx`, `ManualQuestionBuilder.tsx`, `GlobalExamDetailModal.tsx`: token + ScholarButton sweep.

#### 3.3 — Academics hub
- `Academics/AcademicsPage.tsx` — `PageHeader`, `SectionTabs` for Courses/Tutor/Schedule/SRS/Analytics, `CourseCard` rows.
- `CourseTutor.tsx` — chat shell with `todo('AI tutor send')` (already documented as issue #3).
- `ExamScheduler.tsx` — `WeekStrip` + empty-state with `todo('Create exam-schedule item')` (issue #4).
- `SRSReviewPanel.tsx` — queue UI with `todo('Start SRS review')` (issue #5).
- `CourseAnalytics.tsx` — `MasteryBar` rows; charts stubbed via `todo()` (issue #6).

#### 3.4 — EduPlay + Brain Rush + Multiplayer
- `EduPlayPage.tsx`, `BrainRushGamePlay.tsx`, `BrainRushResults.tsx`, `BrainRushQuestionResults.tsx`, `BrainRushMultiplayerWrapper.tsx`, `MultiplayerLobby.tsx`, `MultiplayerMenu.tsx`, `MultiplayerResults.tsx`, `MultiplayerGamePlay.tsx`, `GameJoinPage.tsx`.
- Find-a-match CTA → `todo()` (issue #7).
- Replace all gradient buttons and `rounded-2xl` cards.

#### 3.5 — Study Rooms
- `StudyRoomsPage.tsx`: `PageHeader`, `RoomCard` grid, `SectionTabs` for Friends/Groups/Active.
- `ZegoVideoRoom.tsx`: only outer chrome (controls bar tokens, exit modal). ZegoCloud SDK calls untouched.
- Group chat input → `todo('Send group message')` (issue #8).

#### 3.6 — Profile + Billing + Subscription + Notifications + Feedback
- `ProfilePage.tsx`: `PageHeader`, `KeyValueRow` for personal info, theme picker already wired (keep). Username change CTA → wired if `username_changed_at` exists, else `todo()` (issue #13).
- `BillingHistoryPage.tsx`: `EditorialTable`; render real Stripe state via existing `useSubscription`; "Empty / Failed / Canceled" v4 variants become conditional branches (issue #12).
- `SubscriptionManagementPage.tsx`: token + button sweep, no logic change.
- `NotificationCenter.tsx`: `NumberedList` items, Pomodoro push-notification toggle → `todo()` (issue #9).
- `FeedbackPage.tsx`: form already calls `send-feedback-email` edge fn; only restyle.

#### 3.7 — Goals / Achievements / Informational
- `GoalsAndAchievementsPage.tsx`, `StudyGoalsPage.tsx`, `AchievementsPage.tsx`: stub achievements + goals (issues #10, #11) with `MasteryBar` and `EditorialCard`. Weekly goals temporarily backed by `localStorage` per the original ledger.
- `InformationalPage.tsx`: pure restyle.

#### 3.8 — Content viewers
- `ContentViewPage.tsx`, `BookMode/BookModeViewer.tsx` + widgets, `AudioStudy/AudioStudyPanel.tsx` + sub-components, `MindMap/MindMapView.tsx`, `FlashcardViewer.tsx`, `SummaryDisplay.tsx`, `ProcessingStatus.tsx`.
- Mind-Map "Export PNG" → `todo()` (issue #15).
- Audio mini-player drag-to-dock → `todo()` (issue #16).

#### 3.9 — Cross-cutting sweep (the safety net)
- `rg "rounded-(xl|2xl|lg|\\[12px\\])" src/components/Dashboard/` → must return zero results inside pages restyled in 3.1–3.8.
- `rg "bg-gradient-to-r from-accent-gold"` → must return zero results.
- `rg "hsl|#[0-9a-fA-F]{3,8}" src/components/Dashboard/` → flag any hard-coded colors and convert to tokens.
- `rg "console\\.(log|warn)" src/components/Dashboard/` (excluding `ErrorLogger.*`) → flag and remove dev placeholders.
- Storybook-style smoke pass: load every route in all 6 themes × 2 modes at three viewports (360, 904, 1440 px).

### What I will NOT do in Phase 3

- Active-exam runtime (MCQ/TF/Fill/Open question screens, result screen) — that's **Phase 5**.
- Auth, Onboarding, Pricing, Checkout, ShareView — that's **Phase 4**.
- ChatAssistant, FloatingMiniPlayer global widgets — Phase 4 (out-of-shell).
- Any Supabase schema or edge-function change.
- Any new route, new context, or new provider.

### Technical details

**Files modified per sub-phase** — listed above; each sub-phase is roughly one commit.

**Files created**
- `src/components/Dashboard/_phase3-notes.md` — kept temporarily by sub-phase 3.0 and deleted at the end of 3.9. Tracks any per-page surprises so the audit at 3.9 has a paper trail.

**Files deleted**
- `src/components/Dashboard/WorkshopHeader.tsx` (sub-phase 3.0).

**Cross-file safety checklist**
- Every page restyle is **JSX + Tailwind only** unless a missing handler needs a `todo()` import.
- No prop signatures of `Dashboard.tsx`'s child pages change — the parent component keeps calling each page with the same props.
- All Supabase calls (`supabase.from(...)`, `supabase.functions.invoke(...)`) inside these pages stay byte-identical.
- `ThemeContext`, `AuthContext`, `I18nContext`, `CreditContext`, `SubscriptionContext` — read-only consumption; no provider changes.
- Routes in `App.tsx` — untouched.
- Locale files — only **additive** key insertions; nothing renamed or removed (would break old screens still in the same commit window).

**Best-practice notes**
- Prefer the `PageHeader` `period` prop over manually appending `.` to titles.
- All `SectionTabs` use real `<button role="tab">` semantics (Phase 2 set the precedent).
- Loading states use `ScholarSkeleton`, never raw `animate-pulse div` (the in-place skeletons I wrote for Phase 2's `RecentlyProcessedList` are intentional because the row grid is bespoke — they remain).
- `todo()` is the **only** way to stub a missing handler; QA can grep one symbol to find them all.
- No `alert()`, no `confirm()`, no raw `toast(...)` calls — use `useToast()` or `useConfirm()`.
- Strings with apostrophes (`We'll`, `l'IA`) stay in JSON, never inline JSX — already enforced for `workshop.*`.

**i18n key strategy**
- Each sub-phase adds its keys under a single namespace (`library.*`, `history.*`, `examinations.*`, `academics.*`, `eduplay.*`, `rooms.*`, `profile.*`, `goals.*`, `achievements.*`, `informational.*`, `content.*`).
- The Profile page already throws a `profile.loading` warning in the console — sub-phase 3.6 adds that missing key as part of the restyle.
- All four locales updated in the same commit per sub-phase; CI-like JSON validation runs at the end of each sub-phase.

### Timeline & checkpoints

- **3.0** is a 30-minute cleanup; merge before anything else.
- **3.1 → 3.8** each take one focused session; each is independently reviewable and revertable.
- **3.9** is the audit gate — Phase 3 is not done until it passes the four `rg` checks and the visual smoke pass.

Confirm and I'll start with sub-phase 3.0 (the Phase 2 cleanup).