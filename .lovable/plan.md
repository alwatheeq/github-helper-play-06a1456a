## 1. Phase 3.16 verification — RESULTS (clean)

- `npm run check:tokens` → `✓ 28 swept file(s) clean.`
- Cluster audit (pcre2) on `Dashboard.tsx`, `SummaryDisplay.tsx`, `FlashcardViewer.tsx`:
  - legacy radius / directional legacy / gold-gradient → **0 / 0 / 0** in all three
- Exemptions intact: 25× `rounded-full`, 6× `rounded-md` (matches plan).
- Cross-file: no hook signatures, contexts, Supabase queries, edge-function payloads, routes, locale keys, business logic, SRS algorithm, or flip-animation classes touched. Exactly 4 files changed.

Phase 3.16 is clean — no linter issues, no cross-file drift, no mishaps.

---

## 2. Phase 3.17 — BookMode / Highlighting / Tooltip cluster

### Why this scope

Three small floating-overlay components (one tooltip, one selection-toolbar, one floating-popover) share the same visual primitive: a dark `bg-gray-900` chip with `rounded-xl`. Sweeping them together is correct because:

1. They are all secondary, on-canvas overlays — same "chip / pill / tooltip" radius family.
2. Each file has exactly **one** legacy hit (3 total), making the diff trivial and unambiguous.
3. Their nearest siblings (`BookModeViewer.tsx`, `BookWidget.tsx`, `FlashcardsWidget.tsx`, `NotesWidget.tsx`, `WidgetContainer.tsx`, `HighlightLayer.tsx`) were independently verified to have **0 legacy hits** — so the cluster boundary is honest, not arbitrary.

### Files in scope and inventory (pcre2-confirmed)

| File | legacy radius | directional | gold gradient | `rounded-full` (exempt) | `rounded-md` (exempt) |
|---|---:|---:|---:|---:|---:|
| `src/components/Dashboard/BookMode/FreeFormToggle.tsx` | 1 (L48 `rounded-xl`) | 0 | 0 | 2 | 0 |
| `src/components/Dashboard/Highlighting/HighlightMenu.tsx` | 1 (L33 `rounded-xl`) | 0 | 0 | 1 | 0 |
| `src/components/Common/Tooltip.tsx` | 1 (L25 `rounded-xl`) | 0 | 0 | 0 | 0 |
| **Totals** | **3** | **0** | **0** | **3** | **0** |

### Exact substitutions

All three hits are the same shape: `rounded-xl` on a dark-chip overlay surface (`bg-gray-900 text-white …`). Canonical mapping:

```
rounded-xl  →  rounded-[var(--s4-radius-card)]
```

- `FreeFormToggle.tsx` L48 — hover-help popover anchored under the toggle button.
- `HighlightMenu.tsx` L33 — floating action toolbar over a text selection.
- `Tooltip.tsx` L25 — the reusable tooltip primitive used across the app.

These are the **complete** sweep — no other lines in the three files match any forbidden pattern.

### Exemptions to preserve verbatim

- `FreeFormToggle.tsx` 2× `rounded-full` — circular toggle pill geometry.
- `HighlightMenu.tsx` 1× `rounded-full` — circular icon-button affordance.
- The `bg-gray-900 text-white` dark-chip palette on all three overlays — **deliberate** dark-on-light tooltip aesthetic, not a theming bug, and not in scope for a radius/gradient phase. Migrating these to semantic tokens is a separate concern owned by the design-token phase, not this regression sweep.
- Shadow utilities (`shadow-lg`, `shadow-xl`) — preserved.

### Cross-file safety checks (must hold)

