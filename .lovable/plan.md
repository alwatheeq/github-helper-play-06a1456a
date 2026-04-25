

## Fix All Remaining Dashboard Build Errors

The errors fall into a few repeating patterns. Here's the full fix plan:

### Pattern 1: Missing `useTheme` import (11 files)
These files use `getThemeGradient` or `useTheme()` but never import `useTheme` from ThemeContext:

| File | Fix |
|------|-----|
| `BrainRushQuestionResults.tsx` | Already imports `useTheme` (line 5) but never calls it. Add `const { getThemeGradient } = useTheme();` inside component (after line 45) |
| `ManualQuestionBuilder.tsx` | Add `import { useTheme } from '../../contexts/ThemeContext';` at top |
| `SubscriptionManagementPage.tsx` | Add `import { useTheme } from '../../contexts/ThemeContext';` at top |
| `TopicsTagsModal.tsx` | Already imports `useTheme` (line 3) but never calls it. Add `const { getThemeGradient } = useTheme();` inside component |
| `NotFound.tsx` | Add `import { useTheme } from '../contexts/ThemeContext';` at top |
| `LanguageToggle.tsx` | Add `import { useTheme } from '../contexts/ThemeContext';` and call `const { getThemeGradient } = useTheme();` inside component |
| `PricingPage.tsx` | Add `import { useTheme } from '../../contexts/ThemeContext';` at top |
| `CheckoutPage.tsx` | Already imports `useTheme` (line 5) but never calls it. Add `const { getThemeGradient } = useTheme();` |
| `PaymentSuccess.tsx` | Add `import { useTheme } from '../../contexts/ThemeContext';` at top |
| `PaymentCancel.tsx` | Add `import { useTheme } from '../../contexts/ThemeContext';` at top |
| `GoalsAndAchievementsPage.tsx` | Add `import { useTheme } from '../../contexts/ThemeContext';` and call `const { getThemeGradient } = useTheme();` |

### Pattern 2: Missing `ErrorLogger` import (3 files)
| File | Fix |
|------|-----|
| `FlashcardViewer.tsx` | Add `import { ErrorLogger } from '../../utils/errorLogger';` |
| `Header.tsx` | Add `import { ErrorLogger } from '../../utils/errorLogger';` |
| `LowCreditBanner.tsx` | Add `import { ErrorLogger } from '../../utils/errorLogger';` |

### Pattern 3: Missing `usePageTutorial` / `PageTutorial` imports (3 files)
| File | Fix |
|------|-----|
| `HistoryPage.tsx` | Add `import { usePageTutorial } from '../../hooks/usePageTutorial';` and `import { PageTutorial } from '../Onboarding/PageTutorial';` |
| `InformationalPage.tsx` | Add same two imports + `import { useEffect } from 'react';` (change `import React from` to `import React, { useEffect } from`) |
| `ProfilePage.tsx` | Add `import { usePageTutorial } from '../../hooks/usePageTutorial';` and `import { PageTutorial } from '../Onboarding/PageTutorial';` |

### Pattern 4: Missing `toast` / `setShowSubscriptionModal` references
- `EduPlayPage.tsx` line 292: `setShowSubscriptionModal` doesn't exist. The component uses `usePersistentModal` pattern elsewhere — but actually it doesn't import it. Since `hasActiveSubscription` is already checked, simplest fix: replace `setShowSubscriptionModal(true)` with `showErrorToast('Active subscription required')` or add the modal import. I'll add the modal pattern.
- `GoalsAndAchievementsPage.tsx` line 186: Same issue — `setShowSubscriptionModal(true)`. Already has `PersistentSubscriptionModal` imported. Needs a `const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);` state variable.
- `ProfilePage.tsx` line 1158: `toast` not defined. Uses `useToast` but destructures as `{ error: showErrorToast, success: showSuccessToast }`. Need to add `const toast = useToast();` or reference `showSuccessToast`.

