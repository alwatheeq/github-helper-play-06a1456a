## Project review — current health

I ran the full toolchain and inspected the codebase section by section. Here is what I found and what I propose to fix.

### What is already healthy
- **Tests**: 73/73 pass across 9 files (auth, credits, dedup, queue, subscription, examples).
- **Edge functions**: `tsc` on `supabase/functions/tsconfig.json` is clean — no errors.
- **Dev server**: no runtime errors in the log; preview is rendering.
- **Memory + theme system**: ThemeContext, error logger, Supabase init all wired correctly per project memory.
- **Workflow checks**: `useAuth` → `AuthContext`, `AdminRoute` double-verifies via `admin_users` table (server-side), CORS shared module is correct, Stripe checkout flow validates inputs and uses metadata correctly. No cross-file regressions detected.

### What is broken

`npx tsc --noEmit -p tsconfig.app.json` reports **3 errors**, and ESLint reports **1 error** (102 warnings — non-blocking, mostly `any` in tests/utils and exhaustive-deps hints).

| # | File | Line | Issue |
|---|------|------|-------|
| 1 | `src/hooks/useSTT.ts` | 68 | `Cannot find name 'SpeechRecognitionEvent'` |
| 2 | `src/hooks/useSTT.ts` | 84 | `Cannot find name 'SpeechRecognitionErrorEvent'` |
| 3 | `src/utils/haikuClient.ts` | 60 | `'signal' does not exist in type 'FunctionInvokeOptions'` |
| 4 | `src/hooks/useNotifications.ts` | 88 | ESLint error: `setupRealtimeSubscription` defined but never used |

---

## Fixes (mechanical, no behavior change)

### Fix 1 + 2 — `src/hooks/useSTT.ts` Web Speech types

The file already declares `type SpeechRecognition = any` for the constructor but uses two more types (`SpeechRecognitionEvent`, `SpeechRecognitionErrorEvent`) that the TS DOM lib in this project does not ship. Add matching local type aliases right next to the existing one:

```ts
type SpeechRecognition = any;
type SpeechRecognitionEvent = any;
type SpeechRecognitionErrorEvent = any;
```

This keeps the existing relaxed-typing pattern for the browser-only API. No runtime change.

### Fix 3 — `src/utils/haikuClient.ts` invoke `signal` option

`supabase.functions.invoke()` in `@supabase/supabase-js@2.54.x` does not accept `signal` in its options type — passing it currently has no effect at runtime *and* fails the build. Replace the `AbortController` + `signal` pattern with a real `Promise.race` timeout that actually enforces the timeout:

```ts
async callFunction(functionName: string, body: Record<string, unknown>): Promise<any> {
  try {
    ErrorLogger.debug('Invoking function', { /* unchanged */ });

    const invokePromise = supabase.functions.invoke(functionName, { body });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Function ${functionName} timed out after ${this.requestTimeout}ms`)),
        this.requestTimeout
      )
    );

    const { data, error } = await Promise.race([invokePromise, timeoutPromise]);
    // ...rest of the function unchanged (drop the clearTimeout line)
  }
}
```

This actually enforces the timeout (the previous code didn't, since `signal` was silently ignored) and is fully type-safe.

### Fix 4 — `src/hooks/useNotifications.ts` dead code

`setupRealtimeSubscription` (lines 88–111) is a leftover duplicate — the realtime channel is already set up inline in the `useEffect` at lines 24–49. Delete the unused function. No behavior change because nothing calls it.

---

## What I am NOT changing
- No Supabase schema / RLS / migrations.
- No UI, theme, or layout work (the redesign discussion stays paused — pick that up separately when you're ready).
- No alert→toast migration on `QuizPage` / `EduPlayPage` / `StudyRoomsPage` (tracked in `IMPLEMENTATION_REVIEW_REPORT.md`, but it's a UX cleanup, not a build blocker — happy to do it as a follow-up).
- 102 ESLint warnings remain (mostly `any` in test mocks and `react-hooks/exhaustive-deps` suggestions). They don't block the build and fixing them risks behavior changes; recommend addressing only if you want a fully green lint.

---

## After these fixes
- `npx tsc --noEmit -p tsconfig.app.json` → 0 errors
- `npm run lint` → 0 errors (warnings only)
- `npx vitest run` → 73/73 pass (unchanged)
- `npm run quality` should pass end-to-end

Then we can resume the UI redesign conversation, or I can start on the alert→toast cleanup as a follow-up — your call.