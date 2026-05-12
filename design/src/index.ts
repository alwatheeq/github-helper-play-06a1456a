// Scholar v4 Design System — TypeScript exports
// Usage:  import { themes, Shell4, Dash4 } from './design-system';
//         <Shell4 t={themes.navy_light} active="dash"><Dash4 t={themes.navy_light} /></Shell4>

export type { Theme, ThemeKey } from './theme';
export { themes } from './theme';
export { ThemeProvider, useTheme } from './ThemeProvider';

// Shell & layout utilities
export { Ic, Sf4, Header4, Side4, Shell4, Btn4, Title4, ViewShell4 } from './components';

// English page components
export {
  Dash4, Dash4Proc, Dash4Result,
  Lib4,
  Rooms4, Rooms4Create, Rooms4Friends, Rooms4Groups, Rooms4Active,
  Aca4, Aca4Tutor, Aca4Exams, Aca4SRS, Aca4Analytics,
  Quiz4, Quiz4MyQuizzes, Quiz4Explore, Quiz4History, Quiz4Global,
  Quiz4Preview, Quiz4Active, Quiz4ActiveTF, Quiz4ActiveFill, Quiz4ActiveOpen, Quiz4Result,
  Fb4,
  Play4, Play4Lobby, Play4Host, Play4HostManual, Play4HostWait,
  Play4Join, Play4FindMatch, Play4Battle, Play4BattleLeader, Play4Result,
  Play4LobbyMulti, Play4BattleMulti,
  Hist4,
  Content4View, Content4Book, Content4Audio,
  ContentViewMindMap4, ContentViewFlashcard4,
  Profile4, Goals4, Achievements4, Subscription4, Notifications4,
  ProfileSub4, ProfileSubCancel4, ProfileBilling4, ProfileEdit4,
  ProfileUsername4, ProfileUsernameTaken4, ProfileUsernameCooldown4,
  ProfileSubCanceled4, ProfileSubFailed4, ProfileBillingEmpty4,
  Auth4,
  OnboardingLang4, OnboardingTheme4,
  Pricing4, Checkout4, PaymentSuccess4, PaymentCancel4,
  AccountSuspended4, ShareView4, Informational4,
  GroupChat4,
  NotificationsPomodoro4,
  InsufficientCredits4,
  Tutorial4,
  NotFound4,
  ChatAssistant4, FloatingMiniPlayer4, LowCreditBanner4,
} from './components';

// Arabic RTL page components
export { SfAr, Shell4Ar } from './arabic';
export {
  Dash4Ar, Lib4Ar, Rooms4Ar, ContentRead4Ar,
  GroupChat4Ar, Auth4Ar, Profile4Ar, Notifications4Ar, Quiz4Ar,
} from './arabic';
