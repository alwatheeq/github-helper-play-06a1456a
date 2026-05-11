## Six-phase roadmap: 4.4b → 4.8

Live re-audit (2026-05-11) lets me right-size each remaining phase. Phase 4.5 (buttons) is essentially solved — only 1 bespoke `<button>` left. Phase 4.9 (page composition) is excluded from this batch and remains the final phase after 4.8 lands.

| Phase | Title | Files (live) | Hits (live) | Type |
|---|---|---:|---:|---|
| 4.4b | Backgrounds | 31 + ~25 (white) | 256 + 122 + 14 (bare black) | Mechanical sweep |
| 4.4c | Borders / rings / divides / placeholders + 4.4 close | ~30 | 156 + 9 | Mechanical sweep + regression rule + allowlist |
| 4.5  | Component shells | 1 | 1 | Verification + 1 surgical edit |
| 4.6  | Iconography | 95 | ~523 icon usages | Primitive + 3 batched sweeps |
| 4.7  | Motion | 46 | 40 + 85 | Token prep + sweep |
| 4.8  | Dark-mode parity | 0–10 | — | Verification-driven |

---

## Phase 4.4b — Backgrounds (next commit inside 4.4)

### Live counts
- `bg-(gray\|slate\|zinc\|neutral\|stone)-N`: **256 hits / 31 files** (top hits: `gray-700` 88, `gray-800` 50, `gray-200` 34).
- `bg-white` bare: **122 hits** (mechanical sweep target).
- `bg-black` bare: **14 hits** (mechanical sweep target).
- `bg-(white\|black)/N` opacity overlays: **100 hits** — **preserve verbatim** (decorative alpha).

### Sweep mapping (locked)
```
bg-gray-50|100|200|300|400       → bg-subtle             dark:bg-card-dark
bg-gray-600|700|800|900          → bg-card-dark          (no dark: flip — already dark)
bg-slate-700|800                 → bg-card-dark
bg-white                         → bg-card-light         dark:bg-card-dark
bg-black                         → bg-page               (already palette-flipping via [data-theme] × .dark)
```
- `dark:` variant added only when the same line does not already carry a `dark:bg-*` token (collision guard, same logic as 4.4a).
- `bg-(white|black)/N`, `bg-gradient-*`, `from-*/to-*/via-*`, state colours (red/green/blue/etc) — **never touched**.

### Cross-file safety (4.4b specific)
- **`Common/LoadingSkeleton.tsx`** — shimmer keyframe currently runs against `bg-gray-200`. Sweep proceeds; visual check confirms shimmer remains visible against `bg-subtle` under both modes. If invisible: add `--s4-skeleton-shimmer` token in a single follow-up patch within this commit.
- **`ChatAssistant` + `GlobalChatAssistant`** — bubble surfaces use `bg-gray-100` for received messages; verify after sweep that received vs sent contrast is preserved (sent uses accent).
- **`Dashboard/Sidebar.tsx`** — already on `--s4-sb-*` tokens (Phase 3.16); residual `bg-gray-*` here would be a leak, swept to `bg-card-dark`.
- **`ThemeContext.tsx`** — bg neutrals inside gradient-string fragments excluded (no `from-`/`to-`/`via-` in same string is the inclusion criterion).
- **Canvas / SVG layers** (`MindMap/MindMapView.tsx`, `BookMode/BookModeViewer.tsx`, `Highlighting/HighlightLayer.tsx`) — script edits className tokens only; no `fill=`/`stroke=`/`style.background` colour strings touched.

### Verification (intra-phase, not final gate)
- After commit: `rg -P "(?<![-\w])bg-(?:gray|slate|zinc|neutral|stone)-\d+(?![-\w])"` outside Admin returns 0.
- `tsc --noEmit` clean. `vitest` 73/73.

---

## Phase 4.4c — Borders + close 4.4

### Live counts
- `border-(gray)-N`: **156 hits**. Distribution: `gray-100` 53, `gray-300` 34, `gray-600` 33, `gray-700` 19, `gray-200` 16.
- `border-white`: **9 hits** — manual review (default preserve when on coloured surface).
- `ring-(gray)-N`: **1 hit** (`ring-gray-500`).
- `divide-gray-*`, `placeholder-gray-*`: **0 hits**.

