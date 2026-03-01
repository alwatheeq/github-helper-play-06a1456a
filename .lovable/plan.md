

## Fix All Build Errors

### 1. `src/utils/errorLogger.ts` — Add index signature to `ErrorContext`
Add `[key: string]: unknown;` to the `ErrorContext` interface. This fixes ~40 errors where extra properties like `email`, `userRole`, `adminEmail`, `feedbackId`, `error`, `isVerified`, `newStatus` are passed.

### 2. `src/hooks/useConfirm.tsx` — Change return type to `React.ReactNode`
Change `ConfirmModal: JSX.Element | null` to `ConfirmModal: React.ReactNode`. Fixes JSX component type errors in `CreditManagementPage.tsx`.

### 3. `src/hooks/usePrompt.tsx` — Same fix
Change the `PromptModal` return type to `React.ReactNode`.

### 4. `src/App.tsx` — Remove unused imports
Remove `useState`, `useEffect` from React import. Remove unused lazy imports (`NotFound`, `MultiplayerLobby`, `MultiplayerGamePlay`, `MultiplayerResults`). Remove `userRole` from ErrorLogger call (covered by fix #1 but cleaner to remove if unused).

### 5. `src/components/Admin/AdminLogin.tsx`
- Call `const { getThemeGradient } = useTheme();` (already imports `useTheme` but never calls it)
- Fix line 88: change `ErrorLogger.warn(accessError, ...)` to `ErrorLogger.warn(accessError.message, ...)`

### 6. `src/components/Admin/AdminUsersManagementPage.tsx`
- Add `import { useTheme } from '../../contexts/ThemeContext';` and call `const { getThemeGradient } = useTheme();`
- Fix `.catch()` on `supabase.rpc()` — wrap each call: `Promise.resolve(supabase.rpc(...)).catch((err: Error) => ...)`

### 7. `src/components/Admin/AnalyticsPage.tsx`
- Add `useTheme` import and call
- Fix date range state type: add `'365'` to the union type `'7' | '30' | '90' | '365'`

### 8. `src/components/Admin/AuditLogPage.tsx`
- Add `useTheme` import and call
- Remove unused `Filter` import

### 9. `src/components/Admin/CreditManagementPage.tsx`
- Remove unused `Eye` import and unused destructured elements
- Fix `.catch()` on `supabase.rpc()` — same `Promise.resolve()` wrapper

### 10. `src/components/Admin/FeedbackManagementPage.tsx`
- Remove unused `CheckCircle`, `Video` imports
- Fix `.catch()` on `supabase.rpc()` calls

### No Supabase/database files touched.

