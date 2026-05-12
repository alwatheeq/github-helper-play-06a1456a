## Six-phase roadmap: 4.4c → 4.9

Live re-audit performed against the post-4.4b tree (2026-05-12). Counts below are exact `rg --pcre2` hits outside `src/components/Admin/**`. Each phase ends green: `tsc --noEmit` + `vitest` (73/73) + `check:tokens` allowlist must pass before the next phase begins.

| Phase | Title | Files | Hits | Risk | Mode |
|---|---|---:|---:|---|---|
| 4.4c | Borders / rings + close 4.4 | ~22 | 114 | Low | Mechanical sweep + regression rule + allowlist |
| 4.5  | Component shells (Button) | 1 + 1 | 1 ref upgrade + 1 bespoke `<button>` | Low | Surgical |
| 4.6  | Iconography (ScholarIcon) | 95 | ~523 icon usages | Medium | Primitive + 3 batched sweeps |
| 4.7  | Motion tokens + focus-visible | 46 | 40 + 145 + 17 + 75 | Medium | Token prep + sweep |
| 4.8  | Dark-mode parity | 0–10 | 874 state-colour lines audited | Low–Med | Verification-driven |
| 4.9  | Page composition pass | TBD | TBD | Med | Manual page-level polish |

Phase 4.9 was previously deferred. Including it here closes the Scholar v4 sweep cleanly.

---

## Phase 4.4c — Borders, rings + close 4.4

### Live counts (post-4.4b)
- `border-gray-N`: **104 hits** — distribution: `gray-100` 53, `gray-300` 34, `dark:gray-600` 32, `dark:gray-700` 17, `gray-200` 14, `dark:gray-200` 2, `gray-700` 2, `gray-600` 1.
- `border-white`: **9 hits** — every occurrence is on an `animate-spin` loader inside a coloured-surface button (gold/red/sidebar). Classifier outcome: **preserve all 9** verbatim.
- `border-black`: 0. `border-slate-N`: 0. `divide-*`: 0. `placeholder-gray-*`: 0. `outline-gray-*`: 0.
- `ring-gray-500`: **1 hit** (`Common/PromptModal.tsx:123`) inside a focus-ring chain that also contains a now-orphaned `dark:bg-card-dark dark:border-gray-600 dark:text-ink-on-dark` — both get cleaned in this commit.

### Sweep mapping (locked)
```
border-gray-(100|200|300|400)  → border-divider             [+ companion dark:border-divider-on-dark]
border-gray-(600|700|800|900)  → border-divider-on-dark
dark:border-gray-(any)         → dark:border-divider-on-dark
ring-gray-500                  → ring-divider
border-white                   → preserve (classifier — all 9 are spinner borders on coloured surfaces)
```
- Companion `dark:border-divider-on-dark` is injected only when the line has **no** pre-existing `dark:border-*` token (same collision guard as 4.4a / 4.4b).
- Sweep script: `scripts/phase-4-4c-sweep.cjs` — mirrors the 4.4b runner (rg-discovered file list, token-level regex with `(?<![-\w])` boundaries, per-line companion injection).

### Cross-file safety (4.4c-specific)
- **`Common/PromptModal.tsx`** — focus-ring chain rewrite must keep keyboard-accessible contrast; verified by visual diff against `ConfirmationModal` (already swept).
- **`Common/Card.tsx`, `Common/LoadingButton.tsx`** — read-only check that hairline still renders (cards already use `--s4-shadow-hairline`).
- **`border-white` classifier** — recorded in `docs/SCHOLAR_V4_PARITY_AUDIT.md` so reviewers can see why each was preserved. Same classifier shape as the 4.4a `text-white` table.

### Phase 4.4 close-out (lands in same commit)
1. **Regression rule** appended to `scripts/check-token-regressions.cjs`:
   ```js
   { id: 'raw-neutral',
     re: /(?<![-\w])(?:text|bg|border|ring|divide|placeholder)-(?:gray|slate|zinc|neutral|stone)-\d+(?![-\w])/g,
     hint: 'Use semantic ink/surface/divider tokens (ink, secondary-ink, muted-ink, card-light, card-dark, subtle, divider, divider-on-dark, page).' }
   ```
