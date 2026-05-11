## Phase 4 — Scholar v4 Visual Parity Sweep (non-Admin)

Goal: bring the live app to 1:1 visual parity with `design/templates/Scholar-v4.jsx` (8393-line reference, 40+ pages × 6 palette families × light/dark) across the **9 token families** still unaddressed after Phase 3. Phase 3 normalized only radius + gold gradient — Phase 4 closes the rest with the same disciplined, allowlist-gated, regression-guarded approach.

### Decisions baked into this plan (resolved up-front)
1. **Each sub-phase = one phase.** No pre-splitting 4.4 colour. If audit surfaces ~600+ hits, the *implementation* of 4.4 may run in sequential commits, but it stays one logical phase with one approval, one allowlist append, one verification gate.
2. **`<ScholarButton>` variant API review (Phase 4.5)** runs inline as the audit step of 4.5 — same approval model as every other phase, no separate ceremony.
3. **Dark-mode screenshots (Phase 4.8)** are generated but *not committed* — stored in `/tmp/parity-shots/`, findings summarized in the plan results block.
4. **Nothing is skipped.** Admin (17 files) remains parked per existing project rule.

---

## Operating principles (apply to every sub-phase)

1. **Audit-first, edit-second.** Each sub-phase opens with a pcre2 inventory across `src/components/**` + `src/pages/**` (Admin excluded), producing a frozen file list before any edit.
2. **One token family per sub-phase.** Keeps blast radius surgical and review trivial.
3. **Extend `scripts/check-token-regressions.cjs`.** Each sub-phase adds one `FORBIDDEN` rule (where mechanically detectable) + appends swept files to `SWEPT_FILES`. Once allowlisted for a category a file stays clean forever.
4. **Token-only edits.** No prop/API changes, no behavioral logic, no Supabase, no routes, no i18n keys, no animation-timing changes outside the motion sub-phase, no shadow changes outside the shadow sub-phase, etc.
5. **Theme-aware.** Every replacement must resolve correctly under all 6 `[data-theme]` palettes × light/dark. Hardcoded values that have no existing token get a new token added to `index.css` + `scholarV4.css` alias layer **first**, then sweep.
6. **Cross-file safety gates after every sub-phase:**
   ```
   npm run check:tokens
   npx tsc -p tsconfig.app.json --noEmit
   npx eslint <touched files>
   bunx vitest run        (73-test baseline)
   ```
   Zero new errors. Pre-existing warnings (`I18nContext.tsx` × 3) tolerated.
7. **Admin parked.** The 17 Admin files skipped in every sub-phase.
8. **One approval gate per sub-phase.** Plan → approve → audit + edit + verify → results block → next sub-phase.

---

## Phase 4.0 — Parity Audit (read-only, 0 code edits)

Produces `docs/SCHOLAR_V4_PARITY_AUDIT.md` — the authoritative gap inventory that drives 4.1–4.9.

**Inputs**
- `design/templates/Scholar-v4.jsx` (source of truth — `T` palette object, type scale, spacing constants, shadow recipes, icon stroke values, motion timings)
- `design/Scholar v4.html` (canvas wrapper)
- `src/styles/scholarV4.css` (alias layer, currently 68 lines)
- `src/index.css` (per-theme palette + base tokens, 642 lines, 6 themes × light/dark already wired)
- `tailwind.config.js` (utility surface)
- Live app screenshots: 15 major routes at 1280×820

**Method**
1. Extract reference token tables from `Scholar-v4.jsx` (`T.navy_light`, `T.navy_dark`, … through `T.mono_dark`). Diff against existing `--s4-*` aliases.
2. Map each token to its current implementation:
   - `--s4-*` alias hit → OK
   - Hardcoded Tailwind utility (`text-[18px]`, `shadow-md`, `p-6`) → flagged
   - Missing token entirely → flagged + queued for 4.1 prep step
3. Per-route screenshot diff at 1280×820 (v4 artboard) and 904×583 (current preview). Routes: `/auth`, `/`, `/dashboard`, `/library`, `/study-rooms`, `/academics`, `/quiz`, `/eduplay`, `/history`, `/content/:id` (read + book + audio), `/pricing`, `/feedback`, `/share/:id`, `/account-suspended`, `/404`. Admin skipped.
4. Build file-level inventory per sub-phase. Each row: `file_path | line | current value | target token | risk note`.

**Deliverable**
`docs/SCHOLAR_V4_PARITY_AUDIT.md` with 9 sections (one per sub-phase) — file count, edit count, cross-file dependency notes, frozen file list.

