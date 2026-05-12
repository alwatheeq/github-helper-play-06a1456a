
# Phase 5.1 — Dashboard "Workshop" Rebuild to Match Scholar v4

## Why this exists (and why it wasn't done in 4.x)

Phases 4.1–4.9 swept **primitives** across the entire app: tokens, dark siblings, motion, focus rings, icon strokes, dark-mode orphans. That work is repo-wide and mechanical — a script can do it across 200+ files safely.

Phase 5 is the opposite: **per-page composition** rebuilt against a literal blueprint (`design/templates/Scholar-v4.jsx` → `Dash4`). It cannot be scripted because:
- The v4 reference uses a different **layout grid** (`1.4fr / 1fr` two-column) than the current Dashboard (single-column flow with WorkshopPanel).
- The v4 reference uses different **section semantics** (eyebrow + serif H1 + rule, dashed dropzone, dark "What to generate" card with toggles + stepper, rotating tip card, "Recently processed" enumerated list with roman numerals).
- The current Dashboard wires **real data, real handlers, real flows** (auth, subscription gates, processing pipeline, persistent modals). The v4 reference is a static mock.

Doing this earlier would have meant either (a) scripting a layout rewrite (guaranteed to break behavior) or (b) doing it before primitives were unified (would have to be redone after every token sweep). 5.1 is the right point: tokens are stable, behavior is stable, only composition changes.

This is also why I'm doing **one page** first — Dashboard home — instead of all of them at once. After 5.1 ships, the delta-to-v4 on a real page tells us how to scope 5.2…5.7.

## Scope (strict)

In scope — only the **default `view === 'main'` Workshop screen** of `src/components/Dashboard/Dashboard.tsx` (the screen the user lands on at `/`):
- Header block: eyebrow "THE WORKSHOP", serif H1 "Process your content.", muted subhead, full-width hairline rule.
- Tab row: File / Text / Scan / URL with v4 inline SVG icons, underline-on-active.
- Two-column grid `1.4fr / 1fr`, 22px gap.
- **Left column**: dashed-border dropzone card + "RECENTLY PROCESSED" enumerated list (roman numerals, hairline dividers, "Open" button per row).
- **Right column**: dark "WHAT TO GENERATE" panel (Summary / Flashcards / Examination / Mind map toggles + Questions stepper + credits line + Generate CTA) and the rotating tip card below it.

Out of scope (do not touch):
- Sidebar, Header, GlobalChatAssistant, all routing, all other `view` branches (`history`, `library`, `quiz`, `eduplay`, `studyrooms`, `academics`, `profile`, `feedback`, `informational`, `summary`).
- All processing logic: `handleProcessing`, queue processor, translation, dedup cache, medical pipeline, Supabase reads/writes, edge function calls.
- Subscription gates, `usePersistentModal`, `useSubscriptionUpsellGate`, credit checks, paywalls.
- `InputForm`, `WorkshopPanel`, `ProcessingStatus` internals — we wire to the same callbacks; we don't change them.
- `ThemeContext`, palette strings, status-chip helpers.
- Database, RLS, edge functions, env, build config.
- Admin subtree (already excluded everywhere).

## What changes (files)

1. **New file**: `src/components/Dashboard/WorkshopV4.tsx` — presentation-only component that renders the v4 layout. Props match the existing wiring surface:
   - `activeTab`, `onTabChange` (File/Text/Scan/URL)
   - `onFileSelected(file)` — calls into the same handler `InputForm` calls today
   - `onTextSubmit(text)`, `onScanSubmit(...)`, `onUrlSubmit(...)`
   - `recentItems[]` (id, title, status, time, onOpen)
   - `generationOptions` (summary/flashcards/examination/mindmap booleans + setters)
   - `questionCount`, `setQuestionCount`
   - `creditsRequired`, `onGenerate`, `generateDisabled`
   - `tips[]` (defaults to v4 list)
   No data fetching inside; pure render.

