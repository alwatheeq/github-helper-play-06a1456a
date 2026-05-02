# Wave 7 — Final Theme Token Migration

This is the closing wave. After it, no component will call `getTheme*` helpers, and `ThemeContext` will be reduced to its single legitimate responsibility: persisting the user's selected palette (`currentTheme` / `setTheme`) so CSS variables in `index.css` resolve to the right Scholar palette.

## Scope (5 files)

### 1. `src/components/Dashboard/StudyRoomsPage.tsx` (heavy)
- 44 legacy calls across 7 helpers: `getThemeCardBg`, `getThemeCardBorder`, `getThemeGradient`, `getThemeSubtle`, `getThemeTextPrimary`, `getThemeTextSecondary`, `getThemeTextMuted`.
- Apply the same token map used in waves 5–6:
  - `getThemeCardBg()` → `bg-card-light dark:bg-card-dark`
  - `getThemeCardBorder()` → `border-divider dark:border-divider-on-dark`
  - `getThemeTextPrimary()` → `text-ink dark:text-ink-on-dark`
  - `getThemeTextSecondary()` → `text-secondary-ink dark:text-muted-ink-on-dark`
  - `getThemeTextMuted()` → `text-muted-ink dark:text-muted-ink-on-dark`
  - `getThemeGradient('ui')` → `bg-gradient-to-r from-accent-gold to-accent-gold-soft`
  - `getThemeGradient('bg')` → `bg-accent-gold-soft/20`
  - `getThemeSubtle('ui')` → `bg-accent-gold-soft/20`
  - `getThemeSubtle('bg')` → `bg-accent-gold-soft/10`
- Remove `useTheme` import + destructuring.

### 2. `src/components/Dashboard/SummaryDisplay.tsx` (cosmetic only)
- Single stale comment on line 77 referencing `useTheme`. No code changes; just delete or refresh the comment so the file is clean of legacy mentions.

### 3. `src/components/Dashboard/ProfilePage.tsx` (keep — palette switcher)
- Uses `useTheme()` only to read `currentTheme` and call `setTheme(...)` for the user's palette picker. This is the **legitimate** runtime use of `ThemeContext` and must stay.
- Verify no `getTheme*` styling helpers are used (already confirmed: 0). No code changes; documented as out-of-scope-by-design.

### 4. `src/components/Onboarding/OnboardingWizard.tsx` (keep — palette switcher)
- Same situation: only `currentTheme` + `setTheme`. No styling helpers. No changes.

### 5. `src/pages/ScholarPreview.tsx` (keep — palette previewer)
- Dev/preview page that swaps `currentTheme` to demo palettes. Legitimate use. No changes.

### App.tsx (keep)
- Retains `ThemeProvider` wrapper and `ThemeContext` guard in `AppContent`. Required so `currentTheme` is available to the 3 palette-switcher consumers above. No changes.

## Verification

After edits:
1. `rg -n "getTheme[A-Z]|getBackgroundGradient" src` → must return zero matches anywhere in `src/`.
2. The only remaining `useTheme` consumers must be: `ProfilePage.tsx`, `OnboardingWizard.tsx`, `ScholarPreview.tsx` (palette switchers) and `ThemeContext.tsx` itself.
3. `tsc --noEmit` → 0 errors.
4. `eslint` on the 5 files → no new errors; pre-existing `react-hooks/exhaustive-deps` warnings are legacy debt and remain untouched.
5. Quick visual sanity check on `/dashboard/study-rooms` route via console logs to confirm no runtime errors.

## Out of scope (deferred / by design)

- Removing `getTheme*` helper functions from `ThemeContext.tsx`. They are no longer called anywhere after this wave, but deleting them is a separate cleanup PR (Wave 8 candidate) so this wave stays focused on consumers.
- Removing the legacy color tokens from `tailwind.config.js` safelist — also deferred to a dedicated cleanup pass.

## Cadence

Single batch — StudyRoomsPage is the only substantial file. The other 4 are zero- or one-line touch-ups. Reply **"go"** to execute.
