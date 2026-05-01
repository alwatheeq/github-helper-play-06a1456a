
# Wave 3 — Account & Billing Surfaces

Token-only refactor of 8 files. Same locked Phase 4 token mapping as Waves 1–2. No backend, props, or behavior changes.

## Files (smallest-first execution order)

| # | File | Lines | Legacy calls | Banned literals |
|---|------|-------|---|---|
| 1 | `Pricing/PaymentCancel.tsx` | 65 | 2 | 4 |
| 2 | `Pricing/PaymentSuccess.tsx` | 124 | 3 | 7 |
| 3 | `Dashboard/FeedbackPage.tsx` | 545 | 21 | 0 |
| 4 | `Dashboard/BillingHistoryPage.tsx` | 382 | 26 | 2 |
| 5 | `Pricing/PricingPage.tsx` | 311 | 41 | 0 |
| 6 | `Pricing/CheckoutPage.tsx` | 521 | 3 | 8 |
| 7 | `Dashboard/SubscriptionManagementPage.tsx` | 564 | 58 | 0 |
| 8 | `Dashboard/ProfilePage.tsx` | 1646 | 55 | 22 |

Each file is shipped as its own turn. After every file: `tsc --noEmit` + the per-wave checklist must pass before moving on.

## Token mapping (locked, identical to Waves 1–2)

```text
getThemeCardBg()         -> bg-card-light dark:bg-card-dark
getThemeCardBorder()     -> border border-divider dark:border-divider-on-dark
getThemeBorder()         -> border-divider dark:border-divider-on-dark
getThemeTextPrimary()    -> text-ink dark:text-ink-on-dark
getThemeTextSecondary()  -> text-secondary-ink dark:text-secondary-ink-on-dark
getThemeTextMuted()      -> text-muted-ink dark:text-muted-ink-on-dark
getThemeText()           -> text-ink dark:text-ink-on-dark
getThemeFocusRing()      -> focus:ring-focus
getThemeSubtle('ui'|'bg')-> bg-subtle dark:bg-subtle-on-dark
getThemeGradient('ui')   -> bg-gradient-to-r from-accent-gold to-accent-gold-soft

Pre-existing raw gray pairs cleaned in-place:
text-gray-900 dark:text-gray-100   -> text-ink dark:text-ink-on-dark
text-gray-900 dark:text-white      -> text-ink dark:text-ink-on-dark
text-gray-700 dark:text-gray-300   -> text-secondary-ink dark:text-secondary-ink-on-dark
text-gray-800 dark:text-gray-300   -> text-secondary-ink dark:text-secondary-ink-on-dark
bg-gray-100 dark:bg-gray-700       -> bg-subtle dark:bg-subtle-on-dark
border-gray-300 dark:border-gray-600 -> border-divider dark:border-divider-on-dark
bg-white dark:bg-gray-800          -> bg-card-light dark:bg-card-dark
```

No new tokens introduced. If a gap appears mid-wave, pause and add to `index.css` first.

## Protected surfaces (do NOT touch)

1. **Subscription tier palette** in `SubscriptionManagementPage.tsx`:
   - `tierInfo.bgColor` from `getTierDisplayInfo()` helper (lines 209, 218) — hardcoded gradient/colors stay.
   - The `text-white` over `tierInfo.bgColor` stays as-is (white-on-tier-bg is the intended palette).
   - Same rule as Header tier badges from Phases 3–4.

2. **Achievement tier badges** in `ProfilePage.tsx` lines 1599–1606 (bronze/silver/gold/platinum): per user's deferred decision, **migrate them to role tokens** (`bg-subtle text-ink dark:bg-subtle-on-dark dark:text-ink-on-dark`) for now since all four cases were already visually identical. Will leave a TODO comment in the file noting "differentiate per tier in Phase 6 polish" so it isn't lost.

3. **Status / outcome semantic colors** (success-green, danger-red, warn-yellow) for payment confirmations, error states, suspended badges, and verification states — preserved.

4. **Stripe / Paddle / payment-flow logic** — `useSubscription`, checkout session creation, Stripe redirect URLs, webhook listeners, polling cadence, currency formatting — all untouched.

## Cross-file integrity (verified before approval)

- **Public exports unchanged** (verified per file):
  - `PricingPage` keeps `export default` (App.tsx imports it without `.then`).
  - All 7 others keep their named exports (`PaymentCancel`, `PaymentSuccess`, `FeedbackPage`, `BillingHistoryPage`, `CheckoutPage`, `SubscriptionManagementPage`, `ProfilePage`).
