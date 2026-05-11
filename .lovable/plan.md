# Phase 3.7 — Verification

**Methodology recap.** Phase 3.7 was a class-string token sweep (no JSX, copy, props, hook calls, Stripe edge-function payloads, or `SubscriptionGuard` gating logic changed). Two substitutions only:
1. `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
2. `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`

**Audit gate — all green.**

```text
File                                                                 r-[var(--s4-radius-card)]
src/components/Dashboard/BillingHistoryPage.tsx                       1
src/components/Dashboard/SubscriptionManagementPage.tsx              18
src/components/Pricing/PricingPage.tsx                               13
src/components/Pricing/CheckoutPage.tsx                               8
src/components/Pricing/PaymentSuccess.tsx                             4
src/components/Pricing/PaymentCancel.tsx                              4
src/components/Subscription/PersistentSubscriptionModal.tsx           1
src/components/Subscription/SubscriptionGuard.tsx                     1
```

- 0 hits across all 8 files for `rounded-(xl|2xl|lg|[12px])`
- 0 hits for `bg-gradient-to-r from-accent-gold to-accent-gold-soft`
- 0 hits for `alert(` / `window.confirm(`
- All 4 locale JSONs (ar / en / fr / tr) parse OK
- Hook / edge-function call-sites (`useSubscription`, `useCreditStore`, `postSubscribeCredits`, `create-checkout-session`) intact across the 8 files

**Note on counts.** Earlier scoping estimated ~55 hits; actual count landed at 50 because some originally-counted classes turned out to be `rounded-full` (status pills, plan dots) which are intentional exemptions. The audit gate (0 legacy hits remaining) is the source of truth, not the pre-sweep estimate.

**Cross-file safety verified.** No new imports added; `App.tsx` routes, `Dashboard.tsx` lazy mounts, `PersistentModalContext`, `SubscriptionUpsellGateContext`, and Stripe webhook payloads are byte-identical. Data-driven exemptions preserved: plan-tier accent colors on `PricingPage`, "Most popular" highlight ring, invoice status pills (paid/failed/refunded), Stripe success/cancel icons.

**Verdict.** Phase 3.7 is clean. No linter errors, no cross-file regressions, no mishaps.

---

# Phase 3.8 — Notifications / Pomodoro / Credit Widgets Cluster

Same methodology as 3.3 – 3.7. **Layout, JSX, copy, props, `usePomodoroStore` state machine, `useNotifications` polling, `useCreditStore` / `useCredits` selectors, `useFloatingVideoStore` mini-player wiring, and `Header.tsx` consumer call-sites — byte-identical.** Only class-string substitutions.

### Files in scope (7 files, 12 legacy hits)

| File                                                            | Hits | Role                                    |
|-----------------------------------------------------------------|-----:|-----------------------------------------|
| `src/components/Dashboard/NotificationCenter.tsx`               |    3 | Bell dropdown + notification list       |
| `src/components/Dashboard/PomodoroTimer.tsx`                    |    2 | Floating Pomodoro widget + settings     |
| `src/components/Dashboard/LowCreditBanner.tsx`                  |    1 | Global low-credit ribbon                |
| `src/components/Dashboard/LowCreditWarning.tsx`                 |    1 | Inline low-credit warning card          |
| `src/components/Dashboard/InsufficientCreditsModal.tsx`         |    1 | Hard paywall modal                      |
| `src/components/Dashboard/FloatingVideo/MiniPlayer.tsx`         |    1 | Persistent video mini-player chrome     |
| `src/components/Admin/CreditManagementPage.tsx`                 |    3 | Admin credit ops (sibling — see below)  |

**Admin sibling.** `CreditManagementPage.tsx` lives under `Admin/` but it's the only credit-cluster file with legacy hits and it shares the same `useCreditStore` / `creditHelpers` surface. Including it here keeps the "credit widgets" cluster coherent and avoids a stranded one-file phase later. Admin routes are gated by `has_role` so the change has zero non-admin user impact.

**`CreditBalanceWidget.tsx` (already in context) and `FloatingVideoPortal.tsx` are already clean** — no edits needed, listed here so the next AI doesn't re-touch them.

### Substitution rules (identical to 3.3–3.7)
1. `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
2. `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`

Nothing else changes. No `rounded-full` (pills, avatars, dots), no `rounded-none`, no `rounded-[6px]` (already v4-conformant) is touched.

### Data-driven exemptions to preserve (document in `docs/SCHOLAR_V4_ISSUES.md`)
- Notification severity pills (info=blue, warning=amber, error=red, success=green) — `rounded-full` stays
- Pomodoro phase colors (work=accent, short-break=green, long-break=blue) — stay
- Low-credit banner severity ramp (>30%=neutral, 10–30%=amber, <10%=red) — stays (same logic already used in `CreditBalanceWidget`)
- Mini-player drag-handle and close affordances — `rounded-full` stays
- Admin credit ops status badges (granted/revoked/expired) — stay

### Cross-file safety checklist
- `Header.tsx` mounts both `NotificationCenter` and the credit balance — no prop signature changes
- `Dashboard.tsx` lazy mounts `PomodoroTimer`, `LowCreditBanner`, `InsufficientCreditsModal`, `FloatingVideo/*` — no mount-site changes
- `App.tsx` global mounts unchanged
- `usePomodoroStore`, `useFloatingVideoStore`, `useCreditStore`, `useNotifications`, `useCredits` — call-sites byte-identical
- `CreditContext` provider tree unchanged
- No new imports anywhere

### Audit gate (must all pass before phase is marked done)
```text
rg -n "rounded-(xl|2xl|lg|\[12px\])" <7 files>            → 0 hits
rg -n "bg-gradient-to-r from-accent-gold to-accent-gold-soft" <7 files>  → 0 hits
rg -n "alert\(|window\.confirm\(" <7 files>               → 0 hits
node -e "JSON.parse(...)" on ar/en/fr/tr.json             → all OK
rg -c "rounded-\[var\(--s4-radius-card\)\]" <7 files>     → 12 (one per legacy hit)
```

Plus a manual smoke pass: bell dropdown, Pomodoro start/pause/reset, low-credit banner appearance below threshold, insufficient-credits modal CTA, mini-player drag + close, admin credit grant/revoke buttons.

### Out of scope (deferred to later phases)
- Phase 3.9 — Goals / Achievements
- Phase 3.10 — Feedback / Informational / Help
- Phase 3.11 — Content viewers (Read / Book / Audio / Mind map / Flashcard)
- Phase 3.12 — ShareView / public viewer
- Phase 4.x — **Visual layout rebuild against `design/templates/Scholar-v4.jsx`** (the actual editorial redesign — separate track from the token-sweep)
- Any business-logic change to Pomodoro timing, credit thresholds, notification polling, or admin credit ops
- Any new icon, copy, or color palette

### Deliverables
1. 7 files edited with the two substitutions only
2. `.lovable/plan.md` updated with Phase 3.8 entry (files, hit counts, audit gate result)
3. `docs/SCHOLAR_V4_ISSUES.md` updated with the 3.8 data-driven exemptions list above
4. Audit gate output pasted in the closing message

### Important honesty note
**Phase 3.8 will not change how anything *looks* in a meaningful way** — only corner radii and one gradient. The actual Scholar v4 visual redesign (editorial headers, dark generate card, bookshelf, etc. from `design/templates/Scholar-v4.jsx`) is a separate Phase 4.x track that has not started. The 3.x track is consistency plumbing so the future rebuild has a uniform token surface to build on.

### Estimated time
~10 min (scripted sweep + audit + smoke pass).