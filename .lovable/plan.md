
# Scholar Redesign — Final Verified Plan

A complete visual transformation of the app into a "university reading room" aesthetic. **100% functional parity** — only CSS variables, palette tokens, fonts, and component styling change. No business logic, hooks, Supabase calls, RPC names, table names, or routes are altered. No GitHub commits will be triggered until you confirm.

---

## Scope guarantees

- **Themes**: 6 new Scholar palettes replace the active theme set. Legacy themes (`monochrome`, `warm-neutrals`, `sky-blue`, `rose-pink`, `slate-mist`, `plum-sand`) are **commented out, not deleted**, in `ThemeContext.tsx` and `VALID_COLOR_THEMES`. The new `monochrome` Scholar variant is included as the 6th palette.
- **Typography**: `Fraunces` (display serif), `Inter` (UI sans), `Amiri` (Arabic serif). All loaded **without italic axes**. A global rule sets `font-style: normal !important` on `em`, `i`, and `.italic`.
- **No surface skipped**: every file listed below is touched.

---

## The 6 Scholar Palettes (light + dark each)

| # | Name | Light bg | Dark bg | Accent |
|---|------|----------|---------|--------|
| 1 | Navy & Gold | parchment cream | deep navy | warm gold |
| 2 | Oxblood & Cream | cream | charcoal | oxblood red |
| 3 | Forest & Parchment | parchment | dark forest | forest green + gold |
| 4 | Ink & Blush | blush ivory | ink black | dusty rose |
| 5 | Copper & Charcoal | warm beige | charcoal | copper |
| 6 | Monochrome | gray-50 → white | gray-900 → black | grey gradient (no gold) |

Each palette exposes the same token contract so swapping is one variable change.

---

## Phases & file inventory

### Phase 1 — Foundation
- `index.html` — preload Fraunces / Inter / Amiri (upright weights only).
- `src/index.css` — define `:root` and `[data-theme="..."]` CSS variables for all 6 palettes (×2 modes), parchment-shimmer keyframe, hairline divider util, `font-style: normal !important` override.
- `src/styles/designSystem.css` — Scholar tokens (radii 6px, eyebrow caps, hairlines, shadow scale).
- `tailwind.config.js` — extend with Scholar font families, semantic color tokens bound to CSS vars, safelist new gradient classes.
- `src/contexts/ThemeContext.tsx` — comment out legacy `themeDefinitions`; add 6 Scholar entries; flip default; keep API (`getThemeGradient`, `getThemeCardBg`, etc.) identical so no consumer breaks.

### Phase 2 — Scholar primitives (new folder `src/components/Scholar/`)
- `ScholarCard.tsx`, `ScholarButton.tsx`, `ScholarEyebrow.tsx`, `RomanList.tsx`, `BookSpine.tsx`, `Hairline.tsx`
- `ScholarSpinner.tsx`, `ScholarLoadingButton.tsx` (replaces `Common/LoadingButton.tsx` visuals via re-export wrapper — original file kept as thin pass-through for back-compat)
- `SkeletonLine.tsx`, `SkeletonCard.tsx`, `SkeletonSpine.tsx` (parchment shimmer; supersedes `Common/LoadingSkeleton.tsx` visuals)
- `EmptyState.tsx`, `ErrorState.tsx` (literary copy, themed icons)
- `ScholarToast.tsx` + reconfigure Sonner in `src/components/Toast/Toast.tsx`

### Phase 3 — App shell
- `src/components/Dashboard/Sidebar.tsx` — book-spine nav, eyebrow caps, hairline dividers
- `src/components/Dashboard/Header.tsx` — serif title, gold underline, restyled credit pill
- `src/components/Dashboard/Dashboard.tsx` — Suspense fallback → `ScholarSpinner`; mobile FAB restyled

### Phase 4 — Home / input flow
- `InputForm.tsx`, `ProcessingStatus.tsx`, `LowCreditBanner.tsx`, `LowCreditWarning.tsx`, `InsufficientCreditsModal.tsx`, `CreditBalanceWidget.tsx`

### Phase 5 — Library, History, Content, Sharing
- `LibraryPage.tsx`, `TopicsTagsModal.tsx`, `HistoryPage.tsx`, `ContentViewPage.tsx`, `ShareView.tsx` (both copies), `FavoriteButton.tsx`, `LikeButton.tsx`, `CommentSection.tsx`

### Phase 6 — Summary, Flashcards, MindMap, BookMode, ReadAloud, AudioStudy, Highlighting
- `SummaryDisplay.tsx`, `FlashcardViewer.tsx`
- `MindMap/*` (visual only — node/edge styling via theme vars)
- `BookMode/*`, `ReadAloud/*`, `AudioStudy/*`, `Highlighting/*`

### Phase 7 — Quiz, Manual builder, AI generator
- `QuizPage.tsx`, `QuizTakingComponent.tsx`, `ManualQuestionBuilder.tsx`, `AIQuestionGenerator.tsx`