- **Lazy boundaries unchanged**: `App.tsx` (lines 28–33) and `Dashboard.tsx` (lines 13–14) keep their existing `lazy(() => import(...).then(m => ({ default: m.X })))` shape.
- **Routing unchanged**: `/pricing`, `/checkout`, `/payment/success`, `/payment/cancel`, `/dashboard/billing`, `/dashboard/subscription` all keep their current `<Route>` definitions and lazy boundaries.
- **No new imports** of `ThemeContext` introduced anywhere.

## Per-file procedure (applied to each turn)

1. Backup to `/tmp/<File>.bak.tsx`.
2. Remove `useTheme` import + the destructure.
3. Run mechanical interpolation + plain replacements (same Python script as Wave 2).
4. Run gray-pair cleanup pass for any banned literals listed in that file's pre-scan.
5. Run banned-literal recheck — must be 0 (except SubscriptionManagementPage tier palette).
6. Run `tsc --noEmit -p tsconfig.app.json` — must be clean.
7. Run `eslint <file>` — only pre-existing warnings allowed; 0 new errors/warnings.
8. Confirm `rg "^export "` output matches the pre-edit signature.
9. Report: lines changed, helpers removed, tokens adopted, any anomalies.

## Wave-level verification (after all 8 files)

Run the same verification I ran for Wave 2:

1. `rg "useTheme\(\)|getTheme[A-Z]\w*\("` across all 8 → 0 (allow only the destructure-removed lines being absent).
2. `rg "cyan-[456]00|blue-[456]00/50|from-cyan|to-blue|text-gray-[789]00 dark:"` → 0 (with the SubscriptionManagementPage tier-bg whitelist documented).
3. `rg "ThemeContext"` against the 8 files → none.
4. `tsc --noEmit` whole project → clean.
5. `eslint` on all 8 → 0 errors.
6. Cross-file: `rg "ProfilePage|SubscriptionManagementPage|BillingHistoryPage|PricingPage|CheckoutPage|PaymentSuccess|PaymentCancel|FeedbackPage" -g '*.ts' -g '*.tsx'` → all consumers still resolve.
7. Public-export signatures match pre-edit.
8. Runtime preview console → no new errors (only DEBUG subscription polling).

## Precautions (carried over from Phase 5 plan)

- No backend / Supabase / RLS / edge-function / webhook touches.
- No `useSubscription`, `useFeatureAccess`, `useCredit` logic edits.
- No router or `Suspense` boundary changes.
- No i18n key changes; RTL spacing preserved.
- No effect-deps "fixes" (existing exhaustive-deps warnings stay as-is).
- One file per turn — no drive-by refactors.
- Tier badge palette (subscription + payment-status semantic colors) preserved.

## Out of scope (deferred to Phase 6)

- Differentiating bronze/silver/gold/platinum achievement colors visually (TODO comment dropped in ProfilePage).
- Any payment-provider migration (Stripe/Paddle BYOK vs built-in) — pure UI refactor, not relevant here.
- `ThemeContext` shim removal — happens in Phase 6 after all callers gone.

## Execution gate

Reply **"start wave 3"** and I'll begin with `PaymentCancel.tsx` (smallest, 65 lines, 2 helpers). One file per turn; you approve each before I move to the next, identical to Wave 2's cadence.

**Wave 3 status: ✅ COMPLETE & verified clean.** All 8 files migrated, 0 legacy helpers, 0 banned literals, exports preserved, lazy boundaries intact, tsc clean.

---

# Wave 4 — Admin Surfaces

Token-only refactor of all Admin pages still carrying legacy helpers OR banned literal pairs from the locked Phase 4 map. Same procedure, same precautions, same locked token mapping as Waves 1–3. No backend, RLS, or admin-permission changes.

## Files (smallest-first execution order)

