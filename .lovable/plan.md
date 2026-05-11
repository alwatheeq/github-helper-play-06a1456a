## Phase 3.2 — Verification

Audit gate (re-run on the 8 in-scope files):

- `rg "rounded-(xl|2xl|lg)" QuizPage|QuizTakingComponent|AIQuestionGenerator|ManualQuestionBuilder|GlobalExamDetailModal|LibraryPage|HistoryPage|InputForm` → **0 hits**
- `rg "bg-gradient-to-r from-accent-gold|alert\(|window\.confirm\("` → **0 hits**
- Locale JSON parse (en/ar/fr/tr) → **OK**
- `Dashboard.tsx` lazy-load + prop signatures for `QuizPage` / `QuizTakingComponent` unchanged.
- `useConfirm()` swap in `QuizTakingComponent` reuses the app-level provider — no new mounting.

Result: Phase 3.2 is clean. No linter, cross-file, or runtime regressions detected.

---

## Phase 3.3 — Academics hub restyle

Goal: token + primitive sweep across the Academics surface. **Layout, structure, columns, spacing rhythm, card grouping, and copy stay byte-identical.** This is a chrome migration — no JSX restructuring beyond swapping equivalent wrappers and replacing class strings.

### Files in scope

| File | Lines | Role |
|------|-------|------|
| `Academics/AcademicsPage.tsx` | 980 | Hub shell: courses list, topics, analytics, modals |
| `Academics/CourseAnalytics.tsx` | 243 | Topic performance + course score cards |
| `Academics/CourseTutor.tsx` | 129 | Per-course tutor entry card |
| `Academics/ExamScheduler.tsx` | 277 | Exam date scheduling card + list |
| `Academics/SRSReviewPanel.tsx` | 290 | Spaced-repetition review queue card |
| `TopicsTagsModal.tsx` | 302 | Shared topics/tags management modal |

Touched indirectly (read-only verify, no edits unless a prop changes): `Dashboard.tsx` (line 1487 mount point), `useConfirm.tsx`, `Scholar/index.ts`.

### Deliverables

1. **Token sweep** across all 6 files:
   - `rounded-lg` / `rounded-xl` / `rounded-2xl` / `rounded-[12px]` → `rounded-[var(--s4-radius-card)]` for surfaces, `rounded-[var(--s4-radius-btn)]` for inputs/buttons, `rounded-[var(--s4-radius-chip)]` for pills.
   - `bg-gradient-to-r from-accent-gold to-accent-gold-soft text-white` → `bg-accent-gold text-on-accent` (the 7 confirmed hits in CourseTutor L102, CourseAnalytics L155, ExamScheduler L151, SRSReviewPanel L173, TopicsTagsModal L81, AcademicsPage L843 + L959).
   - Hard-coded status colors (`bg-blue-*`, `bg-red-*`, `bg-green-*`, `text-orange-*`) → `<ScholarBadge variant="info|danger|success|warn">` where they are status indicators; otherwise route through theme tokens.

2. **Primitive swap (visual equivalents only — no layout change):**
   - `AcademicsPage.tsx`: keep existing `<PageHeader>` (already in use, line 641). Convert remaining ad-hoc card containers to `<ScholarCard padding="lg">` keeping current width / column placement. Course rows → `<ScholarCard hover>` preserving the same flex layout. CTAs ("Create course", "Add topic", "Open", "Delete", "Cancel", "Save") → `<ScholarButton variant="primary|secondary|danger">`. Inputs (course name, course code, topic typeahead) → `<ScholarInput>`. Loading state → `<ScholarSkeleton>`. Empty state → existing copy wrapped in `<ScholarCard>`.
   - `CourseAnalytics.tsx`: outer wrapper → `<ScholarCard padding="lg">`. Topic performance rows preserve their bar layout but bar fill uses `bg-accent-gold` + `MasteryBar` if column shape matches (verify before swap; if not 1:1, keep current bar markup).
   - `CourseTutor.tsx`: card → `<ScholarCard padding="md">`. Icon bubble keeps its size, accent color via token. CTA → `<ScholarButton>`.
   - `ExamScheduler.tsx`: scheduler card → `<ScholarCard padding="lg">`. Date input → `<ScholarInput type="date">`. Existing exam list rows preserved as-is, only chrome (border, radius) tokenized. Delete button → `<ScholarIconButton variant="danger">` with `useConfirm()` swap if an inline confirm exists.
   - `SRSReviewPanel.tsx`: queue card → `<ScholarCard padding="lg">`. Difficulty buttons (Again / Hard / Good / Easy) keep order and grid, only colors recolored to token variants (no logic change). Empty state copy preserved.
   - `TopicsTagsModal.tsx`: modal shell → `<ScholarCard variant="elevated" padding="lg">`. Tab pill (line 81 `activeTabBtn`) → `bg-accent-gold text-on-accent` token form. Add/Remove buttons → `<ScholarButton>` / `<ScholarIconButton>`. Confirmation flows → `useConfirm()`.

