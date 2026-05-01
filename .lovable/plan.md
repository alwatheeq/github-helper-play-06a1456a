## Phase 3 Verification — PASS

Confirmed clean:
- `Sidebar.tsx`, `Header.tsx`, `AdminSidebar.tsx`, `AdminHeader.tsx`: zero `useTheme()` / `getTheme*()` calls.
- 66 references to new role tokens (`bg-sidebar`, `accent-gold`, `bg-card-light/dark`, `border-divider`, `text-secondary-ink`, `text-muted-ink-on-dark`).
- No leftover legacy literals in chrome except the **subscription tier badge palette** in `Header.tsx` lines 68–73 (intentional plan-tier identity).
- Inverse-surface affordances (`hover:bg-white/5`, `text-ink-on-dark`) consistent across both sidebars.
- Phase 2 fixes (removed `dark:root`, renamed `.bg-legacy-subtle`) still in place — no cross-file leakage.

Phase 3 ships clean.

---

## Phase 4 — Dashboard Landing & Core Content Surfaces

**Goal:** Migrate the visually dominant, always-on-screen dashboard surfaces off `useTheme()` helpers and onto Scholar tokens / primitives, so the user sees the new system on the home page. Sub-pages (Library, Quiz, EduPlay, Academics, Social, BookMode, AudioStudy, MindMap, etc.) are deferred to Phase 5.

### Decisions locked in
- Cards use `ScholarCard` **directly** (no routing through legacy `Card.tsx`).
- Subscription tier badge palette **kept as-is** (plan identity, not theme).
- `/scholar-preview` harness mounts InputForm in **preview-only** mode (no submission, no Supabase calls).

### Scope (8 files)

| # | File | Helper calls | Action |
|---|------|--------------|--------|
| 1 | `src/components/Common/Modal.tsx` | 4 | Shared modal shell — migrated first (foundation) |
| 2 | `src/components/Dashboard/UsernameSetupModal.tsx` | 14 | Standalone modal mirroring same pattern |
| 3 | `src/components/Dashboard/Dashboard.tsx` | 17 | Shell wrapper, empty state, welcome block, result containers |
| 4 | `src/components/Dashboard/InputForm.tsx` | 51 | Tabs, dropzones, textarea, options panel — heaviest file |
| 5 | `src/components/Dashboard/ProcessingStatus.tsx` | 14 | Progress card, stage labels |
| 6 | `src/components/Dashboard/SummaryDisplay.tsx` | 45 | Summary card, action toolbar, tabs |
| 7 | `src/components/Dashboard/CreditBalanceWidget.tsx` | 6 | Inline credit pill |
| 8 | `src/components/Dashboard/LowCreditBanner.tsx` + `LowCreditWarning.tsx` | TBD | Warning surfaces |

### Token mapping (single source of truth for Phase 4)

```text
getThemeCardBg()         -> use <ScholarCard>  (or bg-card-light dark:bg-card-dark)
getThemeCardBorder()     -> border-divider dark:border-divider-on-dark
getThemeTextPrimary()    -> text-ink dark:text-ink-on-dark
getThemeTextSecondary()  -> text-secondary-ink dark:text-secondary-ink-on-dark
getThemeTextMuted()      -> text-muted-ink dark:text-muted-ink-on-dark
getThemeSubtle('bg')     -> bg-subtle dark:bg-subtle-on-dark
getThemeSubtle('ui')     -> bg-subtle dark:bg-subtle-on-dark
getThemeAccent()         -> text-accent-gold
getThemeGradient()       -> from-accent-gold to-accent-gold-soft (CTA only)
focus:ring-cyan-500      -> focus:ring-focus
focus:ring-blue-500/50   -> focus:ring-focus
text-cyan-600 (form)     -> text-accent-gold
```

Tier badge color map in `Header.tsx` is the established exception — not generalized here.

### Step-by-step

**Step 1 — Token audit (read-only).**
Re-open `src/index.css` / `tailwind.config.ts` and confirm every token in the mapping exists from Phase 1. If `bg-subtle-on-dark`, `ring-focus`, or `bg-page-on-dark` is missing, define it before any component edit. No new color values introduced — only fill gaps.

