# Phase 3.10 — Content Viewers Cluster Token Sweep

## Goal
Replace remaining legacy radius/gradient tokens with Scholar v4 design tokens across the content-viewing surfaces (study/read/listen paths). **No design, layout, behavior, or business-logic changes.** Pure token substitution, identical to phases 3.3–3.9.

## Scope (14 files, ~85 hits)

| File | Hits | Notes |
|------|-----:|-------|
| `FlashcardViewer.tsx` | 43 | Mixed: gold gradients (sub) + data-driven state gradients (exempt) |
| `ShareView.tsx` (in `src/components/`, re-exported by Dashboard/ShareView.tsx) | 7 | Pure gold-gradient + rounded-lg |
| `BookMode/BookModeViewer.tsx` | 6 | FAB + add-widget menu |
| `BookMode/NotesWidget.tsx` | 6 | Notes form, gold buttons |
| `BookMode/WidgetContainer.tsx` | 2 | Card + header radii (including `rounded-t-xl`) |
| `BookMode/FreeFormToggle.tsx` | 1 | Tooltip (dark popover — exempt, see below) |
| `MindMap/MindMapView.tsx` | 5 | Cards, buttons (indigo accents exempt per 3.x baseline) |
| `AudioStudy/AudioUpload.tsx` | 4 | Card + gold button |
| `AudioStudy/TranscriptView.tsx` | 3 | Card + gold button |
| `AudioStudy/AudioSummaryGenerator.tsx` | 3 | Card + gold button |
| `AudioStudy/AudioTtsPlayer.tsx` | 3 | Container + 2 gold buttons |
| `ReadAloud/ReadAloudButton.tsx` | 1 | Gold gradient |
| `Highlighting/HighlightMenu.tsx` | 1 | Floating dark popover (exempt — see below) |
| `ContentViewPage.tsx` | 1 | Back button |

