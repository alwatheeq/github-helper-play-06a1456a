
# Phase 2 Verification + Phase 3 Plan

## Part A — Phase 2 Verification

I checked every Phase 2 deliverable against the codebase.

### Implementation status
| Item | Status |
|---|---|
| Issue 1: `.dark:root` selector leak | ✅ Fixed — `src/index.css:35` is now `.dark[data-theme="navy-gold"] {` only |
| Issue 2: legacy `.bg-subtle` class collision | ✅ Renamed to `.bg-legacy-subtle` in `designSystem.css`; only Tailwind utility now owns `bg-subtle` (verified by grep) |
| 9 Scholar primitives | ✅ All present in `src/components/Scholar/` with barrel `index.ts` |
| Toast restyle | ✅ `Toast.tsx` uses `bg-card-light/dark`, `border-divider`, accent bar, scholar shadow |
| `LoadingButton` adapter | ✅ Now delegates to `<ScholarButton>` (no more inline `btn-primary` legacy classes) |
| `Card` adapter | ✅ Now delegates to `<ScholarCard>`, no longer reads `useTheme()` |
| `/scholar-preview` route | ✅ Wired in `App.tsx:330` via `lazy()` |
| TS build | ✅ Last build error (`ScholarButton` href cast) was fixed; no errors since |
| Console logs | ✅ Clean — only info-level subscription debug; no errors/warnings from Scholar code |

### Minor observations (NOT blockers — already correct, just documenting)
- `bg-subtle` class is now used in 4 Scholar primitives (`ScholarButton` ghost/secondary hover, `ScholarIconButton` ghost/outline hover) → all read `var(--bg-subtle)` from the theme. Verified.
- `LoadingButton`'s old `success`/`warning` variants now collapse to gold/secondary respectively. This is the intended Scholar trade-off (no green/amber CTAs in the parchment palette). Existing call sites keep working without API change.
- `Card`'s previous shadow was a custom `box-shadow` literal; `ScholarCard` now uses `--scholar-shadow-sm`. Visually equivalent in both modes; lighter on light backgrounds.

**Phase 2 is complete and stable.** Safe to proceed.

---

## Part B — Phase 3 Plan: Sidebar + Top-Nav restyle

Goal: migrate the four chrome surfaces (`Dashboard/Sidebar`, `Dashboard/Header`, `Admin/AdminSidebar`, `Admin/AdminHeader`) onto Scholar role tokens and Scholar primitives. After Phase 3, the page chrome reads only from `--bg-sidebar`, `--bg-card-light/dark`, `--accent-gold`, `--text-primary-*`, `--text-muted-*`, `--divider*`. No more `getThemeCardBg()` / `getThemeSubtle()` Tailwind-class output anywhere in chrome.

### Scope (4 files)

```text
src/components/Dashboard/Sidebar.tsx       278 lines, 19 theme-helper calls
src/components/Dashboard/Header.tsx        420 lines, 44 theme-helper calls (largest)
src/components/Admin/AdminSidebar.tsx      184 lines, 0 theme-helper calls (uses raw gray-*)
src/components/Admin/AdminHeader.tsx        69 lines, 1 stub useTheme() call
```

### Out of scope for Phase 3 (deferred)
- `NotificationCenter`, `CreditBalanceWidget`, `LowCreditBanner` — embedded inside Header but are content widgets, not chrome. Phase 4.
- Theme switcher / language toggle dropdowns inside Header — already function on plain Tailwind classes; will get token-aligned in Phase 4 alongside `ProfilePage`.
- Mobile drawer overlay backdrop — kept on `bg-black/50` (intentional, theme-neutral).

### 3.1 — Dashboard Sidebar (`src/components/Dashboard/Sidebar.tsx`)

**Visual contract:**
- Container: `bg-sidebar text-ink-on-dark` (always dark navy/charcoal, in both light AND dark modes — sidebars in Scholar are inverse). Right border: `border-r border-divider-on-dark`.
- Nav items: default = transparent + `text-muted-ink-on-dark`; hover = `bg-white/5`; active = `bg-accent-gold/15 text-accent-gold` with a 2px gold left rail (`border-l-2 border-accent-gold`).
- Icons: `text-muted-ink-on-dark` default, `text-accent-gold` active.
- Pin/unpin button: `<ScholarIconButton variant="ghost" size="sm">` with custom dark-on-dark color override (`text-muted-ink-on-dark hover:text-ink-on-dark`).
- Section labels (eyebrow caps): `.eyebrow text-muted-ink-on-dark`.
- Hairline dividers between groups: `<ScholarDivider />` with `border-divider-on-dark` override.

