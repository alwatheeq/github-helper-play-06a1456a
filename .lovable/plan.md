## Consolidated plan: Phases 4.5 → 4.9 (single implementation pass)

One commit-per-phase, executed back-to-back in the same loop. Every phase ends green: `tsc --noEmit` + `vitest run` (73/73) + `npm run check:tokens` must pass before the next begins. If any gate fails, that phase is rolled back via its generator script and the loop halts for inspection — later phases do not start on a red tree.

---

### Phase 4.5 — Component shells (Button)

**Scope (surgical, 2 files)**
1. `src/components/Scholar/ScholarButton.tsx` — convert `React.FC` to `React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ScholarButtonProps>`. Body unchanged; ref threaded to whichever of `<button>` / `<a>` renders. Add `displayName`.
2. `src/components/Dashboard/FlashcardViewer.tsx` — replace the bespoke "Flip card" `<button>` with `<ScholarButton variant="primary" size="md">`, preserving `onClick` + ARIA.

**Cross-file safety**
- All 81 external `ScholarButton` consumers keep the same prop surface — no API break. Verified by `tsc --noEmit`.
- Radix `asChild` + Tooltip wrappers now receive a real ref (silent fix for dev warnings).

**Gate**: tsc + vitest + check:tokens green. Visual smoke on Dashboard CTA, Pricing CTA, Auth submit (loading), FlashcardViewer flip.

---

### Phase 4.6 — Iconography (ScholarIcon wrapper + 3 sub-batches)

**Primitive** — `src/components/Scholar/ScholarIcon.tsx`:
```tsx
strokeWidth={strokeWidth ?? (size <= 16 ? 1.7 : 1.6)}
aria-hidden={rest['aria-label'] ? undefined : true}
```
Forwards ref, spreads `...rest` (preserves `className`, `animate-spin`, etc.).

**Sweep script** — `scripts/phase-4-6-icon-sweep.cjs`. Per file:
- Lex `lucide-react` named-import list.
- Rewrite `<Foo … />` → `<ScholarIcon icon={Foo} … />` only when `Foo` is in that list AND no existing `strokeWidth=` on the element.
- Keep lucide imports (passed as values to `icon=`); inject `ScholarIcon` import if missing.

**Three batches, each a separate gate**
- 4.6a — Dashboard core (~38 files, ~210 usages): Dashboard, Header, Sidebar, SummaryDisplay, LibraryPage, QuizPage, FlashcardViewer, BookMode cluster.
- 4.6b — Feature clusters (~32 files, ~180 usages): BrainRush, Multiplayer, StudyRooms, Social, Highlighting, MindMap, FloatingVideo, Notifications.
- 4.6c — Surfaces & misc (~25 files, ~133 usages): Auth, Pricing, Subscription, Onboarding, ChatAssistant, Common modals, NotFound/ErrorBoundary/EnvValidator.

**Cross-file safety**
- Animated icons (`Loader2`, `RefreshCw` with `animate-spin`) — `className` passed through `{...rest}`.
- Icons inside `<button>` / Radix triggers — wrapper is a single forwardRef, no slot interference.
- Icons with explicit `strokeWidth=` (intentional overrides, e.g. logo glyphs) — skipped by the script's guard.
- Admin subtree excluded (`-g '!src/components/Admin/**'`).

**Regression rule** appended to `scripts/check-token-regressions.cjs` after 4.6c (`raw-lucide-jsx`): flags any `<LucideName … />` whose symbol is also in the same file's `lucide-react` import list — narrow heuristic, no false positives on the Scholar primitive itself.

**Gate per sub-batch**: tsc + vitest + check:tokens green. Visual diff on one icon-dense screen per batch.

---

### Phase 4.7 — Motion tokens + focus-visible

**Tokens** added to `src/styles/scholarV4.css`:
```css
:root {
  --s4-ease:     cubic-bezier(0.4, 0, 0.2, 1);
  --s4-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --s4-dur-fast: 120ms; --s4-dur-base: 200ms; --s4-dur-slow: 320ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --s4-dur-fast: 0ms; --s4-dur-base: 0ms; --s4-dur-slow: 0ms; }
  *, *::before, *::after { animation-duration: 0.001ms !important; }
}
```

