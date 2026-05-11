## Phase 0+1 verification

I traced every artifact created in Phase 0+1 against the rest of the codebase.

### What I checked
- `src/main.tsx` imports `./styles/scholarV4.css` (✓)
- `src/App.tsx` imports `TodoToastListener` and mounts it inside `ToastProvider` at line 260 (✓)
- `TodoToastListener.tsx` uses `useToast().info(message, duration)` — the real signature in `src/components/Toast/Toast.tsx` is `info: (message: string, duration?: number) => void` (✓ matches)
- `todoToast.ts` is SSR-safe, no external deps, exports a clean `todo()` API + `TODO_TOAST_EVENT` (✓)
- `ScholarV4Icons.tsx` is self-contained, only depends on `react` (✓)
- `scholarV4.css` only aliases existing role tokens; no token name collisions with `index.css` or `designSystem.css` (`rg "--s4-"` only matches the new file) (✓)
- `docs/SCHOLAR_V4_ISSUES.md` Phase 0 and Phase 1 marked done (✓)

### Minor observations (non-blocking)
- `S4Icons` and `todo()` are not consumed yet — expected, they're for Phase 2+.
- The unrelated console errors visible right now (`fetchAchievements`, `updateColorTheme` failing) are pre-existing Supabase issues, not caused by Phase 0+1.
- `scholarV4.css` declares `--s4-radius-card: 6px`, but Phase 1 chrome and existing Workshop use a literal `rounded-[6px]`. Phase 2 should migrate these to `rounded-[var(--s4-radius-card)]` via Tailwind arbitrary value so future tuning is one-file.

Phase 0+1 is clean. Proceeding to plan Phase 2.

---

## Phase 2 — Dashboard / Workshop full rebuild

### Goal
Make the Workshop (Dashboard idle state) match Scholar v4 pixel-for-pixel **and** be the reference implementation that all later page rebuilds copy from. Every visual decision below is taken from the v4 artboard spec already in the design files; functionality stays on existing handlers, with the **URL** tab as the only new stub.

### Scope (in order)

1. **Tokenize Workshop chrome**
   - Replace literal `rounded-[6px]` / `rounded-[4px]` / inline `padding: '22px'` / `padding: '32px'` across `WorkshopPanel`, `InputForm`, `GenerationRail`, `RecentlyProcessedList` with `var(--s4-radius-card)`, `var(--s4-radius-btn)`, `var(--s4-card-pad)`, `var(--s4-card-pad-dark)`.
   - This guarantees every other page rebuilt in Phase 3 inherits the same dial. No visual change today.

2. **Workshop eyebrow + heading block** (currently missing)
   - Above the two-column grid, add: gold eyebrow `WORKSHOP`, serif H1 `Begin a new passage.`, hairline rule. Lives in `WorkshopPanel.tsx`, not Dashboard.tsx, so it stays out of the busy/processing state.

3. **InputForm tab strip → 4 tabs**
   - Add `'url'` to the `inputMode` union and render a 4th tab `URL` (with `S4Icons.Globe`).
   - `url` body: themed input + helper text + primary CTA `Import from URL →`. CTA calls `todo('URL import')` from `utils/todoToast`. No backend touched.
   - Below `sm` breakpoint, the tab strip gains `overflow-x-auto` + `-mx-* px-*` bleed so it scrolls inside its card rather than pushing the page wide.

4. **Dropzone polish** (file + ocr)
   - Lock dropzone height to v4's 220 px via `min-h-[220px]` and center contents with flex.
   - Add the v4 micro-meta strip (`Average processing time`, `Last upload`, `Storage used`) only in file mode — these are already present but currently hardcoded; gate them behind a `dashboardMeta` prop (defaulting to `null`) so they hide cleanly when no real data is available, instead of lying with mock numbers. Logged as item #17 in `SCHOLAR_V4_ISSUES.md` to wire later.

5. **GenerationRail v4 polish**
   - Pure visual: 22 px → `var(--s4-card-pad-dark)`; row icons swapped to `S4Icons.Doc`, `S4Icons.Lib`, `S4Icons.Quiz`, `S4Icons.Bulb`; bottom CTA gets a `S4Icons.Arrow` instead of the literal `→`.
   - Add the v4 rotating tip line below the CTA: small muted text that cycles through 3 tips on a 6 s interval (pure presentation, no persistence).
   - The disabled Generate CTA stays disabled (current behavior). The Examination/Mind-map toggles already mark themselves as TODO in code — wire `todo()` toasts when the user flips them.