2. **Allowlist append** — union of every file swept across 4.4a + 4.4b + 4.4c, grouped under `// Phase 4.4 (colour sweep)`. Projected count: ~62 unique files (the allowlist deduplicates by path).
3. **`docs/SCHOLAR_V4_PARITY_AUDIT.md`** — Phase 4.4 appendix:
   - Per-commit hit counts (4.4a: 556 / 4.4b: 337 / 4.4c: ~114).
   - `text-white` classifier table (139 preserved / 78 swept).
   - `bg-(white|black)/N` overlay decisions (100 preserved).
   - `border-white` classifier (9 preserved).

### Verification gate
- `rg -P "(?<![-\w])(?:text|bg|border|ring)-(?:gray|slate|zinc|neutral|stone)-\d+(?![-\w])"` outside Admin → 0.
- `tsc --noEmit`, `vitest run`, `npm run check:tokens` all green.

---

## Phase 4.5 — Component shells (Button)

### Live state
- `ScholarButton` is currently `React.FC`. It is composed inside Radix triggers and Tooltip wrappers via `asChild` semantics, which forward refs. The current implementation silently drops the ref — Radix logs a dev warning in some paths. **Action:** convert to `React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ScholarButtonProps>`.
- Existing `ScholarButton` usages outside Admin: **81** — all consume the public API (`variant`, `size`, `loading`, `icon`, `href`) and do not touch internals. No API break planned: the forwardRef refactor keeps the prop surface identical.
- Bespoke `<button>` count outside Admin/Scholar: 375, but the overwhelming majority are correctly bespoke (icon-only toolbar buttons, inline chips, accordion triggers — all of which use `ScholarIconButton` or matching token classes). A line-by-line audit identifies **one** remaining bespoke that duplicates `ScholarButton` chrome:
  - `src/components/Dashboard/FlashcardViewer.tsx` — the "Flip card" CTA renders a hand-rolled `<button className="bg-accent-gold text-ink-on-dark rounded-[6px] px-4 py-2 …">`. Migrate to `<ScholarButton variant="primary" size="md">`.

### Plan
1. Refactor `Scholar/ScholarButton.tsx`:
   ```tsx
   export const ScholarButton = React.forwardRef<
     HTMLButtonElement | HTMLAnchorElement,
     ScholarButtonProps
   >((props, ref) => { /* unchanged body, threading ref to <button>/<a> */ });
   ScholarButton.displayName = 'ScholarButton';
   ```
   The internal split between `<button>` and `<a href>` keeps its current branching; ref is forwarded to whichever element renders.
2. Migrate the one bespoke in `FlashcardViewer.tsx` — single search-replace, preserving `onClick` + ARIA.
3. Vitest sanity: existing tests cover render + click paths via `examples/example.test.tsx`; add no new tests (no behaviour change).

### Risks & mitigation
| Risk | Mitigation |
|---|---|
| `forwardRef` generic over union props confuses TS inference | Lock prop generic to `ScholarButtonProps` with an `as`-narrowing helper inside the body; verified by `tsc --noEmit` on all 81 call sites. |
| Radix `asChild` previously slotted a fragment | After ref forwarding, Radix gets a real ref — no behaviour regression; verified visually on Tooltip + DropdownMenu trigger sites. |

### Verification gate
- `tsc --noEmit` clean (all 81 call sites compile).
- Visual smoke: Dashboard primary CTA, Pricing primary CTA, Auth submit (loading state), FlashcardViewer flip CTA — all four exercise the four variants.

---

## Phase 4.6 — Iconography (ScholarIcon wrapper + sweep)