**Exit gate** — 0 file edits. Audit doc reviewed; 4.1 file list approved before any edits.

---

## Phase 4.1 — Typography parity

**Scope** — migrate ad-hoc text sizing/weight/family to v4 scale: Fraunces serif headlines, Inter body, weight ladder 300/400/500/600/700, sizes h1 32 / h2 24 / h3 18 / body 14 / small 12 / eyebrow 10 (uppercase, tracking 0.18em).

**Prep**
Add to `src/styles/scholarV4.css`:
```
.s4-h2     { font-family:'Fraunces',Georgia,serif; font-size:24px; line-height:1.2; font-weight:600; letter-spacing:-.015em; color:var(--s4-ink); }
.s4-h3     { font-family:'Fraunces',Georgia,serif; font-size:18px; line-height:1.3; font-weight:600; color:var(--s4-ink); }
.s4-body   { font-family:Inter,sans-serif; font-size:14px; line-height:1.55; color:var(--s4-body); }
.s4-small  { font-size:12px; line-height:1.45; color:var(--s4-muted); }
.s4-numeric{ font-variant-numeric:tabular-nums; }
```
`.s4-h1` and `.s4-eyebrow` already exist.

**Sweep** — replace `text-[Npx]` / `text-xl|2xl|3xl|4xl` / explicit `font-serif|font-bold|font-semibold` / `tracking-*` combos that match v4 recipes. Preserve `text-sm`/`text-base` for utilitarian UI (tooltips, badge counts).

**Regression rule**
```js
{ id: 'serif-direct', re: /\bfont-serif\b/g, hint: 'Use .s4-h1/.s4-h2 helper classes' }
```

**Cross-file watch** — `LanguageToggle`, `Header`, `Sidebar` (typography drives icon vertical centering — re-screenshot after font swap). RTL: `Amiri` fallback in `--font-family-serif` must stay.

**Estimated** — ~28 files, ~120 edits.

---

## Phase 4.2 — Spacing & layout grid

**Scope** — 8pt-grid alignment per v4 spec: card padding 32 (light) / 22 (dark), `--s4-shell-gap 32px`, rail width 300, consistent section gaps.

**Approach** — audit `p-*`, `gap-*`, `space-y-*`, `m-*` against v4 patterns (card 32, dense list 16, section 32, hero 48). Promote raw values to token utilities (`p-[var(--s4-card-pad)]`) only where v4 prescribes the exact value; preserve component-local micro-tuning.

**Regression rule**
```js
{ id: 'arbitrary-padding', re: /(?<![-\w])p-\[(?:24|32|48)px\](?![-\w])/g, hint: 'Use var(--s4-card-pad) tokens' }
```

**Cross-file watch** — `Dashboard.tsx` shell sets the grid all child panels inherit; edit last. `BookMode/WidgetContainer.tsx` uses CSS Grid — screenshot before/after.

**Estimated** — ~22 files, ~80 edits.

---

## Phase 4.3 — Shadows & elevation