### Pattern 5: Shorthand property errors (variables not in scope)
- `EduPlayPage.tsx` line 504: `{ gameCode }` — `gameCode` is not the local var name; the local is `joinCode`. Fix: `gameCode: joinCode`
- `EduPlayPage.tsx` line 575: `currentGameSession` not defined — the var is `currentGame`. Fix: `gameSessionId: currentGame?.id`
- `MultiplayerMenu.tsx` line 104: `{ gameTitle, difficulty }` — locals are `gameName` and no `difficulty` state. Fix: use actual variable names
- `LibraryPage.tsx` line 700: `{ invitationId }` — no such var. Fix: use the actual parameter name
- `QuizTakingComponent.tsx` lines 84/98/113: `{ quizSessionId }` — no such var. Fix: `quizSessionId: quizId`

### Pattern 6: Supabase API issues
- `LibraryPage.tsx` lines 391/393: `nullsLast` doesn't exist — change to `nullsFirst: false`
- `LibraryPage.tsx` lines 264/318/552/597/636/709/773/830/883/921: `showNotification` callback signature mismatch. The function being passed has `(message, type)` but target expects `(msg) => void`. Fix: wrap with `(msg: string) => showNotification(msg, 'error')`
- `LibraryPage.tsx` lines 856/866: `ErrorLogger.warn` expects string, getting `Error`. Fix: pass `.message`
- `LibraryPage.tsx` line 1061: `fetchLibraryData` as click handler — wrong signature. Fix: wrap in `() => fetchLibraryData()`
- `LibraryPage.tsx` line 1250/1252: `title` prop on Lucide icon — remove `title` prop

### Pattern 7: Supabase select type issues
- `QuizTakingComponent.tsx` lines 92-93: `data.id` and `data.question_count` don't exist in select. Add `id` and `question_count` to the `.select()` call
- `StudyRoomsPage.tsx` lines 299-300: `p.user_profiles` returns array. Fix: access `p.user_profiles[0]` or use `.single()`

### Pattern 8: ZegoCloud type errors
- `ZegoVideoRoom.tsx` lines 121/123: String literals not assignable to enum types. Fix: cast using `as any` or use the SDK's enum values

### Pattern 9: ProfilePage achievement type
- Line 740: Array cast to single `Achievement`. Fix: `as unknown as Achievement[]` and iterate

### Files to modify (22 files total)
1. `BrainRushQuestionResults.tsx` — call `useTheme()`
2. `EduPlayPage.tsx` — fix shorthand props, add subscription modal state
3. `FlashcardViewer.tsx` — add ErrorLogger import
4. `GoalsAndAchievementsPage.tsx` — add useTheme, add subscription modal state
5. `Header.tsx` — add ErrorLogger import
6. `HistoryPage.tsx` — add usePageTutorial/PageTutorial imports
7. `InformationalPage.tsx` — add useEffect, usePageTutorial, PageTutorial imports
8. `LibraryPage.tsx` — fix nullsLast, callback signatures, click handler, icon props, ErrorLogger.warn
9. `LowCreditBanner.tsx` — add ErrorLogger import
10. `ManualQuestionBuilder.tsx` — add useTheme import
11. `MultiplayerMenu.tsx` — fix shorthand props
12. `ProfilePage.tsx` — add usePageTutorial/PageTutorial/toast imports, fix achievement cast
13. `QuizTakingComponent.tsx` — fix shorthand props, add fields to select
14. `StudyRoomsPage.tsx` — fix user_profiles array access
15. `SubscriptionManagementPage.tsx` — add useTheme import
16. `TopicsTagsModal.tsx` — call useTheme()
17. `ZegoVideoRoom.tsx` — fix enum type casts
18. `LanguageToggle.tsx` — add useTheme import + call
19. `NotFound.tsx` (src/components/) — add useTheme import
20. `PricingPage.tsx` — add useTheme import
21. `CheckoutPage.tsx` — call useTheme()
22. `PaymentSuccess.tsx` / `PaymentCancel.tsx` — add useTheme import

### No database/migration/Supabase config changes.