**Code changes:**
- Remove the `useTheme()` destructure (`getThemeCardBg`, `getThemeCardBorder`, `getThemeTextPrimary`, `getThemeTextSecondary`, `getThemeTextMuted`, `getThemeSubtle`).
- Replace all 19 helper-call sites with the static class strings above.
- Keep all existing logic intact: `useMouseProximity`, pin state, RTL mirror via `isRtl`, scroll-into-view layout effect, mobile drawer behavior, sidebar-mode preferences, TTS hover speak.
- Active-item detection unchanged — only the Tailwind class output changes.

### 3.2 — Dashboard Header (`src/components/Dashboard/Header.tsx`)

**Visual contract:**
- Container: `bg-card-light dark:bg-card-dark border-b border-divider dark:border-divider-on-dark`. Sticky top, z-40.
- Logo block: `text-ink dark:text-ink-on-dark`, font-display.
- Credit pill / chat token pill: `<ScholarBadge variant="default">` with embedded progress bar — bar uses `bg-accent-gold` over `bg-chip`.
- Subscription tier pill: keep tier color (existing `tierColorClasses`) but wrap in `<ScholarBadge>` for radius/typography parity. Tier-specific bg/text classes preserved.
- Profile dropdown trigger: `<ScholarIconButton variant="ghost">` with avatar.
- Profile dropdown panel: `<ScholarCard variant="elevated" padding="sm">` absolute-positioned. Items inside use `text-ink dark:text-ink-on-dark` + `hover:bg-subtle`.
- Credits dropdown panel: same `<ScholarCard variant="elevated">` shell. Inside: progress bars on `bg-chip` with `bg-accent-gold` fills; section dividers via `<ScholarDivider />`.
- Light/dark toggle: `<ScholarIconButton variant="ghost">` swapping Sun/Moon icons.
- Language switcher: `<ScholarSelect>` (existing native `<select>` swap).
- Sign out button: `<ScholarButton variant="ghost" size="sm" icon={<LogOut/>}>`.

**Code changes:**
- Remove `useTheme()` destructure.
- Replace all 44 helper-call sites.
- Preserve: subscription/credits math (lines 30–67), `getTierDisplayName`/`getTierColor` logic, `tierColorClasses` map, `NotificationCenter` embedding, click-outside handlers for both dropdowns, ErrorLogger calls.
- Wrap dropdowns with `<ScholarCard variant="elevated">` instead of inline `getThemeCardBg() + getThemeCardBorder()`.

### 3.3 — Admin Sidebar (`src/components/Admin/AdminSidebar.tsx`)

Currently uses raw `bg-gray-900`, `border-gray-800`, `text-gray-300` etc. — already inverse-colored, but hard-coded and theme-blind.

**Visual contract:** identical to Dashboard sidebar (3.1) for visual parity across the app.

**Code changes:**
- Replace all `bg-gray-9XX`, `border-gray-8XX`, `text-gray-3XX` with role-token classes (`bg-sidebar`, `border-divider-on-dark`, `text-muted-ink-on-dark`, `text-accent-gold` for active).
- Same active-state pattern (`bg-accent-gold/15 text-accent-gold` + left rail).
- Pin button → `<ScholarIconButton>`.

### 3.4 — Admin Header (`src/components/Admin/AdminHeader.tsx`)

Has the corruption noted at line 22 (`s shadow-[0_2px_8px_rgba(0,0,0,0.08)]hadow-sm` — broken token concatenation, will be fixed). Uses raw `bg-gray-900`, hard-coded colors.

