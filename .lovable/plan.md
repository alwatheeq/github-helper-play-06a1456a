
# Scholar v4 — Full App Integration

Scholar v4 is a static design canvas: ~8,400 lines of inline-styled JSX with 6 color families × light/dark × ~70 fixed-1280×820 artboards, no real wiring. The good news: your `ThemeContext` already names the same 6 palettes (`navy-gold`, `oxblood-cream`, `forest-parchment`, `ink-blush`, `copper-charcoal`, `monochrome`) and writes `data-theme="…"` on `<html>`. So the integration is mostly: lift v4 tokens into CSS variables, rebuild the shell + every page as responsive Tailwind components wired to existing handlers, and stub anything that has no backend yet.

This is a large initiative. Trying to land it in one shot guarantees regressions. The plan below is **phased** — each phase ships a usable app and is independently reviewable.

---

## Scope summary

- **6 themes × 2 modes** all selectable from Profile (already partly wired) — every component must read from CSS variables, not hardcoded colors.
- **~50 pages** to rebuild visually to match v4 while preserving current business logic and Supabase wiring.
- **Responsive** from ~360 px up; v4's fixed 1280-wide proportions become a design target, not a hard min-width.
- **Stub policy**: any v4 control that doesn't map to existing functionality renders, but `onClick` fires a `toast("TODO: <feature> — not implemented yet")`. Every stub is logged in the issues report.
- **Out of scope**: Supabase schema changes, edge-function changes, new features, new routes (only stubbing existing-but-missing UI).

---

## Phase 0 — Foundation (no visual change yet)

1. **Design tokens** → `src/styles/scholarV4.css`
   - For each `data-theme="<family>"` (light) and `data-theme="<family>".dark` (dark), emit the 12 palette variables from v4's `T` object as CSS custom properties: `--s4-bg, --s4-panel, --s4-panel2, --s4-ink, --s4-body, --s4-muted, --s4-accent, --s4-accent-soft, --s4-rule, --s4-chip, --s4-sb, --s4-sb-ink, --s4-sb-muted, --s4-sb-active`.
   - Add HSL equivalents so Tailwind utilities like `bg-[hsl(var(--s4-panel))]` work.
2. **Tailwind config** → extend `colors` with `scholar.*` aliases pointing at the variables; extend `fontFamily` with `serif: ['Fraunces', …]` and ensure Inter is the sans default.
3. **Fonts** → load Fraunces + Inter in `index.html` (preconnect to fonts.googleapis.com).
4. **Icon set** → port v4's inline `Ic.*` SVGs to `src/components/Scholar/icons/` as small React components that accept `className`/`color`. We do **not** replace lucide-react globally; we use Scholar icons only inside the new shell and v4-rebuilt pages.
5. **Smoke test**: load app on every theme/mode combo, verify no visual regression (variables exist but nothing consumes them yet).

Deliverable: tokens live, app looks identical to today.

## Phase 1 — App shell (visible change)

Rebuild the chrome that wraps every authenticated route:

- `Header4` → new `src/components/Layout/AppHeader.tsx` (logo monogram, tagline, credits chip, bell, avatar+plan). Wired to existing `useAuth`, `useCredits`, `NotificationCenter`.
- `Side4` → new `src/components/Layout/AppSidebar.tsx` using shadcn `Sidebar` primitives, `collapsible="icon"`, themed sidebar background from `--s4-sb`. Items: Dashboard, My Library, Study Rooms, Academics, Examinations, EduPlay, History, Feedback. Active route via `NavLink`. Mobile: `offcanvas` via existing `SidebarTrigger`.
- `Shell4` wrapper in `App.tsx` replacing the current dashboard layout container.
- Mobile: header collapses logo+tagline → just logo+monogram; sidebar slides as a sheet under 1024 px.

Deliverable: every existing page now sits inside the v4 shell. Page bodies still old; that's fine.

## Phase 2 — Dashboard / Workshop (lead page, full fidelity)

Rebuild `WorkshopPanel` and children to exact v4 spec (the one you wrote earlier — Workshop eyebrow, 32 px gap, 300 px right rail, 6 px card radius, 4 tabs File/Text/Scan/URL with 2 px bottom indicator, dropzone, dark feature card, recently-processed list with 12 px row padding).

- Tabs: File (works), Text (works), Scan/OCR (works, gated by feature flag), **URL** (no backend → stub toast).
- Right rail: Summary + Flashcards toggles already wired; the rotating tip from v4 → port verbatim.
- Recently-processed → reuse existing `RecentlyProcessedList` but restyle.
- Responsive: at <1024 px the right rail drops below the input card; at <640 px tabs become a horizontal scroller — never a horizontal page scroll.