### Live counts
- Files importing `lucide-react` outside Admin: **95**. Total imported icon symbols (rough estimate from import-list expansion): **~523 JSX usages**.
- Stroke specification per Scholar v4: `strokeWidth = size <= 16 ? 1.7 : 1.6`. Currently defaults to lucide's `2` everywhere — over-bold compared to the v4 reference (`design/Scholar v4.html`).

### Plan
1. **Primitive** — `src/components/Scholar/ScholarIcon.tsx`:
   ```tsx
   import { forwardRef, type ComponentType, type SVGProps } from 'react';
   import type { LucideProps } from 'lucide-react';
   interface Props extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
     icon: ComponentType<LucideProps>;
     size?: number;
   }
   export const ScholarIcon = forwardRef<SVGSVGElement, Props>(
     ({ icon: Icon, size = 18, strokeWidth, ...rest }, ref) => (
       <Icon
         ref={ref}
         size={size}
         strokeWidth={strokeWidth ?? (size <= 16 ? 1.7 : 1.6)}
         aria-hidden={rest['aria-label'] ? undefined : true}
         {...rest}
       />
     )
   );
   ScholarIcon.displayName = 'ScholarIcon';
   ```
2. **Three sweep batches** (kept small so each is reviewable and easy to roll back):
   - **4.6a — Dashboard core** (~38 files, ~210 usages): `Dashboard.tsx`, `Header.tsx`, `Sidebar.tsx`, `SummaryDisplay.tsx`, `LibraryPage.tsx`, `QuizPage.tsx`, `FlashcardViewer.tsx`, BookMode cluster.
   - **4.6b — Feature clusters** (~32 files, ~180 usages): BrainRush, Multiplayer, StudyRooms, Social, Highlighting, MindMap, FloatingVideo, Notifications.
   - **4.6c — Surfaces & misc** (~25 files, ~133 usages): Auth, Pricing, Subscription, Onboarding, ChatAssistant, Common modals, NotFound/ErrorBoundary/EnvValidator.
3. **Sweep script** — `scripts/phase-4-6-icon-sweep.cjs`: lexes each file's `lucide-react` named-import list, then rewrites JSX usages `<Foo … />` → `<ScholarIcon icon={Foo} … />` only when:
   - the symbol is in the file's lucide import list, AND
   - no existing `strokeWidth=` is set on the element (preserves intentional overrides).
   Import line is rewritten so the symbol stays imported (used as a `ComponentType` value passed to `icon={}`), and `ScholarIcon` is added if missing.
4. **Allowlist + regression rule** appended after 4.6c:
   ```js
   { id: 'raw-lucide-jsx',
     // Heuristic: catches <SomeIcon … /> where SomeIcon also appears in a lucide import in the same file.
     // Implemented by a second-pass walker in check-token-regressions.cjs.
   }
   ```

### Risks & mitigation
| Risk | Mitigation |
|---|---|
| `<Icon className="…">` consumers expecting raw `<svg>` props | Spread `{...rest}` covers all SVG attrs; verified by audit. |
| Animated/spinning icons (`Loader2`) need `className="animate-spin"` to flow through | `{...rest}` preserves className. |
| Bundle-size regression from wrapper overhead | Wrapper is a single forwardRef function; tree-shakes per icon. |

### Verification gate per sub-batch
- `tsc --noEmit` clean.
- Visual diff on at least one icon-dense screen per batch (Dashboard sidebar, BrainRush results, Auth submit).
- `rg "<(Loader2|ChevronDown|X|Plus|Search)\b"` in swept files → returns wrapped form only.

---

## Phase 4.7 — Motion tokens + focus-visible

### Live counts
- `transition-all`: **40** hits — replace with explicit property list per element.
- `duration-N`: **145** hits — normalize to tokens (`duration-[var(--s4-dur-base)]` etc).
- `ease-(in|out|in-out|linear)`: **17** hits — replace with `ease-[var(--s4-ease)]`.
- `focus:ring-N`: **75** hits — migrate to `focus-visible:ring-N` for keyboard-only focus.
- `focus-visible:ring`: 8 hits (already correct, used as reference).
- Custom animations in use: `animate-spin` 59, `animate-pulse` 13, `animate-scale` 10, `animate-fade` 10, `animate-shake` 2, `animate-bounce` 1, `animate-ping` 1, `animate-in` 1. **Preserve all** — these are intentional motion, only the timing/easing primitives change.

