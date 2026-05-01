# Phase 4 Verification — PASS

Confirmed clean across all 7 in-scope files (`Modal.tsx`, `UsernameSetupModal.tsx`, `Dashboard.tsx`, `InputForm.tsx`, `ProcessingStatus.tsx`, `SummaryDisplay.tsx`, `CreditBalanceWidget.tsx`):
- Zero `useTheme()` / `getTheme*()` calls remain (only one harmless comment reference in `SummaryDisplay.tsx`).
- 135 references to new Scholar primitives / role tokens (`ScholarCard`, `text-ink`, `accent-gold`, `bg-card-light`, `border-divider`, `bg-subtle`, `ring-focus`).
- No stray legacy literals (`cyan-500`, `blue-500/50`, raw `gray-*`).
- `previewMode` prop on `InputForm` confirmed as a clean opt-in — no behavioral change for production callers.
- Phase 1–3 fixes (token definitions, sidebar/header chrome) intact, no regressions.

Ships clean.

---

# Phase 5 — Sub-Pages & Remaining Modals

**Goal:** Bring the rest of the user-facing routes onto Scholar tokens. After Phase 5 the only remaining `useTheme()` consumers should be `ThemeContext.tsx` itself (kept for backward compat shim) and a handful of niche overlays we'll close out in Phase 6.

**Scope:** ~70 files, ~1,500 helper calls. Run in **6 waves**, each independently shippable so you can review/approve mid-flight without leaving the app in a half-broken state.

### Hard precautions (apply to every wave)

- **No backend touch.** Zero changes to Supabase queries, RPCs, RLS, edge functions, schema, or auth. Token-only refactor.
- **Public prop APIs unchanged.** Every component keeps the same exports, props, return shape, ref forwarding, and i18n keys.
- **No behavior changes.** No state-machine edits, no effect rewrites, no event-handler logic edits, no router changes.
- **Tier badge palette preserved** (`Header.tsx` lines 68–73 exception — same rule as Phases 3–4).
- **i18n / RTL preserved.** All `t()` keys, `dir`, and conditional spacing classes left untouched.
- **Subscription/credit gating preserved.** Don't touch `useSubscription`, `SubscriptionGuard`, `PersistentSubscriptionModal` logic — only their visual surfaces.
- **Lazy-loading preserved.** Don't change any `React.lazy` boundary or `Suspense` fallback structure.
- **One file, one commit-equivalent edit.** No drive-by refactors of unrelated logic in the same file.
- **Token mapping = same as Phase 4** (locked source of truth, reproduced below — no new tokens introduced).

### Token mapping (reused from Phase 4, do not extend)

```text
getThemeCardBg()         -> <ScholarCard>  | bg-card-light dark:bg-card-dark
getThemeCardBorder()     -> border-divider dark:border-divider-on-dark
getThemeTextPrimary()    -> text-ink dark:text-ink-on-dark
getThemeTextSecondary()  -> text-secondary-ink dark:text-secondary-ink-on-dark
getThemeTextMuted()      -> text-muted-ink dark:text-muted-ink-on-dark
getThemeSubtle('bg'|'ui')-> bg-subtle dark:bg-subtle-on-dark
getThemeAccent()         -> text-accent-gold
getThemeGradient('ui')   -> from-accent-gold to-accent-gold-soft (CTA only)
focus:ring-cyan-500      -> focus:ring-focus
focus:ring-blue-500/50   -> focus:ring-focus
text-cyan-600 (form)     -> text-accent-gold
```

Any token gap discovered mid-wave: stop, define it in `index.css`/`tailwind.config.ts` first, then resume — never inline a new color.

---

### Wave 1 — Shared modals (foundation, blocks other waves)

These are reused by many sub-pages, so they go first to avoid a second pass.

| File | calls |
|---|---|
| `Common/Modal.tsx` consumers cleanup verify | — |
| `Dashboard/InsufficientCreditsModal.tsx` | low (already partially clean) |
| `Dashboard/GlobalExamDetailModal.tsx` | medium |
| `Dashboard/TopicsTagsModal.tsx` | 36 |
| `Subscription/PersistentSubscriptionModal.tsx` | medium |
| `Subscription/SubscriptionGuard.tsx` | low |

Pattern: outer chrome → `<ScholarCard variant="elevated">`, CTAs → `<ScholarButton>`, divider/text → role tokens.

### Wave 2 — Primary content pages (most-trafficked)

| File | calls |
|---|---|
| `Dashboard/LibraryPage.tsx` | 65 |
| `Dashboard/QuizPage.tsx` | 97 |
| `Dashboard/QuizTakingComponent.tsx` | TBD |
| `Dashboard/HistoryPage.tsx` | 27 |
| `Dashboard/FlashcardViewer.tsx` | 46 |
| `Dashboard/ContentViewPage.tsx` | TBD |

Cards/list rows → `<ScholarCard>`, filter chips → `<ScholarBadge>`, CTAs → `<ScholarButton>`. Preserve every selection/persistence/effect.

### Wave 3 — Account & billing surfaces

| File | calls |
|---|---|
| `Dashboard/ProfilePage.tsx` | 55 |
| `Dashboard/SubscriptionManagementPage.tsx` | 58 |
| `Dashboard/BillingHistoryPage.tsx` | 26 |
| `Pricing/PricingPage.tsx` | 41 |
| `Pricing/CheckoutPage.tsx` | TBD |
| `Pricing/PaymentSuccess.tsx` / `PaymentCancel.tsx` | low |
| `Dashboard/FeedbackPage.tsx` | 21 |