Deliverable: Dashboard matches v4 in all 12 theme×mode combos, fully functional on a 360 px phone and a 1920 px desktop.

## Phase 3 — High-traffic pages

In this order, each as one PR-sized change:

1. **My Library** — restyle existing `LibraryPage`. All existing CRUD preserved.
2. **History / The Ledger** — restyle `HistoryPage`.
3. **Examinations hub** (Create / My Quizzes / Explore / History / Global / Preview) — restyle existing pages. *Active exam screens (MCQ / TF / Fill / Open) come in Phase 5.*
4. **Academics** hub — restyle. **Tutor / Exam Schedule / SRS Review / Analytics** sub-pages are mostly stubs in v4 → ship the layouts, wire what exists (course list), toast-stub the rest.
5. **EduPlay** hub + Brain Rush lobby/active/leaderboard/result/multiplayer — restyle existing Brain Rush + Multiplayer pages.
6. **Study Rooms** + Create/Friends/Groups/Active — restyle existing Rooms pages, including the ZegoCloud video tile.
7. **Profile** + Edit / Subscription / Billing / Username variants — restyle existing pages; the v4 "states" (canceled, failed, cooldown, empty billing) become real conditional renders driven by existing subscription state.
8. **Feedback**, **Notifications**, **Goals**, **Achievements**, **Informational** — straight restyles.
9. **Content viewers**: Read / Book Mode / Audio / Mind Map / Flashcard Study → restyle existing viewers.

For each page: same routes, same data hooks, same handlers — only JSX + Tailwind classes change. Any control without a backing handler gets a `toast("TODO: <name>")`.

## Phase 4 — Auth & out-of-shell pages

`Auth`, `OnboardingLang`, `OnboardingTheme`, `Pricing`, `Checkout`, `PaymentSuccess`, `PaymentCancel`, `AccountSuspended`, `ShareView`, `NotFound`, `Tutorial`, `InsufficientCredits`, `LowCreditBanner`, `ChatAssistant`, `FloatingMiniPlayer` — these live outside the main shell. Restyle in place.

## Phase 5 — Active exam runtime & modals

The four active-exam screens (MCQ, TF, Fill, Open) and the result screen. These re-use `QuizTakingComponent` — the logic stays, the wrapper gets the v4 chrome (timer pill, question chip strip, exit-with-confirm modal).

## Phase 6 — Cleanup & polish

