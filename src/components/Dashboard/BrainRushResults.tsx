import React, { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ErrorLogger } from '../../utils/errorLogger';
interface GameSession {
  id: string;
  game_title: string;
  total_questions: number;
  difficulty_level: string;
}

interface Participant {
  id: string;
  display_name: string;
  score: number;
  user_id: string | null;
  is_host: boolean;
}

interface ParticipantStats {
  participant: Participant;
  correctAnswers: number;
  totalAnswers: number;
  avgTimeSeconds: number;
  accuracy: number;
}

interface BrainRushResultsProps {
  gameSession: GameSession;
  participants: Participant[];
  onReturnHome: () => void;
}

export const BrainRushResults: React.FC<BrainRushResultsProps> = ({
  gameSession,
  participants: initialParticipants,
  onReturnHome
}) => {
  const { user } = useAuth();
  const [participantStats, setParticipantStats] = useState<ParticipantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    loadParticipantStats();

    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  }, []);

  const loadParticipantStats = async () => {
    setLoading(true);

    try {
      const statsPromises = initialParticipants.map(async (participant) => {
        const { data: answers, error } = await supabase
          .from('eduplay_answers')
          .select('*')
          .eq('game_session_id', gameSession.id)
          .eq('participant_id', participant.id);

        if (error || !answers) {
          return {
            participant,
            correctAnswers: 0,
            totalAnswers: 0,
            avgTimeSeconds: 0,
            accuracy: 0
          };
        }

        const correctAnswers = answers.filter(a => a.is_correct).length;
        const totalAnswers = answers.length;
        const totalTime = answers.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0);
        const avgTimeSeconds = totalAnswers > 0 ? totalTime / totalAnswers : 0;
        const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

        return {
          participant,
          correctAnswers,
          totalAnswers,
          avgTimeSeconds,
          accuracy
        };
      });

      const stats = await Promise.all(statsPromises);
      const sortedStats = stats.sort((a, b) => b.participant.score - a.participant.score);
      setParticipantStats(sortedStats);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { 
        component: 'BrainRushResults', 
        action: 'loadStats', 
        metadata: { gameSessionId: gameSession.id } 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-12 text-center shadow-[var(--s4-shadow-hairline)]">
          <div className="w-10 h-10 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">Loading results...</p>
        </div>
      </div>
    );
  }

  const winner = participantStats[0];
  const myStats = participantStats.find(s => s.participant.user_id === user?.id);
  const myRank = myStats ? participantStats.findIndex(s => s.participant.user_id === user?.id) + 1 : null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Confetti Effect — subtle */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                backgroundColor: ['#e2c06a', '#f0f0e8', '#5dd4a4', '#e07a9a'][i % 4],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* Header row — Scholar v4 style */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-1">Brain Rush · {gameSession.game_title}</div>
          <h1 className="font-display text-[30px] font-semibold text-ink dark:text-ink-on-dark tracking-tight">Final Results</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReturnHome}
            className="flex items-center gap-2 px-3 py-2 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[11.5px] hover:opacity-70 transition"
          >
            <Home className="h-4 w-4" />
            Back to Games
          </button>
          <button
            onClick={onReturnHome}
            className="px-4 py-2 bg-sidebar text-ink-on-dark text-[11.5px] font-semibold hover:opacity-90 transition"
          >
            Play Again
          </button>
        </div>
      </div>

      {/* Dark banner — your result */}
      {myStats && myRank && (
        <div className="bg-sidebar py-[22px] px-[30px] mb-4 flex items-center shadow-[var(--s4-shadow-hairline)]">
          <div className="pr-7 border-r border-white/10 flex-shrink-0">
            <div className="text-[9px] tracking-[2px] text-muted-ink-on-dark font-bold uppercase mb-2">Your Rank</div>
            <div className="font-display text-[60px] font-semibold text-ink-on-dark leading-none tracking-tight">
              #{myRank}<span className="text-[20px] text-accent-gold ml-2">of {participantStats.length}</span>
            </div>
            <div className="text-[9px] tracking-[1.5px] text-accent-gold font-bold mt-2 uppercase">
              {myRank === 1 ? '— Winner!' : myRank <= 3 ? '— Top 3 finish' : '— Strong effort'}
            </div>
          </div>
          <div className="flex-1 flex justify-evenly pl-7">
            {[
              [myStats.participant.score.toLocaleString(), 'Score'],
              [`${myStats.correctAnswers} / ${myStats.totalAnswers}`, 'Correct'],
              [`${myStats.accuracy.toFixed(0)}%`, 'Accuracy'],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="font-display text-[32px] font-semibold text-ink-on-dark leading-none">{v}</div>
                <div className="text-[9px] tracking-[1.5px] text-muted-ink-on-dark uppercase mt-2">{l}</div>
              </div>
            ))}
            <div className="text-center border-l border-white/10 pl-7">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">Avg Time</div>
              <div className="font-display text-[24px] font-semibold text-ink-on-dark leading-none">
                {myStats.avgTimeSeconds.toFixed(1)}<span className="text-[13px] text-muted-ink-on-dark">s</span>
              </div>
              <div className="text-[10px] text-muted-ink-on-dark mt-1">per question</div>
            </div>
          </div>
        </div>
      )}

      {/* 2-col: top finishers left, full standings right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left: top 3 + game summary */}
        <div className="flex flex-col gap-0">
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">Top Finishers</div>
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark shadow-[var(--s4-shadow-hairline)]">
            {participantStats.slice(0, 3).map((stats, i) => {
              const isMe = stats.participant.user_id === user?.id;
              return (
                <div
                  key={stats.participant.id}
                  className={`flex items-center gap-4 px-5 py-4 border-b border-divider dark:border-divider-on-dark last:border-0 ${i === 0 ? 'bg-accent-gold-soft' : ''}`}
                  style={{ borderLeft: i === 0 ? '3px solid var(--color-accent-gold)' : '3px solid transparent' }}
                >
                  <div className={`font-display text-[22px] font-bold w-7 flex-shrink-0 ${i === 0 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{i + 1}</div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-ink-on-dark'}`}>
                    {stats.participant.display_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-ink dark:text-ink-on-dark truncate">
                      {stats.participant.display_name}
                      {isMe && <span className="text-[9px] tracking-wider text-accent-gold ml-2">YOU</span>}
                    </div>
                    <div className="text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark">{stats.correctAnswers}/{stats.totalAnswers} correct · {stats.accuracy.toFixed(0)}%</div>
                  </div>
                  <div className={`font-display text-[16px] font-bold ${i === 0 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                    {stats.participant.score.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Game summary */}
          <div className="mt-3 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-t-[3px] border-t-accent-gold p-5 shadow-[var(--s4-shadow-hairline)]">
            <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-3">Game Summary</div>
            {[
              ['Questions', String(gameSession.total_questions)],
              ['Players', String(participantStats.length)],
              ['Difficulty', gameSession.difficulty_level],
              ['Winner', winner?.participant.display_name || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-divider dark:border-divider-on-dark last:border-0">
                <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{k}</span>
                <span className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark capitalize">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: full standings table */}
        <div className="md:col-span-2">
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">Final Standings · All {participantStats.length} Players</div>
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark shadow-[var(--s4-shadow-hairline)]">
            <div className="grid grid-cols-[36px_1fr_60px_52px_52px_80px] px-4 py-2 border-b border-divider dark:border-divider-on-dark">
              {['#', 'Player', 'Correct', 'Acc', 'Avg', 'Score'].map(h => (
                <div key={h} className="text-[9px] tracking-[1.5px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase">{h}</div>
              ))}
            </div>
            {participantStats.map((stats, i) => {
              const isMe = stats.participant.user_id === user?.id;
              return (
                <div
                  key={stats.participant.id}
                  className={`grid grid-cols-[36px_1fr_60px_52px_52px_80px] px-4 py-3 border-b border-divider dark:border-divider-on-dark last:border-0 items-center ${isMe ? 'bg-chip dark:bg-chip' : ''}`}
                  style={{ borderLeft: isMe ? '3px solid var(--color-accent-gold)' : '3px solid transparent' }}
                >
                  <span className={`font-display text-[14px] font-bold ${i < 3 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{i + 1}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-ink-on-dark'}`}>
                      {stats.participant.display_name[0].toUpperCase()}
                    </div>
                    <span className={`text-[12px] truncate ${isMe ? 'font-bold text-ink dark:text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>
                      {stats.participant.display_name}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{stats.correctAnswers}/{stats.totalAnswers}</span>
                  <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{stats.accuracy.toFixed(0)}%</span>
                  <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{stats.avgTimeSeconds.toFixed(1)}s</span>
                  <span className={`font-display text-[16px] font-bold ${isMe ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                    {stats.participant.score.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={onReturnHome}
          className="flex items-center gap-2 px-6 py-3 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[12px] hover:opacity-70 transition"
        >
          <Home className="h-4 w-4" />
          Back to Lobby
        </button>
        <button
          onClick={onReturnHome}
          className="px-6 py-3 bg-sidebar text-ink-on-dark font-display text-[14px] font-bold hover:opacity-90 transition"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
