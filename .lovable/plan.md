## Goal

Rebuild the idle Dashboard so it fits a 1366×768 viewport with the 220px sidebar — no horizontal scroll — and matches the editorial spec exactly (sizes, paddings, the single dark feature card, hairlines). Preserve all logic (Supabase, processing pipeline, i18n, subscription gates). Honor the global bans: no italics (substitute upright `font-light` muted text) and no Roman numerals (substitute `01./02./03.` numeric markers).

## What's wrong now

- Right rail is 340px and content doesn't constrain → horizontal scroll on 904px preview and even on 1146px laptop column.
- Tabs (File / Text / Scan) sit on `bg-page` with no white card — they should sit inside the white left card per spec.
- Dropzone padding/min-height not aligned to spec (uses `p-12`, no min-height, no inner browse button styling).
- Recently-processed list lacks the 5-column grid (numeral · title · subject code · output type · time-ago).
- No "What to generate" feature card on the right with the exact 4 toggle rows + cost footer + Generate button as specified.

## Approach

Strict, single-page rebuild of the idle view. Logic is untouched — only markup/classes inside `WorkshopPanel`, `InputForm`, `GenerationRail`, `RecentlyProcessedList`, plus tightening `Dashboard.tsx` paddings.

### 1. Page shell — `Dashboard.tsx`

