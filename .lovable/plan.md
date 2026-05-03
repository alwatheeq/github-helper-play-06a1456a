
# Page 1 — Dashboard / Process Content (rebuild, no Roman numerals)

The current preview shows two stacked headers ("Process content." then "Process Your Content."), and a generic right rail. We rebuild Page 1 in place — same files, same logic, same i18n keys, same processing pipeline — to match reference image 2. Only markup/styling changes.

This revision **drops every spec element we previously agreed to skip** and substitutes safe equivalents.

---

## Substitutions for skipped spec items

| Spec item (skipped) | Replacement we use instead |
|---|---|
| Roman-numeral list (i. ii. iii.) for "Recently processed" | Plain numeric counter `01 / 02 / 03` in muted small-caps gold, OR a simple bullet-less stacked list with hairline dividers between rows. We go with the **hairline-divided stacked list** — cleaner, already in the codebase via `EditorialTable` patterns. |
| Roman-numeral list in any other rail (tips, rankings) | Removed. Tips/quotes render as a single editorial card with the quote + attribution, no list. |
| Italic sub-captions ("or click to browse.") | Upright `font-light` text in muted ink. |
| Literary verb copy ("Compose", "Bring in", "Open the volume") | Existing i18n labels stay verbatim. No copy rewrites. |
| Sidebar fixed-220px requirement | Existing pinnable / proximity behavior preserved. |
| New `RomanList` primitive | **Delete** `src/components/Scholar/RomanList.tsx` and remove its export. Nothing else uses it. |
| `RecentVolumesRail` (the right-rail pile we built last pass) | **Delete**. Splits into in-column "Recently processed" + topbar credits + new `GenerationRail` + `QuoteCard`. |

---

## Root cause of the duplicated header

- `Dashboard.tsx` renders `<PageHeader title="Process content" …>` at the top of the `main` view.
- `InputForm.tsx` *also* renders its own `<PageHeader title={t('dashboard.process_content')} …>` inside the same view.

**Fix**: `InputForm` becomes header-less. The page header lives in `Dashboard.tsx` only.

---

## Target layout (matches reference image 2, sans Roman numerals)

```text
┌─ Sidebar ───────────────┬─ Topbar (Header.tsx, 64px, hairline bottom) ───────────┐
│ Meshfahem.              │ wordmark · tagline · CREDITS pill · bell · avatar      │
│                         ├─────────────────────────────────────────────────────────┤
│ ▌Dashboard              │  THE WORKSHOP                                           │
│  process & today        │  Process your content.                                  │
│                         │  bring in a document, paste text, or scan a page —     │
│  My Library             │  we'll do the rest.                                     │
│  saved works            │  ─────────────────────────────────── hairline ─────────│
│  Study Rooms            │                                                         │
│  live with peers        │  [ File ] [ Text ] [ Scan ]   ← hairline tab strip,    │
│  Academics              │                                  active = gold underline│
│  courses & progress     │                                                         │
│  Examinations           │  ┌─ primary col ───────────┐  ┌─ rail 320 (sticky) ──┐ │
│  quizzes & exams        │  │ ┌─ EditorialCard ────┐ │  │ FeatureDarkCard       │ │
│  EduPlay                │  │ │   DROP ZONE        │ │  │  WHAT TO GENERATE     │ │
│  play & learn           │  │ │   Drop your file   │ │  │  Summary       [▢]   │ │
│  History                │  │ │   here, or click   │ │  │  Flashcards    [▢]   │ │
│  recent activity        │  │ │   to browse.       │ │  │  Examination   [▢]   │ │
│  About                  │  │ │   PDF · PPTX · DOCX│ │  │  Mind map      [▢]   │ │
│  the project            │  │ │   [ Choose file → ]│ │  │  ─── hairline ───    │ │
│  Feedback               │  │ └────────────────────┘ │  │  35 credits  Generate│ │
│  write to us            │  │                        │  └───────────────────────┘ │
│                         │  │  RECENTLY PROCESSED    │  ┌─ Quote card ──────────┐ │
│ ── avatar block ──      │  │   01  Microeconomics…  │  │ "The shortest pencil…"│ │
│                         │  │   ──────────────────   │  │  — a tip from MeshFahem│ │
│ "Read with the pen…"    │  │   02  Anatomy-Lecture  │  └───────────────────────┘ │
│ © 2026 MeshFahem        │  │   ──────────────────   │                            │
│                         │  │   03  Cell-signaling   │                            │
│                         │  └────────────────────────┘                            │
└─────────────────────────┴─────────────────────────────────────────────────────────┘
```

The "Recently processed" list uses **`01 / 02 / 03` markers in muted small-caps gold + hairline dividers** — no Roman numerals.

---

## What changes, file by file

### 1. `src/components/Dashboard/Dashboard.tsx`
- Keep all state, effects, processing logic, and view routing exactly as is.
- In the `currentView === 'main'` branch:
  - Render **one** `PageHeader` (`eyebrow="The Workshop"`, `title="Process your content"`, descriptor from i18n).
  - Below it, render the new `<WorkshopPanel />` for the idle state and existing `<ProcessingStatus />` / `<SummaryDisplay />` for the other stages — unchanged.