### Sweep mapping (locked)
```
border-gray-100|200|300|400  → border-divider           dark:border-divider-on-dark
border-gray-600|700|800|900  → border-divider-on-dark
ring-gray-500                → ring-divider
divide-gray-*                → divide-divider           dark:divide-divider-on-dark
placeholder-gray-*           → placeholder:text-muted-ink
```
- `border-white` — manual classifier inside this commit (same rule as `text-white` in 4.4a): preserve when same className carries any coloured-surface marker; otherwise sweep to `border-card-light` (rare, ~2–3 hits expected).
- Collision guard on pre-existing `dark:border-*` mirrors 4.4a logic.

### Phase 4.4 close-out (lands in this commit)

1. **Regression rule** appended to `scripts/check-token-regressions.cjs`:
   ```js
   { id: 'raw-neutral',
     re: /(?<![-\w])(?:text|bg|border|ring|divide|placeholder)-(?:gray|slate|zinc|neutral|stone)-\d+(?![-\w])/g,
     hint: 'Use semantic ink/surface tokens (ink, secondary-ink, muted-ink, card-light, card-dark, subtle, divider, page).' }
   ```
2. **Allowlist append** — every file swept across 4.4a + 4.4b + 4.4c under `// Phase 4.4 (colour sweep)`. Final allowlist count: ~210 files.
3. **`docs/SCHOLAR_V4_ISSUES.md`** — Phase 4.4 appendix:
   - Per-commit hit counts (sweep).
   - `text-white` classifier table (139 preserved / 78 swept — already captured).
   - `bg-white|black|/N` decisions.
   - `border-white` decisions.
   - Deferred-line log (none expected).
   - Cross-file safety statement.

### Verification gate (blocking — Phase 4.4 exit)
```
node scripts/check-token-regressions.cjs   # ~210 files clean, 5 rules pass
npx tsc -p tsconfig.app.json --noEmit      # 0 errors
npx eslint <swept files>                   # 0 errors
bunx vitest run                            # 73/73
```
Visual smoke (lock-step with original 4.4 plan): 12 routes × 2 palettes × {light, dark} — focus on no white-on-white / black-on-black, gradients intact, LoadingSkeleton shimmer visible, modal backdrops legible.

---

## Phase 4.5 — Component shells

Live audit reveals **the phase is almost complete**: only **1 bespoke `<button className="…px-…">`** remains across non-Admin / non-primitive files:

> `src/components/Dashboard/FlashcardViewer.tsx:637`
> ```tsx
> <button className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-full transition-colors border-divider dark:border-divider-on-dark text-secondary-ink dark:text-secondary-ink-on-dark hover:bg-black/5 dark:hover:bg-white/5`}>
> ```
> Pill-shaped affordance — `variant="ghost"` with `rounded-full` class passed through. Migrate to `<ScholarButton variant="ghost" className="rounded-full" …>`.

### Prep — verify `Scholar/ScholarButton.tsx`
Already confirmed in audit:
- `...rest` spread present (line 65) → `type`/`form`/`aria-*`/`onClick`/`disabled` pass through.
- Variant taxonomy: `primary | secondary | ghost | danger` (4, not 6 as the audit suggested). **Adjustment:** no `outline` or `link` variant required — the one remaining bespoke button maps cleanly to `ghost`.
- **Verify `React.forwardRef`** — current export is `React.FC`, not `forwardRef`. **Required prep edit:** convert to `React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ScholarButtonProps>(...)` so Tooltip/Radix triggers can attach refs. Single isolated commit.

### Sweep
One line in `FlashcardViewer.tsx`. Verify `t()` calls in the button's children stay intact.

### Regression guard (manual, phase-end)
```bash
rg '<button[^>]*className=[^>]*\bpx-' src/components src/pages | grep -v Admin | grep -v '/Scholar/'
# expected: 0 matches
```
Captured in `docs/SCHOLAR_V4_ISSUES.md` appendix.

### Verification gate
- `tsc --noEmit` clean (forwardRef typing).
- `vitest` 73/73.
- Manual smoke: Tooltip-wrapped ScholarButtons across `/dashboard` resolve ref correctly; `/flashcards` pill button behaves identically.

---

## Phase 4.6 — Iconography

### Inventory (live)
- **95 files import from `lucide-react`** (matches audit).
- **~523 lucide icon usages** (`<IconName className="h-N w-N …">`).
- Existing custom icons live in `src/components/Scholar/icons/ScholarV4Icons.tsx` — set is partial, mostly v4-specific glyphs. Lucide remains the primary library.

### Strategy (locked)
Avoid a mass call-site rewrite of 523 occurrences. Instead, introduce a **wrapper primitive** and a **lucide default-props patch**, then *batch-rewrite only* the high-visibility surfaces.

#### Prep commit — `src/components/Scholar/icons/ScholarIcon.tsx`
```tsx
import { LucideIcon, LucideProps } from 'lucide-react';
import { forwardRef } from 'react';
type Props = LucideProps & { icon: LucideIcon };
export const ScholarIcon = forwardRef<SVGSVGElement, Props>(({ icon: Icon, size = 18, ...rest }, ref) => (
  <Icon
    ref={ref}
    size={size}
    strokeWidth={size <= 16 ? 1.7 : 1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  />
));
ScholarIcon.displayName = 'ScholarIcon';
```
Pure additive — does not touch any consumer. Solves the v4 stroke spec (1.6 / 1.7).

#### Sweep — three batches by surface importance
- **Batch A (high-visibility chrome, ~12 files):** `Dashboard/Sidebar.tsx`, `Dashboard/Header.tsx`, `Toast/Toast.tsx`, `Common/Tooltip.tsx`, `Auth/Auth.tsx`, `Pricing/PricingPage.tsx`, `Onboarding/OnboardingWizard.tsx`, NotificationCenter, ChatAssistant pair, ScholarAlert. Migrate `<Icon className="h-N w-N">` → `<ScholarIcon icon={Icon} size={N} className="…">`.
- **Batch B (dashboard pages, ~40 files):** library, history, content view, profile, study goals, achievements, brain rush set, multiplayer set, edu-play, quiz pages.
- **Batch C (remaining, ~43 files):** modals, secondary surfaces, admin-adjacent (but never Admin), info pages.

Each batch: independent commit, `tsc` + `vitest` between batches.

### What we do NOT touch
- **`vite.config.ts`** `optimizeDeps.exclude: ['lucide-react']` — left as-is.
- **`ScholarIconButton.tsx`** custom inline SVGs — already v4-spec stroke.
- **`Scholar/icons/ScholarV4Icons.tsx`** custom icon set — already v4-spec.
- **Admin cluster** — parked.
- **Sizes other than `h-N w-N`** (e.g. `w-full h-full` SVG-fill icons) — different intent, left alone.

### Cross-file safety
- **`Dashboard/Sidebar.tsx`** + **`Dashboard/Header.tsx`** — icons tightly aligned to text baseline (v4 stroke shift can change perceived weight); visual diff at 100% zoom mandatory.
- **`Toast.tsx`** — icon-leading variants; verify success/error/warning/info glyph alignment.
- **Lucide tree-shaking** — wrapper accepts `LucideIcon` as prop, so each call site still imports `{ Icon } from 'lucide-react'` directly. No bundle bloat.
- **A11y** — wrapper passes through `aria-label`/`aria-hidden`; no role/semantics change.
- **`...rest` ordering** — wrapper spreads consumer `className` *after* its own props so users can still override stroke/cap if needed.

### Regression rule — none mechanical
Lucide is a legitimate import. Phase exit recorded as "X / 95 files migrated, Y deferred (with rationale)". Allowlist update only.

### Verification gate
- `tsc --noEmit` clean. `vitest` 73/73.
- Bundle-size diff via `bun run build` ± 1% (sanity, not blocking).
- Visual diff per batch on `/dashboard`, `/auth`, `/pricing`, `/library`, `/profile`.

---

## Phase 4.7 — Motion

### Prep commit — `src/styles/scholarV4.css`
```css
:root {
  --s4-ease:     cubic-bezier(0.4, 0, 0.2, 1);
  --s4-dur-fast: 120ms;
  --s4-dur-base: 200ms;
  --s4-dur-slow: 320ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --s4-dur-fast: 0ms; --s4-dur-base: 0ms; --s4-dur-slow: 0ms; }
}
```
Note: `src/index.css` does **not** currently have a `prefers-reduced-motion` block — the new tokens provide one. Non-token `animate-*` keyframes elsewhere are out of scope (would touch shimmer / spinners / brain-rush fanfare).

### Sweep mapping (locked)
- `transition-all` → `transition-[color,background-color,border-color,opacity,transform,box-shadow]` (explicit prop list, prevents reflow).
- `duration-150`/`200` → `duration-[var(--s4-dur-base)]`; `duration-100` → `[var(--s4-dur-fast)]`; `duration-300`/`500` → `[var(--s4-dur-slow)]`.
- `ease-in-out`/`ease-out`/`ease-in` (default Tailwind) → `ease-[var(--s4-ease)]` only when paired with a duration token swept above (avoid touching animation-only `ease-*` curves).
- `focus:ring-*` → `focus-visible:ring-*` (keyboard-only), preserving any colour/offset modifiers.

### Live counts
- `transition-all`: 40 hits.
- `focus:ring`: 85 hits.
- 46 files total.

### What we do NOT touch
- **`animate-*` keyframe utilities** (spinner, ping, pulse, shimmer, bounce, custom brain-rush keyframes). Phase scope is `transition-*` only.
- **Primitives** (`Scholar/Scholar*.tsx`) — primitives migrated first in their own sub-step so consumers inherit. Sub-step lands inside this phase, before the main sweep.
- **Admin cluster** — parked.

### Cross-file safety
- **Primitives first**: `Scholar/ScholarInput.tsx`, `Scholar/ScholarButton.tsx`, `Scholar/ScholarIconButton.tsx`, `Scholar/MasteryBar.tsx`, `Scholar/ScholarCard.tsx`, `Scholar/ScholarAlert.tsx`. Single prep commit.
- **`BrainRushGamePlay.tsx`, `FlashcardViewer.tsx`, `Scholar/ScholarSkeleton.tsx`** — `animate-*` survives sweep (regex doesn't match).
- **Reduced-motion** — tokens collapse to 0ms automatically.
- **`focus:ring` → `focus-visible:ring`** — visible focus indicators preserved for keyboard users; mouse-click focus suppressed (a11y improvement). Tab through `/auth`, `/dashboard`, `/pricing` to verify focus rings on keyboard navigation.
- **Variant prefixes** (`hover:`, `group-hover:`, `peer-focus:`, `motion-safe:`) — preserved verbatim when wrapping the swept token.

### Regression rules
```js
{ id: 'transition-all',
  re: /(?<![-\w])transition-all(?![-\w])/g,
  hint: 'Use explicit prop list and var(--s4-dur-base)/var(--s4-ease).' }
{ id: 'focus-non-visible',
  re: /(?<![-\w])focus:ring(?!-offset)/g,
  hint: 'Use focus-visible:ring-* (keyboard-only).' }
