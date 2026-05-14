import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Coffee, ChevronUp, SkipForward } from 'lucide-react';
import { usePomodoroStore } from '../../stores/usePomodoroStore';
import { useI18n } from '../../contexts/I18nContext';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export type PomodoroTimerVariant = 'floating' | 'embedded';

export interface PomodoroTimerProps {
  /** `floating` = bottom-right chip (dashboard). `embedded` = full width inside a parent (e.g. notification panel). */
  variant?: PomodoroTimerVariant;
}

const SESSIONS_PER_CYCLE = 4;
const LONG_BREAK = 15 * 60;

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ variant = 'floating' }) => {
  const isEmbedded = variant === 'embedded';
  const [expanded, setExpanded] = useState(isEmbedded);
  const { t } = useI18n();

  const {
    isRunning,
    mode,
    timeRemaining,
    workDuration,
    breakDuration,
    sessionsCompleted,
    start,
    pause,
    reset,
    tick,
    switchMode,
    setWorkDuration,
    setBreakDuration,
  } = usePomodoroStore();

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  const ModeIcon = mode === 'work' ? Timer : Coffee;
  const modeLabel = mode === 'work' ? t('pomodoro.work') : t('pomodoro.break');
  const totalTime = mode === 'work' ? workDuration : breakDuration;
  const progress = totalTime > 0 ? Math.max(0, Math.min(1, timeRemaining / totalTime)) : 0;

  const breakOverlayZ = isEmbedded ? 'z-[200]' : 'z-40';
  const circumference = 2 * Math.PI * 70;

  const modeModes = [
    { label: 'Work',        time: '25 min', seconds: 25 * 60, isWork: true  },
    { label: 'Short Break', time: '5 min',  seconds: 5 * 60,  isWork: false },
    { label: 'Long Break',  time: '15 min', seconds: LONG_BREAK, isWork: false },
    { label: 'Custom',      time: '— min',  seconds: null,    isWork: null  },
  ];

  const embeddedTimer = (
    <div className="w-full flex flex-col items-center gap-4 py-5 px-5">
      {/* Mode badge */}
      <div className="px-3.5 py-1 bg-accent-gold-soft border border-accent-gold/44 rounded-[20px] text-[11px] font-bold text-accent-gold tracking-[0.08em] uppercase">
        {modeLabel === t('pomodoro.work') ? 'Work Session' : 'Break Time'}
      </div>

      {/* Circular timer */}
      <div className="relative w-[160px] h-[160px]">
        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke="var(--color-border-divider, #e5e7eb)" strokeWidth="8" />
          <circle
            cx="80" cy="80" r="70" fill="none"
            stroke="var(--color-accent-gold, #c9a227)" strokeWidth="8"
            strokeDasharray={`${circumference * progress} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[30px] font-bold text-ink dark:text-ink-on-dark tracking-tight leading-none">{formatTime(timeRemaining)}</div>
          <div className="text-[10px] font-semibold text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-[0.1em] mt-1">remaining</div>
        </div>
      </div>

      {/* Session dots */}
      <div className="flex gap-1.5">
        {Array.from({ length: SESSIONS_PER_CYCLE }).map((_, i) => {
          const filled = i < (sessionsCompleted % SESSIONS_PER_CYCLE);
          return (
            <div
              key={i}
              className={`rounded-full border-[1.5px] transition-colors ${filled ? 'bg-accent-gold border-accent-gold' : 'border-divider dark:border-divider-on-dark'}`}
              style={{ width: filled ? 10 : 8, height: filled ? 10 : 8 }}
            />
          );
        })}
      </div>
      <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
        Session <strong className="text-ink dark:text-ink-on-dark">{(sessionsCompleted % SESSIONS_PER_CYCLE) + 1}</strong> of {SESSIONS_PER_CYCLE}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={reset}
          className="w-10 h-10 rounded-[10px] bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark flex items-center justify-center hover:opacity-80 transition"
        >
          <RotateCcw className="h-3.5 w-3.5 text-ink dark:text-ink-on-dark" />
        </button>
        <button
          type="button"
          onClick={isRunning ? pause : start}
          className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center hover:opacity-90 transition text-ink-on-dark"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-gold), color-mix(in srgb, var(--color-accent-gold) 80%, #000 20%))', boxShadow: '0 4px 14px rgba(201,168,39,0.4)' }}
        >
          {isRunning ? <Pause className="h-[18px] w-[18px]" /> : <Play className="h-[18px] w-[18px]" />}
        </button>
        <button
          type="button"
          onClick={switchMode}
          className="w-10 h-10 rounded-[10px] bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark flex items-center justify-center hover:opacity-80 transition"
        >
          <SkipForward className="h-3.5 w-3.5 text-ink dark:text-ink-on-dark" />
        </button>
      </div>

      {/* Mode cards */}
      <div className="w-full grid grid-cols-2 gap-2">
        {modeModes.map((m, i) => {
          const isActive = m.label === 'Work' ? mode === 'work' : (mode === 'break' && breakDuration === m.seconds);
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (m.isWork === null) return;
                if (m.isWork) {
                  setWorkDuration(m.seconds!);
                } else {
                  setBreakDuration(m.seconds!);
                }
              }}
              className={`px-3 py-2.5 text-left rounded-[10px] border transition-colors ${
                isActive
                  ? 'bg-accent-gold-soft border-accent-gold/55'
                  : 'bg-subtle dark:bg-subtle-on-dark border-divider dark:border-divider-on-dark'
              }`}
            >
              <div className={`text-[11px] font-bold ${isActive ? 'text-accent-gold' : 'text-ink dark:text-ink-on-dark'}`}>{m.label}</div>
              <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">{m.time}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const floatingCard = (
    <div className="w-64 rounded-[12px] border bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink dark:text-ink-on-dark">
          <ModeIcon className="h-5 w-5" />
          <span className="font-semibold text-sm">{modeLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition text-muted-ink dark:text-muted-ink-on-dark"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
      <div className="text-center">
        <p className="font-mono text-[38px] font-semibold text-ink dark:text-ink-on-dark">{formatTime(timeRemaining)}</p>
      </div>
      <p className="text-center text-xs text-muted-ink dark:text-muted-ink-on-dark">
        {t('pomodoro.sessions_completed', { count: sessionsCompleted })}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={isRunning ? pause : start}
          className="p-2.5 rounded-full text-ink-on-dark transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-gold), color-mix(in srgb, var(--color-accent-gold) 80%, #000 20%))' }}
        >
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={reset}
          className="p-2 rounded-full border transition hover:bg-black/5 dark:hover:bg-white/10 border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mode === 'break' && isRunning && (
        <div className={`fixed inset-0 ${breakOverlayZ} flex items-center justify-center bg-black/30 backdrop-blur-lg`}>
          <div className="text-center space-y-4">
            <Coffee className="mx-auto h-16 w-16 text-ink-on-dark animate-pulse" />
            <h2 className="font-display text-[38px] font-semibold text-ink-on-dark">{t('pomodoro.take_a_break')}</h2>
            <p className="text-lg text-ink-on-dark/80">{t('pomodoro.break_message')}</p>
            <p className="font-mono text-[38px] font-semibold text-ink-on-dark">{formatTime(timeRemaining)}</p>
            <button
              type="button"
              onClick={pause}
              className="mt-4 px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-ink-on-dark transition"
            >
              {t('pomodoro.pause')}
            </button>
          </div>
        </div>
      )}

      {isEmbedded ? (
        <div className="w-full min-w-0">{embeddedTimer}</div>
      ) : (
        <div className="fixed bottom-24 right-6 z-50">
          {expanded ? (
            floatingCard
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border transition hover:scale-105 bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark"
            >
              <ModeIcon className="h-4 w-4" />
              <span className="font-mono text-sm font-semibold">{formatTime(timeRemaining)}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isRunning) pause();
                    else start();
                  }}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
                >
                  {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reset();
                  }}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <ChevronUp className="h-3.5 w-3.5 opacity-50" />
              </div>
            </button>
          )}
        </div>
      )}
    </>
  );
};

export { PomodoroTimer };
export default PomodoroTimer;