3. **i18n** — namespace `academics.*` already exists in en/ar/fr/tr (lines 1282, 1308 in en.json). Add only **missing** keys discovered during the sweep (eyebrow + empty states for each sub-card if not present). No renames; additive only. JSON-validate all four locales after edits.

4. **`todo()` stubs** for any "Coming soon" placeholders found in the sweep — register entries in `docs/SCHOLAR_V4_ISSUES.md`.

5. **Cross-file safety checks (must hold true after edits):**
   - `Dashboard.tsx` import of `AcademicsPage` (lazy default) unchanged.
   - `AcademicsPage` props from `Dashboard` (none — self-contained) unchanged.
   - Sub-component prop signatures (`CourseAnalytics`, `CourseTutor`, `ExamScheduler`, `SRSReviewPanel`, `TopicsTagsModal`) unchanged.
   - All Supabase calls (`courses`, `course_topics`, `topics`, `course_content_mappings`, `srs_reviews`, `course_exams`, `topic_performance`) byte-identical.
   - `useConfirm()`, `useToast()`, `errorLogger`, `academicsAnalytics`, `academicsProfanity`, `academicsGenerationPreferences` — call sites unchanged.
   - No new exports from `Scholar/index.ts` needed (all primitives already exported).
   - No route or sidebar nav changes.

6. **Audit gate at end of 3.3:**
   - `rg "rounded-(xl|2xl|lg|\[12px\])" src/components/Dashboard/Academics src/components/Dashboard/TopicsTagsModal.tsx` → **0 hits**
   - `rg "bg-gradient-to-r from-accent-gold" <same set>` → **0 hits**
   - `rg "alert\(|window\.confirm\(|console\.(log|warn)" <same set>` (excluding `errorLogger`) → **0 hits**
   - `rg "from-(blue|red|green|orange|purple|indigo|pink)-[0-9]" <same set>` → only inside data-driven status badges (flagged, not blocking)
   - JSON validate en/ar/fr/tr → exit 0
   - Manual smoke: open Academics tab, create course (existing topic + new topic), open `TopicsTagsModal`, open course detail showing analytics/tutor/exam/SRS panels — each renders without runtime error and matches the current layout exactly.

### Out of scope (later phases)

- Course generation / upload pipeline logic (Phase 5 owns runtime)
- New analytics formulas, new SRS algorithm, exam reminders backend
- Any `ChatAssistant`, pricing, onboarding, multiplayer, BookMode, FlashcardViewer, AudioStudy, EduPlay, BrainRush, Profile, Subscription, Pomodoro changes
- Any layout/grid/column/spacing change — **explicitly forbidden by user request**

### Best-practice notes

- Reuse `Scholar/*` exclusively; no new ad-hoc components.
- One commit per file group: (a) `AcademicsPage.tsx`, (b) the 4 sub-panels, (c) `TopicsTagsModal.tsx`, (d) audit pass + locales.
- Every destructive confirm uses `useConfirm()`; every success message uses `useToast()`.
- Verify each commit against the audit gate before moving on.

### Timeline

- `AcademicsPage.tsx` sweep: ~75 min (largest)
- 4 sub-panels: ~45 min
- `TopicsTagsModal.tsx`: ~20 min
- Locales + audit gate: ~15 min

Confirm and I'll start with `AcademicsPage.tsx`.