Tier badge palette inside SubscriptionManagement preserved (matches Header rule). Stripe/Paddle webhooks untouched.

### Wave 4 — Learning modes & games

| File | calls |
|---|---|
| `Dashboard/EduPlayPage.tsx` | 39 |
| `Dashboard/Academics/AcademicsPage.tsx` | 59 |
| `Dashboard/Academics/CourseAnalytics.tsx` | 22 |
| `Dashboard/Academics/CourseTutor.tsx` | 11 |
| `Dashboard/Academics/ExamScheduler.tsx` | 18 |
| `Dashboard/Academics/SRSReviewPanel.tsx` | 16 |
| `Dashboard/AudioStudy/*` (4 files) | ~37 total |
| `Dashboard/BookMode/*` (5 files) | ~63 total |
| `Dashboard/MindMap/MindMapView.tsx` | 8 |
| `Dashboard/ReadAloud/ReadAloudButton.tsx` | low |
| `Dashboard/Highlighting/HighlightLayer.tsx` | low |
| `Dashboard/FloatingVideo/MiniPlayer.tsx` | low |

Audio waveforms, mind-map canvas, book reader controls — visual chrome only, no engine changes.

### Wave 5 — Multiplayer & social

| File | calls |
|---|---|
| `Dashboard/BrainRush*` (4 files) | ~72 total |
| `Dashboard/MultiplayerGamePlay.tsx` / `Lobby` / `Results` / `MultiplayerMenu` / `Wrapper` | ~26 total |
| `Dashboard/GameJoinPage.tsx` | 19 |
| `Dashboard/StudyRoomsPage.tsx` | 42 |
| `Dashboard/Social/FriendsPanel.tsx` | 22 |
| `Dashboard/Social/GroupsPanel.tsx` | 27 |
| `Dashboard/Social/GroupChat.tsx` | 16 |
| `Dashboard/CommentSection.tsx` | 22 |
| `Dashboard/LikeButton.tsx` / `FavoriteButton.tsx` | low |
| `Dashboard/ZegoVideoRoom.tsx` | low |

Realtime channels, presence, Zego SDK init — all untouched. Only shell/card/button visuals migrate.

### Wave 6 — Onboarding, auth, ancillary

| File | calls |
|---|---|
| `Auth/Auth.tsx` | TBD |
| `Onboarding/OnboardingWizard.tsx` | 14 |
| `Onboarding/PageTutorial.tsx` / `TutorialStep.tsx` / `LanguageChoicePage.tsx` | low |
| `ChatAssistant/ChatAssistant.tsx` + `GlobalChatAssistant.tsx` | medium |
| `Dashboard/NotificationCenter.tsx` | 22 |
| `Dashboard/AchievementsPage.tsx` | 27 |
| `Dashboard/GoalsAndAchievementsPage.tsx` | 30 |
| `Dashboard/StudyGoalsPage.tsx` | TBD |
| `Dashboard/InformationalPage.tsx` | 114 |
| `Dashboard/PomodoroTimer.tsx` | 9 |
| `Dashboard/AIQuestionGenerator.tsx` / `ManualQuestionBuilder.tsx` | medium |
| `LanguageToggle.tsx` / `NotFound.tsx` / `ShareView.tsx` / `App.tsx` | low |

`InformationalPage.tsx` is repetitive but mechanical — bulk replace.

### Defer to Phase 6 (out of scope here)

- Admin pages (`Admin/AdminLogin.tsx`, `OverviewPage`, `AnalyticsPage`, `AuditLogPage`, `TransactionsPage`, `AdminUsersManagementPage`) — admin chrome already migrated in Phase 3, contents stay as-is until UI parity confirmed.
- `contexts/ThemeContext.tsx` — leave the `getTheme*` shims in place as no-op fallbacks until zero callers remain across the app, then delete in Phase 6.
- `pages/ScholarPreview.tsx` — extend the preview harness in Phase 6 with the migrated sub-pages.

### Per-wave checklist (apply to every wave before declaring done)

1. `rg "useTheme|getTheme[A-Z]"` against the wave's files returns 0.
2. `rg "cyan-[456]00|blue-[456]00/50|from-cyan|to-blue|text-gray-[789]00 dark:"` against wave's files returns 0 (excludes tier badges).
3. New token adoption count > legacy call count baseline.
4. No new imports of `ThemeContext` introduced; `useTheme` import removed once unused.
5. Smoke-check the wave's primary route in light + dark, default theme, plus one non-default (e.g. `forest`/`ocean`).
6. RTL spot-check on one Arabic-localized page per wave.
7. No console errors / no new network requests vs. baseline.

### Order of execution & approval gates

Wave 1 → review → Wave 2 → review → … → Wave 6 → final sweep.
Each wave is shippable on its own. If a token gap appears, pause the wave, patch tokens, then resume.

### Out-of-scope confirmations (won't change)

- Supabase schema, RLS, edge functions, RPCs.
- `useSubscription`, credit logic, polling cadence.
- Realtime/presence/Zego/Stripe/Paddle integrations.
- Routing, lazy-loading boundaries, `Suspense` fallbacks.
- i18n keys, RTL direction logic, language toggle behavior.
- Tier badge color palette in `Header.tsx`/`SubscriptionManagementPage.tsx`.

---

**Recommended start:** Wave 1 (shared modals) — smallest, unblocks everything else, ~5 files.

Reply "start wave 1" (or pick a different wave) and I'll execute with the precautions above.