**Step 2 — Migrate `Common/Modal.tsx` (foundation).**
- Replace shell with `<ScholarCard variant="elevated">`. Public prop API (`title`, `footer`, `maxWidth`, `onClose`, `children`) stays byte-identical.
- Header/footer dividers → `border-divider dark:border-divider-on-dark`.
- Title → `text-ink dark:text-ink-on-dark`.
- Why first: `InsufficientCreditsModal`, `TopicsTagsModal`, `GlobalExamDetailModal` and other consumers ride on this shell.

**Step 3 — Migrate `UsernameSetupModal.tsx`.**
- Outer card → `<ScholarCard variant="elevated">`.
- Subtle background block → `bg-subtle dark:bg-subtle-on-dark`.
- `@` prefix slot preserved; input → `<ScholarInput>` keeping pl-8 / pr-10 spacing for prefix and validity icon.
- Save CTA → `<ScholarButton variant="primary">` (built-in gold gradient — drop the inline `bg-gradient-to-r ${getThemeGradient()}`).
- Accent icon → `text-accent-gold`.

**Step 4 — Migrate `Dashboard.tsx` shell.**
- Outer wrapper → `bg-page dark:bg-page-on-dark` (verify token in Step 1).
- Result containers (summary view, flashcard preview, empty state, welcome block) → `<ScholarCard>`.
- Helper text → role tokens.
- Remove `useTheme` import once unused.
- Untouched: routing, lazy-load wiring, processing state machine, Supabase calls, persistent-modal logic, tutorial logic, every effect, every i18n key.

**Step 5 — Migrate `InputForm.tsx` (highest-risk, 51 calls).**
- Outer card → `<ScholarCard>` (drop inline `shadow-[0_1px_3px_…]` literal — `ScholarCard` provides `--scholar-shadow-sm`).
- Tab strip (lines ~416–445): track `bg-subtle`, active tab `bg-card-light dark:bg-card-dark text-ink shadow-[var(--scholar-shadow-sm)]`, inactive `text-secondary-ink hover:opacity-80`.
- Dropzones: border `border-divider`, hover `hover:border-accent-gold/40 hover:bg-accent-gold/5`, disabled `opacity-60`.
- Paste textarea → `<ScholarTextarea>`; flashcard count → `<ScholarInput type="number">`.
- Radios: `text-cyan-600 focus:ring-cyan-500` → `text-accent-gold focus:ring-focus`.
- Generation options panel → `<ScholarCard variant="subtle">` (or `bg-subtle` block) with `border-divider`.
- Preserve verbatim: i18n keys, RTL classes (`me-*`/`ms-*`/`start-*`/`end-*`), file-validation, OCR toggle, generation-prefs persistence, character-count guards, drop handlers, multi-file selection.

**Step 6 — Migrate `ProcessingStatus.tsx`.**
- Container → `<ScholarCard>`. Stage label colors → role tokens. Progress bar fill → `bg-accent-gold`, track → `bg-subtle dark:bg-subtle-on-dark`. Spinner → `<ScholarSpinner>`.

**Step 7 — Migrate `SummaryDisplay.tsx` (45 calls).**
- Article card → `<ScholarCard>`.
- Action toolbar buttons (Copy, Download, Refresh, Open) → `<ScholarIconButton>` with same `aria-label` / tooltip text and same handlers.
- Tabs (Summary / Flashcards) reuse the InputForm segmented-control pattern.
- Keep `prose` typography classes intact; only swap surface and text-role classes around them.
- Inline edit and copy/download flows untouched.

**Step 8 — Migrate credit surfaces.**
- `CreditBalanceWidget.tsx`: pill → `<ScholarBadge>` with `accent-gold-soft` background; numeric text `text-ink`.
- `LowCreditBanner.tsx` / `LowCreditWarning.tsx`: → `<ScholarAlert variant="warning">` (already gold-themed in Phase 2). Keep CTA `<ScholarButton variant="primary" size="sm">`.

