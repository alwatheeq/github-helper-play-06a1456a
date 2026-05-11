## Phase 4.3 Verification — ✅ CLEAN

- `node scripts/check-token-regressions.cjs` → **133 swept files clean** (Phases 3.10–3.19 + 4.1 + 4.3, all 4 rules pass).
- `rg -P "(?<![-\w])shadow-(?:sm|md|lg|xl|2xl)(?![-\w])" src/components src/pages` (non-Admin) → **0 hits**.
- `var(--s4-shadow-*)` token references in `src/`: **125 usages**, all 4 tokens defined in both `:root` and `.dark` blocks of `src/styles/scholarV4.css`.
- Single benign match remains in `src/index.css:507` — it's the `.hover\:shadow-lg:hover` *rule definition* (Tailwind-escaped global hover override), not a className consumer. Not a regression. Left untouched.
- `tsc --noEmit` clean; `vitest` 73/73; `eslint` 0 errors. Phase 4.3 is closed.

---

## Phase 4.4 — Colour sweep (plan)

Live audit re-run (2026-05-11) reconciles the original 1,368 estimate to **978 hits across 82 files**:

| Bucket | Hits |
|---|---:|
| `text-(gray\|slate)-N` (incl. `text-white` 218, `text-black` <1) | 478 + 218 |
| `bg-(gray\|slate)-N` (incl. `bg-white` 122, `bg-black` 60 — of which 46 are `bg-black/N` overlays) | 255 + 122 + 60 |
| `border-(gray)-N` + `border-white` 9 | 155 + 9 |
| `ring`/`divide`/`placeholder` | 1 |

**Top-pressure files:** `Dashboard/StudyGoalsPage.tsx` (43), `ProfilePage.tsx` (39), `GoalsAndAchievementsPage.tsx` (39), `QuizPage.tsx` (33), `EduPlayPage.tsx` (26), `ManualQuestionBuilder.tsx` (24), `MultiplayerMenu.tsx` (23), `InformationalPage.tsx` (23), `AIQuestionGenerator.tsx` (20), `Common/LoadingSkeleton.tsx` (16).

---

### Prep commit (`tailwind.config.js`)

Tokens already wired: `ink`, `ink-on-dark`, `muted-ink`, `muted-ink-on-dark`, `divider`, `divider-on-dark`, `subtle`, `secondary-ink`, `card-light`, `card-dark`, `page`. Missing: nothing critical — `page-dark` is **not added**; instead the mapping uses bare `bg-page` (`--bg-page` already flips per `[data-theme]` × `.dark`, so no `dark:` variant needed).

Prep step is **read-only verification** (zero application edits): grep every target token in `src/index.css`, confirm both light + dark variants resolve cleanly under all 6 palettes via `[data-theme]` cascade. If a regression-only token gap surfaces during dry-run, add it as a single follow-up commit before 4.4a starts.

---

### Sweep mapping (locked — frozen during execution)

```
text-gray-900|800     → text-ink              dark:text-ink-on-dark
text-gray-700|600     → text-secondary-ink    dark:text-muted-ink-on-dark
text-gray-500|400     → text-muted-ink        dark:text-muted-ink-on-dark
text-gray-300|200|100 → text-muted-ink-on-dark   (these are inverted-surface
                                                  consumers — pre-checked)
bg-white              → bg-card-light         dark:bg-card-dark
bg-gray-50|100|200    → bg-subtle             dark:bg-card-dark
bg-gray-300|400       → bg-subtle             dark:bg-card-dark
bg-gray-600|700|800|900 → bg-card-dark        (already dark — no `dark:` flip)
border-gray-100|200|300 → border-divider      dark:border-divider-on-dark
border-gray-600|700   → border-divider-on-dark
ring-gray-500         → ring-divider
slate-N|zinc-N|neutral-N|stone-N → mapped identically to gray-N of same step
text-black            → text-ink
text-white            → text-ink-on-dark      (context-dependent — see below)
bg-black              → bg-page               (bare only; opacity overlays preserved)
border-white          → border-card-light     (preserve when on coloured surface)
```

**Why `text-gray-100/200/300` map to `text-ink-on-dark` rather than the regular `text-ink`:** in the current codebase these classes only appear on text that sits on the dark sidebar / coloured-surface ancestors (verified by spot-check of the top 5 files). Each consumer line is re-verified in 4.4a.

---

### Context-dependent rules (`text-white` / `bg-black`)

