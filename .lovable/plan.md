
# Scholar Redesign — Phase 1 Correction Plan (6 themes, Monochrome kept)

The previous Phase 1 used approximated hex values and the wrong CSS variable names. This plan rewrites the foundation to match the official Scholar specification verbatim — using the exact role-based tokens — while **keeping all 6 themes** (the 5 from the spec plus the existing Monochrome variant).

---

## What's wrong today

1. **Wrong variable names** — `index.css` and `ThemeContext.tsx` emit `--theme-bg-from`, `--theme-accent`, `--theme-primary-from`, etc. The spec mandates role tokens: `--bg-page`, `--bg-sidebar`, `--bg-card-dark`, `--bg-card-light`, `--accent-gold`, `--accent-gold-soft`, `--text-primary-dark`, `--text-primary-light`, `--text-muted-dark`, `--text-muted-light`, `--divider`, `--divider-dark`.
2. **Wrong hex values** — approximations like `#1a2540`, `#d4a84a` instead of the exact spec values (e.g. `#0E1A2B`, `#C8932E`, `#EFE9DC`).
3. **Gold-is-rare rule not enforced** — gold should appear only on active nav, credits pill, primary CTAs, and small progress indicators.

---

## The 6 themes (all kept)

| Key | Name | Source of values |
|---|---|---|
| `navy-gold` (default) | Navy & Gold | spec, exact hexes |
| `oxblood-cream` | Oxblood & Cream | spec, exact hexes |
| `forest-parchment` | Forest & Parchment | spec, exact hexes |
| `ink-blush` | Ink & Blush | spec, exact hexes |
| `copper-charcoal` | Copper & Charcoal | spec, exact hexes (light + dark blocks given) |
| `monochrome` | Monochrome | greyscale derivation, no gold |

Each theme exposes the **same 12-token contract** in light and dark.

---

## Phase 1 — Foundation (rewrite)

### 1. `src/index.css` — emit exact spec tokens

Replace the current `:root` and `[data-theme="..."]` blocks with 6 themes × 2 modes (12 token sets), using the exact hex values from the spec for the 5 named themes and a clean greyscale set for Monochrome. Pattern:

````text
:root, [data-theme="navy-gold"] {
  --bg-page: #EFE9DC;
  --bg-sidebar: #0E1A2B;
  --bg-card-dark: #14233A;
  --bg-card-light: #FFFFFF;
  --accent-gold: #C8932E;
  --accent-gold-soft: #E0B85F;
  --text-primary-dark: #0E1A2B;
  --text-primary-light: #F4EFE2;
  --text-muted-dark: #6B6356;
  --text-muted-light: #9AA5B5;
  --divider: #C9BFA8;
  --divider-dark: #1F3050;
}
.dark[data-theme="navy-gold"] { /* dark-mode hex swap */ }

[data-theme="oxblood-cream"]    { /* spec values */ }
.dark[data-theme="oxblood-cream"] { /* spec values */ }
[data-theme="forest-parchment"] { /* spec values */ }
.dark[data-theme="forest-parchment"] { /* spec values */ }
[data-theme="ink-blush"]        { /* spec values */ }
.dark[data-theme="ink-blush"]   { /* spec values */ }
[data-theme="copper-charcoal"]  { /* spec values */ }
.dark[data-theme="copper-charcoal"] { /* spec values, exact from spec */ }
[data-theme="monochrome"]       { /* greyscale, no gold accents */ }
.dark[data-theme="monochrome"]  { /* greyscale */ }
````

All hex values for the 5 named themes come straight from the provided spec text — no approximations. Monochrome uses a neutral grey ramp and substitutes `--accent-gold` with a mid-grey so the gold-only rule doesn't visually break.

Keep the upright-fonts block, the parchment-shimmer keyframe, and the `em, i, .italic { font-style: normal !important; }` override exactly as they are.

### 2. `tailwind.config.js` — bind Tailwind semantics to the new tokens

Replace the current `theme-*` color extensions with role-based bindings:

