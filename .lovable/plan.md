## Remaining sweep — Phases 3.18 → 3.20 (Admin parked)

After Phase 3.17, **10 files** remain on the non-Admin side: 8 require code edits, 2 CSS files are audit-only (false positives). Grouped into three small, semantically-coherent phases.

---

## Phase 3.18 — Auth + top-level error/empty states (5 files, 22 radius + 2 gold gradients)

### Inventory (pcre2-confirmed)

| File | legacy radius | gold gradient | `rounded-full` (exempt) | `rounded-md` (exempt) |
|---|---:|---:|---:|---:|
| `src/components/Auth/Auth.tsx` | 7 (L114, 116, 132, 142, 173, 188, 198) | **2** (L104, L198) | 1 | 1 |
| `src/components/AccountSuspended.tsx` | 5 (L76, 91, 107, 126, 137) | 0 | 2 | 0 |
| `src/components/NotFound.tsx` | 3 (L10, 30, 38) | 0 | 1 | 0 |
| `src/components/ErrorBoundary.tsx` | 4 (L70, 86, 102, 110) | 0 | 1 | 0 |
| `src/components/EnvValidator.tsx` | 3 (L11, 26, 34) | 0 | 1 | 0 |
| **Totals** | **22** | **2** | **6** | **1** |

### Substitutions

1. **Radius (all 22 hits)** — `rounded-lg` / `rounded-xl` → `rounded-[var(--s4-radius-card)]`.
2. **Gold gradient L104 (`Auth.tsx`)** — logo badge:
   ```diff
   - <div className="bg-gradient-to-r from-accent-gold to-accent-gold-soft p-3 rounded-md">
   + <div className="bg-accent-gold p-3 rounded-md">
   ```
   `rounded-md` preserved (exempt).
3. **Gold gradient L198 (`Auth.tsx`)** — primary submit button. Both the gradient AND the radius change on this single line:
   ```diff
   - className="... rounded-lg text-white bg-gradient-to-r from-accent-gold to-accent-gold-soft hover:opacity-90 ..."
   + className="... rounded-[var(--s4-radius-card)] text-white bg-accent-gold hover:opacity-90 ..."
   ```

Solid `bg-accent-gold` is the canonical replacement used in earlier social/pricing sweeps (3.10–3.13) — keeps the brand colour token, drops only the gradient stop pair.

### Cross-file safety

- **Auth.tsx** — auth flow (Supabase `signInWithOAuth`, `signUp`, `signInWithPassword`, redirect URLs, error/success state machine) **NOT TOUCHED**. Only className strings mutate.
- **AccountSuspended.tsx, NotFound.tsx** — consumed by router (`App.tsx` routes) — no props/exports change.
- **ErrorBoundary.tsx** — top-level boundary wrapping the app tree. The `componentDidCatch` / `getDerivedStateFromError` / `ErrorLogger` integration is untouched; only the fallback-UI className strings change.
- **EnvValidator.tsx** — Supabase env-var placeholder UI per `mem://tech/supabase-initialization`. No env-var detection logic changes.
- All semantic state palettes (`bg-red-50/900`, `bg-green-50/900`, `bg-blue-50/900`, `bg-gray-50/800`, dark variants, border colors) preserved verbatim — they encode state, not radius.
- Focus-ring utilities (`focus:ring-accent-gold`, `focus:ring-2`) preserved.

### Audit gate

```text
1. legacy radius / directional / gold-gradient on all 5 files                → 0 / 0 / 0
2. rounded-full preserved                                                    → 6
3. rounded-md preserved (Auth L104)                                          → 1
4. npm run check:tokens                                                      → 36 swept file(s) clean
5. Visual smoke: /auth route renders, OAuth + email-password forms intact,
   404 + suspended + env-missing fallbacks render correctly with new radius.
6. git diff --stat                                                           → exactly 6 files
```

### Allowlist append

```js
// Phase 3.18 (auth + top-level fallbacks)
'src/components/Auth/Auth.tsx',
'src/components/AccountSuspended.tsx',
'src/components/NotFound.tsx',
'src/components/ErrorBoundary.tsx',
'src/components/EnvValidator.tsx',
```

---

## Phase 3.19 — Misc primitives + i18n confirmation modal (3 files, 6 radius)

### Inventory

| File | legacy radius | gold | `rounded-full` (exempt) |
|---|---:|---:|---:|
| `src/components/LanguageToggle.tsx` | 2 (L44, 64) | 0 | 0 |
| `src/components/Scholar/ScholarSkeleton.tsx` | 1 (L16, inside `roundedMap`) | 0 | 1 |
| `src/contexts/I18nContext.tsx` | 3 (L151, 161, 171) | 0 | 0 |
| **Totals** | **6** | 0 | **1** |

### Substitutions

1. **`LanguageToggle.tsx` L44 (trigger button) + L64 (dropdown panel)** — `rounded-lg` → `rounded-[var(--s4-radius-card)]`. Pure className edits.