- Remove the previous `flex-row gap-8` wrapper. The workshop panel owns its internal grid.
- Remove the import + usage of `RecentVolumesRail`.

### 2. `src/components/Dashboard/InputForm.tsx`
- Remove the inner `PageHeader` block (lines ~415–428). Keep all inputs, validation, settings, medical-mode logic, drag/drop, OCR, and the `onProcessInput` contract.
- Replace the outer `<ScholarCard padding="lg">` wrapper so the workshop panel can compose the layout.
- Re-skin the tab strip: hairline-bottom row of three buttons (`File`, `Text`, `Scan`); active tab = 2px gold bottom border + ink label; inactive = muted ink. No pill background.
- Re-skin the dropzone: hairline 1px dashed border, 6px radius, "DROP ZONE" eyebrow (gold uppercase tracked), serif title, lighter upright caption (no italics), file-type meta line, dark-surface CTA `Choose a file →` with gold arrow. All existing drop handlers stay.
- The "Process Text" full-width gold button stays inside the Text tab (it's the primary submit when the user pastes content). Generation prefs wiring stays internal — the rail's Generate button is documented below as visual-only for v1.
- Settings drawer stays, restyled as a hairline-bordered "Processing settings" disclosure.

### 3. New `src/components/Dashboard/WorkshopPanel.tsx`
- Two-column grid:
  - **Primary column (flex)**: `InputForm` → `RecentlyProcessedList` (in-column, not in rail).
  - **Right rail (320px, hidden < lg, sticky)**: `<GenerationRail />` + `<QuoteCard />`.

### 4. New `src/components/Dashboard/RecentlyProcessedList.tsx`
- Reads up to 3 rows from `user_history` (existing query — `eq user_id`, order desc by `created_at`, `nullsFirst: false`, limit 3).
- Renders eyebrow `RECENTLY PROCESSED` (gold uppercase tracked).
- Each row: `01` / `02` / `03` muted-gold marker on the left, file name (serif), meta line (muted small-caps: cards drawn / processing / time-ago), and an `Open` link on the right that dispatches to history view.
- Rows separated by hairlines. Empty state: muted single-line placeholder + `TODO: connect to richer history hook`.
- **No Roman numerals.**

### 5. New `src/components/Dashboard/GenerationRail.tsx`
- Dark surface using existing `FeatureDarkCard` shell, eyebrow `WHAT TO GENERATE`.
- Four toggle rows: **Summary** / concise notes, **Flashcards** / for spaced review, **Examination** / twenty questions, **Mind map** / visual outline. Square gold ON / muted OFF switch on the right.
- Hairline divider, then `35 credits` placeholder text (`TODO: connect cost estimator`) + gold `Generate →` button.
- v1 wiring: Summary / Flashcards toggles mirror the values inside `InputForm`'s settings drawer (read-only display). Examination / Mind map are visual-only with `TODO: connect`. The `Generate →` button is disabled with a tooltip "Use the workspace below" for now — actual submission still happens from the form's existing CTA. This avoids re-plumbing the submit path in this wave.

### 6. New `src/components/Dashboard/QuoteCard.tsx`
- Light hairline-bordered card under the rail. Serif quote (upright, medium weight), em-dash attribution in muted small caps. Static content with `TODO: connect to CMS / rotation`.

### 7. `src/components/Dashboard/RecentVolumesRail.tsx`
- **Delete.** Remove its import from `Dashboard.tsx`.

### 8. `src/components/Scholar/RomanList.tsx`
- **Delete.** Remove its export from `src/components/Scholar/index.ts` and its `RomanListItem` type. Confirmed no other consumers via search.

### 9. `src/components/Dashboard/Header.tsx` (Topbar)
- Already 64px + hairline. Two cosmetic tweaks:
  - Replace the icon-tile + `FileText` logo with the wordmark `Meshfahem` + gold period.
  - Credits pill: gold ring + bold numeral, transparent fill. Existing dropdown logic untouched.

### 10. `src/components/Dashboard/Sidebar.tsx`
- Already restyled (wordmark, gold left border, sub-labels). Add:
  - Avatar block above the © footer: avatar + display name + tier badge, read-only. `useAuth` already provides this.
- No new behavior; visual only.

### 11. `src/components/Scholar/index.ts`
- Remove `RomanList` / `RomanListItem` re-exports. Keep `FeatureDarkCard`, `RightRail`, `PageHeader`, `Eyebrow`, etc.

---

## Constraints honored

- Italic ban in `src/index.css` stays — substitute with `font-light` upright.
- No Roman numerals anywhere.
- All existing i18n keys drive copy. No string rewrites.
- No backend, schema, edge function, or route changes.
- Existing pinnable / proximity sidebar logic preserved.
- Processing pipeline untouched.
- No parallel "demo" or "preview" page is created. Everything renders inside the live `/` Dashboard.

---

## Out of scope for this wave

- Re-plumbing submission through the rail's `Generate` button.
- Real cost estimator for "35 credits".
- Examination / Mind map outputs.
- Library, Academics, History, Profile sub-pages.

Reply **"go"** to execute.