**Sweep** — `scripts/phase-4-7-motion-sweep.cjs`:
```
transition-all                → transition-[background-color,border-color,color,opacity,transform]
duration-(100|150)            → duration-[var(--s4-dur-fast)]
duration-(200|250|300)        → duration-[var(--s4-dur-base)]
duration-(400|500|700)        → duration-[var(--s4-dur-slow)]
ease-(in|in-out|linear)       → ease-[var(--s4-ease)]
ease-out                      → ease-[var(--s4-ease-out)]
focus:ring-*                  → focus-visible:ring-*
focus:ring-offset-*           → focus-visible:ring-offset-*
```
- Collision guard: skip line if it already has `focus-visible:` for the same utility.
- `transition-all` neighbours of `filter:` / `backdrop-` / `grid-` are **logged, not rewritten** — manual review before sweep replaces them.
- Custom `animate-*` classes preserved verbatim (intentional motion).

**Cross-file safety**
- `focus:ring` on form inputs: `focus-visible` matches keyboard tab AND programmatic focus — mouse-click focus suppression is intentional (WCAG-aligned).
- Reduced-motion override keeps `animationend` listeners working (animations still complete, just instantly).

**Gate**: tsc + vitest + check:tokens green. Manual a11y check (tab through Dashboard/Auth/Pricing/Header) + DevTools `prefers-reduced-motion: reduce` toggle.

---

### Phase 4.8 — Dark-mode parity audit

**Programmatic checks (run unconditionally)**
1. `rg -P "(?<![-\w])text-(red|green|blue|amber|yellow|orange|purple|pink|indigo|cyan|teal|emerald|rose|sky|fuchsia|violet|lime)-\d+(?![-\w])"` filtered to lines with no sibling `dark:text-` → orphan list (~30 expected real orphans out of 874 lines).
2. `rg "style=\{\{[^}]*(?:color|background)" src/components` → manual review of inline colour writes.
3. WCAG contrast verification (`wcag-contrast` against resolved CSS variables) on top 12 surfaces — AA on body, AAA on display.

**Visual matrix** — 15 routes × 6 palettes × 2 modes = 180 screens via `scripts/phase-4-8-dark-audit.cjs`. Uses Playwright if installed, else logs manual-capture instructions; does not add a new dep.

**Targeted fixes** (estimated 0–10 files): add `dark:` siblings to genuine orphans only — no sweep.

**Deliverable**: `docs/SCHOLAR_V4_PARITY_AUDIT.md` — Phase 4.8 section with screenshot table + contrast report.

**Gate**: 12 contrast tests pass; visual matrix has zero red flags; tsc + vitest + check:tokens green.

---

### Phase 4.9 — Page composition pass

Manual page-level polish (no primitive or token changes). One commit per page; before/after notes appended to `docs/SCHOLAR_V4_PARITY_AUDIT.md`.

| # | Page | Focus |
|---|---|---|
| 1 | Dashboard home | Right-rail width vs `--s4-rail-width`, section gap vs `--s4-shell-gap` |
| 2 | LibraryPage | Card grid gutter, empty-state vertical centring |
| 3 | Pricing | 3-column rhythm vs `design/Scholar v4.html`, mobile CTA stack |
| 4 | Auth | `max-w-md` single-column, vertical centring |
| 5 | Subscription / SubscriptionManagement | Billing table line-height + `s4-numeric` alignment |
| 6 | Onboarding wizard | Step indicator spacing |

Anything that needs a new primitive bounces to a follow-up phase (does not happen inside 4.9).

**Gate**: all 6 page diffs reviewed; tsc + vitest + check:tokens green.

---

## Cross-cutting precautions (carried through all 5 phases)

1. **No Supabase / DB schema changes** — presentation only.
2. **`text-white` / `bg-(white|black)/N` / `border-white` overlays preserved verbatim** — locked classifier in audit doc.
3. **Admin subtree out of scope** — every sweep glob carries `-g '!src/components/Admin/**'`.
4. **SDK constraints untouched** — `.then(null)` and `nullsFirst: false` patterns left as-is.
5. **Relaxed TS config respected** — no new strictness flags.
6. **Per-phase gate**: tsc + vitest (73/73) + check:tokens green before advancing.
7. **Roll-back unit = one phase = one commit**, generator scripts kept in `scripts/phase-*.cjs` for clean revert/regen.
8. **Halt-on-red**: any failed gate stops the loop; later phases do not start on a red tree.

---

## Numbers at a glance

```text
Phase  Title                       Hits      Files   Risk      Gates
4.5    Component shells            2 edits   2       Low       1
4.6    Iconography (3 sub-batches) ~523      95      Medium    3
4.7    Motion + focus-visible      277       46      Medium    1
4.8    Dark-mode parity            ~30 fix   0–10    Low–Med   1
4.9    Page composition            6 pages   6       Medium    6
       --------------------------------------------------------
       TOTAL                       ~838      ~159    —         12 gates
```

Approve to execute Phases 4.5 → 4.9 sequentially in one loop, halting on the first red gate.