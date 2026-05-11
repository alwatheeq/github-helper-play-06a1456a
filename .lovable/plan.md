## 1. Phase 3.14 verification — RESULTS (clean)

- `npm run check:tokens` → `✓ 21 swept file(s) clean.`
- Cluster scan across `src/components/Pricing/**` and `src/components/Subscription/PersistentSubscriptionModal.tsx`:
  - legacy radius `rounded-(xl|2xl|lg|[12px])` → 0
  - `from-accent-gold to-accent-gold-soft` → 0
  - directional `rounded-(t|b|l|r|tl|tr|bl|br)-(xl|2xl|lg)` → 0
  - Exemptions intact: 4× `rounded-full` (icon halos + theme toggle), 1× `rounded-md` (PersistentSubscriptionModal icon backdrop)
- Cross-file: no edits to `useSubscription`, `useCredits`, `useFeatureAccess`, `useAuth`, `PersistentModalContext`, `verifySubscriptionCreditsAfterCheckout`, `SUBSCRIPTION_PROCESSING_PAYWALL_SESSION_KEY`, edge functions (`create-checkout-session`, `stripe-webhook`), routes, or locale keys.
- Diff size matches plan: 1 component line, 5-line allowlist insertion, 2 doc appends.

Phase 3.14 is clean — no issues, no cross-file drift, no mishaps.

---

## 2. Phase 3.15 — Library / Folders / ShareView cluster

### Files in scope

| File | legacy radius | gold gradient | directional legacy | tokenized hits | `rounded-full` (exempt) |
|---|---:|---:|---:|---:|---:|
| `src/components/Dashboard/LibraryPage.tsx` | 0 | 0 | 0 | many | 8 (avatars / status chips / spinners) |
| `src/components/Dashboard/ContentViewPage.tsx` | 0 | 0 | 0 | 1 | 0 |
| `src/components/Dashboard/HistoryPage.tsx` | 0 | 0 | 0 | 5 | 0 |
| `src/components/ShareView.tsx` | 0 | 0 | 0 | 6 | 2 (spinner + tag chip) |

