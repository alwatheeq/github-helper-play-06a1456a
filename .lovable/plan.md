## 1. Phase 3.15 verification — RESULTS (clean)

- `npm run check:tokens` → `✓ 25 swept file(s) clean.`
- Cluster audit (pcre2-enabled) on `LibraryPage.tsx`, `ContentViewPage.tsx`, `HistoryPage.tsx`, `ShareView.tsx`:
  - legacy radius `rounded-(xl|2xl|lg|[12px])` → **0**
  - `from-accent-gold to-accent-gold-soft` → **0**
  - directional `rounded-(t|b|l|r|tl|tr|bl|br)-(xl|2xl|lg)` → **0**
  - `rounded-full` exemptions preserved → **10** (8 LibraryPage + 2 ShareView), matches plan
- Cross-file: no edits to hooks, contexts, Supabase reads, edge functions, routes, or locale keys; exactly 1 source file changed (`scripts/check-token-regressions.cjs`) plus 2 doc appends.

Phase 3.15 is clean — no linter issues, no cross-file drift, no mishaps.

---

## 2. Phase 3.16 — Core dashboard trio (Dashboard / SummaryDisplay / FlashcardViewer)

### Why this scope

The earlier `Phase 3.16 candidates` list mixed 13 files with ~57 legacy hits across very different domains (core dashboard, error states, auth, common primitives). Bundling them would produce an unreviewable diff and entangle unrelated regression risks. The right move is to keep phases atomic: **3.16 takes the core dashboard trio only**, which is exactly the "priority 1" sub-cluster already named in the prior plan. The remaining 10 files are sequenced in Section 5 below.

### Files in scope and inventory (pcre2-confirmed)

| File | legacy radius | directional legacy | gold gradient | `rounded-full` (exempt) | `rounded-md` (exempt) |
|---|---:|---:|---:|---:|---:|
| `src/components/Dashboard/Dashboard.tsx` | 12 | 0 | 0 | 4 | 0 |
| `src/components/Dashboard/SummaryDisplay.tsx` | 15 | 1 (`rounded-r-lg` L1078) | 0 | 11 | 2 |
| `src/components/Dashboard/FlashcardViewer.tsx` | 2 | 0 | 0 | 10 | 4 |
| **Totals** | **29** | **1** | **0** | **25** | **6** |

### Exact substitutions

All 29 legacy radius hits are `rounded-lg`, `rounded-xl`, or `rounded-2xl` on container cards, dropdown panels, list-row buttons, modals, and the flashcard front/back faces. The canonical mapping is the same one used in every prior phase:

```
rounded-lg   →  rounded-[var(--s4-radius-card)]
rounded-xl   →  rounded-[var(--s4-radius-card)]
rounded-2xl  →  rounded-[var(--s4-radius-card)]
rounded-r-lg →  rounded-r-[var(--s4-radius-card)]   (SummaryDisplay L1078 only)
```

Per-file change targets (line numbers from current source):

- `Dashboard.tsx`: L1542, 1560, 1607, 1617, 1622, 1635, 1644, 1652, 1665, 1699, 1728, 1737 — all `rounded-lg`/`rounded-xl` on icon badge, search input, action menu trigger, dropdown panel, six menu items, error card, and error CTA button.
- `SummaryDisplay.tsx`: L839, 857, 879, 912, 984, 1002, 1021, 1029, 1039, 1106 (`rounded-2xl` modal shell), 1148, 1155, 1178, 1237, 1244 — card shells, action buttons, language/format pickers, modal shell, modal inputs. Plus L1078 `rounded-r-lg` on the error notice strip → `rounded-r-[var(--s4-radius-card)]`.
- `FlashcardViewer.tsx`: L727, 757 — the two `rounded-2xl` flashcard faces (front + back).

### Exemptions to preserve verbatim (do not touch)

