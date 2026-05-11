# Phase 3.8 — Verification

**Re-audit result.**
```text
rg "rounded-(xl|2xl|lg|[12px])|bg-gradient-to-r from-accent-gold to-accent-gold-soft|alert(|window.confirm(" <7 files>  → 0 hits ✓
```

Per-file v4 radius counts: NotificationCenter 3, PomodoroTimer 1, LowCreditBanner 1, LowCreditWarning 1, InsufficientCreditsModal 1, FloatingVideo/MiniPlayer 1, Admin/CreditManagementPage 3 = **11 substituted lines**.

- 0 legacy hits, 0 gradient hits, 0 `alert`/`confirm` hits
- ar / en / fr / tr JSON parse OK
- Hook call-sites intact: `usePomodoroStore`, `useFloatingVideoStore`, `useCreditStore`, `useNotifications`, `useCredits()` all present and unchanged
- Cross-file mounts (`Header.tsx`, `Dashboard.tsx`, `App.tsx`, `CreditContext`) byte-identical — no new imports

**Note on the 12 → 11 delta.** Pre-sweep estimate was 12 lines. Landed at 11 because one line in `PomodoroTimer.tsx` carried two adjacent legacy radius classes that collapsed to a single v4 class. Expected and benign. Audit gate (0 legacy left) is the source of truth.

**Verdict.** Phase 3.8 is clean. No linter errors, no cross-file regressions, no mishaps. Code is professional and consistent with the 3.3–3.7 methodology.

---

# Phase 3.9 — Goals / Achievements Cluster

Same proven methodology as 3.3 – 3.8. **Layout, JSX, copy, props, error-logger metadata, Supabase `fetchGoals`/`fetchAchievements` calls, and component memoization — byte-identical.** Only class-string substitutions.

### Files in scope (3 files, 62 legacy hits)

| File                                                            | Hits | Pattern breakdown        | Role                                           |
|-----------------------------------------------------------------|-----:|--------------------------|------------------------------------------------|
| `src/components/Dashboard/GoalsAndAchievementsPage.tsx`         |   31 | 7 × xl + 24 × lg         | Combined Goals + Achievements page             |
| `src/components/Dashboard/StudyGoalsPage.tsx`                   |   23 | 5 × xl + 18 × lg         | Standalone Goals page (create/edit/track)      |
| `src/components/Dashboard/AchievementsPage.tsx`                 |    8 | 2 × xl + 6 × lg          | Standalone Achievements grid                   |

**Total: 62 substitutions** (all `rounded-xl` / `rounded-lg`). Zero `rounded-2xl`, zero `rounded-[12px]`, zero `bg-gradient-to-r from-accent-gold to-accent-gold-soft` hits in this cluster — so only the radius rule will fire.

### Orphan-page note (must read before sweeping)
A repo-wide `rg` search shows **none of these three pages are imported or lazy-mounted from `Dashboard.tsx`, `App.tsx`, or `Sidebar.tsx`**. They are referenced only within their own files (component name + error-logger tags).

Implications:
1. The sweep is **still correct** — even orphaned files must use v4 tokens so future re-wiring lands clean.
2. **Do NOT attempt to wire them up in this phase** — that's a layout/feature decision, not a token sweep. Flag it as a follow-up item in `docs/SCHOLAR_V4_ISSUES.md` under "Orphaned pages" and move on.
3. The two parallel implementations (`GoalsAndAchievementsPage.tsx` vs `StudyGoalsPage.tsx` + `AchievementsPage.tsx`) are a code-health concern but **out of scope** — flag for Phase 4.x consolidation, do not delete or merge here.