```
Allowlist: append 46 files under `// Phase 4.7 (motion)`.

### Verification gate
- `node scripts/check-token-regressions.cjs` — 7 rules pass.
- `tsc --noEmit` clean. `vitest` 73/73.
- Manual: tab-traverse `/auth`, `/dashboard`, `/pricing`; verify focus rings appear on keyboard nav only; verify reduced-motion (OS toggle) collapses transitions; verify hover lifts on dashboard cards remain smooth.

---

## Phase 4.8 — Dark-mode parity (verification-driven)

### Inputs from prior phases
After 4.4 lands, ~210 files carry full light/dark token coverage. After 4.7, motion tokens degrade under reduced-motion. Phase 4.8 confirms **no orphaned light-only or dark-only colour leaks** remain in non-Admin code.

### Pass methodology
1. **Static audit** (run once at phase start):
   ```bash
   # Any className using a token without dark: counterpart on an inverting surface.
   rg -nP '(?<![-\w])(text|bg|border)-(ink|secondary-ink|muted-ink|divider|card-light|subtle)\b' src/components src/pages | grep -v Admin | grep -v 'dark:' | wc -l
   ```
   For each hit, classify: (a) intentionally surface-locked (preserved), (b) missing `dark:` variant (residual — fix in this phase).
2. **Visual matrix** — **15 routes × 6 palettes × {light, dark} = 180 screenshots**, captured to `/tmp/p48-shots/` and discarded after audit (per parity-audit plan). For each:
   - No element renders white-on-white or black-on-black.
   - Accent-gold contrast ≥ 4.5:1 against the surface it sits on (text usage).
   - Sidebar ink readable under each `--s4-sb` value.
   - State colours (red/green/yellow/blue) read correctly under both modes.
3. **Forced-colors** — toggle Windows High Contrast emulation in Chromium; verify no critical UI disappears.

### Expected file edits
0–10 residual fixes (className-only). If a hit cannot be tokenised cleanly, log it in `docs/SCHOLAR_V4_ISSUES.md` Phase-4.8 appendix with rationale.

