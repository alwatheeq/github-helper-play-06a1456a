# Fix: "Missing Supabase environment variables" white-screen crash

## Root cause

`src/lib/supabase.ts` throws synchronously at module load when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are undefined:

```ts
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables...')
}
```

Because this runs during the import graph, the React tree never mounts — so `EnvValidator` (which is designed to show a friendly "Configuration Error" screen) never gets a chance to render. The user sees the raw Uncaught Error from the bundled `index-CNoni6gY.js`.

This contradicts the project memory rule:
> Supabase client uses placeholder values for missing env vars to render custom error UI.

Additionally, the sandbox currently has no `.env` file, and `.gitignore` lists `.env`, which is the typical Lovable/Vite-stack scenario where the managed env file gets dropped between sessions.

## Changes

### 1. `src/lib/supabase.ts` — use placeholder fallbacks instead of throwing

Replace the throw with safe placeholder values so module load always succeeds. `EnvValidator` then handles the missing-config case at render time.

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use placeholders when env vars are missing so the app can still mount
// and EnvValidator can render the friendly Configuration Error screen.
const effectiveUrl = supabaseUrl || 'https://placeholder.supabase.co'
const effectiveKey = supabaseAnonKey || 'placeholder-anon-key'

export const supabase = createClient(effectiveUrl, effectiveKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export const isSupabaseConfigured = (): boolean =>
  Boolean(supabaseUrl && supabaseAnonKey)
```

No throw, no behavioral change when env vars ARE set, and `isSupabaseConfigured()` still reports the true state (using the original variables, not the placeholders).

### 2. `.gitignore` — stop ignoring `.env`

Per the Lovable Vite-stack guidance for this exact symptom, remove the `.env` line from `.gitignore` so the managed env file is tracked and survives sandbox restarts. (`.env.local`, `.env.*.local` etc. remain covered by the existing `*.local` pattern; we only remove the bare `.env` line.)

## Why this is safe

- No backend / Supabase schema changes (respects the Supabase preservation rule).
- No new dependencies.
- All existing call sites of `supabase` keep working unchanged when env vars are present.
- When env vars are absent, `EnvValidator` (already wired in `App.tsx`) shows the proper Configuration Error UI instead of a hard crash.

## Verification after implementation

- `tsc --noEmit` clean.
- With env vars present: app loads normally, auth/queries unchanged.
- With env vars absent: `EnvValidator` Configuration Error screen renders (no Uncaught Error in console).
- Reload preview to confirm the white-screen crash is gone.

Reply with **go** (or "approve") to apply these two edits.