2. **`ScholarSkeleton.tsx` L16** — value inside an internal `roundedMap`:
   ```diff
     const roundedMap = {
       none: 'rounded-none',
       sm: 'rounded-[4px]',
       md: 'rounded-[6px]',
   -   lg: 'rounded-lg',
   +   lg: 'rounded-[var(--s4-radius-card)]',
       full: 'rounded-full',
     };
   ```
   **The `lg` key stays** — public prop API (`rounded?: 'none'|'sm'|'md'|'lg'|'full'`) is unchanged. Callers (`ScholarPreview.tsx`, `HistoryPage.tsx`) pass no `rounded` prop today (default `md`), but any future caller passing `rounded="lg"` still works.

3. **`I18nContext.tsx` L151/161/171** — language-confirmation modal (dialog, cancel button, confirm button). All three `rounded-lg` → `rounded-[var(--s4-radius-card)]`.
   - **Critical**: only className strings inside the modal JSX change. The provider value, the `t()` function, the `LanguageContext` exports, language detection logic, and the localStorage persistence are **NOT TOUCHED**.

### Cross-file safety

- **LanguageToggle** consumed in header surfaces — props (`compact`, default) unchanged.
- **ScholarSkeleton** — `roundedMap` is a module-private const. Only its `lg` value mutates; the key and the public prop type stay identical. Verified callers do not depend on the literal class name string.
- **I18nContext** — provider/context/`useI18n` hook signature unchanged. The `bg-blue-600` confirm button is semantic state colour (modal primary action) — preserved.
- No Supabase, no edge functions, no routes, no business logic, no animation classes touched.

### Audit gate

```text
1. legacy / directional / gold on all 3 files     → 0 / 0 / 0
2. rounded-full preserved                          → 1 (ScholarSkeleton)
3. npm run check:tokens                            → 39 swept file(s) clean
4. Visual smoke:
   - LanguageToggle trigger + dropdown render with new radius
   - Skeleton placeholders in HistoryPage / ScholarPreview render unchanged
     (default size=md uses rounded-[6px], not affected)
   - Language confirmation modal opens with new radius on card + both buttons
5. git diff --stat                                 → exactly 4 files
```

### Allowlist append

```js
// Phase 3.19 (language toggle / skeleton primitive / i18n modal)
'src/components/LanguageToggle.tsx',
'src/components/Scholar/ScholarSkeleton.tsx',
'src/contexts/I18nContext.tsx',
```

---

## Phase 3.20 — CSS audit (verification-only, 0 edits expected)

### Files

| File | matches | action |
|---|---|---|
| `src/index.css` | L358 `border-radius: 0.75rem; /* rounded-xl by default */`, L365 `border-radius: 0.5rem; /* rounded-lg */` | **No edit** — matches are inside CSS comments documenting the rem values of legacy Tailwind utility classes. Confirm the surrounding rule sets the token (`--s4-radius-*` or scoped element) and not a `.rounded-lg`/`.rounded-xl` utility override. |
| `src/styles/designSystem.css` | L45, L72, L98 — all `border-radius: 0.75rem;` with `/* rounded-xl */` comments | **No edit** — these are **token definitions** (the design-system source of truth that defines what `--s4-radius-*` equals). Sweeping them would be circular. |

### Procedure (verification only)

1. Open each file at the cited line numbers.
2. Confirm each `rounded-(lg|xl)` match is inside a `/* … */` CSS comment, not inside a selector or rule body that would emit utility classes.
3. If any match is **not** a comment, escalate as a Phase 3.20-edit (currently expected zero).
4. **Strengthen the regression guard**: extend `scripts/check-token-regressions.cjs` to optionally ignore CSS comment lines so future `npm run check:tokens` runs on these files don't generate noise if/when they're added to the allowlist. *Do not allowlist the CSS files unless the guard is comment-aware* — naively allowlisting would silence real future regressions in the same files.

### Deliverable

- Add a short "CSS audit findings" appendix in `docs/SCHOLAR_V4_ISSUES.md` documenting that the 5 CSS matches are intentional comment annotations on token definitions, with line numbers and verification timestamp.
- No source-file edits expected. If the guard is extended to be comment-aware, that script change is the **only** code change in 3.20.

---

## Global precautions (apply to all three phases)

- **Edits only via `code--line_replace`** — one className substitution per line. No file rewrites.
- **Never touch**: Supabase calls, RLS reasoning, edge functions, routes, `ErrorLogger`, i18n key strings, `t()` calls, business logic, animation/transition classes, semantic state colours (red/green/blue/gray tints), focus-ring utilities, shadow utilities, `dark:` variants.
- **Allowlist ordering**: append new files in the same order they appear in each phase's table so the audit log reads sequentially.
- **Each phase produces 4 deliverables**: source edits, `scripts/check-token-regressions.cjs` block, `docs/SCHOLAR_V4_ISSUES.md` appendix, `.lovable/plan.md` RESULTS block.
- **Admin cluster (17 files, 6 gold gradients) remains parked** until the Admin pages are designed.

## Final state after 3.20

- Allowlist: **39 files** (31 currently + 5 from 3.18 + 3 from 3.19).
- Non-Admin codebase: **0 legacy radius, 0 gold gradients, 0 directional legacy**.
- CSS token-definition files documented as intentionally exempt.
- Regression guard runs green on every commit.

## Estimated effort

- Phase 3.18: ~6 min (22 line edits across 5 files + 2 gradient cleanups).
- Phase 3.19: ~3 min (6 edits across 3 files, one inside an object literal).
- Phase 3.20: ~2 min (read-only audit + doc appendix; optional guard enhancement +5 min).