### Deliverable
- Findings summary in `docs/SCHOLAR_V4_ISSUES.md` Phase-4.8 appendix (audit hit counts, screenshot summary, contrast measurements for accent-gold on each palette, list of residual fixes).
- `.lovable/plan.md` Phase-4.8 RESULTS block.
- Screenshots **not committed** (temp only).

### What we do NOT touch
- Source-of-truth CSS (`src/index.css`, `src/styles/*`).
- Tailwind config tokens (already complete after 4.4).
- Admin cluster.

---

## Cross-phase precautions (apply to all six phases)

- **Admin parked** — `src/components/Admin/**` excluded from sweeps, regression allowlists, verification gates.
- **Primitives token-defining** — `Scholar/Scholar*.tsx` edited only in prep commits, never in mechanical sweeps.
- **No i18n keys touched** — `t('…')` preserved character-for-character.
- **No prop / handler / hook / state / data-flow** changes — className/style-string mutations only (exception: 4.5 forwardRef and 4.6 icon wrapper primitive, both isolated prep commits).
- **No `dark:` / `hover:` / `focus:` / `group-hover:` / `peer-*` variants on the swept token are *removed*** — variants are *preserved* or, when adding a `dark:` pair, *augmented* under collision guard.
- **Collision guard** — every mechanical sweep checks the line for a pre-existing `dark:<property>-*` token on the same property before appending its own.
- **Per-line conservatism** — when ambiguity exists (text-white on unknown surface, border-white in coloured context, transition-all on motion-sensitive element), default to **preserve** and log in deferred-line appendix.
- **Verification cadence** — `tsc --noEmit` + `vitest` after every commit; full regression-guard run at every phase exit.
- **Memory respect** — `mem://constraints/supabase-preservation`, `mem://tech/typescript-config`, `mem://style/theme-system`, `mem://tech/supabase-sdk-compatibility`, `mem://tech/error-handling`, `mem://tech/ui-hook-patterns` observed throughout.
- **No backend / schema / RLS / migration / edge-function** edits in any of the six phases.
- **No new npm dependencies** — lucide-react remains the icon source; no motion library added.
- **Documentation discipline** — every phase exits with its RESULTS block in `.lovable/plan.md` and an appendix in `docs/SCHOLAR_V4_ISSUES.md`.

---

## Aggregate execution order & estimates

```
Phase   Title                       Edits (approx)   Files   Risk
4.4b    Backgrounds                 ~390             ~40     Low–Med (LoadingSkeleton, ChatAssistant)
4.4c    Borders + 4.4 close         ~170             ~30     Low
4.5     Component shells            1 + 1 prep        2      Very low
4.6     Iconography (3 batches)     ~523             95      Med (visual chrome alignment)
4.7     Motion                      ~165             46      Low–Med (focus a11y)
4.8     Dark-mode parity            0–10 + audit     0–10    Low (audit-driven)
```

Total estimated mutations across the six phases: **~1,260 className/JSX edits + 3 prep commits + 4 regression-rule deltas + 6 docs appendices**. Phase 4.9 (page composition, 15 page shells) remains the final phase after 4.8 lands.

---

## Risk register (cross-phase)

| Risk | Phase | Likelihood | Mitigation |
|---|---|---|---|
| LoadingSkeleton shimmer invisible on `bg-subtle` | 4.4b | Medium | Visual check in commit; `--s4-skeleton-shimmer` token ready |
| `bg-(white\|black)/N` overlay mis-swept | 4.4b | Low | Regex requires no `/N` suffix; manual audit pass |
| ChatAssistant message-bubble contrast lost | 4.4b | Low | Visual check post-sweep |
| `border-white` on coloured surface mis-classified | 4.4c | Low | Same per-line classifier as `text-white` in 4.4a |
| ScholarButton `forwardRef` migration breaks consumers | 4.5 | Low | TS type signature widens; all consumers re-typecheck |
| Lucide icon stroke shift breaks Sidebar alignment | 4.6 | Medium | Wrapper accepts override; visual diff per batch |
| Bundle bloat from icon wrapper | 4.6 | Very low | Wrapper is 12 lines, no new imports |
| `focus-visible` regression on Safari < 15.4 | 4.7 | Very low | Polyfilled by Tailwind preset; not project's concern |
| Accent-gold contrast fails on one palette | 4.8 | Low | Audit-driven; tokens already wired |
| Hidden orphan `text-gray-*` in late-merged feature branch | all | Very low | Regression guard catches at every gate |

Awaiting approval to begin Phase 4.4b.
