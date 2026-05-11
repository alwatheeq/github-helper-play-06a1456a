## Phase 3.12 — Social cluster token sweep

Mechanical token substitution across 6 files. No layout, color, animation, business-logic, or import changes. Same rules as Phase 3.10/3.11.

### Scope (40 hits, 6 files)

| File | Hits | Notes |
|------|-----:|-------|
| `Social/GroupsPanel.tsx` | 13 | 4 card `rounded-xl`, 8 `rounded-lg` (inputs, buttons, member chips, QR wrapper), 1 gold-gradient member avatar (`rounded-full`, gradient-only flatten) |
| `Social/FriendsPanel.tsx` | 12 | 3 card `rounded-xl`, 8 `rounded-lg` (search input, list rows, accept/decline icon buttons), 1 gold-gradient "Add" button (radius + gradient flatten) |
| `Social/GroupChat.tsx` | 7 | 5 `rounded-xl/lg` (header button, system row, input, send button, chat bubble), 1 gold-gradient peer avatar (`rounded-full`, gradient-only flatten) |
| `CommentSection.tsx` | 10 | 1 gold-gradient commenter avatar (`rounded-full`, gradient-only flatten), 9 `rounded-lg` (textareas, sort select, post/cancel buttons) |
| `LikeButton.tsx` | 1 | `rounded-lg` hit area |
| `FavoriteButton.tsx` | 1 | `rounded-lg` hit area |

### Substitution rules (identical to 3.10/3.11)

- `rounded-xl` / `rounded-2xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
- `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`
- `rounded-full`, `rounded-md`, bare `rounded` → **untouched**
- Semantic colors preserved: `bg-blue-600` (primary affordance in CommentSection), `bg-green-500/10` (accept), `bg-red-500/10` (decline), `bg-white` (QR background in GroupsPanel), `bg-accent-gold-soft/20` pastel surfaces

### Exemptions (recorded in `docs/SCHOLAR_V4_ISSUES.md`)

1. **Gold avatars with `rounded-full`** (GroupsPanel:435, GroupChat:273, CommentSection:282) — `rounded-full` stays, gradient flattens to `bg-accent-gold` (same pattern as 3.11 OnboardingWizard avatars).
2. **GroupChat peer-bubble avatar** uses a ternary; only the peer branch is a `from-accent-gold to-accent-gold-soft` gradient — flatten that one branch.
3. **CommentSection primary affordance** `bg-blue-600` preserved (same convention as FeedbackPage in 3.11).
4. **FriendsPanel green/red icon-button tints** preserved as semantic accept/decline affordances.

### Cross-file safety

- All 6 files are leaf components: `GroupsPanel`, `FriendsPanel`, `GroupChat` rendered only by `Dashboard.tsx`; `CommentSection`, `LikeButton`, `FavoriteButton` consumed by content cards — no `className` prop contracts, no exported style constants.
- No changes to Supabase realtime channels, `useAuth`, `useI18n`, props, hooks, error-logger metadata, locale JSONs.
- Sed-based substitution scoped to the 6 file paths; no global replace.

### Audit gate

- `rg "rounded-(xl|2xl|lg|\[12px\])"` against the 6 files → **0 hits**
- `rg "from-accent-gold to-accent-gold-soft"` against the 6 files → **0 hits**
- `rounded-full` count unchanged
- `bg-blue-600`, `bg-green-500/10`, `bg-red-500/10`, `bg-white` counts unchanged
- 4 locale JSONs parse OK
- Hook / Supabase / error-logger call-sites byte-identical

### Deliverables

- 6 source files edited
- `.lovable/plan.md` — Phase 3.12 results block (count, audit gate, exemptions, next: 3.13 ChatAssistant)
- `docs/SCHOLAR_V4_ISSUES.md` — 3.12 exemption notes (gold `rounded-full` avatars, CommentSection blue affordance, FriendsPanel green/red affordances)

Estimated ~6 min.