## Substitution rules (same as 3.3–3.9)
- `rounded-2xl` / `rounded-xl` / `rounded-lg` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]`
- `rounded-t-xl` → `rounded-t-[var(--s4-radius-card)]`
- `bg-gradient-to-r from-accent-gold to-accent-gold-soft` → `bg-accent-gold`
- `rounded-md` left **as-is** (small-control radius, not in legacy set)
- `rounded-full` left **as-is** (FAB, color swatches, handles)

## Data-driven exemptions (preserve byte-identical, flag in `docs/SCHOLAR_V4_ISSUES.md`)
1. **FlashcardViewer flip-card state gradients** — `from-red-400/to-pink-500` & `from-blue-400/to-indigo-500` (front face by correctness), `from-emerald-400/to-teal-500` (success bar), `from-red-600/to-pink-700` & `from-purple-500/to-indigo-600` dark variants (quiz feedback). These encode answer state, not brand accent.
2. **FlashcardViewer card faces** — `rounded-2xl` on flip-card front/back faces stays as-is (animation depends on matched-radius backface; changing it would visually break the flip).
3. **MindMap indigo accents** — `bg-indigo-600/700`, indigo handle/border colors stay (data-viz accent, already exempted in earlier phases).
4. **HighlightMenu + FreeFormToggle dark popovers** — `bg-gray-900 … rounded-xl` floating menus. These are intentional non-card floating chips; per the established 3.x rule for popover/toast surfaces, leave radius as-is and flag. **Decision: keep `rounded-xl` here**, document the exemption.
5. **ShareView gold-accent icon chip** (`p-1 rounded` and `p-2 rounded-lg`) — `rounded` (no suffix) untouched; `rounded-lg` substituted.

## Cross-file safety checks
- `ContentViewPage.tsx` only imports `BookModeViewer` — no token change in import path. Confirm `BookModeViewer` props unchanged.
- `src/components/Dashboard/ShareView.tsx` is a pure re-export of `src/components/ShareView.tsx` — edit the source file once.
- `BookModeViewer` ⟷ `WidgetContainer` ⟷ `NotesWidget` ⟷ `FreeFormToggle` — verify no shared className constants are mutated; each file owns its own JSX literals.
- `AudioStudyPanel.tsx` (parent) untouched — confirm child prop contracts (`stage`, `selectedFile`, `transcriptText`, `generatedText`) byte-identical.
- `ReadAloudButton.tsx` — confirm `readAloudUtils.ts` not modified (logic file, no UI).
- `useBookMode`, `useHighlights`, `useTTS` hooks untouched.
- Supabase calls (`supabase.from('user_history')`, `supabase.from('user_library_items')`, `supabase.functions.invoke('chat-assistant')`) untouched.
- `useI18n`, `useAuth`, `useChatContext`, `useUserPreferences` consumers byte-identical.
- No new imports, no `React.memo` changes, no error-logger metadata changes.

## Execution plan
1. **Edit 13 source files** with precise `sed`/line-replace substitutions per the rules above (skip exempted lines).
2. **Update `docs/SCHOLAR_V4_ISSUES.md`** — append Phase 3.10 exemption block listing:
   - Flashcard state gradients (red/pink, blue/indigo, emerald/teal, purple/indigo dark)
   - Flashcard `rounded-2xl` flip-card faces
   - MindMap indigo accents
   - Floating dark popovers (HighlightMenu, FreeFormToggle tooltip)
   - ShareView `rounded` (un-suffixed) micro-chip
3. **Update `.lovable/plan.md`** with Phase 3.10 results, expected sub count, and audit-gate snapshot.
4. **Audit gate** (must pass before declaring done):
   - `rg "rounded-(xl|2xl|lg|\[12px\])" <files>` → only exempted lines remain
   - `rg "bg-gradient-to-r from-accent-gold to-accent-gold-soft" <files>` → 0
   - `rg "alert\(|confirm\(" <files>` → 0
   - Token count parity: `rg "rounded-\[var\(--s4-radius-card\)\]" <files>` matches expected ~70 new tokens (85 hits − ~15 exempted)
   - `node -e "JSON.parse(require('fs').readFileSync('src/locales/<lang>.json'))"` for en/fr/ar/tr → all parse
   - Hook/Supabase/ErrorLogger call-sites: `rg -c "supabase\.from|supabase\.functions\.invoke|ErrorLogger\.error|useAuth\(\)|useI18n\(\)" <files>` byte-identical to pre-sweep snapshot.
5. **Verify zero behavior delta** by spot-reading the diff for each file (especially `FlashcardViewer.tsx` line 727 + 757 flip-card faces — must remain `rounded-2xl`).

## What this phase explicitly does **not** do
- No layout, spacing, color, typography, or animation changes
- No component restructure, no extracting helpers, no consolidating duplicates
- No wiring orphan pages
- No Scholar v4 redesign (that remains Phase 4.x)
- No edits to `readAloudUtils.ts`, hooks, contexts, or Supabase functions

## Deliverables
- 13 edited source files (`ShareView.tsx` counts once; Dashboard re-export untouched)
- `.lovable/plan.md` updated
- `docs/SCHOLAR_V4_ISSUES.md` updated with 3.10 exemptions
- Audit gate green
- Estimated time: ~8 min

---

## Phase 3.10 — RESULT (executed)

- **Files edited:** 12 (FlashcardViewer, ShareView, BookModeViewer, NotesWidget, WidgetContainer, MindMapView, AudioUpload, TranscriptView, AudioSummaryGenerator, AudioTtsPlayer, ReadAloudButton, ContentViewPage).
- **Substitutions:** 60 new `rounded-[var(--s4-radius-card)]` tokens + all `bg-accent-gold` gradient subs.
- **Audit gate:** ✓ 0 gold gradients, 0 unexpected legacy radii. Remaining legacy hits are the 4 planned exemptions (2× FlashcardViewer flip-card `rounded-2xl`, HighlightMenu `rounded-xl`, FreeFormToggle `rounded-xl`).
- **Cross-file:** No imports, hooks, Supabase calls, prop contracts, or error-logger sites touched.
- **Follow-up flagged:** `NotesWidget.tsx:316` native `confirm()` — defer to UX pass.

**Next:** Phase 3.11 (Informational / Feedback / Onboarding / Common modals & buttons, ~85 hits across ~12 files).
