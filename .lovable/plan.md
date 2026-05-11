## Phase 3.6 — Verification

- `rg "rounded-(xl|2xl|lg|\[12px\])|bg-gradient-to-r from-accent-gold|alert\(|window\.confirm\("` on the 2 in-scope files → **0 hits**
- `Dashboard.tsx` lazy import + mount of `ProfilePage` byte-identical
- `UsernameSetupModal` props / RPC / `username_changed_at` cooldown logic untouched
- Locale JSON (en/ar/fr/tr) valid
- Data-driven exemptions preserved as documented

Result: Phase 3.6 is clean. No linter, runtime, or cross-file regressions.

---

## Phase 3.7 — Billing / Subscription / Pricing cluster

Same conservative token-sweep methodology as 3.3 → 3.6. **Layout, JSX, copy, props, hooks, Stripe edge-function calls (`create-checkout-session`, `stripe-webhook`), `useSubscription` / `useCreditStore` state, and `SubscriptionGuard` gating logic — byte-identical.** Only class-string substitutions.

### Files in scope

| File | Lines | Legacy hits | Role |
|------|-------|-------------|------|
| `src/components/Dashboard/BillingHistoryPage.tsx` | 377 | 1 | In-shell billing invoice list |
| `src/components/Dashboard/SubscriptionManagementPage.tsx` | 552 | 21 | In-shell plan / status / cancel |
| `src/components/Pricing/PricingPage.tsx` | 302 | 13 | Out-of-shell plans grid |
| `src/components/Pricing/CheckoutPage.tsx` | 519 | 8 | Out-of-shell checkout wrapper |
| `src/components/Pricing/PaymentSuccess.tsx` | 122 | 4 | Stripe success redirect landing |
| `src/components/Pricing/PaymentCancel.tsx` | 63 | 4 | Stripe cancel redirect landing |
| `src/components/Subscription/PersistentSubscriptionModal.tsx` | 139 | 2 | Global upsell modal (rendered from `PersistentModalContext`) |
| `src/components/Subscription/SubscriptionGuard.tsx` | 101 | 2 | Route-level paywall wrapper |

**Total: 8 files, ~55 hits.**

Indirectly touched (verify only — no edits): `App.tsx` routes for `/pricing`, `/checkout`, `/payment-success`, `/payment-cancel`; `Dashboard.tsx` mount of `BillingHistoryPage` + `SubscriptionManagementPage`; `useSubscription` hook; `useCreditStore`; `PersistentModalContext`; `SubscriptionUpsellGateContext`; `SubscriptionRefreshListener`; edge functions (`create-checkout-session`, `stripe-webhook`, `get-credit-balance`).

### Deliverables

1. **Scripted token sweep** (identical regex to 3.3 – 3.6):
   - `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`
   - `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
   - **No** other class-string changes. **No** JSX restructuring. **No** primitive swaps (`<ScholarCard>`/`<ScholarButton>`). **No** copy / a11y / handler edits. **No** new imports.

2. **Inventory data-driven color exemptions** (preserve as-is, document in `docs/SCHOLAR_V4_ISSUES.md`):
   - Plan-tier accent colors on `PricingPage` cards (Free / Pro / Business gradients) — data-driven per `plan.color`, leave
   - "Most popular" highlight ring + badge — semantic emphasis, leave
   - Invoice status pills on `BillingHistoryPage` (paid = green, failed = red, refunded = gray) — semantic, leave
   - Subscription status badges on `SubscriptionManagementPage` (active / past_due / canceled / trialing) — semantic, leave
   - Stripe success ✓ green icon, cancel ✗ red icon on landing pages — semantic, leave

3. **Cross-file safety checks** (must hold true post-edit):
   - `App.tsx` routes (`/pricing`, `/checkout`, `/payment-success`, `/payment-cancel`) unchanged
   - `Dashboard.tsx` lazy mounts of `BillingHistoryPage` / `SubscriptionManagementPage` unchanged
   - `useSubscription` / `useCreditStore` / `useAuth` call sites identical
   - `PersistentModalContext` + `SubscriptionUpsellGateContext` consumers unchanged
   - `create-checkout-session` invoke payload (`priceId`, `mode`, `successUrl`, `cancelUrl`) byte-identical
   - `stripe-webhook` not touched (server-side, out of scope)
   - `postSubscribeCredits` utility call site unchanged
   - `SubscriptionGuard` gating logic + fallback render unchanged
   - No new imports anywhere

4. **Audit gate at end of 3.7:**
   - `rg "rounded-(xl|2xl|lg|\[12px\])"` on the 8 files → **0 hits**
   - `rg "bg-gradient-to-r from-accent-gold"` on the 8 files → **0 hits**
   - `rg "alert\(|window\.confirm\("` on the 8 files → **0 hits**
   - Locale JSON parse (en/ar/fr/tr) → exit 0
   - Manual smoke (preview):
     - In-shell: Billing tab → invoice list renders; Subscription tab → status card + plan switcher + cancel modal render
     - Out-of-shell: `/pricing` → 3 plan cards render; click → `/checkout` mounts; success/cancel landing pages render

### Cross-file step deliberately carried forward from 3.6

Re-verify `Dashboard.tsx` byte-identical (no drift across phase transitions). Confirm `useSubscription` not mutated (Profile relies on it for tier display — Phase 3.6 boundary integrity).

### Out of scope (deferred)

- Notifications / Pomodoro / Credit widgets (3.8) — `LowCreditBanner`, `LowCreditWarning`, `InsufficientCreditsModal`, `CreditBalanceWidget`, `NotificationCenter`, `PomodoroTimer`
- Goals / Achievements (3.9), Feedback / Informational (3.10), Content viewers (3.11), Share (3.12)
- Stripe webhook / edge function changes — backend wiring, owned by Phase 5
- Issue #12 ledger row "Empty / Failed / Canceled" billing variants — UI already covers these states; ledger flip to 🟢 deferred to Phase 5 review
- Any layout / spacing / color-palette change — **explicitly forbidden by user**

### Best-practice notes

- Single scripted commit (proven safe in 3.3 – 3.6)
- No `<ScholarCard>` swaps on PricingPage / CheckoutPage — Stripe-redirect flow has tight visual contract with Stripe-hosted pages; even semantic-equivalent swaps risk pixel drift
- 8 files in one sweep is the largest batch yet, but mechanics are identical and proven; risk is sub-linear
- Update `.lovable/plan.md` "Phase 3.7 — applied" with hit counts per file
- Update `docs/SCHOLAR_V4_ISSUES.md` exemptions section with the 5 categories above

### Timeline

- Scripted sweep: ~3 min
- Audit + smoke (2 surfaces — in-shell + out-of-shell): ~10 min
- Total: ~13 min

Confirm and I'll run the sweep.