2. **Edited**: `src/components/Dashboard/Dashboard.tsx` — only the JSX block that renders the default Workshop view. Replace the current `<InputForm …/> + <WorkshopPanel …/>` composition with `<WorkshopV4 …/>` wired to the **same state and handlers** that exist today. No change to hooks, effects, processing pipeline, or other view branches.

3. **No new CSS file**. Everything uses existing Scholar v4 tokens already in `src/index.css` and `src/styles/scholarV4.css` (`--s4-*`, `s4-h1`, `s4-eyebrow`, `s4-numeric`, `font-serif` for Fraunces). If a token is genuinely missing (e.g., the dashed-border inset spacing), add it to `scholarV4.css` as `--s4-dropzone-*` rather than inlining magic numbers.

4. **No semantic-token violations**. No raw hex, no `text-white`/`bg-black`. Dark "What to generate" panel uses `bg-foreground text-background` (or the existing inverse-surface token) — same approach 4.x already uses for inverse cards.

## Layout spec (lifted from `Dash4`, lines 152–278)

```text
┌──────────────────────────────────────────────────────────┐
│ eyebrow: THE WORKSHOP                  (accent, 10/2.5)  │
│ H1: Process your content.              (Fraunces 38/600) │
│ sub: bring in a document…              (muted 13)        │
│ ────────────────────────────────────── (hairline rule)   │
│                                                          │
│ [File●] [Text]  [Scan]  [URL]          (tab row, 38h)    │
│                                                          │
│ ┌─ 1.4fr ─────────────────┐ ┌─ 1fr ────────────────────┐ │
│ │ ┌ panel + 1.5px dashed┐ │ │ ┌ DARK PANEL ──────────┐ │ │
│ │ │   ⬆ icon            │ │ │ │ WHAT TO GENERATE      │ │ │
│ │ │   Drop your file    │ │ │ │ Summary        [on]   │ │ │
│ │ │   or click to browse│ │ │ │ Flashcards     [on]   │ │ │
│ │ │   PDF·PPTX·DOCX     │ │ │ │ Examination    [off]  │ │ │
│ │ │   [Choose a file →] │ │ │ │ Mind map       [off]  │ │ │
│ │ └─────────────────────┘ │ │ │ ─────────────────────  │ │ │
│ │                         │ │ │ Questions   [− 10 +]  │ │ │
│ │ RECENTLY PROCESSED      │ │ │ ─────────────────────  │ │ │
│ │ i.   Microeco-Ch7  Open │ │ │ 8 credits             │ │ │
│ │ ii.  Anatomy-12    Open │ │ │ [    Generate →    ]  │ │ │
│ │ iii. Cell-signal   Open │ │ └────────────────────────┘ │ │
│ │ iv.  Linear-Alg    Open │ │ ┌ tip card ─────────────┐  │ │
│ │ v.   WW2-timeline  Open │ │ │ 01 / 08               │  │ │
│ │                         │ │ │ Drop a chapter and …  │  │ │
│ └─────────────────────────┘ │ └────────────────────────┘ │ │
│                             └────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

Tokens (mapped to existing `--s4-*` set; no new primitives unless missing):
- Eyebrow: `text-[10px] tracking-[0.25em] uppercase font-bold text-accent`
- H1: `font-serif text-[38px] font-semibold text-foreground tracking-[-0.02em]`
- Hairline: `h-px bg-foreground/80`
- Tab row: `gap-7 h-[38px]`, active = `border-b-2 border-accent text-foreground font-semibold`, inactive = `text-muted-foreground`
- Dropzone outer: `bg-card border border-border p-[18px]`; inner: `border border-dashed border-border/80 px-5 py-7 text-center`
- Dark panel: `bg-foreground text-background p-[22px]`; toggles: 34×18 pill, 12×12 thumb
- Stepper: 28h cells, accent border at 33% alpha (token: `--s4-accent-soft`)
- "8 credits": `text-accent text-[11px] font-medium font-numeric`
- Generate CTA: full-width `bg-accent text-foreground py-[10px] text-[13px] font-semibold text-center`
- Tip card: `bg-card border border-border p-[16px_18px] min-h-[76px]`

Responsive:
- ≥1024px: two-column `1.4fr/1fr`, 22px gap (matches v4).
- <1024px: stack to single column, dark panel below dropzone, tip card last.
- The current viewport (904px) will see the stacked layout; that's correct and matches what v4 implies for narrow screens.

Motion:
- Tab underline transition: `transition-[border-color,color] duration-[var(--s4-dur-base)] ease-[var(--s4-ease)]`
- Toggle thumb: `transition-[margin-left] duration-[var(--s4-dur-fast)] ease-[var(--s4-ease-out)]`
- Tip rotation: existing 4500ms interval; cross-fade `transition-[opacity] duration-[var(--s4-dur-base)]`
- No `transition-all`, no `animate-*` invented.

## Wiring map (Dashboard.tsx → WorkshopV4 props)

| WorkshopV4 prop | Source in current Dashboard.tsx |
|---|---|
| `activeTab` / `onTabChange` | new local state OR existing `InputForm` tab state lifted up (read-only refactor inside the same file) |
| `onFileSelected` | existing `handleFileUpload` / `processFile` callback chain |
| `onTextSubmit` | existing `handleTextSubmit` |
| `recentItems[]` | derived from current `history` query already loaded for the Header/Sidebar |
| `generationOptions` | existing `generationPreferences` state from `mergeGenerationPreferences` |
| `questionCount` | existing question count state used by `QuizPage` defaults — read-only here, write goes to same setter |
| `creditsRequired` | existing credit calculator helper |
| `onGenerate` | existing `handleProcessing` entry point |
| `tips[]` | hardcoded v4 list inside WorkshopV4 (presentation copy, not data) |

If a piece of state isn't currently lifted to Dashboard.tsx (e.g., it lives inside `InputForm`), I will lift only that one piece up — minimum viable refactor — without touching `InputForm`'s internals beyond exporting the state shape.

## Precautions (carried from prior phases)

- No DB / schema / RLS / edge function changes.
- No `ThemeContext` palette edits.
- No `text-white`, `bg-white/N`, `border-white` removals (preserved verbatim per existing rule).
- No Admin files touched.
- Status-chip helpers untouched.
- Supabase SDK call sites untouched (`.then(null)`, `nullsFirst: false` patterns preserved).
- TypeScript: relaxed config respected; no new `strict`-only patterns.
- ErrorLogger: any new try/catch uses existing `ErrorLogger` util.
- Lazy-loaded sub-pages stay lazy.

## Verification gates (halt-on-red)

1. `tsc --noEmit` clean.
2. `vitest run` — 73/73 still pass (no test currently asserts Workshop layout, so no test changes needed; if a snapshot test exists for Dashboard, it gets reviewed and updated only for the Workshop block).
3. `npm run check:tokens` clean on `Dashboard.tsx` and `WorkshopV4.tsx`.
4. Manual visual diff: capture preview at desktop (1280) and current viewport (904), compare side-by-side with `design/Scholar v4.html` Dash4 artboard. Note remaining deltas in `docs/SCHOLAR_V4_PARITY_AUDIT.md` under "Phase 5.1 deltas".
5. Functional smoke: file drop still triggers processing; tab switch still toggles input mode; Generate still gates on credits/subscription.

## Deliverables

- `src/components/Dashboard/WorkshopV4.tsx` (new, presentation-only).
- `src/components/Dashboard/Dashboard.tsx` (Workshop JSX block swapped, wiring preserved).
- `docs/SCHOLAR_V4_PARITY_AUDIT.md` (Phase 5.1 section: before/after notes, screenshot refs, residual deltas, calibrated estimate for 5.2…5.7).
- No other files modified.

## What this plan does NOT promise

- Pixel-perfect identity with the static v4 mock at every viewport. The v4 mock is a fixed 1280×820 artboard; the live app is responsive. Spec above defines the responsive fallback explicitly so we don't drift.
- Touching other Dashboard `view` branches. Those are 5.2+ (Library, Quiz, EduPlay, StudyRooms, Academics, Profile, Feedback) and will get their own per-page plans, scoped from what we learn here.

Awaiting approval to implement.
