# Phase 3.11 — Informational / Feedback / Onboarding / Common modals & buttons Token Sweep

## Goal
Replace remaining legacy radius/gradient tokens with Scholar v4 design tokens across the help/onboarding/global-modal surfaces. **No design, layout, behavior, or business-logic changes.** Pure token substitution, identical methodology to phases 3.3–3.10.

## Scope (10 files, 73 hits)

| File | Hits | Notes |
|------|-----:|-------|
| `src/components/Dashboard/InformationalPage.tsx` | 48 | 9 card containers + 6 gold-gradient icon chips + many pastel semantic info panes |
| `src/components/Onboarding/OnboardingWizard.tsx` | 7 | 2× `rounded-full` gold-gradient avatars (gradient sub only) + 5× `rounded-lg` |
| `src/components/Dashboard/FeedbackPage.tsx` | 6 | Form fields, dashed dropzone, image previews, status banners |
| `src/components/Onboarding/PageTutorial.tsx` | 4 | Tutorial card + close/back/next buttons |
| `src/components/Onboarding/LanguageChoicePage.tsx` | 3 | 1× `rounded-full` gold-gradient avatar (gradient sub only) + 2× `rounded-lg` |
| `src/components/Common/Modal.tsx` | 2 | Close-button hit areas |
| `src/components/Common/ConfirmationModal.tsx` | 1 | Modal card surface |
| `src/components/Common/PromptModal.tsx` | 1 | Modal card surface |
| `src/components/Common/Tooltip.tsx` | 1 | Dark popover — **exempt** (see below) |

**Total expected substitutions: ~72 new `var(--s4-radius-card)` tokens + 8 gold-gradient flattenings. 1 line exempted.**

## Substitution rules (unchanged from 3.3–3.10)
- `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
- `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`
- `rounded-md`, `rounded-full`, `rounded` (no suffix) — **left as-is**
- Pastel info panes (`bg-blue-50`, `bg-green-50`, `bg-purple-50`, `bg-orange-50`, `bg-red-50`, `bg-yellow-50`, `bg-teal-50`, dark counterparts) — colors preserved, only radius substituted

## Data-driven / structural exemptions (preserve byte-identical, flag in `docs/SCHOLAR_V4_ISSUES.md`)
1. **`Common/Tooltip.tsx:25`** — `bg-gray-900 … rounded-xl` global tooltip surface. Same rule as `HighlightMenu` / `FreeFormToggle` in Phase 3.10 (dark floating popover). Defer to a Phase 4.x popover-token pass.
2. **InformationalPage non-gold gradient icon chips** —
   - line 89: `bg-gradient-to-r from-green-500 to-emerald-600 … dark:from-green-600 dark:to-emerald-700` (Library section indicator)
   - line 358: `bg-gradient-to-r from-orange-500 to-red-600 … dark:from-orange-600 dark:to-red-700` (Quiz/warning section indicator)
   - These encode section semantics (success/warning), not brand accent. Only the `rounded-lg` on those lines is substituted; the gradient is preserved.
3. **OnboardingWizard `rounded-full` gold avatars** (lines 130, 186) and **LanguageChoicePage `rounded-full` avatar** (line 46) — `rounded-full` stays (circular avatar); the inner gold gradient flattens to `bg-accent-gold`.
4. **FeedbackPage dashed dropzone** (line 398) — `border-2 border-dashed rounded-lg` becomes `border-2 border-dashed rounded-[var(--s4-radius-card)]`; dashed-border treatment preserved (it is a layout primitive, not a brand element).
5. **FeedbackPage `bg-blue-600 … rounded-lg` upload button** (line 425) — blue is the primary input affordance color in this form, not a brand-gold candidate. Radius substituted; color preserved.

## Cross-file safety checks
- `InformationalPage`, `FeedbackPage` are page-level — only imported by `Dashboard.tsx` as lazy routes. No prop contracts touched.
- `OnboardingWizard` mounted by `OnboardingContext.tsx`. `LanguageChoicePage` mounted by `App.tsx`. `PageTutorial` mounted by `usePageTutorial.ts` (consumed by HistoryPage, StudyRoomsPage, LibraryPage, EduPlayPage, AcademicsPage, ProfilePage, QuizPage). **Verify no shared className constants exported from any of these — each file owns its JSX literals.**
- `Common/Modal.tsx`, `ConfirmationModal.tsx`, `PromptModal.tsx`, `Tooltip.tsx` are reused across many sites. They expose only props (`isOpen`, `onClose`, `title`, `children`, etc.) — no className contract. Substituting internal class strings is safe.
- `useConfirm.tsx`, `usePrompt.tsx` (consumers of the two modals) — untouched.
- Supabase calls (`submit-feedback` edge function path via `FeedbackPage`), `useAuth`, `useI18n`, `OnboardingContext` — byte-identical.
- No new imports, no `React.memo` wrappers added/removed, no error-logger metadata changes.

## Execution plan
1. **Edit 9 source files** (Tooltip.tsx skipped — exempt) with precise `sed` / `code--line_replace` per the rules above.
2. **Update `docs/SCHOLAR_V4_ISSUES.md`** — append Phase 3.11 block listing:
   - Tooltip dark-popover exemption
   - InformationalPage non-gold gradient icon chips (green/emerald, orange/red)
   - `rounded-full` gold avatars (gradient sub only)
   - FeedbackPage blue primary-affordance color preserved
3. **Update `.lovable/plan.md`** with Phase 3.11 results and audit-gate snapshot.
4. **Audit gate** (must pass before declaring done):
   - `rg "rounded-(xl|2xl|lg|\[12px\])" <files>` → only the 1 exempted Tooltip line remains
   - `rg "bg-gradient-to-r from-accent-gold to-accent-gold-soft" <files>` → 0
   - `rg "alert\(|window\.confirm\(" <files>` → 0 (FeedbackPage may use toast — verify)
   - Token count: `rg "rounded-\[var\(--s4-radius-card\)\]" <files>` matches expected ~72
   - `node -e "JSON.parse(require('fs').readFileSync('src/locales/<lang>.json'))"` for en/fr/ar/tr → all parse
   - Hook/Supabase/error-logger call-sites: `rg -c "supabase\.from|supabase\.functions\.invoke|ErrorLogger\.error|useAuth\(\)|useI18n\(\)|useConfirm|usePrompt"` byte-identical to pre-sweep
   - TypeScript build (harness auto-runs): green
5. **Spot-verify** diffs visually for the two non-gold gradients in InformationalPage (lines 89, 358) — gradients must remain.

## What this phase explicitly does **not** do
- No layout, spacing, color, typography, or animation changes
- No component restructure, extracting helpers, or consolidating duplicates
- No wiring orphan pages, no behavioral fixes
- No Scholar v4 layout redesign (remains Phase 4.x)
- No edits to hooks (`useConfirm`, `usePrompt`, `usePageTutorial`), contexts (`OnboardingContext`), or Supabase functions
- No replacement of native `confirm()` (flagged from 3.10, separate UX pass)
- Tooltip dark-popover NOT touched (consistent exemption from 3.10)

## Deliverables
- 9 edited source files
- `.lovable/plan.md` updated with Phase 3.11 result block
- `docs/SCHOLAR_V4_ISSUES.md` appended with Phase 3.11 exemptions
- Audit gate green
- Estimated time: ~8 min

## Next after this
Phase 3.12 — Social cluster (GroupsPanel, FriendsPanel, GroupChat, CommentSection, LikeButton, FavoriteButton, ~6 files, ~39 hits).
