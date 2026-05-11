## Phase 3.6 — Profile cluster

Same conservative token-sweep methodology proven in Phases 3.3 / 3.4 / 3.5. **Layout, JSX, copy, props, hooks, Supabase queries, RPC calls (`check_username_available`), and `username_changed_at` cooldown logic — byte-identical.** Only class-string substitutions.

### Files in scope

| File | Lines | Legacy hits | Role |
|------|-------|-------------|------|
| `src/components/Dashboard/ProfilePage.tsx` | 1632 | 28 | Profile hub: avatar, info form, preferences, theme, stats, achievements |
| `src/components/Dashboard/UsernameSetupModal.tsx` | 269 | 3 | Username picker w/ availability check + 10-day cooldown |

Indirectly touched (verify only — no edits): `Dashboard.tsx` lazy mount of `ProfilePage`, `useAuth`, `useSubscription`, `useToast`, `useI18n`, `useTheme`/`ThemeContext` (theme gradient consumers), Supabase tables `user_profiles` / `user_preferences` / `achievements` (read-only here), and the `check_username_available` RPC.

### Deliverables

1. **Scripted token sweep** (identical regex to 3.3 / 3.4 / 3.5):
   - `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold` (4 hits: lines 950, 1350, 1435 in ProfilePage; +brand button on line 1082 stays GREEN gradient — see exemptions)
   - `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
   - **No** other class-string changes. **No** JSX restructuring. **No** primitive swaps. **No** copy / a11y / handler edits.

2. **Inventory data-driven color exemptions** (preserve as-is, document in `docs/SCHOLAR_V4_ISSUES.md`):
   - Line 1082 — `from-green-500 to-emerald-600` "Save" CTA: semantic success color, intentional contrast against the gold primary above. Leave.
   - Lines 1321 / 1325 / 1580 — `bg-gradient-to-br ${bgGradient}` / `${uiGradient}` / `${getBadgeColor(tier)}`: data-driven theme + achievement-tier swatches. Leave.
   - Lines 1492 / 1506 / 1520 / 1534 / 1548 — stat-card accent backgrounds (`bg-orange-100`, `bg-green-100`, `bg-subtle`, `bg-purple-100`, `bg-indigo-100`): semantic per-stat color coding. Leave.
   - Lines 1449 / 1460 / 1469 — paginator buttons (`bg-gray-700` / `bg-gray-300` / `bg-gray-100`): legacy neutrals, **leave** (not in approved sweep regex; would risk visual drift).

3. **Cross-file safety checks** (must hold true post-edit):
   - `Dashboard.tsx` import + lazy mount of `ProfilePage` unchanged
   - `UsernameSetupModal` props `{ isOpen, onClose, onComplete }` + `onComplete(username)` signature unchanged
   - `check_username_available` RPC call + `COOLDOWN_DAYS = 10` + `username_changed_at` update logic unchanged
   - `useAuth` / `useSubscription` / `useToast` / `useI18n` call sites identical
   - `ScholarCard` / `ScholarButton` imports + variants in `UsernameSetupModal` unchanged
   - No new imports

4. **Audit gate at end of 3.6:**
   - `rg "rounded-(xl|2xl|lg|\[12px\])"` on the 2 files → **0 hits**
   - `rg "bg-gradient-to-r from-accent-gold"` on the 2 files → **0 hits**
   - `rg "alert\(|window\.confirm\("` → **0 hits** (already 0)
   - Locale JSON parse (en/ar/fr/tr) → exit 0
   - Manual smoke (preview): Profile tab → avatar + info form + theme picker + stats + achievements render; open username modal → availability check debounces, cooldown banner shows when applicable, save succeeds.

### Cross-file step deliberately carried forward from 3.5

Re-verify `useFloatingVideoStore` is untouched (Profile doesn't consume it, but the audit boundary must remain stable across cluster transitions). Confirm `Dashboard.tsx` is byte-identical from Phase 3.5 → 3.6.

### Out of scope (deferred)

- Billing / Subscription (3.7), Notifications / Pomodoro (3.8), Goals / Achievements pages (3.9 — note: `AchievementsPage.tsx` is separate from the stat card on `ProfilePage`), Feedback (3.10), Content viewers (3.11), Share (3.12)
- Issue #13 cooldown timer backend wiring — already live in this modal via `username_changed_at`; ledger row can be flipped to 🟢 in Phase 5 review
- Any layout / spacing / color-palette change — **explicitly forbidden by user**

### Best-practice notes

- Single scripted commit (proven safe in 3.3 / 3.4 / 3.5)
- No `<ScholarCard>` swaps for ProfilePage's 1632-line dense grid — pixel-drift risk too high for a token-only phase
- Update `.lovable/plan.md` "Phase 3.6 — applied" with hit counts per file
- Update `docs/SCHOLAR_V4_ISSUES.md` exemptions section with the 4 categories above

### Timeline

- Scripted sweep: ~3 min
- Audit + smoke: ~7 min
- Total: ~10 min

Confirm and I'll run the sweep.