There is **no standalone `Folders` component in user space** — folder management is composed inside `LibraryPage.tsx` (Admin's `FoldersManagementPage.tsx` is a separate cluster, out of scope here). Adding `HistoryPage.tsx` because it is the sibling library-navigation surface and benefits from the same regression coverage.

### Findings

All four files are already fully tokenized. They were pre-conformed in earlier passes but were **never added to `SWEPT_FILES`**, so they are unprotected against regression.

Phase 3.15 is therefore a **zero-substitution, pure-guard-extension phase** — the durable win is closing the regression-guard gap, identical in shape to Phase 3.14 (which also landed mostly as allowlist extension).

### Substitutions

None. All audit greps return 0 hits.

### Exemptions to preserve verbatim

- `LibraryPage.tsx`: 8× `rounded-full` — user avatars, status pills, spinner ring, dot indicators (circular by design).
- `ShareView.tsx`:
  - L79 `animate-spin rounded-full … border-accent-gold` — loading spinner geometry.
  - L169 `rounded-full` on `text-xs` tag chip — pill-style tag affordance.
- Semantic state colors (red/green/blue/orange tints) and `bg-accent-gold` / `bg-accent-gold-soft/30` chip tints — affordance/intent, preserve.
- No `rounded-md` in this cluster.

### Cross-file safety checks

1. `useAuth`, `useSubscription`, `useCredits`, `useNotifications`, `useFeatureAccess` — read-only consumers, no signature change.
2. Supabase reads in `LibraryPage` / `HistoryPage` / `ContentViewPage` / `ShareView` (history, content, share-link tables) — untouched. Keeps `.then(null)` + `nullsFirst: false` patterns intact.
3. Edge function `generate-share-link` payload contract — unchanged.
4. Routes (`/library`, `/history`, `/content/:id`, `/share/:token`) — unchanged.
5. `ErrorLogger` calls and metadata shape — untouched.
6. i18n keys — none referenced/modified.
7. No shared component imported by the cluster (e.g. `Common/Card`, `Scholar/ScholarCard`) is in this scope; their tokenization is owned by their own clusters.

### Regression-guard extension

Append to `SWEPT_FILES` in `scripts/check-token-regressions.cjs` under a new `// Phase 3.15 (library / content / history / share cluster)` block:

```js
'src/components/Dashboard/LibraryPage.tsx',
'src/components/Dashboard/ContentViewPage.tsx',
'src/components/Dashboard/HistoryPage.tsx',
'src/components/ShareView.tsx',
```

Order: library-navigation surfaces first (LibraryPage → ContentViewPage → HistoryPage), then the public share surface.

### Audit gate (must all pass before marking 3.15 done)

```text
1. rg "(?<![-\w])rounded-(xl|2xl|lg|\[12px\])(?![-\w])" <4 files>   → 0
2. rg "from-accent-gold to-accent-gold-soft" <4 files>              → 0
3. rg "rounded-(t|b|l|r|tl|tr|bl|br)-(xl|2xl|lg)" <4 files>         → 0
4. rg "rounded-full" <4 files>                                      → 10 (8 LibraryPage + 2 ShareView)
5. npm run check:tokens                                             → 25 swept file(s) clean
6. git diff --stat                                                  → exactly 1 file changed
                                                                      (check-token-regressions.cjs)
```

### Deliverables

1. `scripts/check-token-regressions.cjs` — append 4 files to `SWEPT_FILES` under Phase 3.15 block.
2. `docs/SCHOLAR_V4_ISSUES.md` — append "Phase 3.15 — library / content / history / share cluster" section: file inventory (zero substitutions), exemption rationale (avatars/spinner/tag-chip `rounded-full`), cross-file checks, audit gate results.
3. `.lovable/plan.md` — Phase 3.15 RESULTS block (zero substitutions, allowlist extended to 25, next: Phase 3.16).

### Why this is the right scope and what comes next

- Honestly documenting "no substitutions, guard-only" beats fabricating churn. The cluster is already correct; the gap is enforcement, and that is what we close.
- Keeping `HistoryPage.tsx` in this cluster (rather than a separate phase) reflects how the library-navigation surfaces are used together — single mental model for future maintainers.
- **Phase 3.16 candidates** (to be scoped after 3.15 lands), in priority order based on real substitution work remaining:
  1. `Dashboard/Dashboard.tsx`, `Dashboard/SummaryDisplay.tsx`, `Dashboard/FlashcardViewer.tsx` (core dashboard surfaces with active legacy hits)
  2. `Dashboard/BookMode/FreeFormToggle.tsx`, `Dashboard/Highlighting/HighlightMenu.tsx`
  3. `Common/Tooltip.tsx`, `LanguageToggle.tsx`, `Scholar/ScholarSkeleton.tsx`
  4. Top-level error/empty states: `AccountSuspended.tsx`, `NotFound.tsx`, `ErrorBoundary.tsx`, `EnvValidator.tsx`, `Auth/Auth.tsx`
  Admin cluster (`src/components/Admin/**`) remains a separate, larger phase.

**Estimate:** ~2 min (single file edit + 2 doc appends + guard run).
---

## Phase 3.15 — RESULTS

**Substitutions applied**: 0 (cluster already conformed in earlier passes).

**Regression guard extended**: 4 files appended to `SWEPT_FILES` under `// Phase 3.15 (library / content / history / share cluster)` block (LibraryPage, ContentViewPage, HistoryPage, ShareView).

**Audit gate**:
- `npm run check:tokens` → `✓ 25 swept file(s) clean.`
- legacy radius / gold-gradient / directional legacy → 0 across all 4 files
- `rounded-full` exemptions intact: 10 (8 LibraryPage + 2 ShareView)

**Cross-file safety**: no hook signatures, contexts, Supabase queries, edge-function payloads (`generate-share-link`), routes, locale keys, or business logic modified. Exactly 1 source file changed (`scripts/check-token-regressions.cjs`) + 2 doc appends (this file, SCHOLAR_V4_ISSUES.md).

**Next**: Phase 3.16 — core dashboard surfaces (Dashboard.tsx, SummaryDisplay.tsx, FlashcardViewer.tsx) which have active legacy hits requiring real substitutions.