### Plan
1. **Tokens** added to `src/styles/scholarV4.css`:
   ```css
   :root {
     --s4-ease:        cubic-bezier(0.4, 0, 0.2, 1);   /* Scholar v4 spec */
     --s4-ease-out:    cubic-bezier(0, 0, 0.2, 1);
     --s4-dur-fast:    120ms;
     --s4-dur-base:    200ms;
     --s4-dur-slow:    320ms;
   }
   @media (prefers-reduced-motion: reduce) {
     :root {
       --s4-dur-fast: 0ms; --s4-dur-base: 0ms; --s4-dur-slow: 0ms;
     }
     *, *::before, *::after { animation-duration: 0.001ms !important; }
   }
   ```
2. **Sweep** — `scripts/phase-4-7-motion-sweep.cjs`:
   ```
   transition-all                 → transition-[background-color,border-color,color,opacity,transform]
   duration-(100|150)             → duration-[var(--s4-dur-fast)]
   duration-(200|250|300)         → duration-[var(--s4-dur-base)]
   duration-(400|500|700)         → duration-[var(--s4-dur-slow)]
   ease-in-out / ease-out / ease-in / ease-linear → ease-[var(--s4-ease)]   (or --s4-ease-out for ease-out only)
   focus:ring-(\d+)               → focus-visible:ring-$1
   focus:ring-offset-(\d+)        → focus-visible:ring-offset-$1
   focus:ring-(focus|divider|…)   → focus-visible:ring-$1
   ```
   Collision guard: skip lines that already contain `focus-visible:` for the same utility (prevents duplicates).
3. **`transition-all` replacement** is conservative — the explicit property list above covers 95%+ of current uses (colour/opacity/transform). The script logs any line that combines `transition-all` with a non-listed effect (e.g., `filter`) for manual review.

### Risks & mitigation
| Risk | Mitigation |
|---|---|
| `focus:ring` on form inputs where users tab AND click | `focus-visible` matches both keyboard tab and programmatic focus; mouse-click focus is intentionally suppressed (WCAG-aligned, matches v4 spec). |
| `transition-all → transition-[…]` misses an animated property | Sweep logs `transition-all` neighbours of `filter:`, `backdrop-`, `grid-`; any hit requires manual conversion before the sweep replaces it. |
| Reduced-motion override too aggressive | The global `animation-duration: 0.001ms` is a standard a11y pattern; preserved animations still play (just instantly) so logic that listens to `animationend` keeps working. |

### Verification gate
- `tsc --noEmit` clean.
- Manual a11y check: tab through Dashboard primary CTA, Auth form, Pricing card, Header menu — focus ring visible only on keyboard.
- `prefers-reduced-motion: reduce` DevTools toggle → no perceptible animation.

---

## Phase 4.8 — Dark-mode parity audit

### Goal
Catch any orphaned light-only colour leaks that survived 4.4a/4.4b/4.4c. By construction, the colour sweep should leave 0 raw-neutral tokens, but state colours (red/green/blue/amber/…), conditional gradients, and inline `style={{…}}` colour writes can still ship with no dark-mode counterpart.

### Audit matrix
- **15 routes** × **6 palettes** (`mono`, `sepia`, `slate`, `sky`, plus the two dark variants) × **2 modes** (light, dark) = **180 screens**.
- Captured via a small `scripts/phase-4-8-dark-audit.cjs` that drives `vite preview` headlessly and writes screenshots into `docs/audit/4.8/<route>__<palette>__<mode>.png`. No new dependencies — uses the project's existing Playwright dev dep if present, otherwise falls back to a `puppeteer-core` chromium discovery (we'll detect at script start and skip if unavailable; manual capture fallback documented).