- 25× `rounded-full` across the trio — avatars, status dots, spinner rings, circular action buttons, progress pills. Circular by intent.
- 6× `rounded-md` — `SummaryDisplay.tsx` L843, L916 (icon backdrops) and `FlashcardViewer.tsx` L818, L893, L964, L1025 (rating cards). `rounded-md` is the design system's chip/sub-element radius and is intentionally distinct from `--s4-radius-card`; the guard already permits it. These match the same exemption pattern accepted in Phases 3.11 and 3.14.
- Semantic state colors (red/green/orange/indigo/purple tints) on error notices and rating cards — affordance/intent, preserve.
- The `bg-gradient-to-br from-green-…` / `from-orange-…` / `from-indigo-…` gradients in `FlashcardViewer.tsx` are **not** the forbidden gold-gradient pair and remain in scope of the design system; preserve unchanged.

### Cross-file safety checks (must hold)

1. **No hook signatures or contexts changed**: `useAuth`, `useSubscription`, `useCredits`, `useFeatureAccess`, `useNotifications`, `useOnboarding`, `usePageTutorial`, `useBookMode`, `useHighlights`, `ChatContext`, `PersistentModalContext`, `ThemeContext`, `SubscriptionUpsellGateContext` — all read-only consumers.
2. **No business logic changes** in Dashboard.tsx (content generation, share-link flow, save-to-library, folder picker, language picker, delete confirmation), SummaryDisplay.tsx (export, translate, format/length re-generation, modal state), or FlashcardViewer.tsx (SRS algorithm, rating handler, deck navigation, flip animation).
3. **Supabase queries** in all three files — untouched; `.then(null)` + `nullsFirst: false` patterns preserved.
4. **Edge-function payload contracts** (`generate-summary-and-flashcards`, `generate-share-link`, `translate-text`, `translate-quiz-bulk`) — unchanged.
5. **Routes** (`/dashboard`, `/content/:id`, etc.) — unchanged.
6. **i18n keys** — none touched.
7. **`ErrorLogger` calls & metadata shape** — unchanged.
8. **Flip-animation classes** on FlashcardViewer (`backface-hidden`, `rotate-y-180`, `transform-style-3d`) — preserved alongside the radius swap; tokenization must not break the 3D transform stack.
9. **No shared component imports modified** — `Common/Card`, `Common/Modal`, `Scholar/ScholarCard`, `Scholar/ScholarButton` tokenization is owned by their own clusters.

### Regression-guard extension

Append to `SWEPT_FILES` in `scripts/check-token-regressions.cjs` under a new block:

```js
// Phase 3.16 (core dashboard surfaces)
'src/components/Dashboard/Dashboard.tsx',
'src/components/Dashboard/SummaryDisplay.tsx',
'src/components/Dashboard/FlashcardViewer.tsx',
```

### Audit gate (must all pass before marking 3.16 done)

```text
1. rg --pcre2 "(?<![-\w])rounded-(xl|2xl|lg|\[12px\])(?![-\w])" <3 files>   → 0
2. rg "from-accent-gold to-accent-gold-soft" <3 files>                       → 0
3. rg "rounded-(t|b|l|r|tl|tr|bl|br)-(xl|2xl|lg)" <3 files>                  → 0
4. rg "rounded-full" <3 files>                                               → 25 (4 + 11 + 10)
5. rg "rounded-md" <3 files>                                                 → 6  (0 + 2 + 4)
6. npm run check:tokens                                                      → 28 swept file(s) clean
7. Visual smoke test in /preview at 904x583: dashboard renders, summary/flashcard
   modals open with consistent card radius, flashcard flip animation still works.
8. git diff --stat                                                           → exactly 4 files changed
   (Dashboard.tsx, SummaryDisplay.tsx, FlashcardViewer.tsx, check-token-regressions.cjs)
```

### Deliverables

