## Phases 4.3 → 4.5 — Shadows, Colour, Component Shells

Three sequential phases. Each ships with: prep commit (tokens/primitives) → mechanical sweep → regression-guard delta → verification gate → results appendix. Admin remains parked. Live audit re-check (2026-05-11) reconciles counts against the original audit numbers.

---

## Phase 4.3 — Shadows (53 files, 132 hits)

### Prep commit (`src/styles/scholarV4.css`)
Add four shadow tokens under `:root` (dark-mode override via `.dark` block already present):

```css
--s4-shadow-hairline: 0 0 0 1px hsl(var(--s4-rule));
--s4-shadow-card:     0 1px 2px rgb(0 0 0 / .04), 0 4px 12px rgb(0 0 0 / .04);
--s4-shadow-modal:    0 8px 32px rgb(0 0 0 / .12);
--s4-shadow-floating: 0 12px 40px rgb(0 0 0 / .16);
```

Dark-mode block multiplies alpha by ~2 (depth needs more contrast on dark surfaces). Reduced-motion / forced-colors unaffected.

### Sweep mapping (locked)
| Tailwind input | v4 output |
|---|---|
| `shadow-sm` | `shadow-[var(--s4-shadow-hairline)]` |
| `shadow` / `shadow-md` | `shadow-[var(--s4-shadow-card)]` |
| `shadow-lg` / `shadow-xl` | `shadow-[var(--s4-shadow-modal)]` |
| `shadow-2xl` | `shadow-[var(--s4-shadow-floating)]` |
| `hover:shadow-md` | `hover:shadow-[var(--s4-shadow-card)]` (variant preserved) |
| `shadow-inner` | left untouched (not in v4 vocabulary; verify case-by-case, log deferrals) |

### What we do NOT touch
- `shadow-none` (semantic reset).
- `shadow-inner` (no v4 mapping — deferred, logged).
- Coloured shadows (`shadow-red-*`, `shadow-primary/30`, etc.) — those are decoration tokens, not surface elevation; preserved as-is.
- Admin cluster (`src/components/Admin/**`) — parked.
- Phase 4.1 primitives (`Scholar/CourseCard.tsx`, `Scholar/PageHeader.tsx`, `Scholar/ScholarBadge.tsx`) — token-defining surfaces.

### Cross-file safety
- **Modal/Toast/Popover z-stack**: `Modal.tsx`, `ConfirmationModal.tsx`, `PromptModal.tsx`, `Toast/Toast.tsx`, `Common/Tooltip.tsx` — sweep edits the shadow only; backdrop/overlay z-index untouched.
- **`BookMode/BookModeViewer.tsx` + `Highlighting/HighlightLayer.tsx`**: floating widgets stack on top of content — verify the `--s4-shadow-floating` value still reads as "above modal" not "below."
- **Phase 3 radius-swept files (~10)**: re-opened for shadow-only edits. Lines mutated are className strings; no JSX restructure.
- **No state/handler/prop changes.** ClassName-only edits.

### Regression rule
```js
{ id: 'tailwind-shadow',
  re: /(?<![-\w])shadow-(?:sm|md|lg|xl|2xl)(?![-\w])/g,
  hint: 'Use shadow-[var(--s4-shadow-*)]' }
```
Allowlist: append 53 files under `// Phase 4.3 (shadows)` block.

### Verification gate
```
npm run check:tokens                      # 139 swept files clean (86 + 53)
npx tsc -p tsconfig.app.json --noEmit     # 0 errors
npx eslint <53 touched files>             # 0 errors
bunx vitest run                           # 73/73
```
Visual smoke: `/dashboard` cards, `/pricing` plan cards, all modals (`PromptModal`, `ConfirmationModal`, `InsufficientCreditsModal`), `Toast` stack, `Tooltip`, `BookModeViewer`. Light + dark, navy-gold + oxblood-cream palettes.

---

## Phase 4.4 — Colour (36 + ~30 files, ~784 hits — three internal commits)

Largest phase. Three mechanical sweeps inside one verification gate.

