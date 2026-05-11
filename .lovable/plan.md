## Phase 3 verification (3.0 + 3.1)

### Clean

- `WorkshopHeader.tsx` deleted; `WorkshopPanel.tsx` now uses `<PageHeader>` from `Scholar`. No stale imports anywhere (`rg WorkshopHeader` returns zero).
- `HistoryPage.tsx` is fully migrated: `PageHeader`, `ScholarCard`, `ScholarButton`, `ScholarSkeleton`, every container radius routed through `var(--s4-radius-card)` / `var(--s4-radius-btn)`. Status/topic pills use the v4 hairline-chip pattern. Loading + error + empty states all use Scholar primitives.
- `WorkshopPanel.tsx`, `GenerationRail.tsx`, `RecentlyProcessedList.tsx`, `InputForm.tsx` parse cleanly; no broken imports; `todo()` wired through the global listener.
- Locale parity: all `history.*` and `workshop.*` keys present in en/ar/fr/tr.

### Mishaps still open (carry into 3.2 cleanup)

| # | File | Issue | Severity |
|---|------|-------|----------|
| E | `LibraryPage.tsx` | ~20 `rounded-lg` classes, raw `bg-blue-600` / `bg-red-600` action buttons (lines 709, 1240), bespoke shadow strings still hard-coded. Header + outer card converted, **inner toolbar + grid + delete modal not yet token-driven**. | Medium — visible legacy chrome on the most-used page. |
| F | `InputForm.tsx` | 7 `rounded-lg` survivors on inline form controls (textarea L578, error banners L434/L794, meta-strip L678, dropdowns). Not in scope of 3.0 but they violate the token rule. | Low |
| G | `HistoryPage.tsx` L295 | Hard-coded `text-orange-600 / dark:text-orange-400` for the "expires" line. Should use a semantic warning token. | Cosmetic |
| H | `HistoryPage.tsx` L245, L230-234 | Medical badge / icon bubble use raw `bg-red-50 / dark:bg-red-900` instead of the `ScholarBadge` "danger" variant which already exists. | Low |

These four are quick edits and will land at the start of 3.2.

---

## Phase 3.2 — Examinations hub restyle

Convert the entire exam surface to v4 primitives **without touching runtime, scoring, generation, or Supabase calls**. JSX + Tailwind + token classes only, plus `todo()` for any unbound CTA.

### Files in scope

| File | Lines | Role |
|------|-------|------|
| `QuizPage.tsx` | 1808 | Hub: Create / My Quizzes / Explore / History / Global Exams |
| `QuizTakingComponent.tsx` | 646 | Active-quiz wrapper chrome (header, exit modal, timer pill) — runtime stays untouched |
| `AIQuestionGenerator.tsx` | 322 | AI question modal/panel |
| `ManualQuestionBuilder.tsx` | 331 | Manual MCQ/TF/fill builder |
| `GlobalExamDetailModal.tsx` | 213 | Country-exam detail dialog |

Plus carry-over cleanup of mishaps E–H above (`LibraryPage.tsx`, `InputForm.tsx`, `HistoryPage.tsx`).

### Deliverables