| # | File | Lines | Legacy calls | Banned literals |
|---|------|-------|---|---|
| 1 | `Admin/BlockUserModal.tsx` | 252 | 0 | 11 |
| 2 | `Admin/OverviewPage.tsx` | 255 | 4 | 4 |
| 3 | `Admin/AdminLogin.tsx` | 318 | 3 | 0 |
| 4 | `Admin/TagsManagementPage.tsx` | 338 | 0 | 4 |
| 5 | `Admin/FoldersManagementPage.tsx` | 346 | 0 | 4 |
| 6 | `Admin/SubscriptionModal.tsx` | 362 | 0 | 11 |
| 7 | `Admin/CreditManagementPage.tsx` | 370 | 0 | 9 |
| 8 | `Admin/TransactionsPage.tsx` | 383 | 3 | 9 |
| 9 | `Admin/TokenUsagePage.tsx` | 408 | 0 | 1 |
| 10 | `Admin/AnalyticsPage.tsx` | 416 | 4 | 8 |
| 11 | `Admin/FeedbackManagementPage.tsx` | 479 | 0 | 11 |
| 12 | `Admin/AuditLogPage.tsx` | 490 | 3 | 33 |
| 13 | `Admin/UserActivityPage.tsx` | 546 | 0 | 19 |
| 14 | `Admin/AdminUsersManagementPage.tsx` | 616 | 3 | 11 |
| 15 | `Admin/UsersPage.tsx` | 1239 | 0 | 16 |

Excluded (already clean, 0 legacy + 0 banned): `AdminDashboard.tsx`, `AdminHeader.tsx`, `AdminRoute.tsx`, `AdminSidebar.tsx`, `AppSettingsPage.tsx`, `SubscriptionsManagementPage.tsx`.

Cadence: ship 1–2 files per turn (user choice). After each turn: `tsc --noEmit` clean + per-file checklist passes.

## Token mapping (locked, identical to Waves 1–3)

Same as Wave 3 — no new tokens. If a gap appears mid-wave, pause and add to `index.css` first.

## Protected surfaces (do NOT touch)

1. **Status / outcome semantic colors** (success-green, danger-red, warn-yellow, info-blue) for admin badges (active / banned / suspended / payment-failed / refunded) — preserved.
2. **Admin role badges** with explicit role colors (super_admin / admin / moderator) if any — preserved.
3. **Admin auth / route guards** (`AdminRoute`, `useAuth`, role checks, RLS-bound queries) — untouched.
4. **Supabase queries, RPC calls, edge-function invocations, audit-log writes** — untouched.
5. **Pagination, sort, filter, search logic** — untouched.
6. **Chart libraries** (recharts/chart.js color palettes if any) — preserved exactly.

## Cross-file integrity (verified before approval)

- Public exports unchanged (named exports for all 15 files).
- Lazy boundaries unchanged: `App.tsx` admin routes (verified pre-flight) keep their existing `lazy(() => import(...).then(m => ({ default: m.X })))` shape.
- No new imports of `ThemeContext` introduced anywhere; remove `useTheme` import + destructure from each migrated file.
- No prop / signature / hook-deps changes.

## Per-file procedure (applied to each turn)

1. Backup to `/tmp/<File>.bak.tsx`.
2. Remove `useTheme` import + destructure.
3. Run mechanical interpolation + plain replacements (same Python script as Wave 3).
4. Run gray-pair cleanup pass for banned literals listed in that file's pre-scan.
5. Run banned-literal recheck — must be 0.
6. Run `tsc --noEmit -p tsconfig.app.json` — must be clean.
7. Confirm `rg "^export "` matches pre-edit signature.
8. Report: lines changed, helpers removed, tokens adopted, anomalies.

## Wave-level verification (after all 15 files)

1. `rg "useTheme\(\)|getTheme[A-Z]\w*\("` across `src/components/Admin/` → 0.
2. `rg` for the 7 banned literal pairs → 0 in `src/components/Admin/`.
3. `rg "ThemeContext"` against the 15 files → 0.
4. `tsc --noEmit` whole project → clean.
5. Cross-file consumer resolution intact (admin routes still resolve in `App.tsx`).
6. Public-export signatures match pre-edit.
7. Runtime preview: admin pages render, no new console errors.

## Precautions (carried over)

- No backend / Supabase / RLS / edge-function / webhook / audit-log touches.
- No admin permission / role-check logic edits.
- No router or `Suspense` boundary changes.
- No i18n key changes; RTL spacing preserved.
- No effect-deps "fixes" (existing exhaustive-deps warnings stay as-is).
- 1–2 files per turn — no drive-by refactors.
- Status / role semantic colors preserved.

## Out of scope (deferred to Phase 6)

- `ThemeContext` shim removal — happens in Phase 6 after all callers gone.
- Visual polish of admin charts / tables.
- Any admin-feature changes (data shape, columns, filters).