### Prep commit (`tailwind.config.ts` + verification)
Audit-confirmed tokens already exist in `tailwind.config.ts` (`ink`, `ink-on-dark`, `secondary-ink`, `muted-ink`, `muted-ink-on-dark`, `card-light`, `card-dark`, `subtle`, `divider`, `divider-on-dark`, `page-dark`). Prep step:
1. Verify each token resolves to an HSL semantic variable (no raw hex).
2. Add any missing aliases discovered during dry-run grep (max 2–3 expected).
3. Commit token verification — zero application-code edits in this commit.

### Sweep mapping (locked — frozen during execution)
```
text-gray-900|800        → text-ink              dark:text-ink-on-dark
text-gray-700|600        → text-secondary-ink    dark:text-muted-ink-on-dark
text-gray-500|400        → text-muted-ink        dark:text-muted-ink-on-dark
text-gray-300            → text-muted-ink-on-dark
bg-white                 → bg-card-light         dark:bg-card-dark
bg-gray-50|100           → bg-subtle             dark:bg-card-dark
bg-gray-800|900          → bg-card-dark
border-gray-200|300      → border-divider        dark:border-divider-on-dark
ring-gray-300            → ring-divider
placeholder-gray-*       → placeholder:text-muted-ink
divide-gray-*            → divide-divider
text-black               → text-ink
bg-black                 → bg-page-dark          (unless decorative — see below)
text-white               → text-ink-on-dark      (unless on coloured surface — see below)
slate|zinc|neutral|stone → mapped identically to gray-N of the same step
```

### State-vs-decoration allowlist (preserved verbatim)
- `red|green|yellow|blue|amber|orange|emerald|rose-(50…900)` — semantic state UI (error / success / warning / info / submit-confirm). Untouched.
- `purple|indigo|pink|cyan|teal-N` — currently 0 hits in non-Admin tree (live re-check). Defensive: if any exist post-sweep, flagged for case-by-case review.

### Context-dependent rules (`text-white` / `bg-black`)
Per-line audit during 4.4a:
- `text-white` on element whose ancestor sets `bg-accent-*`, `bg-red-*`, `bg-green-*`, `bg-primary`, `bg-gold` → **preserve** (foreground of coloured surface).
- `text-white` on element with no coloured surface ancestor → **sweep** to `text-ink-on-dark`.
- `bg-black` with `/N` opacity modifier (e.g. `bg-black/50` backdrops) → **preserve** (decorative overlay alpha).
- Bare `bg-black` → **sweep** to `bg-page-dark`.

Each context-dependent decision logged in a 4.4 audit appendix (file + line + rationale).

### Three commit plan (inside one phase)
1. **4.4a Text colours** — `text-(gray|slate|zinc|neutral|stone)-N` + conditional `text-white|black`. Estimated ~280 hits.
2. **4.4b Backgrounds** — `bg-(gray|slate|zinc|neutral|stone)-N` + conditional `bg-white|black`. Estimated ~310 hits.
3. **4.4c Borders + rings + dividers + placeholders.** Estimated ~190 hits.

Each commit independently `tsc`-clean and `vitest`-green. Regression rule and allowlist applied **once** at phase end.

### Frozen file list
Generated live at sweep time via `rg -l` (~50 unique files across the three commits). Excluded:
- `src/components/Admin/**` (parked).
- `src/contexts/ThemeContext.tsx` — top hit file (~56). **Special handling**: it returns gradient strings used by other components. Verify each replacement is a `className`/`style` string mutation, not a logic change. `mem://style/theme-system` enforced.
- Phase 4.1 primitives (3 files) — token-defining.
- `src/index.css`, `src/styles/scholarV4.css` — source of truth, untouched.

### Cross-file safety
- **`ThemeContext.tsx`**: `getThemeGradient` returns string literals. Sweep each string conservatively; run targeted ThemeContext tests after the commit. No new helper added; no signature changed.
- **`Common/LoadingSkeleton.tsx`**: shimmer keyframe currently animates against `bg-gray-200`. After sweep to `bg-subtle`, re-check the gradient stop colour produces visible motion under both light and dark palettes. If not, add a dedicated `--s4-skeleton-shimmer` token in a follow-up patch (anticipated mitigation, not blocker).
- **`Auth/Auth.tsx` confirmation modal blue**: classified as semantic submit-confirm UI → preserved as-is.
- **Toast variants** (`success`/`error`/`warning`/`info`) — state colours preserved; only surface neutrals swept.
- **`Sidebar.tsx`** — uses `--s4-sb-*` already in Phase 3; verify no residual `text-gray-*` overrides leak through.
- **No `t()` / i18n** edits. **No prop / handler / hook** changes.