- Set the main content padding to `pt-8 pr-10 pb-10 pl-10` (32 / 40 / 40 / 40).
- Remove any `max-w-*` / centering on the workspace container so it fills the column edge-to-edge.
- Keep the existing `PageHeader` call but pass:
  - eyebrow = `THE WORKSHOP`
  - title = `Process your content` (period auto-added)
  - descriptor = upright muted-ink line: "Bring in a file, paste text, or scan a page — we'll do the rest." (no italic — replaces the spec's italic caption per ban).
- Header rule stays (the built-in hairline below).

### 2. Workshop two-column grid — `WorkshopPanel.tsx`

Replace the current flex layout with a strict CSS grid:

```text
grid-template-columns: minmax(0, 1fr) 300px
gap: 32px
```

- Right rail width pinned to **300px** (down from 340) so total fits in 1066px inner width.
- Below `lg`, collapse to single column (rail moves below).
- Drop `QuoteCard` entirely from this page (not in spec, and it pushes the rail over budget visually).
- Move `RecentlyProcessedList` out of the left column and render it **below the grid** (spans full width, 36px top margin) — matches "below the body grid".

### 3. Left card — `InputForm.tsx` rebuild (visual only)

The whole tabs + dropzone area becomes the single white card:

- Outer wrapper: `bg-card-light border border-divider rounded-[6px] p-8 min-h-[320px]` (this is the card the user said is missing white background — tabs now live inside it).
- Tabs row inside the card, `flex gap-7 mb-6`, no background pills, hairline only on the active tab (2px gold underline). Icon 14px + 6px gap + label 13px/500.
- Active = `text-ink` + `border-b-2 border-accent-gold`. Inactive = `text-muted-ink` + `border-b-2 border-transparent`.
- File mode body — dashed dropzone:
  - `border border-dashed border-divider rounded-[6px] py-10 px-8 text-center` (40/32 padding).
  - Icon: `Upload` 32px, `text-accent-gold`, strokeWidth 1.5, centered.
  - 8px gap → headline "Drop your file here." (`font-display text-xl font-semibold text-ink`).
  - 6px gap → sub-line "Or click to browse — PDF, DOCX, images up to 25 MB" (upright `font-light text-[13px] text-muted-ink` — replaces italic per ban).
  - 18px gap → button `Choose a file →`, `bg-sidebar text-ink-on-dark text-[13px] font-semibold rounded-[4px] px-5 py-2.5`.
- Below dashed box: 16px gap → 1px hairline → 12px gap → flex row `gap-6` of three small upright `text-[11px] text-muted-ink` meta labels: "Average processing time — 12s", "Last upload — 2 hours ago", "Storage used — 142 / 500 MB" (substituting upright for the spec's italic; values are static placeholders since live data isn't wired — `TODO: connect`).
- Text mode and OCR mode bodies keep their existing logic but adopt the same inner sizing (textarea inside the same card; no nested cards).

### 4. Right card — `GenerationRail.tsx` rebuild

Single dark feature card, 300px column-fill, `p-[22px]`:

- Eyebrow `WHAT TO GENERATE` (10px / 700 / 2px tracking / `accent-gold`, mb-1).
- Title `Outputs.` (`font-display text-[22px] font-semibold text-ink-on-dark`, mb-4).
- 1px `divider-on-dark` hairline, mb-3.
- 4 generator rows, each `flex justify-between items-center py-2.5 border-b border-divider-on-dark` (no border on last):
  - Left: 14px icon (lucide) + 10px gap + two-line text — line 1 `text-[13px] font-semibold text-ink-on-dark`, line 2 upright `font-light text-[11px] text-muted-ink-on-dark` (replaces italic).
  - Right: toggle 30×16, `rounded-full`, knob 12px, OFF `bg-divider-on-dark`, ON `bg-accent-gold`.
  - Rows: Summary (ON), Flashcards (ON), Examination (OFF), Mind map (OFF). Examination/Mind map remain `TODO: connect` — visual only.
- 16px gap → footer:
  - Caption row flex space-between: left `COST` (10px caps, 1.5px tracking, muted-light); right `8 credits` (13px / 600 / accent-gold). Cost is currently hard-coded `35` — change to `8` per spec; `TODO: connect cost estimator` comment stays.
  - 12px gap → full-width `Generate →` button, `bg-accent-gold text-sidebar text-[13px] font-bold rounded-[4px] py-3`. Stays disabled (visual only — submit still happens via the InputForm CTAs); tooltip preserved.

### 5. Recently processed — `RecentlyProcessedList.tsx` rebuild

Full-width section under the grid, 36px top margin:

- Eyebrow `RECENTLY PROCESSED` (11px / 700 / 2px / accent-gold).
- Section title `From the workshop.` (`font-display text-xl font-semibold text-ink`, mt-1).
- 1px hairline, mt-3.
- List as a CSS grid row:

```text
grid-template-columns: 28px minmax(0,1fr) 110px 200px 80px
gap: 16px
padding: 12px 0
border-bottom: 1px solid divider (none on last)
```

Columns:

1. **Numeric marker** `01.`, `02.`, `03.` — upright `font-display text-[12px] font-medium text-accent-gold tabular-nums` (replaces Roman numerals per ban).
2. **Title** — `font-display text-sm font-semibold text-ink truncate`.
3. **Subject code** — `text-[11px] tracking-[1.5px] font-bold uppercase text-secondary-ink` (e.g. `ECN101`).
4. **Output type** — upright `font-light text-[12.5px] text-muted-ink` (e.g. "Summary · 240 words").
5. **Time-ago** — upright `font-light text-[12px] text-muted-ink text-right`.

Real data wiring: continue to read up to 5 rows from `user_history` (limit raised from 3 → 5). Fields the table doesn't have (subject code, output type, word/card count) are derived loosely from existing columns or shown as `—`/best-effort labels with a `TODO: connect` comment. No schema changes.

### 6. Cleanup

- Delete `src/components/Dashboard/QuoteCard.tsx` and remove its export — not on this page per spec.
- Remove `RightRail` usage from `WorkshopPanel` (replaced by the explicit grid).
- Keep `FeatureDarkCard` available for other pages but stop using it here (the rail card is hand-built to match the exact 22px padding / row layout).

## Constraints honored

- **No horizontal scroll**: rail fixed at 300px; left column uses `minmax(0, 1fr)` so it can shrink; everything stays inside the 1066px inner content area on a 1366px laptop.
- **No italics**: every italic call in the spec → upright `font-light` muted text.
- **No Roman numerals**: `01./02./03.` markers in muted gold.
- **No backend / schema changes**: only `user_history` reads, with a higher limit.
- **No nested cards**: tabs + dropzone live inside the single left white card; right column is the single dark card; "Recently processed" is bare on `bg-page` (hairlines only).
- Radii limited to 4px (buttons) and 6px (cards / dropzone).

## Files touched

- `src/components/Dashboard/Dashboard.tsx` — paddings + descriptor text only.
- `src/components/Dashboard/WorkshopPanel.tsx` — grid rewrite, drop QuoteCard/RightRail, move RecentlyProcessedList below grid.
- `src/components/Dashboard/InputForm.tsx` — wrap tabs + body in the white card, resize dropzone, restyle browse button + meta row.
- `src/components/Dashboard/GenerationRail.tsx` — exact spec rewrite (sizes, cost=8, footer, Generate button).
- `src/components/Dashboard/RecentlyProcessedList.tsx` — 5-column grid, numeric markers, limit 5.
- Delete `src/components/Dashboard/QuoteCard.tsx`.

Reply "go" to implement.
