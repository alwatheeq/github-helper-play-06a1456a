## Phase 3.3 — Verification

Re-run audit gate on the 6 in-scope files (`AcademicsPage`, `CourseAnalytics`, `CourseTutor`, `ExamScheduler`, `SRSReviewPanel`, `TopicsTagsModal`):

- `rg "rounded-(xl|2xl|lg|\[12px\])"` → **0 hits**
- `rg "bg-gradient-to-r from-accent-gold"` → **0 hits**
- `rg "alert\(|window\.confirm\("` → **0 hits**
- Locale JSON parse (en/ar/fr/tr) → **OK**
- `Dashboard.tsx` lazy-load of `AcademicsPage` (line 1487) intact, props unchanged.
- All sub-component prop signatures, Supabase calls, hook usages identical to pre-sweep.

Result: Phase 3.3 is clean. Conservative token sweep preserved layout exactly per user instruction; no linter, runtime, or cross-file regressions.

---

## Phase 3.4 — EduPlay & Brain Rush / Multiplayer cluster

Goal: identical conservative token sweep on the gaming hub. **Layout, JSX structure, copy, gameplay logic, scoring, timers, realtime channels — all byte-identical.** Only class-string substitutions for legacy radius and the gold gradient.

### Files in scope (9 files, ~4,543 lines)

| File | Lines | Hits | Role |
|------|-------|------|------|
| `EduPlayPage.tsx` | 1103 | 27 | Gaming hub: mode picker, library picker, recent games |
| `BrainRushGamePlay.tsx` | 687 | 12 | Single-player Brain Rush runtime |
| `BrainRushMultiplayerWrapper.tsx` | 74 | 0 | Mode router wrapper |
| `BrainRushQuestionResults.tsx` | 279 | 11 | Per-question result card |
| `BrainRushResults.tsx` | 375 | 17 | Final results screen |
| `MultiplayerMenu.tsx` | 412 | 15 | Lobby entry / mode picker |
| `MultiplayerLobby.tsx` | 455 | 12 | Room lobby |
| `MultiplayerGamePlay.tsx` | 624 | 7 | Multiplayer runtime |
| `MultiplayerResults.tsx` | 264 | 8 | Final scoreboard |
| `GameJoinPage.tsx` | 270 | 13 | Public join-by-code page (route-level) |

Touched indirectly (verify only): `Dashboard.tsx` line 1482 (`EduPlayPage` mount), `App.tsx` line 274 (`GameJoinPage` route), `useFloatingVideoStore`, `useMultiplayerSession` if present. **No prop / callback / store changes.**

### Deliverables

1. **Scripted token sweep** (same algorithm used for Academics):
   - `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`
   - `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
   - No other class-string changes. No JSX restructuring. No primitive swaps.

2. **Inventory of remaining legacy color literals** (`bg-blue-*`, `bg-red-*`, `bg-green-*`, `bg-purple-*`, `bg-indigo-*`, `bg-pink-*`, `text-orange-*`) inside the 9 files. These typically live in:
   - Brain Rush answer-feedback colors (correct = green, wrong = red) — **leave as-is**, they are semantic gameplay signals, not chrome. Recoloring would change the design.
   - Multiplayer player-color avatars / leaderboard accents — **leave as-is**, data-driven user colors.
   - Mode-card accent stripes on `EduPlayPage` and `MultiplayerMenu` — **leave as-is**, brand-distinct per game mode (per user instruction "do not change design").
   - Document these in `docs/SCHOLAR_V4_ISSUES.md` under a new "data-driven color exemptions" section so they are not flagged in future audits.

3. **Cross-file safety checks** (must hold true after edits):
   - `Dashboard.tsx` import + mount of `EduPlayPage` (line 18, 1482) unchanged.
   - `App.tsx` import + route mount of `GameJoinPage` (line 35, 274) unchanged.
   - Realtime channels (`brain_rush_*`, `multiplayer_*` Supabase channels) untouched.
   - `useFloatingVideoStore`, `useChatStore`, `useCreditStore` call sites identical.
   - All `BrainRush*` callback prop signatures (`onAnswer`, `onComplete`, `onExit`) identical.
   - `MultiplayerLobby` → `MultiplayerGamePlay` → `MultiplayerResults` state handoff byte-identical.
   - No new imports beyond what each file already has.

4. **Audit gate at end of 3.4:**
   - `rg "rounded-(xl|2xl|lg|\[12px\])" <9 files>` → **0 hits**
   - `rg "bg-gradient-to-r from-accent-gold" <9 files>` → **0 hits**
   - `rg "alert\(|window\.confirm\("` (excluding `errorLogger`) → **0 hits** (already 0)
   - Locale JSON parse → exit 0
   - Manual smoke (preview): open EduPlay tab, verify mode picker renders, open MultiplayerMenu, verify lobby renders, open Brain Rush solo runtime, verify question card and answer feedback intact.

### Out of scope (later phases)

- Brain Rush / Multiplayer runtime logic, scoring, matchmaking → owned by Phase 5.
- Notifications / Pomodoro push wiring (issue #9) → Phase 3.5+.
- "Find a Match" matchmaking stub (issue #7) → Phase 5.
- Profile, Billing, Subscription, Feedback, Goals, Achievements, Informational, Content viewers, ShareView → later 3.x sub-phases.
- Any layout / spacing / column / grid / copy change — **explicitly forbidden by user**.

### Best-practice notes

- Single scripted commit (proven safe in 3.3): a Python regex pass identical to the 3.3 sweep, applied atomically across all 9 files.
- Do not introduce `<ScholarCard>` / `<ScholarButton>` wrapper swaps in this sub-phase — even semantically equivalent swaps risk pixel-level layout drift on the dense gameplay cards. Token sweep only.
- Audit gate must pass before marking phase complete.
- Update `.lovable/plan.md` "Phase 3.4 — applied" section with hit counts per file.

### Timeline

- Scripted sweep: ~5 min
- Audit gate + smoke check: ~10 min
- Total: ~15 min

Confirm and I'll run the sweep.