**Visual contract:**
- Container: `bg-card-light dark:bg-card-dark border-b border-divider dark:border-divider-on-dark` (NOT inverse — admin header is normal-mode like dashboard header).
- Shield logo: `text-accent-gold` over `bg-chip` square.
- Title text: `text-ink dark:text-ink-on-dark` font-display.
- Subtitle: `text-muted-ink dark:text-muted-ink-on-dark`.
- Menu toggle, sign-out, user pill: `<ScholarIconButton>` / `<ScholarButton>`.

**Code changes:**
- Fix the corrupted class string.
- Remove the no-op `useTheme()` call.
- Replace hard-coded grays with role tokens.
- Keep the `signOut` + navigate behavior identical.

### 3.5 — App-level background

`src/App.tsx` calls `getBackgroundGradient()` in 4 places to set the page background (lines 91, 105, 119, 222, 250). Phase 3 leaves these alone — gradient classes still resolve correctly. Phase 5 cleanup will remove them once dashboard pages are migrated. **Not changed in Phase 3** to avoid touching unmigrated page contents.

### 3.6 — Self-QA after build

After implementation:
1. Confirm build passes (harness auto-runs).
2. Use `browser--navigate_to_sandbox` to load `/` (main app), then `/admin/login` → verify chrome looks correct.
3. Switch through 3 themes (navy-gold, oxblood-cream, monochrome) × light/dark via the existing theme switcher; confirm:
   - Sidebar stays inverse (always dark) and gold accent updates per palette.
   - Header background flips light↔dark.
   - Active nav item shows gold rail + tinted bg.
   - No layout regressions (no shifted z-indexes, no missing borders).
4. Hover the dashboard sidebar to confirm proximity-open still works.
5. Open the profile dropdown + credits dropdown; confirm they render as elevated cards.
6. Read console — no new errors.
7. Confirm `/scholar-preview` still renders (regression check on primitives).

### Cross-file precautions

- **No public API changes.** All four files keep their existing `Props` interfaces. `Dashboard.tsx` passes `currentView`, `onNavigate`, `isSidebarOpen`, `toggleSidebar` to `Sidebar` — unchanged. `AdminDashboard.tsx` similarly unchanged.
- **No `useTheme()` removal from `ThemeContext`** — many other components still consume it. Only the *call sites* in these 4 files are removed. ThemeContext stays intact until Phase 5 cleanup.
- **Active-route logic preserved verbatim** — risk of breaking nav highlighting is the highest cross-file risk; will diff carefully.
- **RTL preserved** — Dashboard sidebar uses `isRtl` for left/right swap; all class strings will mirror correctly (using `start-`/`end-` Tailwind logical properties where the original used `left-`/`right-`).
- **Mobile drawer preserved** — `isSidebarOpen` + `toggleSidebar` flow untouched.
- **No Supabase / data-fetching code touched.**
- **`tierColorClasses` map kept** — sub status colors (gray/blue/violet/etc.) are *intentional* tier semantics, not theme tokens; Scholar wraps them, doesn't replace them.

### File manifest (Phase 3)

**Edited (4):**
- `src/components/Dashboard/Sidebar.tsx`
- `src/components/Dashboard/Header.tsx`
- `src/components/Admin/AdminSidebar.tsx`
- `src/components/Admin/AdminHeader.tsx`

**Created:** none.

**Untouched:** `ThemeContext`, `App.tsx`, all dashboard pages, all admin pages, Supabase, edge functions, Scholar primitives (already done in Phase 2).

---

## Out of Phase 3 (deferred)

- **Phase 4** — Dashboard hub, Library, Folders, Quiz, Flashcards, Study Rooms, Brain Rush, Pricing, EduPlay, Academics, History, Profile, Feedback, Informational, NotificationCenter, CreditBalanceWidget, all admin pages.
- **Phase 5** — Auth, OnboardingWizard, PageTutorial, modals (Confirmation/Prompt/PersistentSubscription/InsufficientCredits/etc.), GlobalChatAssistant, then ThemeContext legacy-helper cleanup, then `/scholar-preview` route removal.

After Phase 3 lands and you've eyeballed the chrome across 2–3 themes, I'll plan Phase 4 in slices (it's ~20 page-level files; will likely break into 4a Library/Folders/History, 4b Quiz/Flashcards/Brain Rush, 4c Academics/Study Rooms/EduPlay, 4d Pricing/Profile/Admin pages).
