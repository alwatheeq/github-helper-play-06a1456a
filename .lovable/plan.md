# Why the page is slow to appear

Your app currently downloads a huge JavaScript bundle before it can render anything. Two things compound:

1. **`Dashboard.tsx` eagerly imports every page** (Library, Quiz, Profile, StudyRooms, Academics, EduPlay, History, Informational, Feedback, SummaryDisplay, InputForm…). That's ~25,000 lines of component code pulled in on first load, even if the user only ever visits the home view.
2. **Heavy third-party libraries are pulled into the main chunk** because the components that use them are eagerly imported through Dashboard:
   - `@zegocloud/zego-uikit-prebuilt` (very large, used only in StudyRooms)
   - `@xyflow/react` + `dagre` (MindMap only)
   - `recharts` (CourseAnalytics only)
   - `html2pdf.js` (SummaryDisplay PDF export + BillingHistory only)
   - `qrcode.react`, all `lucide-react` icons

Result: the browser must download/parse megabytes of JS before the dashboard shell paints. Slow networks/CPUs feel a multi-second white screen.

The console log already hints at it: `LibraryPage.fetchLibraryData: 699ms` runs immediately on dashboard mount because Library is part of the initial chunk and its effects run as soon as Dashboard mounts.

# Plan — Reduce initial bundle and defer heavy work

## 1. Lazy-load every Dashboard sub-page

Convert the eager imports in `src/components/Dashboard/Dashboard.tsx` (lines 8–17) to `React.lazy(...)` and wrap the page-switch render in a single `<Suspense fallback={<LoadingSpinner/>}>`. Pages to lazy-load:

- `LibraryPage`, `HistoryPage`, `InformationalPage`, `FeedbackPage`, `ProfilePage`, `QuizPage`, `EduPlayPage`, `StudyRoomsPage`, `AcademicsPage`, `SummaryDisplay`

Keep eager: `Header`, `Sidebar`, `InputForm`, `ProcessingStatus` (needed for the default home view paint).

This alone removes the largest chunks (Zego, MindMap, recharts, html2pdf) from the initial load — they only download when the user opens those features.

## 2. Lazy-load heavy components inside their pages

- `MindMapView` (`@xyflow/react`+`dagre`) → lazy inside `SummaryDisplay`/wherever it renders
- `CourseAnalytics` (`recharts`) → lazy inside `AcademicsPage`
- `ZegoVideoRoom` → already isolated; ensure it's only imported lazily by `StudyRoomsPage`
- `html2pdf.js` → switch to dynamic `await import('html2pdf.js')` inside the export click handler in `SummaryDisplay.tsx` and `BillingHistoryPage.tsx`, instead of a top-level import

## 3. Tighten Vite chunking

Update `vite.config.ts` `manualChunks` so heavy libs each get their own chunk that only loads on demand:

```text
react-vendor:     react, react-dom, react-router-dom
supabase-vendor:  @supabase/supabase-js
zego-vendor:      @zegocloud/zego-uikit-prebuilt
flow-vendor:      @xyflow/react, dagre
charts-vendor:    recharts
pdf-vendor:       html2pdf.js
qr-vendor:        qrcode.react
icons-vendor:     lucide-react
```

Add `<link rel="preconnect">` to the Supabase URL in `index.html` so the auth round-trip starts earlier.

## 4. Defer non-critical effects on first paint

- In `LibraryPage.tsx`, gate `fetchLibraryData` behind the user actually opening Library (it already runs at mount because Library mounts with Dashboard). Once step 1 lands, this is automatic.
- In `App.tsx`, the `check_user_block_status` RPC (line 65) currently blocks the entire UI behind `checkingBlock`. Render the dashboard optimistically and only redirect to `/account/suspended` if the check returns blocked — removes one full RPC round-trip from time-to-interactive.

## 5. Verify

- Run `npm run build` and inspect the printed chunk sizes — the main entry chunk should drop substantially (target: main < 300 kB gz, with zego/flow/charts/pdf split into separate ≥100 kB chunks loaded on demand).
- Manually confirm Library, Quiz, StudyRooms, Academics still navigate and render (lazy fallback spinner, then content).

## Expected impact

- First meaningful paint of the dashboard shell drops from "download everything" to roughly Header+Sidebar+InputForm only.
- Routes the user never visits (e.g. StudyRooms with Zego, MindMap with xyflow, Analytics with recharts) never download their JS.
- Removing the blocking block-status RPC removes ~200–500 ms before the UI shows.

## Files to edit

- `src/components/Dashboard/Dashboard.tsx` — lazy imports + Suspense wrapper
- `src/components/Dashboard/SummaryDisplay.tsx` — dynamic import for `html2pdf.js`, lazy `MindMapView`
- `src/components/Dashboard/BillingHistoryPage.tsx` — dynamic import for `html2pdf.js`
- `src/components/Dashboard/Academics/AcademicsPage.tsx` — lazy `CourseAnalytics`
- `src/components/Dashboard/StudyRoomsPage.tsx` — confirm `ZegoVideoRoom` is lazy
- `vite.config.ts` — expanded `manualChunks`
- `index.html` — Supabase `preconnect`
- `src/App.tsx` — non-blocking block-status check