**Step 9 — Cleanup pass.**
- Remove unused `useTheme` imports from each touched file.
- Verification greps (must all return zero):
  - `rg "useTheme\(\)" <touched files>`
  - `rg "getTheme[A-Za-z]+\(" <touched files>`
  - `rg "bg-(slate|gray|sky|emerald|violet|cyan)-\d|text-cyan-600|focus:ring-cyan-500|focus:ring-blue-500" <touched files>`

**Step 10 — Visual QA via `/scholar-preview`.**
- Extend the preview page with a "Dashboard Surfaces" section:
  - `<InputForm>` mounted in **preview-only** mode (a `previewMode` prop short-circuits submit handlers and disables the primary CTA — no Supabase, no upload, no edge-function calls).
  - `<ProcessingStatus>` fed mock state.
  - `<SummaryDisplay>` fed mock content.
- Cycle all 6 themes × {light, dark} = 12 combinations and confirm contrast, borders, focus rings, and hover states.
- Then manually verify on `/dashboard`.

### Cross-file precautions

1. **Modal API compatibility.** `Common/Modal.tsx` is consumed by 7+ files. Prop names, defaults, and `footer` slot stay identical. No behavior changes.
2. **Phase 2 adapters untouched.** `Card.tsx` already delegates to `ScholarCard` — leave alone. `LoadingButton.tsx` already routes to `ScholarButton` — leave alone. No double migration.
3. **`ThemeContext` stays alive.** We are NOT removing `ThemeContext` or `useTheme` yet — out-of-scope files (Library, Quiz, ~74 others) still depend on it. We just stop using it in Phase 4 files. **Memory rule respected:** `getThemeGradient` utility itself remains exported for the rest of the app.
4. **Subscription tier palette in `Header.tsx`** stays exactly as-is.
5. **Toast (Phase 2)** already migrated; not retouched.
6. **i18n & RTL.** All `dir`-aware classes (`me-*`, `ms-*`, `start-*`, `end-*`) preserved verbatim. Only color/surface tokens change.
7. **Focus ring.** Replace ad-hoc `focus:ring-cyan-500 / blue-500/50` with `focus:ring-focus` consistently — accessibility regression risk if missed.
8. **Lazy-loaded sub-pages.** `SummaryDisplay` is in scope (lazy-imported but a Phase 4 target). Do **not** touch other lazy-imported pages (Library, Quiz, EduPlay, Academics, Profile, Feedback, Informational, History, StudyRooms).
9. **Supabase / backend.** Zero changes to schema, RLS, edge functions, hooks, client config — pure UI token swap (per Core memory rule).
10. **TypeScript relaxed config.** No new strict-mode violations introduced; unused-locals tolerance preserved (per Core memory rule).
11. **Supabase SDK quirks.** No RPC or `order()` calls touched, so `.then(null)` and `nullsFirst: false` patterns remain untouched.
12. **`previewMode` for InputForm.** Adding the prop must be opt-in and default `false`. Real `/dashboard` mounts behave exactly as today.

### Out of scope (Phase 5+ candidates)

Library, Quiz, EduPlay, Academics, Social, BookMode, AudioStudy, MindMap, Highlighting, ReadAloud, FloatingVideo, Onboarding, Pricing, Auth, Admin pages (Overview/Analytics/Audit/Transactions/Users), ChatAssistant, NotificationCenter, Pomodoro, Achievements, BillingHistory, ProfilePage, Subscription modals, ShareView. ~74 files remain after Phase 4.

### Acceptance criteria

- 8 listed files: zero `useTheme()` / `getTheme*()` calls.
- All 6 themes × {light, dark} render Dashboard root + InputForm + ProcessingStatus + SummaryDisplay + credit surfaces without color mismatches, blown contrast, or missing borders.
- No regressions in: file upload, OCR toggle, paste flow, generation-options persistence, processing progress, summary actions, credit pill, low-credit banner, modal open/close, username setup.
- `/scholar-preview` extended harness renders all pieces in preview-only mode across all themes.
- No Supabase, edge-function, or backend code touched.

Ready to execute on approval.