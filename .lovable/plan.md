## Fix the 4 Build Errors Blocking the Preview

The preview is white because TypeScript is failing the build on 4 errors. All are small, mechanical fixes — no logic changes, no UI changes, no Supabase changes.

---

### 1. `src/test/subscription.test.ts` — 3 errors (lines 36, 71, 98)

**Problem**: The mock subscription objects in 3 test cases are missing `created_at` and `updated_at`, which the `Subscription` type requires.

**Fix**: Add the two timestamp fields to each of the three mock subscription objects (the ones starting at lines 16, 51, and 78). Use `new Date().toISOString()` for both:

```ts
created_at: new Date().toISOString(),
updated_at: new Date().toISOString(),
```

No test logic changes — just adding the missing properties so the mock matches the type contract.

---

### 2. `src/utils/queueProcessor.ts` line 223 — destructuring a non-iterable

**Problem**: Line 221 does `const additionalCards = additionalResult.flashcards || additionalResult;`. When the fallback (`additionalResult`) is hit, it's a `FlashcardsResult` object (not an array), so spreading it on line 223 (`[...allFlashcards, ...additionalCards]`) fails because `FlashcardsResult` has no iterator.

**Fix**: Make the fallback safe by ensuring `additionalCards` is always an array:

```ts
const additionalCards = Array.isArray(additionalResult)
  ? additionalResult
  : (additionalResult.flashcards || []);
```

This guarantees the spread on line 223 always works, no behavior change for the normal case.

---

### What this does NOT touch
- No Supabase / database / migration changes
- No UI changes
- No new features
- No theme or design system changes

---

### After this is fixed
The preview will load and we can move on to your next ask: the **personalized onboarding stage** ("what are you studying for?" → med / university / self-learner → templated home screen). I'll bring that up as the next step once you can see the app running.