1. `src/components/Dashboard/Dashboard.tsx` — 12 radius substitutions.
2. `src/components/Dashboard/SummaryDisplay.tsx` — 15 radius + 1 directional substitution.
3. `src/components/Dashboard/FlashcardViewer.tsx` — 2 radius substitutions.
4. `scripts/check-token-regressions.cjs` — append 3 files under Phase 3.16 block.
5. `docs/SCHOLAR_V4_ISSUES.md` — Phase 3.16 section: per-file substitution counts, directional case, `rounded-md`/`rounded-full` exemption rationale, cross-file checks, audit gate results.
6. `.lovable/plan.md` — Phase 3.16 RESULTS block.

### Best-practice notes

- Use `code--line_replace` per hit (or per tight block of adjacent hits) — never rewrite whole files. Preserves git blame and minimizes review surface.
- Make all radius edits in a single pass per file, then re-grep that file before moving on. This catches partial-edit drift early.
- Do **not** consolidate radius values into a Tailwind config alias in this phase — that is a separate refactor with its own cross-file blast radius; the inline `var(--s4-radius-card)` is the established Scholar v4 convention.
- Leave the `border-divider` without `border` prefix bug on `SummaryDisplay.tsx` L839, L912, L843 alone — it is pre-existing and out of scope for a radius/gradient phase.

### Estimated effort

~6 minutes: 29+1 line-replace edits across 3 files, 1 allowlist edit, 2 doc appends, 1 guard run, 1 preview smoke check.

---

## 3. Phase 3.16 — out of scope (deferred)

The remaining candidate files have confirmed legacy hits and will be sequenced as:

- **Phase 3.17 — BookMode / Highlighting / Tooltip cluster**: `BookMode/FreeFormToggle.tsx` (1), `Highlighting/HighlightMenu.tsx` (1), `Common/Tooltip.tsx` (1).
- **Phase 3.18 — Auth + top-level error/empty states**: `Auth/Auth.tsx` (7 radius + **2 gold gradients** at L104, L198 — the only remaining gold-gradient hits in the candidate set, requires `bg-gradient-to-r` prefix removal too), `AccountSuspended.tsx` (5), `NotFound.tsx` (3), `ErrorBoundary.tsx` (4), `EnvValidator.tsx` (3).
- **Phase 3.19 — Misc primitives**: `LanguageToggle.tsx` (2), `Scholar/ScholarSkeleton.tsx` (1).
- **Phase 3.20+** — Admin cluster (`src/components/Admin/**`) as its own multi-phase sweep.

Calling these out here so they are not forgotten when 3.16 lands.
---

## Phase 3.16 — RESULTS

**Substitutions applied**: 30 total
- `Dashboard.tsx`: 12 plain radius (`rounded-lg` / `rounded-xl` → `rounded-[var(--s4-radius-card)]`)
- `SummaryDisplay.tsx`: 15 plain + 1 directional (`rounded-r-lg` L1078 → `rounded-r-[var(--s4-radius-card)]`)
- `FlashcardViewer.tsx`: 2 plain (`rounded-2xl` on flashcard front/back faces)

**Regression guard extended**: 3 files appended under `// Phase 3.16 (core dashboard surfaces)`.

**Audit gate**:
- `npm run check:tokens` → `✓ 28 swept file(s) clean.`
- legacy radius / directional legacy / gold-gradient → 0 across all 3 files
- `rounded-full` exemptions preserved: 25 (4 + 11 + 10), matches plan
- `rounded-md` exemptions preserved: 6 (0 + 2 + 4), matches plan
- Token uses: Dashboard 12, SummaryDisplay 16, FlashcardViewer 33 (existing tokens + 2 new) → 30 new + 31 pre-existing

**Cross-file safety**: no hook signatures, contexts, Supabase queries, edge-function payloads, routes, locale keys, business logic, SRS algorithm, flip-animation classes, or shared component imports modified. Exactly 4 source files changed (Dashboard.tsx, SummaryDisplay.tsx, FlashcardViewer.tsx, scripts/check-token-regressions.cjs).

**Next**: Phase 3.17 — BookMode / Highlighting / Tooltip cluster (FreeFormToggle 1, HighlightMenu 1, Tooltip 1).