### Regression rule
```js
{ id: 'raw-neutral',
  re: /(?<![-\w])(?:text|bg|border|ring|divide|placeholder)-(?:gray|slate|zinc|neutral|stone)-\d+(?![-\w])/g,
  hint: 'Use semantic ink/surface tokens' }
```
Plus a second informational (non-blocking) rule that lists `text-white|bg-black` outside the preserved coloured-surface contexts — gated by per-file allowlist exceptions documented in `docs/SCHOLAR_V4_ISSUES.md`.

### Verification gate
```
npm run check:tokens                      # 139 + 4.4 files clean
npx tsc -p tsconfig.app.json --noEmit     # 0 errors
npx eslint <swept files>                  # 0 errors
bunx vitest run                           # 73/73
```
Visual smoke: every route surface (`/auth`, `/onboarding`, `/dashboard`, `/library`, `/pricing`, `/quiz`, `/profile`, `/share`, `/billing`, `/feedback`, `/edu-play`, `/academics`) × 2 palettes × {light, dark} = 48 smoke screenshots — focus on no white-on-white / black-on-black, state colours intact, gradients intact.

---

## Phase 4.5 — Component shells (29 files, button-only)

### Prep commit (`Scholar/ScholarButton.tsx`)
Audit-confirmed variant taxonomy is complete (`primary | secondary | ghost | outline | danger | link`). Prep step:
1. **Verify `React.forwardRef`** on default export. If missing, add (ref is required for Tooltip + Radix Popover triggers).
2. **Verify `...rest` spread** onto the underlying `<button>` element so consumers can pass `type`, `form`, `aria-*`, `data-*`, `disabled`, `onClick`, etc.
3. Verify `disabled` prop disables both click handler and applies disabled visual variant.
4. Single commit, no consumer changes.

### Sweep target (locked)
Bespoke `<button className="…px-…">` patterns across 29 files. Each call-site:

```tsx
// before
<button className="px-4 py-2 rounded bg-blue-600 text-white …" onClick={…}>Save</button>

// after — variant chosen per the taxonomy
<ScholarButton variant="primary" onClick={…}>Save</ScholarButton>
```

Variant chosen per visual intent (submit/CTA → `primary`; cancel/dismiss → `secondary`; icon+text affordance → `ghost`; destructive → `danger`; inline text → `link`). Decision per call-site documented in the results appendix as a one-line table row.

### What we do NOT touch
- `<ScholarButton>` consumers (already migrated).
- `<button>` inside Radix UI primitives (DropdownMenuTrigger, etc.) — Radix manages internal markup.
- Icon-only buttons whose primitive is `Scholar/ScholarIconButton.tsx`.
- `<form>` submit buttons whose `type="submit"` semantics are validated — preserved via `...rest`.
- Admin cluster (parked).

### Cross-file safety
- **Form submit**: `Auth/Auth.tsx`, `Pricing/CheckoutPage.tsx`, `Dashboard/FeedbackPage.tsx`, `Dashboard/InputForm.tsx`, `Dashboard/ProfilePage.tsx` — `type="submit"` preserved through `...rest`; verified by submitting each form post-sweep.
- **Tooltip/Popover wrapping**: any `<Tooltip><button>…</button></Tooltip>` → confirm `ScholarButton` forwards ref so Radix can position the popper. Prep commit guarantees this.
- **Phase 3 radius-swept modals** (`PromptModal.tsx`, `ConfirmationModal.tsx`): preserve `disabled` state and the close-handler binding — re-test the X-close and Cancel paths.
- **Aria-labels and i18n**: `{t('action.save')}` children stay as children of `<ScholarButton>` unchanged. No `t()` keys touched.
- **Keyboard navigation**: ensure tab order unchanged — `ScholarButton` renders a single `<button>` (no fragment).
- **Color exception**: state buttons that currently inline `bg-red-600` → migrate to `variant="danger"` (taxonomy-mapped, not preserved verbatim).