1. **Carry-over fixes (E–H)** — single small commit, ≤30 min.
   - `LibraryPage.tsx`: convert remaining `rounded-lg`/`rounded-xl` → `rounded-[var(--s4-radius-card)]`; gradient/blue/red action buttons → `<ScholarButton variant="primary|danger|secondary">`; delete-confirm modal → reuse `useConfirm()` hook (already exists) instead of an inline modal.
   - `InputForm.tsx`: token sweep on textareas, error banners (`<ScholarAlert variant="error">`), meta-strip card → `<ScholarCard padding="md">`.
   - `HistoryPage.tsx`: medical chip → `<ScholarBadge variant="danger">`; expires-on color → `text-accent-gold` for the icon and `text-secondary-ink` for the text (it's informative, not a warning).

2. **`QuizPage.tsx` token + primitive sweep.**
   - Header already uses `<PageHeader>` and `<SectionTabs>` (good — preserved as-is).
   - Replace every `rounded-lg / rounded-xl / rounded-2xl / rounded-[12px]` with `var(--s4-radius-card)` for surfaces and `var(--s4-radius-btn)` for inputs/buttons.
   - Card containers (lines 995–1700, the four tab panels) → `<ScholarCard>` with `padding="lg"` and `variant="default"`; nested toolbars use `padding="md"`.
   - Primary CTAs ("Generate Quiz", "Start Quiz", "Create Folder", "Take Exam") → `<ScholarButton variant="primary">`. Secondary ("Cancel", "Edit") → `variant="secondary"`. Destructive ("Delete folder/quiz") → `variant="danger"`.
   - Inputs ("Quiz title", "Folder name", search) → `<ScholarInput>` already in `Scholar/`.
   - Difficulty toggle + question-count slider → keep current native controls but wrap container in a `ScholarCard variant="muted"` and recolor active state to `var(--s4-accent)`.
   - Folder chips (line range ~1260–1320) → `<ScholarBadge>` with hairline border.
   - Empty states ("No quizzes yet", "No exams yet") → `<ScholarCard>` + `<ScholarButton>` CTA pointing to the Create tab.
   - Loading skeletons → `<ScholarSkeleton count={...}/>`.
   - **Global Exams tab** (~1364–1680): exam list rows → `<EditorialTable>` (columns: Exam, Country, Type, Best score, Action). Hard-coded country flags stay as `<span>` text.
   - Library-picker modal: outer surface → `<ScholarCard variant="elevated" padding="lg">`; search bar → `<ScholarInput>`; result rows → hover via `ScholarCard hover`.
   - Color folder picker stays (color values are user data), but its container → `var(--s4-radius-card)`.

3. **`QuizTakingComponent.tsx` chrome only.**
   - Top bar: replace the bespoke header with `<PageHeader>` slotted via a new prop `eyebrow={t('examinations.in_progress')}`, `title={quizTitle}`, `actions={<TimerPill/> + <ExitButton/>}`. Don't move the timer logic — only the visual wrapper.
   - Exit-confirm dialog → swap inline modal for the existing `useConfirm()` hook (consistent with the rest of the app). Same i18n keys.
   - Timer pill → small token-styled span (`var(--s4-radius-chip)`, hairline border, accent text when ≤ 30 s remaining).
   - **Do not** touch question rendering, answer selection, progress logic, autosave, or submission. Phase 5 owns those.

4. **`AIQuestionGenerator.tsx`** — token sweep + `<ScholarButton>` + `<ScholarInput>` + `<ScholarCard>`. Loading state → `<ScholarSpinner>`. Errors → `<ScholarAlert>`.

5. **`ManualQuestionBuilder.tsx`** — same token sweep. The dynamic option list keeps its add/remove buttons but uses `<ScholarIconButton>` for the X buttons.

6. **`GlobalExamDetailModal.tsx`** — outer dialog → `<ScholarCard variant="elevated" padding="lg">`; Start/Cancel → `<ScholarButton>`; question-count + difficulty rows → `<KeyValueRow>` (already exists in `Scholar/`).

7. **i18n additions.** Single namespace `examinations.*` (also alias to `quiz.*` where keys already exist so we don't break old strings). New keys needed:
   - `examinations.eyebrow`, `examinations.title`, `examinations.descriptor`
   - `examinations.tabs.create|quizzes|explore|history|exams`
   - `examinations.in_progress`, `examinations.exit_confirm_title`, `examinations.exit_confirm_body`
   - `examinations.empty.*` (one per tab)
   - Added to en/ar/fr/tr in the same commit; JSON-validated.

8. **`todo()` stubs** for the handlers still listed as missing in `SCHOLAR_V4_ISSUES.md`:
   - "Share quiz with cooldown" (issue #14)
   - "Export quiz to PDF" (new issue if not present)
   - Any "Coming soon" inline alert/toast currently used as a placeholder is replaced by `todo()` and entered in the ledger.

9. **Audit gate at end of 3.2:**
   - `rg "rounded-(xl|2xl|lg|\[12px\])" src/components/Dashboard/{QuizPage,QuizTakingComponent,AIQuestionGenerator,ManualQuestionBuilder,GlobalExamDetailModal,LibraryPage,HistoryPage,InputForm}.tsx` → 0 hits.
   - `rg "bg-gradient-to-r from-accent-gold" src/components/Dashboard/` → 0 hits (re-run, was passing).
   - `rg "alert\(|confirm\(|console\.(log|warn)" <same set>` → 0 hits (excluding `ErrorLogger`).
   - `rg "from-(blue|red|green|orange|purple)-[0-9]" <same set>` → only inside data-driven status badges; flagged in `_phase3-notes.md` if found.
   - JSON validation: `node -e "['en','ar','fr','tr'].forEach(l => JSON.parse(require('fs').readFileSync('src/locales/'+l+'.json','utf8')))"` exits 0.

### Cross-file safety

- `Dashboard.tsx` passes the same props to `QuizPage` and `QuizTakingComponent`. **Prop signatures unchanged.**
- `QuizPage` → `QuizTakingComponent` handoff via `activeQuizId` state stays byte-identical.
- `useConfirm()` is already mounted at the app level (used by `LibraryPage` and others), so swapping `QuizTakingComponent`'s inline modal to it is safe.
- `AIQuestionGenerator` and `ManualQuestionBuilder` are consumed from `QuizPage` create-tab only; their callback signatures (`onGenerated`, `onCancel`, `onSave`) stay identical.
- `GlobalExamDetailModal` consumes `selectedExam` and `onStart`/`onClose`. Unchanged.
- Supabase calls (`generate-quiz`, `translate-quiz-bulk`, `user_quiz_sessions`, `user_quiz_attempts`, `global_exams`, `global_exam_attempts`, `quiz_folders`) — **byte-identical**.
- Routes in `App.tsx` — untouched.
- Locales only get additive keys.

### Out of scope (still owned by later phases)

- Active-exam runtime (question rendering, scoring, timer ticking, autosave) → Phase 5.
- Reworking the AI generation prompt or response schema → not in v4 migration at all.
- Global-exam attempt-resume logic → Phase 5.
- Any change to `ChatAssistant`, `FloatingMiniPlayer`, onboarding, or pricing.

### Best-practice notes

- Reuse `Scholar/*` exclusively; no new ad-hoc components for this sub-phase.
- Use `useConfirm()` for every destructive confirm modal (delete quiz, delete folder, exit exam). No inline modals.
- Use `useToast()` for success messages already in code; never `alert()`/`toast()` raw.
- Strings with apostrophes stay in JSON.
- One commit per file group for reviewability: (a) carry-over fixes E–H, (b) `QuizPage.tsx`, (c) `QuizTakingComponent.tsx` chrome, (d) the three smaller exam files + locales, (e) audit pass.

### Timeline

- Cleanup commit: ~30 min
- `QuizPage.tsx` sweep: ~90 min (largest file, dense)
- `QuizTakingComponent.tsx` chrome: ~30 min
- `AIQuestionGenerator` + `ManualQuestionBuilder` + `GlobalExamDetailModal` + locales: ~45 min
- Audit gate: ~15 min

Confirm and I'll start with the carry-over cleanup commit (mishaps E–H) before the `QuizPage` sweep.
---

## Phase 3.2 — applied

- **Carry-over (E–H):** `LibraryPage.tsx` Try-again/Try-bulk-delete buttons and the delete-confirm modal converted to `<ScholarButton>`. All `rounded-lg/xl/2xl` swept to `var(--s4-radius-card)` in Library + InputForm. `HistoryPage.tsx` medical badge → `<ScholarBadge variant="danger">`, expires-on color de-warned. `InputForm.tsx` inline error banner → `<ScholarAlert variant="danger">` with dismiss.
- **QuizPage / QuizTakingComponent / AIQuestionGenerator / ManualQuestionBuilder / GlobalExamDetailModal:** legacy radius tokens swept; gold gradients converted to `bg-accent-gold`; raw purple/green CTAs swapped to `bg-accent-gold` or `<ScholarButton>` with `variant="primary|danger"`. Exit & Submit buttons in `QuizTakingComponent` now use `<ScholarButton>` (variant=danger / primary). No runtime, scoring, timer, or Supabase code touched.
- **i18n:** all `quiz.*` keys already present in en/ar/fr/tr; JSON validated.
- **Audit gate passed:**
  - `rg "rounded-(xl|2xl|lg)" <8 files>` → 0
  - `rg "bg-gradient-to-r from-accent-gold" <same>` → 0
  - `rg "alert\(|window\.confirm\("` in scope files → 0

Remaining gold-gradient hits in Dashboard live in pages owned by 3.3–3.8 (EduPlay, BrainRush, Academics, Social, AudioStudy, BookMode, Profile, Subscription, Multiplayer, Pomodoro, FlashcardViewer, etc.) and will be swept there.
