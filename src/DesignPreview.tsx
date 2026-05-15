import React, { useState } from 'react';
import { themes } from '../design/src/theme';
import type { Theme } from '../design/src/theme';
import {
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
} from '../design/src/components';

const pages: { id: string; label: string; Component: React.FC<{ t: Theme }> }[] = [
  { id: 'Dash4',                   label: '01 · Dashboard (idle)',             Component: Dash4 },
  { id: 'Dash4Proc',               label: '02 · Dashboard (processing)',        Component: Dash4Proc },
  { id: 'Dash4Result',             label: '03 · Dashboard (results)',           Component: Dash4Result },
  { id: 'Lib4',                    label: '04 · My Library',                   Component: Lib4 },
  { id: 'Hist4',                   label: '05 · History / Ledger',             Component: Hist4 },
  { id: 'Rooms4',                  label: '06 · Study Rooms (browse)',         Component: Rooms4 },
  { id: 'Rooms4Create',            label: '07 · Study Rooms (create)',         Component: Rooms4Create },
  { id: 'Rooms4Friends',           label: '08 · Study Rooms (friends)',        Component: Rooms4Friends },
  { id: 'Rooms4Groups',            label: '09 · Study Rooms (groups)',         Component: Rooms4Groups },
  { id: 'Rooms4Active',            label: '10 · Study Rooms (active session)', Component: Rooms4Active },
  { id: 'Aca4',                    label: '11 · Academics (course list)',      Component: Aca4 },
  { id: 'Aca4Tutor',               label: '12 · Academics (AI Tutor)',         Component: Aca4Tutor },
  { id: 'Aca4Exams',               label: '13 · Academics (Exam Scheduler)',   Component: Aca4Exams },
  { id: 'Aca4SRS',                 label: '14 · Academics (SRS Review)',       Component: Aca4SRS },
  { id: 'Aca4Analytics',           label: '15 · Academics (Analytics)',        Component: Aca4Analytics },
  { id: 'Quiz4',                   label: '16 · Quiz (create/browse)',         Component: Quiz4 },
  { id: 'Quiz4Active',             label: '17 · Quiz (taking · MCQ)',          Component: Quiz4Active },
  { id: 'Quiz4ActiveTF',           label: '18 · Quiz (taking · True/False)',   Component: Quiz4ActiveTF },
  { id: 'Quiz4ActiveFill',         label: '19 · Quiz (taking · Fill-blank)',   Component: Quiz4ActiveFill },
  { id: 'Quiz4ActiveOpen',         label: '20 · Quiz (taking · Open-ended)',   Component: Quiz4ActiveOpen },
  { id: 'Quiz4Result',             label: '21 · Quiz (results/score)',         Component: Quiz4Result },
  { id: 'Quiz4MyQuizzes',          label: '22 · Quiz (My Quizzes)',            Component: Quiz4MyQuizzes },
  { id: 'Quiz4Global',             label: '23 · Quiz (Global Exams)',          Component: Quiz4Global },
  { id: 'Quiz4Preview',            label: '24 · Quiz (preview)',               Component: Quiz4Preview },
  { id: 'Quiz4Explore',            label: '25 · Quiz (Explore)',               Component: Quiz4Explore },
  { id: 'Quiz4History',            label: '26 · Quiz (History)',               Component: Quiz4History },
  { id: 'Play4',                   label: '27 · EduPlay (games hub)',          Component: Play4 },
  { id: 'Play4Lobby',              label: '28 · EduPlay (Brain Rush lobby)',   Component: Play4Lobby },
  { id: 'Play4Battle',             label: '29 · EduPlay (Brain Rush active)',  Component: Play4Battle },
  { id: 'Play4BattleLeader',       label: '30 · EduPlay (leaderboard)',        Component: Play4BattleLeader },
  { id: 'Play4Host',               label: '31 · EduPlay (host a game)',        Component: Play4Host },
  { id: 'Play4HostManual',         label: '32 · EduPlay (manual questions)',   Component: Play4HostManual },
  { id: 'Play4HostWait',           label: '33 · EduPlay (waiting room)',       Component: Play4HostWait },
  { id: 'Play4Join',               label: '34 · EduPlay (join a game)',        Component: Play4Join },
  { id: 'Play4FindMatch',          label: '35 · EduPlay (find match)',         Component: Play4FindMatch },
  { id: 'Play4LobbyMulti',         label: '36 · EduPlay (multi lobby)',        Component: Play4LobbyMulti },
  { id: 'Play4BattleMulti',        label: '37 · EduPlay (multi active)',       Component: Play4BattleMulti },
  { id: 'Play4Result',             label: '38 · EduPlay (results)',            Component: Play4Result },
  { id: 'Content4View',            label: '39 · Content View (read)',          Component: Content4View },
  { id: 'Content4Book',            label: '40 · Content View (book mode)',     Component: Content4Book },
  { id: 'Content4Audio',           label: '41 · Content View (audio)',         Component: Content4Audio },
  { id: 'ContentViewMindMap4',     label: '42 · Content View (mind map)',      Component: ContentViewMindMap4 },
  { id: 'ContentViewFlashcard4',   label: '43 · Content View (flashcards)',    Component: ContentViewFlashcard4 },
  { id: 'Profile4',                label: '44 · Profile (main)',               Component: Profile4 },
  { id: 'ProfileEdit4',            label: '45 · Profile (edit)',               Component: ProfileEdit4 },
  { id: 'ProfileUsername4',        label: '46 · Profile (username setup)',     Component: ProfileUsername4 },
  { id: 'ProfileUsernameTaken4',   label: '47 · Profile (username taken)',     Component: ProfileUsernameTaken4 },
  { id: 'ProfileUsernameCooldown4',label: '48 · Profile (username cooldown)',  Component: ProfileUsernameCooldown4 },
  { id: 'ProfileSub4',             label: '49 · Profile (subscription)',       Component: ProfileSub4 },
  { id: 'ProfileSubCancel4',       label: '50 · Profile (cancel sub)',         Component: ProfileSubCancel4 },
  { id: 'ProfileSubCanceled4',     label: '51 · Profile (sub canceled)',       Component: ProfileSubCanceled4 },
  { id: 'ProfileSubFailed4',       label: '52 · Profile (payment failed)',     Component: ProfileSubFailed4 },
  { id: 'ProfileBilling4',         label: '53 · Profile (billing)',            Component: ProfileBilling4 },
  { id: 'ProfileBillingEmpty4',    label: '54 · Profile (billing empty)',      Component: ProfileBillingEmpty4 },
  { id: 'Goals4',                  label: '55 · Goals',                        Component: Goals4 },
  { id: 'Achievements4',           label: '56 · Achievements',                 Component: Achievements4 },
  { id: 'Subscription4',           label: '57 · Subscription (plans)',         Component: Subscription4 },
  { id: 'Notifications4',          label: '58 · Notifications',               Component: Notifications4 },
  { id: 'NotificationsPomodoro4',  label: '59 · Notifications + Pomodoro',    Component: NotificationsPomodoro4 },
  { id: 'Auth4',                   label: '60 · Auth / Sign In',              Component: Auth4 },
  { id: 'OnboardingLang4',         label: '61 · Onboarding (language)',        Component: OnboardingLang4 },
  { id: 'OnboardingTheme4',        label: '62 · Onboarding (theme)',           Component: OnboardingTheme4 },
  { id: 'Pricing4',                label: '63 · Pricing',                      Component: Pricing4 },
  { id: 'Checkout4',               label: '64 · Checkout',                     Component: Checkout4 },
  { id: 'PaymentSuccess4',         label: '65 · Payment Success',             Component: PaymentSuccess4 },
  { id: 'PaymentCancel4',          label: '66 · Payment Cancelled',           Component: PaymentCancel4 },
  { id: 'AccountSuspended4',       label: '67 · Account Suspended',           Component: AccountSuspended4 },
  { id: 'ShareView4',              label: '68 · Share View',                   Component: ShareView4 },
  { id: 'Informational4',          label: '69 · Informational / About',       Component: Informational4 },
  { id: 'Fb4',                     label: '70 · Feedback',                    Component: Fb4 },
  { id: 'GroupChat4',              label: '71 · Group Chat',                  Component: GroupChat4 },
  { id: 'InsufficientCredits4',    label: '72 · Insufficient Credits',        Component: InsufficientCredits4 },
  { id: 'LowCreditBanner4',        label: '73 · Low Credit Banner',           Component: LowCreditBanner4 },
  { id: 'Tutorial4',               label: '74 · Tutorial / Onboarding',       Component: Tutorial4 },
  { id: 'ChatAssistant4',          label: '75 · Chat Assistant',              Component: ChatAssistant4 },
  { id: 'FloatingMiniPlayer4',     label: '76 · Floating Mini Player',        Component: FloatingMiniPlayer4 },
  { id: 'NotFound4',               label: '77 · 404 Not Found',               Component: NotFound4 },
];

