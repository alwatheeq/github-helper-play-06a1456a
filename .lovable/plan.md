## 1. Phase 3.13 verification — RESULTS (clean)

Regression guard already in place (`scripts/check-token-regressions.cjs`, wired into `npm run check:tokens` + `quality` + `quality:quick`) and **covers the social cluster** (Phase 3.12 files are already on the allowlist alongside Phase 3.11 and 3.13 files). So the "automated regression checks to prevent legacy radius or gold gradients from reappearing in the social cluster files" is already done — no additional work needed there.

Audit re-run for Phase 3.13:

| File | legacy radius | gold gradient | rounded-full (exempt) | rounded-t-* (preserved) | directional corners (preserved) |
|---|---:|---:|---:|---:|---:|
| `ChatAssistant/ChatAssistant.tsx` | 0 | 0 | 1 (FAB) | 1 | 2 (resize handle `tl`/`tr`) |
| `ChatAssistant/GlobalChatAssistant.tsx` | 0 | 0 | 1 (FAB) | 1 | 2 (resize handle) |

- `npm run check:tokens` → `✓ 16 swept file(s) clean.`
- No cross-file contracts (`ChatContext`, `useChatStore`, props, locale keys, edge-function payloads) were touched.
- No logic, hook order, Supabase call, or error-logger drift.
- Semantic affordances preserved (`focus:ring-accent-gold`, `bg-blue-500` hover tints, `text-white` on gold).

Phase 3.13 is clean.

---

## 2. Phase 3.14 — pricing / subscription / checkout cluster

### Files in scope

| File | legacy radius hits | gold gradient hits | already-tokenized | rounded-full (exempt) | rounded-md (exempt) |
|---|---:|---:|---:|---:|---:|
| `src/components/Pricing/PricingPage.tsx` | 1 (`rounded-t-2xl` line 126) | 0 | 16+ | 1 (theme toggle) | 0 |
| `src/components/Pricing/CheckoutPage.tsx` | 0 | 0 | ~8 | 1 (error icon) | 0 |
| `src/components/Pricing/PaymentSuccess.tsx` | 0 | 0 | 4 | 1 (success icon) | 0 |
| `src/components/Pricing/PaymentCancel.tsx` | 0 | 0 | 4 | 1 (cancel icon) | 0 |
| `src/components/Subscription/PersistentSubscriptionModal.tsx` | 0 | 0 | 1 | 0 | 1 (close-affordance pill) |

**The cluster was largely swept in earlier passes.** Only one substitution remains. The bulk of Phase 3.14 work is **closing the regression-guard gap**: these five files are currently *not* on the `SWEPT_FILES` allowlist, so they aren't protected against re-introduction of legacy patterns.

### Substitution rule (single hit)

`src/components/Pricing/PricingPage.tsx:126`

```diff
- <div className={`p-6 bg-subtle dark:bg-subtle-on-dark rounded-t-2xl`}>
+ <div className={`p-6 bg-subtle dark:bg-subtle-on-dark rounded-t-[var(--s4-radius-card)]`}>
```

This preserves directional behavior (header of a card that uses `rounded-[var(--s4-radius-card)]` on its parent at line 124 + `overflow-hidden`) — same pattern Phase 3.13 used for the ChatAssistant header.

### Exemptions to preserve verbatim

- `rounded-full` on icon halos (`PaymentSuccess` green check, `PaymentCancel` orange X, `CheckoutPage` red error halo, `PricingPage` theme-toggle button) — circular by design.
- `rounded-md` on `PersistentSubscriptionModal:54` icon backdrop — explicit medium-radius affordance distinct from card-radius; out of forbidden-pattern set.
- Semantic affordance colors: `bg-red-100`, `bg-blue-50`, `bg-orange-50`, `bg-green-100` and their dark-mode variants — state/intent colors, not brand-gradient candidates.
- `text-white` on `bg-accent-gold` buttons — intentional contrast pairing.
- Stripe/billing-period business logic, `useSubscription`/`useCredits` hooks, `verifySubscriptionCreditsAfterCheckout`, `SUBSCRIPTION_PROCESSING_PAYWALL_SESSION_KEY`, `ErrorLogger` calls — **not touched**.

### Cross-file safety checks

1. `useSubscription`, `useCredits`, `useFeatureAccess`, `useAuth` — read-only consumers; no signature change.
2. `PersistentModalContext` exports `SUBSCRIPTION_PROCESSING_PAYWALL_SESSION_KEY` consumed by `PaymentSuccess` — not modified.
3. Edge functions `create-checkout-session`, `stripe-webhook` — no client-side payload changes.
4. Routes (`/pricing`, `/profile/subscription`, success/cancel return URLs) — unchanged.
5. `SubscriptionGuard` and `SubscriptionRefreshListener` — share visual idiom with the cluster but are out of scope (separate phase / already aligned).
6. i18n keys — none touched (these pages are English-only copy today; no locale drift).

### Regression-guard extension

Append the five files to `SWEPT_FILES` in `scripts/check-token-regressions.cjs` under a new `// Phase 3.14 (pricing / subscription / checkout cluster)` block, in declaration order matching the table above. Re-run `npm run check:tokens` — must report `✓ 21 swept file(s) clean.`

### Audit gate (must all pass before marking 3.14 done)

```text
1. rg "rounded-(xl|2xl|lg|\[12px\])" <5 files>                       → 0
2. rg "from-accent-gold to-accent-gold-soft" <5 files>               → 0
3. rg "rounded-t-2xl|rounded-b-2xl|rounded-l-2xl|rounded-r-2xl" …    → 0
4. rg "rounded-full" <5 files>                                       → 4 (icon halos + theme toggle)
5. rg "rounded-md" <5 files>                                         → 1 (modal close affordance)
6. npm run check:tokens                                              → 21 files clean
7. git diff --stat                                                   → exactly 2 files changed
                                                                       (PricingPage.tsx, check-token-regressions.cjs)
```

### Deliverables

1. `src/components/Pricing/PricingPage.tsx` — single-line substitution at L126.
2. `scripts/check-token-regressions.cjs` — append 5 files to `SWEPT_FILES`.
3. `docs/SCHOLAR_V4_ISSUES.md` — append "Phase 3.14 — pricing / subscription / checkout cluster" section: file inventory, the lone substitution, exemption rationale (`rounded-full` halos, `rounded-md` modal affordance), audit gate results.
4. `.lovable/plan.md` — Phase 3.14 RESULTS block (counts, audit gate, exemptions, next: Phase 3.15).

### Why this is the right scope

- Substituting only the one drifted class avoids gratuitous diffs; the rest of the cluster already conforms.
- Adding the files to the allowlist now is the durable win: without it, any future contributor edit could silently re-introduce `rounded-xl`/gradient pairs and CI would not catch it.
- Keeps the phase honest — 3.14 is documented as "sweep + guard" rather than overstating the substitution count.

**Estimate:** ~3 min. **Next phase:** 3.15 (Library / Folders / ShareView cluster — to be scoped after 3.14 lands).