### Phase 8 — EduPlay / Brain Rush / Multiplayer / Study Rooms
- `EduPlayPage.tsx`, `BrainRushGamePlay.tsx`, `BrainRushQuestionResults.tsx`, `BrainRushResults.tsx`, `BrainRushMultiplayerWrapper.tsx`
- `MultiplayerMenu.tsx`, `MultiplayerLobby.tsx`, `MultiplayerGamePlay.tsx`, `MultiplayerResults.tsx`, `GameJoinPage.tsx`
- `StudyRoomsPage.tsx`, `ZegoVideoRoom.tsx` (chrome only — Zego SDK untouched), `FloatingVideo/*`

### Phase 9 — Academics, Social, Profile, Goals, Achievements
- `Academics/*` (entire folder)
- `Social/*`
- `ProfilePage.tsx`, `StudyGoalsPage.tsx`, `GoalsAndAchievementsPage.tsx`, `AchievementsPage.tsx`, `GlobalExamDetailModal.tsx`, `UsernameSetupModal.tsx`

### Phase 10 — Notifications, Pomodoro, Feedback, Informational, Billing, Subscription
- `NotificationCenter.tsx` → "THE BULLETIN" (serif headers, themed icons, restyled Pomodoro section)
- `PomodoroTimer.tsx`
- `FeedbackPage.tsx`, `InformationalPage.tsx`
- `BillingHistoryPage.tsx`, `SubscriptionManagementPage.tsx`
- `Subscription/PersistentSubscriptionModal.tsx`, `Subscription/SubscriptionGuard.tsx`

### Phase 11 — System UI layer (toasts / modals / loaders / hooks)
- `Common/Modal.tsx`, `Common/ConfirmationModal.tsx`, `Common/PromptModal.tsx`
- `Common/Card.tsx`, `Common/Badge.tsx`, `Common/Tooltip.tsx`
- `Common/LoadingButton.tsx`, `Common/LoadingSkeleton.tsx` (re-skin to Scholar)
- `Toast/Toast.tsx` + Sonner config
- `hooks/useConfirm.tsx`, `hooks/usePrompt.tsx` (return Scholar-styled nodes)
- `AccountSuspended.tsx`, `NotFound.tsx`, `EnvValidator.tsx`, `ErrorBoundary.tsx`, `LanguageToggle.tsx`, `SubscriptionRefreshListener.tsx`

### Phase 12 — Auth, Onboarding, Pricing, Chat
- `Auth/Auth.tsx`
- `Onboarding/LanguageChoicePage.tsx`, `OnboardingWizard.tsx`, `PageTutorial.tsx`, `TutorialStep.tsx` (configs untouched)
- `Pricing/PricingPage.tsx`, `CheckoutPage.tsx`, `PaymentSuccess.tsx`, `PaymentCancel.tsx`
- `ChatAssistant/ChatAssistant.tsx` + `.css`, `GlobalChatAssistant.tsx` + `.css`

### Phase 13 — Admin surfaces (full pass)
- `Admin/AdminLogin.tsx`, `AdminDashboard.tsx`, `AdminHeader.tsx`, `AdminSidebar.tsx`, `AdminRoute.tsx`
- `OverviewPage.tsx`, `UsersPage.tsx`, `AdminUsersManagementPage.tsx`, `UserActivityPage.tsx`
- `AnalyticsPage.tsx`, `TokenUsagePage.tsx`, `TransactionsPage.tsx`, `CreditManagementPage.tsx`
- `SubscriptionsManagementPage.tsx`, `SubscriptionModal.tsx`
- `FeedbackManagementPage.tsx`, `FoldersManagementPage.tsx`, `TagsManagementPage.tsx`
- `AppSettingsPage.tsx`, `AuditLogPage.tsx`, `BlockUserModal.tsx`

### Phase 14 — Theme picker + i18n + QA
- Theme picker UI in `ProfilePage` + admin `AppSettingsPage` — 6 Scholar swatches with light/dark preview
- i18n: add `scholar.*` namespace (loaders, empty states, error states, bulletin labels) to `src/locales/en.json`, `ar.json`, `fr.json`, `tr.json`
- Final QA pass: RTL (Arabic), mobile (375 / 768), contrast (WCAG AA on every palette), keyboard focus rings visible on all 6 palettes, dark-mode parity for every page touched in phases 3–13

---

## Technical notes

- **No DB / RPC / edge function changes.** No migrations. Supabase preserved per project memory.
- **Token contract** stays identical (`getThemeGradient`, `getThemeCardBg`, `getThemeCardBorder`, `getThemeTextPrimary`, etc.) so existing consumers keep working — only the values they return change.
- **Italic suppression** is enforced both at font-load level (no italic axes loaded) and CSS level (`em, i, .italic { font-style: normal !important; }`) so any third-party component rendering `<em>` still looks upright.
- **GitHub sync**: Lovable's GitHub integration auto-syncs file edits. There is no manual push step to withhold. We'll work phase-by-phase so you can review each in the live preview, and any phase can be reverted from history before you publish.

---

## Order of execution after approval

Phases run sequentially 1 → 14. After each phase I'll stop and surface what changed so you can spot-check the preview before I continue. Approve this plan to start with Phase 1.