### Regression guard (manual)
No mechanical regex possible (`<button className="px-…">` is a legitimate pattern in primitives). At phase end:
```bash
rg '<button[^>]*className=[^>]*\bpx-' src/components src/pages | grep -v Admin | grep -v Scholar/
# expected: 0 matches
```
Result captured in `docs/SCHOLAR_V4_ISSUES.md` appendix.

### Verification gate
```
npm run check:tokens                      # all prior rules pass
npx tsc -p tsconfig.app.json --noEmit     # 0 errors
npx eslint <29 touched files>             # 0 errors
bunx vitest run                           # 73/73 — run after every 5 swept files
```
Visual + interaction smoke:
- Submit forms on `/auth`, `/checkout`, `/profile`, `/feedback`, `/inputs` — verify form posts.
- Cancel + close buttons on all modals — verify closure.
- Keyboard tab order across `/dashboard` toolbar.
- RTL toggle on `/auth` form — verify button alignment.

---

## Aggregate execution order

1. **4.3 Shadows** — smallest in scope, builds shadow token grammar reused in 4.4 surfaces. ~3 days of mechanical edits + 1 verification cycle.
2. **4.4 Colour** — bulk of the remaining v4 parity work; three internal commits, single verification gate at the end. ~5–6 days.
3. **4.5 Component shells** — depends on 4.4 colour tokens (variant fills resolve to ink-on-accent etc.). Requires forwardRef prep. ~3 days.

After 4.5 ends, the remaining phases are 4.6 (icons), 4.7 (motion), 4.8 (dark-mode verification), 4.9 (page composition). Plan for those will be authored once 4.5 lands and live audit numbers re-confirm.

---

## Cross-phase precautions (apply to all three)

- **Admin parked** — `src/components/Admin/**` excluded from all sweeps, all regression allowlists, all verification gates.
- **Primitives token-defining** — `Scholar/CourseCard.tsx`, `Scholar/PageHeader.tsx`, `Scholar/ScholarBadge.tsx`, `Scholar/ScholarButton.tsx`, `Scholar/ScholarInput.tsx`, `Scholar/ScholarIconButton.tsx`, `Scholar/MasteryBar.tsx`, `Scholar/ScholarSkeleton.tsx` — edited only in prep commits, never in mechanical sweeps.
- **No i18n keys touched** — `t('…')` calls preserved character-for-character across all 3 phases.
- **No prop / handler / hook / state logic changed** — className/style-string mutations only.
- **No `dark:` / `hover:` / `focus:` variants on the swept token itself** — preserved verbatim; only the base token migrates.
- **RTL safe** — Phase 4.1 helper cascade (`'Fraunces','Amiri',Georgia,…`) is the only typography path; 4.3/4.4/4.5 do not introduce new font-family declarations.
- **Reduced motion / forced colors** — `src/index.css` blocks are untouched; new shadow/color tokens degrade gracefully under both media queries.
- **Test cadence** — `bunx vitest run` after every 5 files in 4.4 and 4.5 (larger blast radius); after each phase in 4.3.
- **Memory respect** — `mem://constraints/supabase-preservation`, `mem://tech/typescript-config`, `mem://style/theme-system`, `mem://tech/supabase-sdk-compatibility` all observed.

---

## Deliverables per phase

Each phase exits with:
1. Mechanical sweep commits (1 for 4.3, 3 for 4.4, 1 for 4.5).
2. Prep commit (CSS tokens for 4.3, token verification for 4.4, ScholarButton API confirm for 4.5).
3. `scripts/check-token-regressions.cjs` — rule + allowlist append.
4. `docs/SCHOLAR_V4_ISSUES.md` — results appendix (files touched, edit count, deferred-line log, cross-file safety statement, visual smoke summary).
5. `.lovable/plan.md` — RESULTS block per phase.

Estimated combined edits: ~1,000 className mutations across ~110 unique files (some files touched in multiple phases), + 1 CSS token file, + 1 ScholarButton verification, + 1 regression script update per phase.

Awaiting approval to begin Phase 4.3.
