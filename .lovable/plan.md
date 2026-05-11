# Phase 3.12 verification + regression guard + Phase 3.13 plan

## 1. Phase 3.12 verification — PASS

Re-ran the audit gate against all 6 social-cluster files:

| Check | Result |
|---|---|
| Legacy `rounded-(xl\|2xl\|lg\|[12px])` in 6 files | **0 hits** |
| `from-accent-gold to-accent-gold-soft` in 6 files | **0 hits** |
| `rounded-full` preserved (gold avatars + add-friend button) | 4 hits (GroupsPanel, GroupChat, CommentSection, FriendsPanel) ✓ |
| Semantic affordances preserved | `bg-blue-600`×3 in CommentSection, `bg-green-500/10` + `bg-red-500/10` in FriendsPanel ✓ |
| Cross-file contracts | No exported style constants, no `className` props consumed by parents — leaf components only |
| Hook / Supabase / error-logger call-sites | Byte-identical (no logic touched) |

No linter / TS / cross-file issues introduced. Phase 3.12 is clean.

## 2. Regression guard (the step that belongs to 3.12 and must not be skipped)

Add an automated check so legacy radius or gold gradients can never silently re-enter the social cluster (or any already-swept file).

### 2a. Script `scripts/check-token-regressions.cjs`

Single Node script (no new deps). For each entry in a `SWEPT_FILES` allowlist (currently the 6 social files + 3.10/3.11 files already swept), it greps for:

- `\brounded-(xl|2xl|lg|\[12px\])\b`
- `from-accent-gold to-accent-gold-soft`

Exits non-zero with a per-file report on any hit. Reads files via `fs.readFileSync`, no external runtime.

### 2b. Wire into `package.json`

```
"check:tokens": "node scripts/check-token-regressions.cjs",
"quality": "npm run check:tokens && npm run lint && npx tsc --noEmit && ..."
```

Inserts `check:tokens` as the first step in `quality` and `quality:quick` so CI / local `npm run quality` blocks regressions before lint/build.

### 2c. Document in `docs/SCHOLAR_V4_ISSUES.md`

Add a short "Token regression guard" section pointing to the script and explaining the allowlist contract (each completed phase appends its file paths).

No source files change in step 2 — guard-only.

## 3. Phase 3.13 — ChatAssistant cluster

### Scope (17 hits, 2 files)

Confirmed via `rg`:

| File | radius hits | gold-gradient hits | `rounded-full` (exempt) |
|---|---:|---:|---:|
| `ChatAssistant/ChatAssistant.tsx` | 6 | 4 | 1 (FAB) |
| `ChatAssistant/GlobalChatAssistant.tsx` | 5 | 4 | 1 (FAB) |
| **Total** | **11** | **8** | 2 |

Hit locations (verified):
- `ChatAssistant.tsx`: FAB (gold gradient + `rounded-full`, gradient-only flatten), header bar (`rounded-t-lg` + gold gradient), suggestion buttons (`rounded-lg`), user-bubble (`rounded-lg` + gold gradient), assistant-bubble (`rounded-lg`), loading bubble (`rounded-lg`), input (`rounded-lg`), send button (`rounded-lg` + gold gradient), outer panel (`rounded-lg`).
- `GlobalChatAssistant.tsx`: FAB (line 496, gold gradient + `rounded-full`), panel (line 512, `rounded-lg`), header (line 523, `rounded-t-lg` + gold gradient), user-bubble (lines 620–622, `rounded-lg` + gold gradient), loading bubble (line 632, `rounded-lg`), input (line 651, `rounded-lg`), send (line 658, `rounded-lg` + gold gradient).

### Substitution rules (identical to 3.10–3.12)

- `rounded-xl` / `rounded-2xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
- `rounded-t-lg` (header) → `rounded-t-[var(--s4-radius-card)]` (preserves directional rounding pattern used in 3.11 modals)
- `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`
- `rounded-full` (FABs) → **untouched**, flatten the gradient only (same exemption as 3.11 OnboardingWizard avatars and 3.12 GroupsPanel/GroupChat/CommentSection)

### Exemptions (to record in `docs/SCHOLAR_V4_ISSUES.md`)

1. Two FAB buttons keep `rounded-full` (pill affordance), gradient flattens to `bg-accent-gold`.
2. Header bars keep directional `rounded-t-*` (top-only rounding); only the radius value swaps to the token.
3. CSS file `ChatAssistant.css` and `GlobalChatAssistant.css` are out of scope (animation keyframes, drag/resize handles — no color/radius tokens to migrate). Verified: no `rounded-*` or gold-gradient classes inside them.

### Cross-file safety

- `ChatAssistant` is consumed by `SummaryView` / `LibraryItemView` / `ShareView` / `HistoryItemView` — props are `summaryText`, `originalText`, `topics`, `medicalMode`, `contextType`, `contextId`; no `className` pass-through, no exported style constants. Visual change only.
- `GlobalChatAssistant` is mounted from `Dashboard.tsx` / `App.tsx` and reads from `ChatContext`; same prop contract analysis — no style API to break.
- No changes to: Supabase edge-function call (`chat-assistant`), `useAuth`, `useI18n`, `useToast`, `ErrorLogger`, `creditUpdated` event dispatch, draggable/resizable handlers, locale JSONs.
- Sed scoped to exactly 2 file paths.

### Audit gate

Against the 2 ChatAssistant files:
- `rg "rounded-(xl|2xl|lg|\[12px\])"` → **0 hits**
- `rg "from-accent-gold to-accent-gold-soft"` → **0 hits**
- `rounded-full` count unchanged (2)
- `rounded-t-lg` → `rounded-t-[var(--s4-radius-card)]` count: 2
- Hook / Supabase / event-dispatch / drag-handler call-sites byte-identical
- 4 locale JSONs parse OK

Plus: **run `npm run check:tokens`** (the new guard from step 2) — must exit 0 against the freshly-extended allowlist that now includes the 2 ChatAssistant files.

### Deliverables

1. `scripts/check-token-regressions.cjs` (new)
2. `package.json` — add `check:tokens` script, prepend to `quality` + `quality:quick`
3. `docs/SCHOLAR_V4_ISSUES.md` — token-regression-guard section + 3.13 exemption notes
4. `src/components/ChatAssistant/ChatAssistant.tsx` — radius + gradient flatten
5. `src/components/ChatAssistant/GlobalChatAssistant.tsx` — radius + gradient flatten
6. `.lovable/plan.md` — Phase 3.13 results block (counts, audit gate including `check:tokens` pass, exemptions, next: 3.14)

Estimated ~8 min (5 for guard + 3 for sweep).
