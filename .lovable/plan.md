
# Phase 1 Verification + Complete Phase 2 Implementation Plan

## Part A — Phase 1 Verification

I re-read `src/index.css`, `tailwind.config.js`, `src/contexts/ThemeContext.tsx`, and `src/styles/designSystem.css`. The token foundation is mostly correct, but **three issues** must be fixed before Phase 2 builds on top of it.

### What's correct
- All 6 themes define the full 15-token contract in light + dark.
- Navy & Gold hexes match the spec exactly.
- `tailwind.config.js` exposes role utilities (`bg-page`, `bg-sidebar`, `accent-gold`, `ink`, `subtle`, `chip`, `ring-focus`, etc.).
- `ThemeContext` correctly applies `data-theme="…"` on `<html>` and toggles `.dark`.

### Issues to fix as part of Phase 2

**Issue 1 — `.dark:root` selector leaks Navy dark tokens into all themes.**
`src/index.css` line 36 reads:
```css
.dark[data-theme="navy-gold"], .dark:root { … }
```
The bare `.dark:root` matches *any* dark mode regardless of `data-theme`, so when a user selects e.g. "Forest dark" the Navy dark hexes load on top of the Forest dark block. Effect: dark mode is broken for all 5 non-default themes.
**Fix:** drop the `, .dark:root` half — keep only `.dark[data-theme="navy-gold"]`.

**Issue 2 — Tailwind `bg-subtle` utility collides with a legacy class.**
`src/styles/designSystem.css` defines `.bg-subtle { background-color:#f9fafb }` and `.dark .bg-subtle { background-color:#111827 }`. Tailwind also generates `.bg-subtle { background-color: var(--bg-subtle) }`. The legacy class wins in cascade order, so the new theme-aware utility silently breaks.
**Fix:** rename the legacy class to `.bg-legacy-subtle` + `.bg-legacy-subtle-hover:hover`. Grep + update consumers (none expected, but verified during the edit).

**Issue 3 — `tailwind.config.js` exposes `secondary-ink` but `.lovable/plan.md` referenced it as `text-secondary`.** The actual binding is correct (`secondary-ink` → `var(--text-secondary-dark)`), so no code change. Plan doc was misleading; will be corrected.

---

## Part B — Phase 2: Scholar Primitives (full implementation)

Phase 2 delivers the complete primitive library every later phase composes from. Each primitive reads only role tokens, so all 6 themes × 2 modes work with zero per-component branching.

### 2.0 — Foundation fixes (prerequisites)

| File | Change |
|---|---|
| `src/index.css` | Remove `, .dark:root` from the `[data-theme="navy-gold"]` dark selector (line 36) |
| `src/styles/designSystem.css` | Rename `.bg-subtle` → `.bg-legacy-subtle`, `.bg-subtle-hover:hover` → `.bg-legacy-subtle-hover:hover` (and the `.dark` variants) |
| `src/styles/designSystem.css` | Verify with `rg "bg-subtle"` across `src/` — replace any non-Tailwind consumer (likely zero hits inside Scholar surfaces; legacy admin pages may stay on legacy class) |

### 2.1 — Scholar primitives (`src/components/Scholar/`)

New folder. Each file is a single-purpose, theme-aware primitive that ONLY reads from CSS variables / Tailwind role utilities. No theme branching, no `useTheme()` calls.

| File | Component | What it provides |
|---|---|---|
| `ScholarCard.tsx` | `<ScholarCard>` | `bg-card-light dark:bg-card-dark`, `border border-divider dark:border-divider-on-dark`, `rounded-[6px]`, shadow tokens (`--scholar-shadow-sm` → `-md` on hover). Variants: `default`, `elevated`, `flat`. Padding: `none|sm|md|lg`. Optional `as` prop for `<article>`/`<section>`. |
| `ScholarButton.tsx` | `<ScholarButton>` | Variants: `primary` (`bg-accent-gold`, smart text color via `text-ink-on-dark` for navy/oxblood/forest/copper, `text-ink` override for monochrome via `[data-theme="monochrome"]_&:text-ink-on-dark` selector), `secondary` (transparent + `border-divider`), `ghost`, `danger` (kept red for destructive). Sizes `sm|md|lg`. Loading state with gold `<ScholarSpinner>`. Focus ring uses `ring-2 ring-focus`. Supports `asChild` via slot pattern (manual, no Radix dep) or accepts `href` to render `<a>`. |
| `ScholarInput.tsx` | `<ScholarInput>`, `<ScholarTextarea>`, `<ScholarSelect>` | Three exports in one file. `bg-card-light dark:bg-card-dark`, `border-divider`, `text-ink dark:text-ink-on-dark`, focus → `ring-2 ring-focus border-accent-gold/60`. `error` prop adds red border. `label` + `helperText` + `errorText` props. |
| `ScholarBadge.tsx` | `<ScholarBadge>`, `<ScholarChip>` | Badge: `bg-chip text-ink dark:text-ink-on-dark`. Variants: `default`, `accent` (`bg-accent-gold-soft text-ink`), `success`, `warn`, `danger`. Chip is the same primitive with `removable` + `onRemove` interaction. |
| `ScholarSpinner.tsx` | `<ScholarSpinner>` | Lucide `Loader2` rotating, color `text-accent-gold`. Sizes `sm|md|lg|xl`. `label` prop renders sr-only text for a11y. |
| `ScholarDivider.tsx` | `<ScholarDivider>` | `<hr>` using existing `.hairline` class + `border-divider dark:border-divider-on-dark`. Optional `label` prop renders centered eyebrow text using existing `.eyebrow` class. |
| `ScholarAlert.tsx` | `<ScholarAlert>` | Card-shaped notice. Variants: `info` (gold left bar), `success` (green), `warn` (amber), `danger` (red). Uses `bg-card-light dark:bg-card-dark` body, role-driven left border. |
| `ScholarSkeleton.tsx` | `<ScholarSkeleton>` | Wraps existing `.parchment-shimmer` class. Props: `width`, `height`, `rounded`, `count`. |
| `ScholarIconButton.tsx` | `<ScholarIconButton>` | Square icon-only button — `size` (sm/md/lg), `variant` (ghost/solid), tooltip via existing `<Tooltip>`. |
| `index.ts` | barrel | Re-exports all primitives + types. |