const themeKeys = Object.keys(themes);

export const DesignPreview: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState('navy_light');
  const urlPage = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('page') : null;
  const [activePage, setActivePage] = useState<string | null>(urlPage);

  const t = themes[activeTheme];

  const currentPage = activePage ? pages.find(p => p.id === activePage) : null;

  return (
    <div style={{ fontFamily: 'sans-serif', background: '#111', minHeight: '100vh', color: '#fff' }}>
      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#1a1a1a', borderBottom: '1px solid #333', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <strong style={{ color: '#d4a85a', fontSize: 15 }}>Scholar v4 Design Preview</strong>
        <select
          value={activeTheme}
          onChange={e => setActiveTheme(e.target.value)}
          style={{ background: '#333', color: '#fff', border: '1px solid #555', padding: '4px 8px', borderRadius: 6, fontSize: 13 }}
        >
          {themeKeys.map(k => (
            <option key={k} value={k}>{themes[k].name}</option>
          ))}
        </select>
        {activePage && (
          <button
            onClick={() => setActivePage(null)}
            style={{ background: '#333', color: '#aaa', border: '1px solid #555', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
          >
            ← All pages
          </button>
        )}
        <span style={{ color: '#666', fontSize: 12 }}>{activePage ? `Viewing: ${currentPage?.label}` : `${pages.length} pages`}</span>
      </div>

      {/* Single page view */}
      {currentPage && (
        <div style={{ padding: 0 }}>
          <div style={{ background: currentPage.Component ? t.bg : '#222', minHeight: '100vh' }}>
            <currentPage.Component t={t} />
          </div>
        </div>
      )}

      {/* Grid view */}
      {!activePage && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {pages.map(({ id, label, Component }) => (
              <div
                key={id}
                onClick={() => setActivePage(id)}
                style={{ cursor: 'pointer', border: '1px solid #333', borderRadius: 8, overflow: 'hidden', transition: 'border-color 0.15s', background: '#1a1a1a' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#d4a85a')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#333')}
              >
                <div style={{ fontSize: 11, color: '#888', padding: '6px 10px', borderBottom: '1px solid #333', background: '#111' }}>
                  {label}
                </div>
                <div
                  style={{
                    transform: 'scale(0.38)',
                    transformOrigin: 'top left',
                    width: '263.16%',
                    height: 480,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ width: 1200, background: t.bg }}>
                    <Component t={t} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
