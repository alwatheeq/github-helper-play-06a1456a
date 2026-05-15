import React, { useState } from 'react';

interface NotificationItem {
  type: 'exam' | 'room' | 'friend' | 'badge' | 'credit' | 'library';
  icon: React.ReactNode;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

interface NotificationGroup {
  date: string;
  items: NotificationItem[];
}

const TYPE_BORDER: Record<NotificationItem['type'], string> = {
  exam:    'border-l-accent-gold',
  room:    'border-l-[#3A6B8A]',
  friend:  'border-l-[#5B7A3A]',
  badge:   'border-l-accent-gold',
  credit:  'border-l-red-600',
  library: 'border-l-[#B8893A]',
};

const TYPE_ICON_COLOR: Record<NotificationItem['type'], string> = {
  exam:    'text-accent-gold',
  room:    'text-[#3A6B8A]',
  friend:  'text-[#5B7A3A]',
  badge:   'text-accent-gold',
  credit:  'text-red-600',
  library: 'text-[#B8893A]',
};

const ExamIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const RoomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const BadgeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const FriendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
    <line x1="12" y1="14" x2="12" y2="18"/>
    <line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);

const CreditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4l3 3"/>
  </svg>
);

const LibraryIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const TYPE_ICON_NODE: Record<NotificationItem['type'], React.ReactNode> = {
  exam:    <ExamIcon />,
  room:    <RoomIcon />,
  friend:  <FriendIcon />,
  badge:   <BadgeIcon />,
  credit:  <CreditIcon />,
  library: <LibraryIcon />,
};

const MOCK_GROUPS: NotificationGroup[] = [
  {
    date: 'Today',
    items: [
      { type: 'exam',    icon: null, title: 'Exam results ready',       body: 'Your Microeconomics — Ch. VII results are available.',    time: '2:14 PM', unread: true  },
      { type: 'room',    icon: null, title: "Room invite from Layla A.", body: "Join 'Series Convergence Review' starting at 4:00 PM.",    time: '1:40 PM', unread: true  },
      { type: 'badge',   icon: null, title: 'Achievement unlocked',      body: "You earned the '14-Day Streak' badge. Keep going!",        time: '9:00 AM', unread: true  },
      { type: 'library', icon: null, title: 'Processing complete',       body: 'Anatomy Lecture XII is ready — 32 flashcards generated.',  time: '8:55 AM', unread: false },
    ],
  },
  {
    date: 'Yesterday',
    items: [
      { type: 'friend', icon: null, title: 'Friend request',             body: 'Nour Faris wants to connect with you on MeshFahem.',       time: '7:30 PM', unread: false },
      { type: 'exam',   icon: null, title: 'Exam results ready',         body: 'CS161 — Algorithms results: you scored 81%.',               time: '5:10 PM', unread: false },
      { type: 'room',   icon: null, title: 'Room starting soon',         body: "'CS Algorithms Deep Dive' begins in 15 minutes.",           time: '7:45 AM', unread: false },
    ],
  },
  {
    date: 'Earlier',
    items: [
      { type: 'credit',  icon: null, title: 'Credits running low',       body: 'You have 182 credits remaining. Consider upgrading.',      time: 'May 6',   unread: false },
      { type: 'friend',  icon: null, title: 'Karim H. is now a friend',  body: 'You and Karim Hassan are now connected.',                  time: 'May 5',   unread: false },
      { type: 'badge',   icon: null, title: 'Achievement unlocked',      body: "You earned 'Flashcard Factory' — 100+ cards generated.",   time: 'May 3',   unread: false },
    ],
  },
];

interface PrefItem {
  label: string;
  on: boolean;
}

const INITIAL_PREFS: PrefItem[] = [
  { label: 'Exam results',     on: true  },
  { label: 'Room invites',     on: true  },
  { label: 'Friend requests',  on: true  },
  { label: 'Achievements',     on: true  },
  { label: 'Credit alerts',    on: false },
  { label: 'Processing done',  on: true  },
];

export const NotificationsPage: React.FC = () => {
  const [groups, setGroups] = useState<NotificationGroup[]>(MOCK_GROUPS);
  const [prefs, setPrefs] = useState<PrefItem[]>(INITIAL_PREFS);

  const allItems = groups.flatMap((g) => g.items);
  const totalUnread = allItems.filter((i) => i.unread).length;

  const handleMarkAllRead = () => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((item) => ({ ...item, unread: false })),
      }))
    );
  };

  const togglePref = (index: number) => {
    setPrefs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, on: !p.on } : p))
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-end justify-between mb-1">
        <div>
          <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-accent-gold mb-1.5">Inbox</p>
          <h1 className="font-display text-[38px] font-semibold text-ink dark:text-ink-on-dark" style={{ letterSpacing: '-0.02em' }}>
            Notifications.
          </h1>
          <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark mt-1">
            {totalUnread} unread &middot; {allItems.length} total
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-4 py-1.5 text-[12px] font-medium text-muted-ink dark:text-muted-ink-on-dark border border-divider dark:border-divider-on-dark hover:opacity-70 transition"
        >
          Mark all read
        </button>
      </div>

      {/* Divider line */}
      <div className="h-px bg-ink dark:bg-ink-on-dark opacity-80 mt-[14px] mb-[22px]" />

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr_240px] gap-6">
        {/* Feed */}
        <div className="flex-1 min-w-0">
          {groups.map((group) => (
            <div key={group.date} className="mb-6">
              {/* Group header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-accent-gold whitespace-nowrap">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
              </div>

              {/* Notification items */}
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 px-4 py-3 mb-2 border border-l-[3px] transition-colors ${
                    item.unread
                      ? 'bg-accent-gold-soft border-divider dark:border-divider-on-dark'
                      : 'bg-transparent border-divider dark:border-divider-on-dark'
                  } ${TYPE_BORDER[item.type]}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 flex items-center justify-center flex-shrink-0 border ${
                      item.unread
                        ? 'bg-accent-gold-soft/20 border-accent-gold/30'
                        : 'bg-subtle dark:bg-card-dark border-divider dark:border-divider-on-dark'
                    } ${TYPE_ICON_COLOR[item.type]}`}
                  >
                    {TYPE_ICON_NODE[item.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p
                        className={`text-[13px] leading-snug ${
                          item.unread
                            ? 'font-bold text-ink dark:text-ink-on-dark'
                            : 'font-medium text-ink dark:text-ink-on-dark'
                        }`}
                      >
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {item.unread && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                        )}
                        <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4">
          {/* Notification preferences */}
          <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark border-t-[3px] border-t-accent-gold p-4">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-accent-gold mb-3">
              Preferences
            </p>
            {prefs.map((pref, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between py-2 ${
                  idx < prefs.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''
                }`}
              >
                <span className="text-xs text-secondary-ink dark:text-muted-ink-on-dark">
                  {pref.label}
                </span>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => togglePref(idx)}
                  aria-checked={pref.on}
                  role="switch"
                  className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                    pref.on ? 'bg-accent-gold' : 'bg-accent-gold/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      pref.on ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="bg-sidebar p-4">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-accent-gold mb-2.5">
              Quick Stats
            </p>
            {[
              ['Unread',    String(totalUnread)],
              ['This week', '7'],
              ['All time',  '34'],
            ].map(([label, value], idx) => (
              <div
                key={label}
                className={`flex items-center justify-between py-1.5 ${
                  idx < 2 ? 'border-b border-ink-on-dark/[.10]' : ''
                }`}
              >
                <span className="text-xs text-ink-on-dark/50">{label}</span>
                <span className="font-display text-base font-bold text-ink-on-dark">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