Per-line audit during 4.4a/4.4b. Mechanical sweep is suspended for these two classes; instead a small Node helper enumerates each occurrence and classifies by nearest ancestor `bg-*` token in the same JSX subtree:

- `text-white` over `bg-accent-*` / `bg-red-*` / `bg-green-*` / `bg-primary` / `bg-gold` / any explicit coloured surface → **preserve**. (~140–160 estimated.)
- `text-white` with no coloured-surface ancestor → **sweep to `text-ink-on-dark`**. (~55–70 estimated.)
- `bg-black/N` (opacity-modified, ~46 hits) → **preserve** (modal backdrop / overlay alpha).
- Bare `bg-black` (~14 hits) → **sweep to `bg-page`**.
- `border-white` (9 hits) → manual review; default preserve.

Each context-dependent decision logged with file:line + ancestor surface in `docs/SCHOLAR_V4_ISSUES.md` Phase-4.4 appendix.

---

### Three internal commits (one phase, one verification gate)

1. **4.4a — Text colours.** All `text-(gray|slate|zinc|neutral|stone)-N` + classified `text-white|black`. Est. ~620 hits.
2. **4.4b — Backgrounds.** All `bg-(gray|slate|zinc|neutral|stone)-N` + classified `bg-white|black`. Est. ~340 hits.
3. **4.4c — Borders / rings / dividers / placeholders.** All remaining. Est. ~165 hits.

Each commit is independently `tsc`-clean and `vitest`-green. Cadence: `bunx vitest run` after every 5 files swept. Regression rule + allowlist applied **once** at phase end.

---

### What we do NOT touch

- **State / decoration colours** (`red|green|yellow|blue|amber|orange|emerald|rose-(50…900)`) — semantic UI, preserved verbatim.
- **Coloured-surface foregrounds** (`text-white` on `bg-gold` etc.) — preserved.
- **Opacity overlays** (`bg-black/N`, `bg-white/N`) — decorative, preserved.
- **`src/components/Admin/**`** — parked.
- **`src/contexts/ThemeContext.tsx`** — **specially handled** (see Cross-file safety). String-literal mutations only; `getThemeGradient` signature and return contract unchanged.
- **Primitives** (`Scholar/CourseCard.tsx`, `Scholar/PageHeader.tsx`, `Scholar/ScholarBadge.tsx`, `Scholar/ScholarButton.tsx`, `Scholar/ScholarInput.tsx`, `Scholar/ScholarIconButton.tsx`, `Scholar/MasteryBar.tsx`, `Scholar/ScholarSkeleton.tsx`, `Scholar/ScholarAlert.tsx`, `Scholar/ScholarCard.tsx`) — token-defining surfaces.
- **`src/index.css`, `src/styles/scholarV4.css`, `src/styles/designSystem.css`** — source of truth, untouched.

---

### Cross-file safety

- **`ThemeContext.tsx` (top hit count, ~56)** — `getThemeGradient` returns gradient string literals consumed across Admin + Dashboard (see `mem://style/theme-system`). Plan: sweep only `className` / `style` string fragments where the neutral is a foreground or surface token — leave `from-* via-* to-*` gradient stops untouched. Hand-audit every line. Run targeted ThemeContext consumers (`Dashboard.tsx`, Admin shells) post-commit; verify gradients still render in all 6 palettes × light/dark.
- **`Common/LoadingSkeleton.tsx` (16 hits)** — shimmer keyframe currently animates against `bg-gray-200`. After sweep to `bg-subtle`, re-check the gradient stop produces visible motion in both light and dark. **Mitigation if invisible:** add `--s4-skeleton-shimmer` token in a single follow-up patch within 4.4b (anticipated, not blocker).
- **`Auth/Auth.tsx` confirmation modal blue** — semantic submit-confirm UI → preserved verbatim.
- **Toast variants** (`success`/`error`/`warning`/`info`) — state colours preserved; only surface neutrals swept.
- **`Dashboard/Sidebar.tsx`** — already uses `--s4-sb-*` from Phase 3.16. Verify no residual `text-gray-*` leaks; sweep what's left to `text-ink-on-dark` (sidebar is dark-surface).
- **`MindMap/MindMapView.tsx`, `BookMode/BookModeViewer.tsx`, `Highlighting/HighlightLayer.tsx`** — canvas / SVG rendering layers; ensure colour-string props passed to canvas (not className) aren't accidentally swept.
- **No `t()` / i18n key** edits. **No prop / handler / hook / state / data-flow** changes — className/style-string mutations only.
- **No `dark:` / `hover:` / `focus:` / `group-hover:` variants** on the swept token itself are touched; the *base* token migrates and the `dark:` variant is *added* (per mapping table). Pre-existing `dark:` variants are inspected for conflict before each line is rewritten — if a file already has `dark:bg-card-dark`, the sweep does not double it.
- **Coloured shadows** introduced in 4.3 reference `--s4-shadow-*` only; no neutral-class shadows exist post-4.3.
- **RTL** — Phase 4.1 typography cascade is the only path; 4.4 introduces no font-family or directional CSS.
- **Reduced motion / forced colors** — `src/index.css` media-query blocks untouched.
- **Memory respect** — `mem://constraints/supabase-preservation`, `mem://tech/typescript-config`, `mem://style/theme-system`, `mem://tech/supabase-sdk-compatibility`, `mem://tech/error-handling` observed.

