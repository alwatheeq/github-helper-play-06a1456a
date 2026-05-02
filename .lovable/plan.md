# Page 1 — Dashboard / Process Content (editorial integration, design-first)

Build every visual surface the spec defines for this page, even when the underlying feature isn't wired up yet. Stub data sources behind a `TODO: connect` comment so we can hook real data later without re-doing the layout. No backend, route, or i18n-string rewrites. Italic ban stays; substitute italics with muted small-caps or lighter weight.

---

## Adopted from spec (visual + structural)

- Two-column body grid: primary flex column + 320px right rail (stacks on mobile).
- Header block: eyebrow (small-caps) → 48px serif title with trailing period → muted sub-caption → hairline rule.
- Hairline-bordered cards, 6px radius, no shadows, no gradients, no glassmorphism.
- Gold (`--accent-gold`) reserved for: active nav state, primary CTA, key numerals, progress fill.
- Roman-numeral ranked lists (`i. ii. iii.`) in right-rail rankings.
- Editorial sidebar visual language: serif label, gold left-border on active, hairline section dividers, "Meshfahem." wordmark, avatar block at bottom.
- 64px topbar: hairline bottom, credits pill (gold ring + bold numeral, no fill), language toggle, avatar.
- Inverted dark feature card primitive for hero/CTA blocks.
- Bottom-hairline-only inputs with gold underline on focus.

## Adapted (not discarded)

- **Italic sub-captions / numerals / placeholders** → render upright using `text-xs uppercase tracking-wide text-muted-ink` for eyebrows or `font-light text-sm text-muted-ink` for sub-text. Italic ban remains in `src/index.css`.
- **Literary verb copy** ("Compose", "Bring in", "Open the volume") → not applied. Existing i18n labels stay; only their visual treatment changes.
- **Sidebar fixed-220px requirement** → keep current pinnable/proximity behavior; restyle the open state to match spec.
- **Sidebar sub-labels under each nav item** → render the sub-label slot in the markup using a muted small-caps line; if a route has no sub-label content yet, leave the slot empty and add `TODO: connect` so we can fill it later without re-layout.

## Design surfaces built even if feature not wired

| Surface | Data source today | Placeholder strategy |
|---|---|---|
| `RecentVolumesRail` (right rail, ranked Roman list) | existing history hook if available, else empty | render 3 ghost rows with muted text + `TODO: connect to history query` |
| Credits pill in Topbar | `useCredits` if present, else `—` | numeral slot renders `—` when undefined |
| Tips block in right rail | static array for now | inline content with `TODO: drive from CMS / personalization` |
| `FeatureDarkCard` "Today's volume" hero (if present in spec) | none | static editorial copy with `TODO: connect` |
| Sidebar avatar block | existing auth user | unchanged |

---

## Layout target

```text
┌─ Sidebar (existing pin/proximity) ┬──── Topbar 64px, hairline ─────┐
│ Meshfahem.                        ├──────────────────────────────────┤
│                                   │ STUDIO · COMPOSE                 │
│ ▌ Dashboard   (gold left bar)     │ Process content.                 │
│   sub-label slot                  │ Paste, upload, or scan a passage.│
│                                   │ ─────────────────── hairline ────│
│   Library                         │                                  │
│   Academics                       │ ┌─ primary col ─┐ ┌─ rail 320 ─┐ │
│   Examinations                    │ │ EditorialCard │ │ Recent      │ │
│   Study rooms                     │ │  InputForm    │ │  i.  …      │ │
│   Feedback                        │ │   tabs hairln │ │  ii. …      │ │
│   Profile                         │ │   gold CTA    │ │  iii. …     │ │
│                                   │ │               │ │ ─────       │ │
│ ── avatar block ──                │ │ ProcessingSt. │ │ Credits     │ │
└───────────────────────────────────┘ │  hairline bar │ │  bold gold  │ │
                                      │  gold fill    │ │ ─────       │ │
                                      │               │ │ FeatureDark │ │
                                      │ SummaryDisplay│ │  card       │ │
                                      │  in Editorial │ │ ─────       │ │
                                      │  Card         │ │ Tips Roman  │ │
                                      └───────────────┘ └─────────────┘
```

## Files touched

1. `src/components/Dashboard/Dashboard.tsx` — page wrapper, `PageHeader`, two-column grid, mount right rail. Keep all state/effects/conditional rendering.
2. `src/components/Dashboard/Sidebar.tsx` — restyle: serif labels, gold left-border on active, hairline dividers, wordmark top, avatar block bottom, sub-label slot per item. Pin/proximity behavior unchanged.
3. `src/components/Dashboard/Header.tsx` — restyle to 64px editorial topbar with hairline, credits pill, language toggle, avatar.
4. `src/components/Dashboard/InputForm.tsx` — re-skin: hairline tab strip, hairline textarea / dropzone, gold primary CTA, outline secondary. No logic changes.
5. `src/components/Dashboard/ProcessingStatus.tsx` — re-skin: 2px hairline track + gold fill, muted small-caps stage caption.
6. `src/components/Dashboard/SummaryDisplay.tsx` — wrap in `EditorialCard`, small `PageHeader` variant for section title. Logic untouched.
7. **New** `src/components/Scholar/RomanList.tsx` — ordered list with `i. ii. iii.` markers in muted ink.
8. **New** `src/components/Scholar/FeatureDarkCard.tsx` — inverted-surface card primitive.
9. **New** `src/components/Dashboard/RecentVolumesRail.tsx` — right rail composed of `RomanList`, credits block, `FeatureDarkCard`, tips block. Placeholder data with `TODO: connect` comments. Hidden < `lg`.

## Files explicitly NOT touched

- `src/index.css` (italic ban stays).
- Auth, subscription, credit, onboarding, modal, processing pipeline logic.
- Routes, query keys, Supabase calls, edge functions.
- Admin sidebar/header.
- Other dashboard subpages (Library, Academics, Examinations, Study rooms, Feedback, Profile).
- i18n JSON files.

---

## After Page 1

You preview, flag anything off, we calibrate. Once Page 1 reads right, same extraction process for Page 2. Later page descriptions plug into the same primitives.

Reply **"go"** to execute Page 1.