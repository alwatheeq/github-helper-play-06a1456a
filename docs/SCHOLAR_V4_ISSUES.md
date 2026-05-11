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
