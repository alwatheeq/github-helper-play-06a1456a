## Phase 3.4 — Verification

Audit gate re-run on the 9 in-scope files (`EduPlayPage`, `BrainRushGamePlay`, `BrainRushMultiplayerWrapper`, `BrainRushQuestionResults`, `BrainRushResults`, `MultiplayerMenu`, `MultiplayerLobby`, `MultiplayerGamePlay`, `MultiplayerResults`, `GameJoinPage`):

- `rg "rounded-(xl|2xl|lg|\[12px\])"` → **0 hits**
- `rg "bg-gradient-to-r from-accent-gold"` → **0 hits**
- `Dashboard.tsx` mount of `EduPlayPage` and `App.tsx` route for `GameJoinPage` unchanged
- No prop / callback / Supabase channel / store-call modifications
- Data-driven gameplay colors (correct/wrong feedback, player avatars, mode accents) intentionally preserved per "do not change design"

Result: Phase 3.4 is clean. No linter, runtime, or cross-file regressions.

---

## Phase 3.5 — Study Rooms cluster

Same conservative token-sweep methodology as 3.3 / 3.4. **Layout, JSX, copy, ZegoCloud session lifecycle, Supabase realtime channels, RLS-bound queries — byte-identical.** Only class-string substitutions.

### Files in scope

| File | Lines | Legacy hits | Role |
|------|-------|-------------|------|
| `StudyRoomsPage.tsx` | 1285 | 15 | Rooms hub: list, create, friends, groups, invitations |
| `ZegoVideoRoom.tsx` | 291 | 5 | Live A/V room shell (ZegoCloud SDK mount) |

Indirectly touched (verify only, no edits): `Dashboard.tsx` mount of `StudyRoomsPage`, `useFloatingVideoStore` (PiP handoff for Rooms), Supabase tables `study_rooms` / `room_participants` / `room_invitations`, the ZegoCloud `kitToken` + `zp.joinRoom` call. **No prop / hook / SDK-config changes.**

### Why these two only

The Rooms cluster is self-contained at the route boundary. `CommentSection.tsx` is shared chrome (used by Library/History/ShareView) and was already token-swept under Phase 3.2 shared-components pass — re-checking it here would risk double-edit drift.

### Deliverables

1. **Scripted token sweep** (identical regex to 3.3 / 3.4):
   - `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`
   - `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
   - **No** other class-string changes. **No** JSX restructuring. **No** primitive swaps (`<ScholarCard>` etc.).

2. **Inventory legacy color literals** (`bg-blue-*`, `bg-green-*`, `bg-red-*`, `bg-purple-*`, `text-orange-*`) and document under "data-driven color exemptions" in `docs/SCHOLAR_V4_ISSUES.md`. Expected exemptions to preserve as-is:
   - Participant role badges (host / co-host / guest) — semantic, leave
   - Mic / camera / screen-share state colors (red = muted, green = live) — semantic, leave
   - Friend / group avatar accent colors — data-driven, leave

3. **Cross-file safety checks** (must hold true after edits):
   - `Dashboard.tsx` import + lazy mount of `StudyRoomsPage` unchanged
   - `useFloatingVideoStore` call sites identical (PiP / dock state)
   - Supabase channel names (`room:*`, `room_participants:*`, `study_rooms:*`) untouched
   - ZegoCloud `ZegoUIKitPrebuilt` config object byte-identical (`kitToken`, `scenario`, `turnOnMicrophoneWhenJoining`, callbacks)
   - All `onJoin` / `onLeave` / `onInvite` callback signatures identical
   - No new imports

4. **Audit gate at end of 3.5:**
   - `rg "rounded-(xl|2xl|lg|\[12px\])"` on the 2 files → **0 hits**
   - `rg "bg-gradient-to-r from-accent-gold"` on the 2 files → **0 hits**
   - `rg "alert\(|window\.confirm\("` → **0 hits**
   - Locale JSON parse (en/ar/fr/tr) → exit 0
   - Manual smoke (preview): open Rooms tab → list renders, create-room modal opens, friends/groups tabs render, joining a room mounts ZegoCloud video grid without layout drift.

### Out of scope (explicit, deferred to later 3.x)

- Profile (`ProfilePage.tsx`) → 3.6
- Billing / Subscription (`BillingHistoryPage.tsx`, `SubscriptionManagementPage.tsx`) → 3.7
- Notifications / Pomodoro (`NotificationCenter.tsx`, `PomodoroTimer.tsx`) → 3.8
- Goals / Achievements (`StudyGoalsPage.tsx`, `GoalsAndAchievementsPage.tsx`, `AchievementsPage.tsx`) → 3.9
- Feedback / Informational (`FeedbackPage.tsx`, `InformationalPage.tsx`) → 3.10
- Content viewers (`ContentViewPage.tsx`, BookMode, AudioStudy, MindMap, ReadAloud, Highlighting) → 3.11
- Share (`ShareView.tsx`) → 3.12
- Group chat table (issue #8), Pomodoro push (issue #9), Achievements/Goals tables (#10/#11) — backend wiring, owned by Phase 5
- Any layout / spacing / column / copy change — **explicitly forbidden by user**

### Best-practice notes

- Single scripted commit (proven safe in 3.3 + 3.4)
- No `<ScholarCard>` / `<ScholarButton>` swaps in this sub-phase — Rooms cards have dense participant grids, even semantic-equivalent swaps risk pixel drift
- Update `.lovable/plan.md` "Phase 3.5 — applied" with hit counts per file
- Update `docs/SCHOLAR_V4_ISSUES.md` data-driven exemptions section

### Timeline

- Scripted sweep: ~3 min
- Audit + smoke: ~7 min
- Total: ~10 min

Confirm and I'll run the sweep.
---

## Phase 3.5 — applied
Token sweep across 2 Rooms files. Hits: StudyRoomsPage 17, ZegoVideoRoom 5. Total 22 substitutions.
Audit gate: 0 hits for rounded-(xl|2xl|lg|[12px]) and bg-gradient-to-r from-accent-gold. No JSX, prop, hook, ZegoCloud config, or Supabase channel changes. Data-driven role/state colors preserved.