1. **`Tooltip.tsx` is a primitive used widely** — confirm the component **public API** (`title`/`children`/`position` props, default `position="top"`, the `positionClasses` map, the `group`-hover trigger pattern) is unchanged. Only the className string mutates.
2. **`HighlightMenu.tsx`** is consumed by `Highlighting/HighlightLayer.tsx` and the `useHighlights` hook — props (`onHighlight`, `onCopy`, `onDelete`, position coords) and event handlers untouched.
3. **`FreeFormToggle.tsx`** is consumed by `Dashboard.tsx` (already swept in 3.16) and `SummaryDisplay.tsx` (already swept in 3.16) via the `enabled` / `onToggle` / `compact` props — none of those props change.
4. **No hooks, contexts, Supabase reads, edge functions, routes, locale keys, or business logic** referenced by any of the three files.
5. **No animation classes** (`transition-all`, `opacity-0`, `invisible`, `group-hover:*`) are touched — the hover/visibility behaviour is identical post-edit.
6. **`ErrorLogger`** — not referenced.
7. **Sibling files in BookMode/ and Highlighting/** were pre-scanned and have **0 legacy hits** — no hidden adjacent work is being skipped.

### Regression-guard extension

Append to `SWEPT_FILES` in `scripts/check-token-regressions.cjs` under a new block:

```js
// Phase 3.17 (book-mode toggle / highlight menu / tooltip overlays)
'src/components/Dashboard/BookMode/FreeFormToggle.tsx',
'src/components/Dashboard/Highlighting/HighlightMenu.tsx',
'src/components/Common/Tooltip.tsx',
```

Order: largest functional surface first (FreeFormToggle), then the selection toolbar (HighlightMenu), then the shared primitive (Tooltip).

### Audit gate (must all pass before marking 3.17 done)

```text
1. rg --pcre2 "(?<![-\w])rounded-(xl|2xl|lg|\[12px\])(?![-\w])" <3 files>   → 0
2. rg "from-accent-gold to-accent-gold-soft" <3 files>                       → 0
3. rg "rounded-(t|b|l|r|tl|tr|bl|br)-(xl|2xl|lg)" <3 files>                  → 0
4. rg "rounded-full" <3 files>                                               → 3 (2 + 1 + 0)
5. rg "rounded-md" <3 files>                                                 → 0
6. npm run check:tokens                                                      → 31 swept file(s) clean
7. Visual smoke at /preview (904x583):
   - Hover the free-form toggle → dark help popover renders with new card radius
   - Select text in a summary → HighlightMenu toolbar renders with new radius
   - Hover any tooltip-bearing icon → tooltip renders with new radius
   - Toggle animation, selection-menu positioning, and tooltip placement unchanged
8. git diff --stat                                                           → exactly 4 files changed
   (FreeFormToggle.tsx, HighlightMenu.tsx, Tooltip.tsx, check-token-regressions.cjs)
```

### Deliverables

1. `src/components/Dashboard/BookMode/FreeFormToggle.tsx` — 1 radius substitution (L48).
2. `src/components/Dashboard/Highlighting/HighlightMenu.tsx` — 1 radius substitution (L33).
3. `src/components/Common/Tooltip.tsx` — 1 radius substitution (L25).
4. `scripts/check-token-regressions.cjs` — append 3 files under Phase 3.17 block.
5. `docs/SCHOLAR_V4_ISSUES.md` — Phase 3.17 section: file inventory (3 hits), exemption rationale (`rounded-full` circular toggles + dark-chip palette out of scope), cross-file checks, audit gate results.
6. `.lovable/plan.md` — Phase 3.17 RESULTS block.

### Best-practice notes

- Use `code--line_replace` for each of the 3 hits — never rewrite whole files. Each edit is a single class-string substitution on a single line.
- Do **not** consolidate the dark-chip styling into a shared `<Chip>` primitive in this phase — that is a design-system refactor with its own cross-file blast radius, not a regression sweep.
- Do **not** migrate `bg-gray-900` → semantic tokens in this phase. That belongs to a future "dark-chip tokenization" phase covering all overlay surfaces consistently.

### Estimated effort

~2 minutes: 3 line-replace edits, 1 allowlist edit, 2 doc appends, 1 guard run, 1 visual smoke.

---

## 3. Downstream phases (deferred — for continuity, not in scope of 3.17)

- **Phase 3.18 — Auth + top-level error/empty states**: `Auth/Auth.tsx` (7 radius + **2 gold gradients** at L104, L198, requires `bg-gradient-to-r` prefix removal), `AccountSuspended.tsx` (5), `NotFound.tsx` (3), `ErrorBoundary.tsx` (4), `EnvValidator.tsx` (3).
- **Phase 3.19 — Misc primitives**: `LanguageToggle.tsx` (2), `Scholar/ScholarSkeleton.tsx` (1).
- **Phase 3.20+ — Admin cluster**: `src/components/Admin/**`, multi-phase.
---

## Phase 3.17 — RESULTS (DONE)

- `npm run check:tokens` → ✓ 31 swept file(s) clean.
- 3 substitutions applied (FreeFormToggle L48, HighlightMenu L33, Tooltip L25), all `rounded-xl` → `rounded-[var(--s4-radius-card)]`.
- Audit gate: legacy=0, directional=0, gold=0, rounded-full=3 (exempt), rounded-md=0.
- Cross-file: Tooltip public API + consumer props of HighlightMenu/FreeFormToggle unchanged.
- Files changed: 4 (3 source + `scripts/check-token-regressions.cjs`).
- Next: Phase 3.18 (Auth + top-level error/empty states — includes 2 gold-gradient removals in Auth.tsx).
