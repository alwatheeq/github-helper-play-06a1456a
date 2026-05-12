
# Phase 5.1a — Dropzone & tab-strip parity fixes

You're right that these are visual deltas, not the state-lifting items I listed. Three concrete misses, all in `src/components/Dashboard/InputForm.tsx`, all pure presentation.

## Side-by-side: v4 reference vs current

### 1. Dropzone copy & typography

**v4 (Dash4 lines 200–204)**
```
        ⬆ (36px upload icon)
  Drop your file here,                 ← serif, 22px, semibold, ink
  or click to browse.                  ← serif, 22px, regular, MUTED (same line treatment, two lines via <br/>)
  PDF, PPTX, DOCX · up to 400 pages    ← 12px muted
  [   Choose a file →   ]              ← inline-block, dark bg, light text, 10×24 padding
```

**Current (`InputForm.tsx` 511–522)**
```
  ⬆ (32px gold icon)                   ← gold tint not in v4
  Drop your file here, or click…       ← single-line (i18n "drop_file" = full sentence)
  Or click to browse — PDF, DOCX, PPTX up to 25 MB   ← combined helper + filetypes
  [Choose a file →]
```

### 2. Tab-strip underline

**v4 (Dash4 lines 188–195)** — tab row has **no full-width rule**. Only the active tab itself carries a 2px accent underline (`borderBottom: 2px solid accent` per item).

**Current (line 448)** — `border-b border-divider` runs the **full width** under all four tabs, plus each tab has its own `-mb-px border-b-2`. That extra full-width hairline is what's reading as the wrong "underline below it".

### 3. Upload icon color

**v4** — icon in `t.muted` (neutral muted ink).
**Current** — `text-accent-gold` (gold). Pulls focus away from the headline.

## What changes (one file)

`src/components/Dashboard/InputForm.tsx`:

1. **Tab strip wrapper** (line 448): drop the `border-b border-divider dark:border-divider-on-dark` class. Keep the per-tab active underline as-is.

2. **Upload icon** (line 512): `Upload size={36} strokeWidth={1.7} className="text-muted-ink dark:text-muted-ink-on-dark"` (was `size={32}` + gold).

3. **Dropzone copy block** (lines 513–518) — replace with the two-line v4 treatment:
   - Line 1: serif `text-[22px] font-semibold text-ink` → `Drop your file here,`
   - Line 2 (below `<br/>` or as second `<p>`): serif `text-[22px] font-normal text-muted-ink` → `or click to browse.`
   - Helper: `text-[12px] text-muted-ink mt-2` → `PDF, PPTX, DOCX · up to 400 pages` (matches v4 spec; current "25 MB" is implementation detail not visible in v4 — moves into a tooltip later if needed)
   - i18n: split `dashboard.drop_file` into two new keys (`dashboard.drop_file_line_1`, `dashboard.drop_file_line_2`) and add `dashboard.drop_file_helper`. Old key kept for back-compat (used elsewhere? — quick grep: only here, but we leave it to be safe).

4. **Choose-a-file CTA** (line 519): adjust padding/treatment to match v4 — `inline-block px-6 py-2.5 bg-ink text-card-light text-[13px] font-medium` (currently uses `bg-sidebar` which is theme-dependent — v4 uses pure `t.ink` over `t.bg`, i.e. inverse).

## Out of scope (kept honest)

- External tab row outside `InputForm` — unchanged (still a state-lifting refactor).
- OCR/Text/URL tabs — only the File-mode dropzone is touched. The other three modes already use the same `dropzoneCls` helper, so the icon/copy fix only affects the File panel; OCR/Text/URL keep their existing copy.
- No token, theme, or i18n architecture changes — just three new keys added.

## Verification

- `tsc --noEmit` clean.
- `vitest run` 73/73.
- `npm run check:tokens` clean.
- Visual smoke at the current 904px viewport against `design/Scholar v4.html` Dash4 dropzone.

## Note for future small visual edits

For copy/color/font tweaks like these, you can also use **Visual Edits** (the Edit button in the chat box) — point-and-click on the element and change text/color/font directly without spending a prompt. This plan exists because it's also touching markup structure (split into two lines, drop a wrapper border) which Visual Edits can't do.

Approve to implement.