````text
colors: {
  'page':              'var(--bg-page)',
  'sidebar':           'var(--bg-sidebar)',
  'card-dark':         'var(--bg-card-dark)',
  'card-light':        'var(--bg-card-light)',
  'accent-gold':       'var(--accent-gold)',
  'accent-gold-soft':  'var(--accent-gold-soft)',
  'ink':               'var(--text-primary-dark)',
  'ink-on-dark':       'var(--text-primary-light)',
  'muted-ink':         'var(--text-muted-dark)',
  'muted-ink-on-dark': 'var(--text-muted-light)',
  'divider':           'var(--divider)',
  'divider-dark-on':   'var(--divider-dark)',
}
````

Components can then use `bg-page`, `bg-sidebar`, `text-ink`, `bg-accent-gold`, `border-divider` directly. The legacy `theme-bg-from` / `theme-accent` keys are kept temporarily as aliases pointing at the new tokens so nothing breaks until phases 3–13 migrate them.

### 3. `src/contexts/ThemeContext.tsx` — 6 themes, correct keys

- Theme keys: `navy-gold` (default), `oxblood-cream`, `forest-parchment`, `ink-blush`, `copper-charcoal`, `monochrome`.
- Update `LEGACY_COLOR_THEME_MAP` so old user prefs migrate cleanly (e.g. `warm-neutrals → copper-charcoal`, `slate-mist → navy-gold`, legacy `monochrome` stays `monochrome`).
- Helper functions (`getThemeGradient`, `getThemeCardBg`, `getThemeCardBorder`, `getThemeTextPrimary`, …) keep their **signatures** but their return values now reference the new token-backed Tailwind classes (e.g. `getThemeCardBg()` returns `'bg-card-light'`). This keeps every existing consumer working without edits.
- `applyTheme()` writes the `data-theme` attribute on `<html>`; CSS handles the rest.

### 4. `src/styles/designSystem.css` — already correct

`.scholar-card`, `.scholar-btn`, hairline, shadow scale stay as-is. They reference `var(--scholar-hairline)` etc. which are independent of the palette tokens.

### 5. `.lovable/plan.md` — keep "6 Scholar Palettes"

Update the palette table so the 5 named themes use the exact spec descriptions; Monochrome row stays.

---

## Gold-is-rare enforcement (carried into Phases 3–14)

When restyling components in later phases, `accent-gold` may **only** appear on:
- the active sidebar nav item,
- the credits/balance pill,
- primary CTAs (one per view max),
- small progress indicators (XP bars, quiz progress).

Every other "highlight" use becomes ink, parchment, navy, or a hairline divider. Monochrome theme uses a neutral grey in place of gold to keep the rule visually consistent.

---

## Phases 2–14 — unchanged

Primitives, app shell, all dashboard pages, admin surfaces, auth/onboarding/pricing, system UI (toasts/modals/loaders), notifications ("THE BULLETIN"), Pomodoro, i18n `scholar.*` namespace in en/ar/fr/tr, and final QA (RTL, mobile, contrast, focus rings, dark-mode parity) all remain as previously approved. Only the foundation tokens they consume change.

---

## Technical notes

- No DB / RPC / edge function changes.
- No GitHub commits triggered manually; review happens in the live preview phase by phase.
- Italic suppression stays enforced at both font-load and CSS level.
- Token-contract guarantee: every helper in `ThemeContext` keeps its signature, so no other file needs to change just because tokens were renamed under the hood.

---

## Order of execution after approval

1. Rewrite `src/index.css` with 6 themes × 2 modes using exact spec hexes (greyscale for Monochrome).
2. Rewrite `tailwind.config.js` color bindings to the role tokens (with legacy aliases).
3. Rewrite `src/contexts/ThemeContext.tsx` (6 themes, helpers updated to return new token-backed classes, legacy migration map).
4. Update `.lovable/plan.md` palette table to reflect spec.
5. Stop and let you verify in the live preview before Phase 2.

Approve to proceed.