---

### Regression rule (4.4)

```js
{ id: 'raw-neutral',
  re: /(?<![-\w])(?:text|bg|border|ring|divide|placeholder)-(?:gray|slate|zinc|neutral|stone)-\d+(?![-\w])/g,
  hint: 'Use semantic ink/surface tokens (ink, secondary-ink, muted-ink, card-light, card-dark, subtle, divider, page).' }
```

A second informational (non-blocking) audit lists residual `text-white|bg-black` outside the allowlisted coloured-surface contexts — those exceptions land per-file in `docs/SCHOLAR_V4_ISSUES.md` rather than being mechanically banned (false-positives on coloured surfaces would block legitimate uses).

Allowlist: append the ~80 swept files under `// Phase 4.4 (colour sweep)`; final count **~210 files**.

---

### Frozen file list

Generated live at sweep time via `rg -l` (current count: **82 files**). Exclusions enumerated above. Locked when 4.4a opens.

---

### Verification gate (blocking — phase end)

```
node scripts/check-token-regressions.cjs   # ~210 swept files clean (all 5 rules)
npx tsc -p tsconfig.app.json --noEmit      # 0 errors
npx eslint <swept files>                   # 0 errors
bunx vitest run                            # 73/73
```

**Visual smoke:** every route surface (`/auth`, `/onboarding`, `/dashboard`, `/library`, `/pricing`, `/quiz`, `/profile`, `/share`, `/billing`, `/feedback`, `/edu-play`, `/academics`) × 2 palettes (navy-gold, oxblood-cream) × {light, dark}. Focus: no white-on-white / black-on-black under any palette, state colours intact, gradients intact, LoadingSkeleton shimmer visible, modal backdrops still legible.

---

### Phase exit deliverables

1. Three sweep commits (4.4a text, 4.4b bg, 4.4c borders) — className/style-string edits only.
2. `tailwind.config.js` — token audit only (no additions expected).
3. `scripts/check-token-regressions.cjs` — `raw-neutral` rule + ~80 files appended.
4. `docs/SCHOLAR_V4_ISSUES.md` — Phase 4.4 results appendix: per-commit hit count, classified `text-white`/`bg-black` decisions table, deferred-line log, cross-file safety statement, visual smoke summary.
5. `.lovable/plan.md` — Phase 4.4 RESULTS block.

**Estimated:** ~1,125 className mutations across ~80 files + 1 script update + 2 docs. **No new tokens. No CSS file edits. No primitive edits.**

---

### Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| `text-white` on coloured-surface miscalled by ancestor heuristic | Medium | Dry-run classifier dumps file:line + ancestor surface; manual review before 4.4a lands |
| `ThemeContext.tsx` gradient-string fragment swept by accident | Medium | Excluded from mechanical sweep; hand-audit only |
| LoadingSkeleton shimmer invisible after `bg-gray-200 → bg-subtle` | Medium | Visual check in 4.4b; fallback `--s4-skeleton-shimmer` token ready |
| `text-gray-100/200/300` consumer is not actually on dark surface | Low | Per-line confirmation in 4.4a (heuristic-based dry-run) |
| Existing `dark:` variant collides with newly-added `dark:` | Low | Pre-sweep grep per file rejects lines that already carry a `dark:` token on the same property |
| `bg-black/N` overlay accidentally swept | Low | Regex requires no `/N` suffix; manual audit confirms |
| Slate/zinc/neutral/stone mapped identically to gray but semantically different | Very low | Live audit confirms only `bg-slate-700|800` present (2 hits, dark-surface) |

Awaiting approval to begin Phase 4.4a (text colours).