**Why these 9 (not 6):** `ScholarAlert`, `ScholarSkeleton`, and `ScholarIconButton` are required by ≥3 surfaces each in Phases 3–5 (toasts, loading states, sidebar collapse, modals, page tutorials). Including them now means later phases are pure migration with no new primitive work.

### 2.2 — Toast restyle (`src/components/Toast/Toast.tsx`)

Move toasts to Scholar tokens:
- Container: `bg-card-light dark:bg-card-dark`, `rounded-[6px]`, `shadow-[var(--scholar-shadow-md)]`, `border border-divider dark:border-divider-on-dark`.
- Left accent bar: gold for success/info (`bg-accent-gold`), red for error, amber for warn.
- Text: `text-ink dark:text-ink-on-dark` for title, `text-muted-ink dark:text-muted-ink-on-dark` for description.
- Replaces inline gradient/teal classes.

Will read existing `Toast.tsx` first, preserve all behavior (animations, auto-dismiss, queue), restyle only.

### 2.3 — `LoadingButton` adapter (`src/components/Common/LoadingButton.tsx`)

Existing `LoadingButton` is used widely across the app. Rather than break callers, rewrite its internals to delegate to `<ScholarButton loading={…}>`. Public props (`onClick`, `loading`, `variant`, `size`, `icon`) preserved 1:1. Variant mapping:
| LoadingButton variant | ScholarButton variant |
|---|---|
| `primary` | `primary` |
| `secondary` | `secondary` |
| `danger` | `danger` |
| `success` | `primary` (gold; success isn't a brand color in Scholar) — except when explicitly overridden via className |
| `warning` | `secondary` with amber accent override class |

This is a **cross-file** change but contained: one consumer file, no API change.

### 2.4 — `Card` adapter (`src/components/Common/Card.tsx`)

Existing `Card` calls `useTheme().getThemeCardBg()` / `getThemeCardBorder()` which return Tailwind class strings derived from the *legacy* themeDefinitions object. Rewrite internals to render `<ScholarCard>` directly, mapping the `padding` + `hover` props through. Public API unchanged.

This decouples `Card` from the legacy `themeDefinitions` Tailwind-class branch in `ThemeContext`, which is critical because Phase 3 will start removing those branches.

### 2.5 — Dev preview route (`src/pages/ScholarPreview.tsx`)

Temporary route at `/scholar-preview` that renders every primitive in every variant/size, against all 6 themes (theme switcher inline) × light/dark. Used for visual QA only; will be removed at the start of Phase 3. Adding the route in `src/App.tsx`.

### 2.6 — Self-QA after build

After implementation I will:
1. Run the build (harness auto-runs).
2. Use `browser--navigate_to_sandbox` to load `/scholar-preview`, switch through all 6 themes × light/dark, and screenshot each combo to confirm no token leaks (Issue 1 fix verification).
3. Verify `bg-subtle` Tailwind utility actually paints `var(--bg-subtle)` in DevTools (Issue 2 fix verification).
4. Smoke-test one toast trigger to confirm restyle.
5. Confirm no consoles errors and no TS errors.

---

## File Manifest (Phase 2)

**Edited (5):**
- `src/index.css` — selector fix
- `src/styles/designSystem.css` — rename `.bg-subtle` → `.bg-legacy-subtle`
- `src/components/Toast/Toast.tsx` — restyle to Scholar tokens
- `src/components/Common/LoadingButton.tsx` — delegate to `ScholarButton`
- `src/components/Common/Card.tsx` — delegate to `ScholarCard`
- `src/App.tsx` — register `/scholar-preview` route

**Created (11):**
- `src/components/Scholar/ScholarCard.tsx`
- `src/components/Scholar/ScholarButton.tsx`
- `src/components/Scholar/ScholarInput.tsx`
- `src/components/Scholar/ScholarBadge.tsx`
- `src/components/Scholar/ScholarSpinner.tsx`
- `src/components/Scholar/ScholarDivider.tsx`
- `src/components/Scholar/ScholarAlert.tsx`
- `src/components/Scholar/ScholarSkeleton.tsx`
- `src/components/Scholar/ScholarIconButton.tsx`
- `src/components/Scholar/index.ts`
- `src/pages/ScholarPreview.tsx`

**Untouched:** ThemeContext, theme switcher, all dashboard/admin/auth pages, Supabase, edge functions. Migration of those happens in Phases 3–5.

---

## Out of Phase 2 (deferred to later phases, by design)

- Sidebar / top-nav restyle → Phase 3
- Dashboard, Library, Folders, Quiz, Flashcards, Study Rooms, Brain Rush, Pricing → Phase 4
- Auth, OnboardingWizard, PageTutorial, ConfirmationModal, PromptModal, PersistentSubscriptionModal, ChatAssistant → Phase 5
- Removal of legacy gradient helpers (`getUIGradient`, `getBackgroundGradient`) from ThemeContext → Phase 5 cleanup, once all consumers are migrated.

After Phase 2 lands and you've reviewed `/scholar-preview`, I'll plan Phase 3 separately.
