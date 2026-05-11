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
- [ ] Phase 2 — Dashboard / Workshop full rebuild to v4.
- [ ] Phase 3 — page-by-page restyle (Library, History, Quiz, Academics, EduPlay, Rooms, Profile, Feedback, Notifications, Goals, Achievements, Informational, Content viewers).
- [ ] Phase 4 — Auth & out-of-shell pages.
- [ ] Phase 5 — Active exam runtime & modals.
- [ ] Phase 6 — Cleanup (drop legacy `designSystem.css` rules, remove old shell files).
