## Finishing Phases 4.7 → 4.8 → 4.9 (single execution loop)

Three sub-phases, three gates. Each phase ends green: `tsc --noEmit` + `vitest run` (73/73) + `npm run check:tokens` must pass before the next begins. Halt-on-red.

Live counts (just measured):

| Phase | Title | Hits | Files | Risk |
|---|---|---:|---:|---|
| 4.7b | Motion-token sweep (transition/duration/ease) | 206 | ~46 | Low |
| 4.8b | Conservative bg/border dark-orphan fix | ~150 of 256 | ~50 | Low–Med |
| 4.9b | Page-rhythm polish (5 pages, mechanical only) | ~5 edits | 5 | Low–Med |

---

### Phase 4.7b — Motion-token sweep

**Sweep** — `scripts/phase-4-7b-motion-sweep.cjs`:
```
transition-all                → transition-[background-color,border-color,color,opacity,transform,box-shadow]
duration-(75|100|150)         → duration-[var(--s4-dur-fast)]
duration-(200|250|300)        → duration-[var(--s4-dur-base)]
duration-(400|500|700|1000)   → duration-[var(--s4-dur-slow)]
ease-out                      → ease-[var(--s4-ease-out)]
ease-(in|in-out|linear)       → ease-[var(--s4-ease)]
```

**Cross-file safety**
- Skip lines containing `filter`, `backdrop-`, `grid-template`, `width`, `height`, or `max-w` next to `transition-all` (logged for manual review; previous run reported 0 such cases).
- `animate-spin/pulse/scale/fade/shake/bounce` classes preserved verbatim — only the timing primitives change.
- Token boundaries use `(?<![-\w])` + `(?![-\w])` — same lexer guard used in every prior sweep.

**Gate**: tsc + vitest + check:tokens green.

---

### Phase 4.8b — Conservative bg/border dark-orphan fix

**Mapping (unambiguous subset only)**
```
bg-{color}-50     → add dark:bg-{color}-950/40
bg-{color}-100    → add dark:bg-{color}-900/30
border-{color}-200 → add dark:border-{color}-800
border-{color}-300 → add dark:border-{color}-700
border-{color}-600 → add dark:border-{color}-400
border-{color}-700 → add dark:border-{color}-400
border-{color}-800 → add dark:border-{color}-300
```

**Explicitly skipped (preserved verbatim)**
- `bg-{color}-{500|600|700}` — saturated CTA/badge surfaces; color reads fine on both modes by design. Adding a dark sibling would over-mute and break visual hierarchy.
- `bg-{color}-{800|900}` — already-dark surfaces; on dark mode they remain readable, on light mode they're intentional dark accents.
- Any line that already contains `dark:bg-` or `dark:border-` (collision guard).
- Admin subtree (`-g '!src/components/Admin/**'`).

**Script** — `scripts/phase-4-8b-dark-fix.cjs`. Same className-aware regex used in 4.8a, extended with the bg/border map.

**Expected**: ~150 dark siblings added across ~30 files (256 raw orphans − ~106 intentionally-saturated buttons that stay raw).

**Gate**: tsc + vitest + check:tokens green. Visual smoke on Dashboard SummaryDisplay, GoalsAndAchievements, MultiplayerLobby (top 3 affected).

---

### Phase 4.9b — Page-rhythm polish (mechanical only)

**Scope (5 pages, no design-judgment work)**
1. **Dashboard home** — verify `--s4-rail-width` and `--s4-shell-gap` are wired through; replace any `gap-N` / `w-[Npx]` literals with the tokens where the value matches.
2. **LibraryPage** — empty-state container: ensure `min-h-[60vh] flex items-center justify-center`. Card grid gap: `gap-6` → `gap-[var(--s4-shell-gap)]` if mismatched.
3. **Pricing** — three-column grid: confirm `lg:grid-cols-3` + `gap-6`; mobile CTA: ensure `<ScholarButton fullWidth>` on `<lg`.
4. **Subscription / SubscriptionManagement** — billing-table `<td>` numeric cells: add `s4-numeric` class for tabular-nums alignment.
5. **Onboarding wizard** — step indicator: standardize gap to `gap-2` (current values vary 1.5/2/3).

**Cross-file safety**
- All edits are **token replacements or class additions** — no structural HTML changes, no behavior changes, no new components.
- Each page edited in its own commit logical unit so any one can be reverted independently.
- Anything that on inspection requires visual judgment (typography hierarchy, hero proportions, custom animations) is **logged in the audit doc, not edited** — mirrors the 4.9a discipline.

**Gate**: tsc + vitest + check:tokens green per page.

---

## Cross-cutting precautions (same as prior phases)

1. **No Supabase / DB schema changes** — presentation-only.
2. **`text-white` / `bg-(white|black)/N` / `border-white` overlays preserved verbatim** — locked in audit doc.
3. **Admin subtree out of scope** — every sweep glob carries `-g '!src/components/Admin/**'`.
4. **Theme palette config (ThemeContext)** — raw `text-stone-*`/`bg-zinc-*` strings are the *definition* of the palette system; never sweep.
5. **Status-chip helpers (subscriptionHelpers)** — already have inline `dark:` siblings; never touch.
6. **Per-phase gate**: tsc + vitest + check:tokens green before advancing.
7. **Roll-back unit = one phase = one commit**, generator scripts kept in `scripts/phase-4-{7b,8b,9b}-*.cjs`.
8. **Halt-on-red**: any failed gate stops the loop.

---

## Numbers at a glance

```text
Phase  Title                          Hits   Files   Risk      Gates
4.7b   Motion-token sweep             206    ~46     Low        1
4.8b   bg/border dark-orphan fix      ~150   ~30     Low–Med    1
4.9b   Page rhythm (5 pages)          ~5     5       Low–Med    1
       ----------------------------------------------------------
       TOTAL                          ~361   ~80     —          3 gates
```

After this loop, expected v4 parity: **≥98%**. Remaining gap is genuine design-judgment work (hero proportions, custom animation curves) that requires a designer's eye and screenshot diffs against `design/Scholar v4.html` — out of scope for mechanical sweeps.

Approve to execute 4.7b → 4.8b → 4.9b sequentially, halting on the first red gate.