### Programmatic checks (run unconditionally)
1. `rg -P "(?<![-\w])text-(?:red|green|blue|amber|yellow|orange|purple|pink|indigo|cyan|teal|emerald|rose|sky|fuchsia|violet|lime)-\d+(?![-\w])"` lines without a sibling `dark:text-` on the same className → list of suspects (currently 874 lines; many are correctly intentional state colours, audit narrows to ~30 real orphans expected).
2. `rg "style=\{\{[^}]*(?:color|background)" src/components` → manual review of any inline colour writes.
3. Contrast verification on the top 12 highest-traffic surfaces using `wcag-contrast` against the resolved CSS variables (script reads `index.css` palettes directly).

### Deliverables
- `docs/SCHOLAR_V4_PARITY_AUDIT.md` — Phase 4.8 section with screenshot table + contrast report.
- Targeted fixes (estimated 0–10 files): adding `dark:` siblings to genuine orphans, not a sweep.

### Verification gate
- All 12 contrast tests pass (WCAG AA on body, AAA on display).
- Visual matrix has zero red flags (logged in audit doc).

---

## Phase 4.9 — Page composition pass

### Goal
With every primitive on tokens, do a page-level polish covering structural rhythm: gutters, max-widths, section spacing, hero proportions. This is intentionally narrative-driven (not a regex sweep) because the remaining issues are layout-level and require a designer's eye.

### Scope (per `docs/SCHOLAR_V4_PARITY_AUDIT.md`)
1. **Dashboard home** — right-rail width vs. `--s4-rail-width`, section gap vs. `--s4-shell-gap`.
2. **LibraryPage** — card grid gutter, empty-state vertical centring.
3. **Pricing** — three-column rhythm vs. v4 reference; CTA stack on mobile.
4. **Auth** — single-column max-width (`max-w-md`), vertical centring.
5. **Subscription / SubscriptionManagement** — billing table line-height + numeric alignment (`s4-numeric`).
6. **Onboarding wizard** — step indicator spacing.

### Working method
- Each page gets a screenshot pair (current vs. `design/Scholar v4.html` reference).
- A single PR per page with before/after diff in the description.
- No primitive or token changes — anything that needs a new primitive bounces back to a follow-up phase.

### Verification gate
- All 6 page diffs reviewed.
- `npm run check:tokens` still green (no regressions during layout work).
- Final allowlist count snapshot committed to `docs/SCHOLAR_V4_PARITY_AUDIT.md`.

---

## Cross-cutting precautions (carried from prior phases)

1. **No Supabase / DB schema changes** — colour and motion phases are presentation-only.
2. **`text-white` / `bg-(white|black)/N` / `border-white` overlays preserved verbatim** — locked via classifier tables in `docs/SCHOLAR_V4_PARITY_AUDIT.md`.
3. **Admin subtree out of scope** — every sweep glob carries `-g '!src/components/Admin/**'`.
4. **SDK constraints** untouched — `.then(null)` and `nullsFirst: false` patterns left as-is.
5. **Relaxed TS config respected** — no new strictness flags introduced.
6. **Per-phase gate**: `tsc --noEmit` + `vitest run` (73/73) + `npm run check:tokens` must all pass before opening the next phase.
7. **Roll-back unit** = one phase = one commit (sweeps include their generating script, kept in `scripts/phase-*.cjs` so any phase can be regenerated or reverted in isolation).

---

## Numbers at a glance (sweep budget vs. live)

```text
Phase   Title                       Hits (live)   Files   Risk
4.4c    Borders + close 4.4         114           ~22     Low
4.5     Component shells            1 + 1         2       Low
4.6     Iconography                 ~523          95      Medium
4.7     Motion + focus-visible      277           46      Medium
4.8     Dark-mode parity            ~30 fixes     0–10    Low–Med
4.9     Page composition            ~6 pages      6       Medium
        --------------------------------------------------
        TOTAL                       ~952 edits    ~180    —
```

Awaiting approval to begin **Phase 4.4c (Borders + close 4.4)**.