**Scope** — replace `shadow-sm|md|lg|xl|2xl` with v4 elevation tokens (subtle 1px hairlines + ambient + directional, not Tailwind's default ramp).

**Token prep** — add to `scholarV4.css`:
```
--s4-shadow-hairline: 0 0 0 1px var(--s4-rule);
--s4-shadow-card:     0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.04);
--s4-shadow-modal:    0 8px 32px rgb(0 0 0 / 0.12);
--s4-shadow-floating: 0 12px 40px rgb(0 0 0 / 0.16);
```

**Map** — `shadow-sm`→hairline, `shadow-md`→card, `shadow-lg|xl`→modal, `shadow-2xl`→floating. On-hover elevation deferred to 4.7 motion (translateY micro-lift).

**Regression rule**
```js
{ id: 'tailwind-shadow', re: /(?<![-\w])shadow-(?:sm|md|lg|xl|2xl)(?![-\w])/g, hint: 'Use shadow-[var(--s4-shadow-*)]' }
```

**Cross-file watch** — `Modal`, `ConfirmationModal`, `PromptModal` already swept for radius; re-open carefully, shadow-only edit. `Toast.tsx` elevation matters for z-stack — verify.

**Estimated** — ~30 files, ~60 edits.

---

## Phase 4.4 — Color surfaces & ink hierarchy (single phase, sequential commits)

**Scope** — eliminate hardcoded `text-gray-*`, `bg-white|black`, `text-black`, `border-gray-*`, `bg-slate-*`, etc. Promote to semantic ink / surface tokens.

**Mapping** (built and locked in 4.0 audit doc)
```
text-gray-900  → text-ink dark:text-ink-on-dark
text-gray-600  → text-secondary-ink dark:text-muted-ink-on-dark
text-gray-400  → text-muted-ink dark:text-muted-ink-on-dark
bg-white       → bg-card-light dark:bg-card-dark
border-gray-200→ border-divider dark:border-divider-on-dark
```

**Critical preservation** — semantic state colors (`red|green|yellow|blue-*` for error/success/warn/info) are state, not theme. The 4.0 audit produces an explicit allowlist of state-vs-decoration hits before any edit.

**Regression rule**
```js
{ id: 'raw-neutral', re: /(?<![-\w])(text|bg|border|ring|divide|placeholder)-(gray|slate|zinc|neutral|stone)-\d+(?![-\w])/g, hint: 'Use semantic ink/surface tokens' }
```

**Execution** — one logical phase, but implementation runs in three sequential commits inside this phase (text → backgrounds → borders) for review sanity. All three commits land before the phase's verification gate; allowlist appended once at phase end.

**Cross-file watch** — highest-volume phase (~600 hits expected). `tailwind.config.js` keeps gray scale available — do not remove until sweep complete.

**Estimated** — ~80 files, ~600 edits.

---

## Phase 4.5 — Component shells (button / input / badge / chip)

**Scope** — replace bespoke `<button className="px-4 py-2 bg-... rounded-... border-...">` with `<ScholarButton>` / `<ScholarInput>` / `<ScholarBadge>` primitives (already exist in `src/components/Scholar/`).

**Audit step (inline — no separate approval)**
1. Catalog every bespoke button/input pattern; classify variant (`primary|secondary|ghost|danger|link`) and size (`sm|md|lg`).
2. List any v4 variant the current `ScholarButton.tsx` doesn't cover.
3. Extend `ScholarButton.tsx` variant API with the missing variants in a single prep commit *inside* this phase. Existing call-sites unchanged (additive API).
4. Then sweep.

**Cross-file watch** — `type="submit"`, `disabled`, `aria-*`, `name`, `form` attributes must transfer 1:1. `ScholarButton` must `React.forwardRef` for `<Tooltip>` + `<form>` usage — verify in prep commit. Run `vitest run` after every 5 swept files (highest behavioural-regression risk in the whole phase).

**Regression rule** — none mechanical; rely on grep audit (bespoke `<button` with className containing `px-` AND `rounded-` should approach zero in swept files).

**Estimated** — ~45 files, ~150 edits + 1 primitive prep commit.

---

## Phase 4.6 — Iconography stroke + size normalization

**Scope** — v4 uses 1.6/1.7 stroke-width on 14/16/18/20px icons with round caps + joins. Current code uses lucide-react defaults (stroke 2.0, varied size).

**Approach**
1. Add `<ScholarIcon>` wrapper in `src/components/Scholar/icons/` applying v4 stroke/size defaults to any lucide icon (additive — no existing call-site breaks).
2. Sweep `<Icon className="h-N w-N">` → `<ScholarIcon icon={Icon} size={N} />`.
3. Custom inline SVGs (already used in `ScholarIconButton`) untouched.

**Cross-file watch** — `lucide-react` is in `optimizeDeps.exclude` (vite.config.ts) — leave config alone. `Header.tsx` icons tightly aligned with text baseline — verify after change.

**Estimated** — ~40 files, ~200 edits.

---

## Phase 4.7 — Motion & micro-interactions

**Scope** — standardize transition timing; replace ad-hoc `transition-all duration-150|200|300` with token utilities. Card hover lifts (`hover:-translate-y-px`), keyboard-only focus rings (`focus-visible:` not `focus:`).

**Token prep** — add to `scholarV4.css`:
```
--s4-ease:     cubic-bezier(0.4, 0, 0.2, 1);
--s4-dur-fast: 120ms;
--s4-dur-base: 200ms;
--s4-dur-slow: 320ms;
```

**Regression rule**
```js
{ id: 'transition-all', re: /\btransition-all\b/g, hint: 'Specify props or use var(--s4-ease)' }
```

**Cross-file watch** — animation-driven components (`BrainRush*`, `FlashcardViewer`, `ScholarSkeleton`) — preserve `animate-*` keyframe utilities, touch `transition-*` only. `@media (prefers-reduced-motion)` block in `index.css` must still suppress after sweep.

**Estimated** — ~35 files, ~80 edits.

---

## Phase 4.8 — Dark-mode parity audit

**Scope** — verify every swept file renders correctly under `.dark[data-theme="<family>"]` for all 6 palettes. Catch hardcoded light-only colors that escaped 4.4.

**Approach**
1. Browser screenshot loop: 15 routes × 6 themes × {light, dark} = 180 captures → `/tmp/parity-shots/` (not committed).
2. Diff against `Scholar-v4.jsx` reference panels visually.
3. Per discrepancy: locate offending file/class, fix, re-screenshot.
4. Append `--s4-bg-on-dark` style overrides to `scholarV4.css` if a class needs a different value under `.dark`.

**Cross-file watch** — `ThemeContext.tsx` controls `data-theme` on `<html>`; behavior unchanged. `mem://style/theme-system`: use `getThemeGradient` utility — do not bypass.

**Deliverable** — findings summary in plan results block; screenshots discarded.

**Estimated** — 0–10 file edits (mostly verification after 4.4 + 4.7 leave the codebase clean).

---

## Phase 4.9 — Page-level composition (final polish)

**Scope** — page-shell anatomy: hero placement, section spacing, rail layouts, sticky headers, footer alignment. "Feel" phase — composition not tokens.

**Approach** — per major route, compare live screenshot against v4 reference at 1280×820. Adjust grid templates, max-widths, column gaps, sticky positioning. **No new tokens, no new utilities** — composition only.

**Cross-file watch** — route-level changes can ripple into children. Edit page shell first, verify children still render; only touch children if v4 explicitly differs.

**Estimated** — ~15 files (`Dashboard.tsx`, `LibraryPage.tsx`, `Academics/`, `EduPlayPage.tsx`, `ContentViewPage.tsx`, `HistoryPage.tsx`, `PricingPage.tsx`, `Auth.tsx`, `ShareView.tsx`, `FeedbackPage.tsx`, `Onboarding/`, `NotFound.tsx`), ~40 edits.

---

## Cross-phase guardrails

- Each sub-phase opens with a planning note in `.lovable/plan.md` (frozen file list) and closes with a `docs/SCHOLAR_V4_ISSUES.md` results appendix.
- `scripts/check-token-regressions.cjs` grows by **at most 1 rule + N files per sub-phase**. Never remove rules or files.
- Admin allowlist stays empty across all 9 sub-phases.
- Supabase / edge-functions / database schema untouched (mem core rule).
- No prop API changes to existing Scholar primitives without an explicit prep commit inside the sub-phase (only 4.5 and 4.6 introduce additive APIs).

---

## Verification protocol (run after every sub-phase, blocking)

```
npm run check:tokens                       # extended regression guard
npx tsc -p tsconfig.app.json --noEmit      # 0 errors required
npx eslint <touched files>                 # 0 errors; 3 pre-existing warnings tolerated
bunx vitest run                            # 73/73 tests required
```

Phase exit also requires the results block to record: files touched, edits applied, regression-guard delta (new rule + N allowlisted files), screenshots reviewed for visual regression, and a one-line cross-file safety statement.

---

## Estimated effort & sequencing

| Phase | Files | Edits | Effort | Risk |
|---|---:|---:|---:|---:|
| 4.0 audit | 0 | 0 | 30 min | none |
| 4.1 typography | 28 | ~120 | 25 min | low |
| 4.2 spacing | 22 | ~80 | 20 min | low |
| 4.3 shadows | 30 | ~60 | 15 min | low |
| 4.4 colour (one phase, 3 commits) | 80 | ~600 | 90 min | high |
| 4.5 component shells | 45 | ~150 | 60 min | high |
| 4.6 icons | 40 | ~200 | 30 min | medium |
| 4.7 motion | 35 | ~80 | 20 min | low |
| 4.8 dark-mode | 0–10 | ~20 | 40 min | medium |
| 4.9 composition | 15 | ~40 | 60 min | medium |
| **total** | **~150 unique** | **~1350** | **~6 h** | — |

Serial execution in the order above: typography first (spacing/shadows depend on type metrics); component shells later (consume token decisions from 4.1–4.4); composition (4.9) last.

---

## Final state after Phase 4

- Allowlist: ~150 files across 9 token-family regression rules.
- Non-Admin codebase: **1:1 parity** with `Scholar-v4.jsx` reference across all 6 palettes × light/dark.
- New tokens added to `scholarV4.css`: typography helpers, shadow tokens, motion tokens.
- Admin (17 files) remains the only outstanding cluster, parked for its own design pass.

Awaiting approval to begin **Phase 4.0 — Parity Audit** (read-only, 0 edits).