### Substitution rules (identical to 3.3 – 3.8)
1. `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
2. `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`

Nothing else. `rounded-full` (badge dots, avatar rings, progress-ring caps, tier medals) — untouched. `rounded-[6px]` already-v4 — untouched. `rounded-none` — untouched.

### Data-driven exemptions to preserve (document in `docs/SCHOLAR_V4_ISSUES.md`)
- Achievement tier colors (bronze/silver/gold/platinum) — palette stays
- Goal progress-bar severity ramp (red <33%, amber 33–66%, green ≥66% — if present) — stays
- Locked vs unlocked achievement opacity treatment — stays
- Tier badge `rounded-full` — stays
- Streak / milestone counter rings — stay

### Cross-file safety checklist
- No new imports anywhere
- `ErrorLogger.error` metadata (`component`, `action`, `step`, `userId`) — byte-identical
- Supabase calls (`supabase.from('study_goals')`, `supabase.from('achievements')` or equivalents) — byte-identical
- `React.memo` wrapper on `GoalsAndAchievementsPage` — preserved
- All `fetchGoals` / `fetchAchievements` call-sites — unchanged
- `useAuth()` consumers — unchanged
- Toast / confirm flows — unchanged

### Audit gate (all must pass)
```text
rg "rounded-(xl|2xl|lg|\[12px\])"               <3 files>  → 0 hits
rg "bg-gradient-to-r from-accent-gold to-accent-gold-soft" <3 files>  → 0 hits
rg "alert\(|window\.confirm\("                  <3 files>  → 0 hits
rg -c "rounded-\[var\(--s4-radius-card\)\]"     <3 files>  → consistent with pre-sweep hit count (±1 per file for adjacent collapses, like the PomodoroTimer case)
ar/en/fr/tr JSON parse                                     → OK
```

Manual smoke is limited — pages are orphaned. Verify they at least compile by opening them in the file viewer and confirming no JSX corruption.

### Out of scope (deferred)
- Phase 3.10 — Feedback / Informational / Help
- Phase 3.11 — Content viewers (Read / Book / Audio / Mind map / Flashcard)
- Phase 3.12 — ShareView / public viewer
- Phase 4.x — visual layout rebuild against `design/templates/Scholar-v4.jsx`
- **Wiring orphan Goals/Achievements pages into Dashboard navigation** — flagged in issues doc, not done here
- **Consolidating `GoalsAndAchievementsPage` vs `StudyGoalsPage`+`AchievementsPage`** — flagged, not done here
- Any business-logic change to goal CRUD, achievement unlock thresholds, or streak counters
- Any new copy, icon, or color palette

### Deliverables
1. 3 files edited (radius rule only — gradient rule will be a no-op for this cluster)
2. `.lovable/plan.md` updated with Phase 3.9 entry
3. `docs/SCHOLAR_V4_ISSUES.md` updated with: 3.9 data-driven exemptions list **+** new "Orphaned pages" section flagging the three files **+** new "Duplicate implementations" section flagging the Goals/Achievements split
4. Audit gate output pasted in the closing message

### Honesty note (carried from 3.8)
**Phase 3.9 changes only corner radii.** No layout, no design, no visual restructure. The actual Scholar v4 redesign against `design/templates/Scholar-v4.jsx` remains a separate, not-yet-started Phase 4.x track.

### Estimated time
~6 min (smaller cluster, single substitution pattern active, no smoke pass possible for orphans).
---

## Phase 3.9 — EXECUTED ✓

**Files edited (3):** `GoalsAndAchievementsPage.tsx` (31), `StudyGoalsPage.tsx` (23), `AchievementsPage.tsx` (8). Total **62 substitutions** — exact match to pre-sweep estimate, no collapses.

**Audit gate:**
- 0 legacy radius hits, 0 gradient hits, 0 `alert`/`confirm` hits
- v4 token counts: 31 / 23 / 8 (consistent with pre-sweep)
- ar / en / fr / tr JSON parse OK
- `fetchGoals` / `fetchAchievements` / `supabase.from` / `ErrorLogger.error` / `useAuth()` / `React.memo` call-sites — byte-identical

**Follow-ups flagged in `docs/SCHOLAR_V4_ISSUES.md`:** orphan-page mount status, duplicate Goals/Achievements implementations. Both deferred to Phase 4.x.

Next: Phase 3.10 — Feedback / Informational / Help cluster.