6. **RecentlyProcessedList v4 polish**
   - Row padding bumped from 12 px to v4's `py-3` (already correct).
   - Replace the mock "Subject code" derivation with a single source-of-truth helper that returns `—` when no real subject exists, and add a comment pointing at `SCHOLAR_V4_ISSUES.md` so the next backend task knows where to plug in.
   - Add the v4 5-column header row (`No.`, `Title`, `Subject`, `Output`, `When`) above the list, matching grid columns exactly.
   - Empty-state copy unchanged; loading state gets a real 3-row skeleton instead of the plain "Loading…" text (uses existing `LoadingSkeleton`).

7. **Responsive contract**
   - Wrapper grid in `WorkshopPanel`:
     ```text
     ≥1024 px: minmax(0, 1fr) 300px         (current)
     <1024 px: stack — rail moves under input
     <640 px:  tab strip horizontal-scrolls inside card
     ```
   - Implement via a single Tailwind class swap (`lg:grid-cols-[minmax(0,1fr)_300px] grid-cols-1`); drop the inline `style` block.
   - Verified the current viewport (904 × 583) triggers the stacked layout — that's the intended responsive behavior, not a regression.

8. **Stub registry**
   - Add to `docs/SCHOLAR_V4_ISSUES.md`:
     - #17 Workshop meta strip (real processing/storage numbers)
     - #18 URL import handler
     - #19 Examination/Mind-map output wiring from the rail
     - #20 Subject code field on `user_history`

### What I will NOT do in Phase 2
- Touch any other page (Library, Quiz, Academics, etc.) — Phase 3.
- Add new routes, new tables, new edge functions.
- Replace `lucide-react` globally — Workshop migrates to `S4Icons`, other pages keep lucide until they're rebuilt.
- Rebuild the busy/processing Dashboard state (modal/queue UI) — out of scope; only idle Workshop changes.

### Technical details

**Files modified**
- `src/components/Dashboard/WorkshopPanel.tsx` — heading block, responsive grid, no inline styles.
- `src/components/Dashboard/InputForm.tsx` — 4th URL tab, tab-strip overflow, dropzone min-height, meta strip gating, icon swaps where used inside the card.
- `src/components/Dashboard/GenerationRail.tsx` — icons → S4Icons, tokens, rotating tip, TODO toasts on Examination/Mind-map.
- `src/components/Dashboard/RecentlyProcessedList.tsx` — header row, skeleton loader, subject-code helper.
- `src/styles/scholarV4.css` — add `--s4-card-pad`, `--s4-card-pad-dark` consumption helpers if missing (already declared).
- `docs/SCHOLAR_V4_ISSUES.md` — add items #17–#20.

**Files created**
- `src/components/Dashboard/WorkshopHeader.tsx` — small, presentational; the eyebrow + H1 + hairline block. Kept separate so Phase 3 can reuse the pattern verbatim on every page.

**Cross-file safety checklist**
- `ScholarCard` (used by `InputForm`) — current padding is `lg`; we keep that prop and let `ScholarCard` continue to own its radius. No change to `Scholar/` exports.
- `useFeatureAccess`, `useSubscription`, `extractTextFromFile`, `medStudentClient` — untouched.
- i18n keys — every new string (`workshop.eyebrow`, `workshop.title`, `workshop.url_tab`, `workshop.url_cta`, `workshop.url_helper`, `workshop.meta_*`, `workshop.tip_1..3`) added to all 4 locale files (`en`, `ar`, `fr`, `tr`). The `profile.loading` warning visible in console logs is a separate, pre-existing miss and will be fixed in Phase 3 when Profile is rebuilt — flagging it now so we don't repeat the mistake.
- Theme tokens — `--s4-*` already alias the role tokens; no new CSS variables.
- No `ThemeContext` changes; no Supabase calls added or moved.

**Best-practice notes**
- All new tabs/buttons use real `<button type="button">` with `aria-controls`/`aria-selected` for the tab strip (current code is missing this); the URL stub uses `aria-disabled="false"` so screen readers don't lie.
- The rotating tip uses `prefers-reduced-motion` to freeze on the first tip when the user has reduced motion enabled.
- Every TODO toast goes through `todo()` — no inline `toast(...)` calls — so QA can grep one symbol.

### Deliverable
After Phase 2, the Dashboard idle state matches v4 in all 12 theme × mode combos, is fully responsive from 360 px up, and is the canonical reference for every page in Phase 3. Functionality identical to today except the new URL tab, which stubs cleanly.

Confirm and I'll start the build.