- Remove dead files: legacy `Card.tsx` paths that no one renders anymore, `designSystem.css` rules superseded by Scholar tokens.
- Delete `design/` source artboards from the build (they're dev-only, but `src/pages/ScholarPreview.tsx` should point at v4 templates or be removed).
- Final pass on dark-mode contrast (Oxblood and Ink palettes have low-contrast risk per v4 values; audit `--s4-muted` against `--s4-bg`).

---

## Issues report — what's already known to be missing

You asked for "all issues — missing functions for buttons, etc." Based on a static read of v4 vs the current codebase, here's the up-front list. The full list grows during implementation; I'll keep `docs/SCHOLAR_V4_ISSUES.md` as a living checklist.

### Missing or stubbed functionality (will toast "TODO")

| v4 element | Page | Status |
| --- | --- | --- |
| **URL tab** in Workshop dropzone | Dashboard | No edge function to fetch+extract from a URL. Stub. |
| **Scan / OCR** for handwritten | Dashboard | Edge fn `ocr-scan` exists for images — works for printed; handwriting quality is uncontrolled. |
| **AI Tutor** chat surface | Academics · Tutor | No dedicated edge fn; could reuse `chat-assistant`. Stub initially. |
| **Exam Schedule** with calendar | Academics · Exams | No `exam_schedule` table. Stub. |
| **SRS Review** queue | Academics · SRS | `srsAlgorithm.ts` util exists; no `srs_cards` table. Stub queue UI. |
| **Academics Analytics** charts | Academics · Analytics | Some studyTracking exists but no aggregation endpoint. Stub charts with mock until backend lands. |
| **Find a Match** matchmaking | EduPlay · Find Match | No matchmaking edge fn; current multiplayer is invite-code only. Stub. |
| **Group Chat** (room-wide text) | Rooms · Groups / GroupChat | No `room_messages` table. Stub. |
| **Pomodoro notifications** | Notifications | `usePomodoroStore` exists locally; no push wiring. Stub the "enable push" CTA. |
| **Achievements** badges | Achievements | No `achievements` table. Stub progress bars with static data. |
| **Goals & Targets** weekly goals | Goals | No `user_goals` table. Stub with localStorage placeholder. |
| **Billing History** entries | Profile · Billing | Exists via Stripe but the v4 "empty state", "failed", "canceled" variants need state-driven rendering — wire to existing subscription status. |
| **Username cooldown** timer | Profile · Username | No `username_changed_at` timestamp on profiles. Stub timer. |
| **ShareView** rich preview | /share/:id | Exists; v4 adds reactions/comments — stub. |
| **Mind Map** export PNG | ContentView · MindMap | Library `html-to-image` not installed. Stub. |
| **Floating MiniPlayer** dock controls | Audio Study | `useFloatingVideoStore` exists, drag-to-dock is new. Stub drag. |

### Likely visual regressions to watch

- v4 uses **Fraunces** (serif) for headings everywhere — currently project uses Inter throughout. Long Arabic strings in Fraunces fall back to system serif (Fraunces has no Arabic). Need a `font-family: Fraunces, 'IBM Plex Sans Arabic', …` stack.
- v4 sidebar background is the brand-dark color (`--s4-sb`) regardless of light/dark mode. Current sidebar follows page background. Big visual change; intentional.
- v4 dropzone is 220 px tall and the right rail is 300 px wide — at viewports under ~1080 px these don't fit side-by-side. Phase 2 stacks them.
- Card radius drops from 12 px (current `rounded-xl`) to 6 px (v4). Will look "sharper / more editorial" — confirm this is desired across the app, not just Workshop.
- Button radius drops from 12 px to 4 px. Same note.

### Risky migrations

- `designSystem.css` defines `.btn-soft-primary`, `.card-subtle`, etc. with hardcoded hex. Many pages use these classes. Phase 6 maps them to v4 tokens; if a page is rebuilt in Phase 3 it can drop the class entirely.
- `tailwind.config.js` likely has color tokens that conflict with the new `scholar.*` namespace — will audit on Phase 0.
- The 6 theme palettes in `ThemeContext.tsx` currently emit **Tailwind class strings** (e.g. `bg-amber-100`) via `getThemeAccent()` etc. Anything calling these helpers keeps working but will look "off" until that page is rebuilt to consume CSS vars instead. Helpers stay for back-compat; new code uses vars.

---

## Technical details

**Files created**
- `src/styles/scholarV4.css` — 6 families × 2 modes × ~14 vars.
- `src/components/Scholar/icons/*.tsx` — ~30 icons from v4's `Ic` object.
- `src/components/Layout/AppHeader.tsx`, `AppSidebar.tsx`, `AppShell.tsx`.
- `src/components/Dashboard/v4/*.tsx` for the rebuilt Workshop pieces, then progressively under `Library/v4`, `Rooms/v4`, etc. (or in-place replacement once a page is fully ported).
- `docs/SCHOLAR_V4_ISSUES.md` — running stub/issue ledger.

**Files modified**
- `tailwind.config.js`, `index.html`, `src/App.tsx`, `src/contexts/ThemeContext.tsx` (adds CSS-var emission, keeps helper API).

**Files deleted (Phase 6 only, after all pages migrated)**
- legacy palette code paths in `designSystem.css`, the old `Header.tsx`/`Sidebar.tsx` once replaced, and the dev-only `design/*` artboards from the build.

**Stub helper**
```ts
// src/utils/todoToast.ts
import { toast } from "sonner";
export const todo = (feature: string) =>
  toast(`${feature} — not implemented yet`, { description: "Coming soon" });
```

**Responsive contract**
- Page-level horizontal scroll is a bug; flag any `min-w-[…px]` discovered.
- Below 768 px: sidebar offcanvas, right rails stack under main column, tab strips become horizontal scroll inside their card.
- Use a single content `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` rhythm everywhere.

---

## Timeline & checkpoints

- **Phase 0+1** (foundation + shell): biggest commit, visible everywhere. Show me before continuing.
- **Phase 2** (Workshop only): second checkpoint — sign-off here locks the visual language.
- **Phase 3** ships page-by-page; each page is its own commit so you can review and revert atomically.
- After Phase 3 the issues doc is finalized and we tackle stubs in priority order you choose.

Confirm the phasing (especially the Phase 0+1 checkpoint) and I'll start.
