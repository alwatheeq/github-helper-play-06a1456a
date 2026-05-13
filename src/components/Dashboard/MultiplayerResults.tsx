import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ErrorLogger } from '../../utils/errorLogger';

interface PlayerResult {
  user_id: string;
  display_name: string;
  total_score: number;
  correct_answers: number;
  total_questions: number;
  average_time_ms: number;
  rank: number;
}

interface MultiplayerResultsProps {
  lobbyId: string;
}

export default function MultiplayerResults({ lobbyId }: MultiplayerResultsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<PlayerResult[]>([]);
  const [myResult, setMyResult] = useState<PlayerResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameName, setGameName] = useState('');

  useEffect(() => {
    loadResults();
  }, [lobbyId]);

  const loadResults = async () => {
    try {
      const { data: lobby, error: lobbyError } = await supabase
        .from('multiplayer_game_lobbies')
        .select('game_name')
        .eq('id', lobbyId)
        .single();

      if (lobbyError) throw lobbyError;
      setGameName(lobby.game_name);

      const { data: scores, error: scoresError } = await supabase
        .from('multiplayer_game_scores')
        .select(`
          user_id,
          total_score,
          correct_answers,
          total_questions,
          average_time_ms,
          rank
        `)
        .eq('lobby_id', lobbyId)
        .order('rank', { ascending: true });

      if (scoresError) throw scoresError;

      const { data: players, error: playersError } = await supabase
        .from('multiplayer_game_players')
        .select('user_id, display_name')
        .eq('lobby_id', lobbyId);

      if (playersError) throw playersError;

      const playersMap = new Map(players.map(p => [p.user_id, p.display_name]));

      const resultsWithNames = scores.map(score => ({
        ...score,
        display_name: playersMap.get(score.user_id) || 'Unknown'
      }));

      setResults(resultsWithNames);

      const userResult = resultsWithNames.find(r => r.user_id === user?.id);
      if (userResult) {
        setMyResult(userResult);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'MultiplayerResults', action: 'loadResults', lobbyId, userId: user?.id });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto mb-4" />
          <p className="text-secondary-ink dark:text-muted-ink-on-dark">Loading results...</p>
        </div>
      </div>
    );
  }

  const getRankLabel = (rank: number) => {
    if (rank === 1) return 'Champion';
    if (rank <= 3) return 'Strong performance';
    if (rank <= 5) return 'Great effort';
    return 'Keep pushing';
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase">
            Brain Rush · {gameName || 'Game Results'}
          </div>
          <h1
            className="font-display text-[30px] font-semibold text-ink dark:text-ink-on-dark mt-[5px] mb-[3px]"
            style={{ letterSpacing: -0.6 }}
          >
            Final Results
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard/brain-rush')}
            className="inline-flex items-center gap-1.5 px-[13px] py-1.5 border border-divider dark:border-divider-on-dark text-[11.5px] text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition"
          >
            ← Back to Games
          </button>
          <button
            onClick={() => navigate('/dashboard/brain-rush')}
            className="inline-flex items-center gap-1.5 px-[15px] py-1.5 bg-sidebar text-card-light text-[11.5px] font-semibold hover:opacity-90 transition"
          >
            Play Again
          </button>
        </div>
      </div>

      {/* Dark banner — your result */}
      {myResult && (
        <div className="bg-sidebar px-[30px] py-[22px] flex items-center mb-4">
          <div className="pr-[30px] border-r border-card-light/[0.08] flex-shrink-0">
            <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">Your Rank</div>
            <div
              className="font-display text-[60px] font-semibold text-card-light leading-none"
              style={{ letterSpacing: -2 }}
            >
              #{myResult.rank}
              <span className="text-[22px] text-accent-gold ml-1.5">of {results.length}</span>
            </div>
            <div className="font-display text-[10.5px] text-accent-gold mt-2">
              — {getRankLabel(myResult.rank)}
            </div>
          </div>
          <div className="flex-1 flex justify-evenly pl-[30px]">
            {[
              [myResult.total_score.toLocaleString(), 'Score'],
              [`${myResult.correct_answers} / ${myResult.total_questions}`, 'Correct'],
              [`${myResult.total_questions > 0 ? Math.round((myResult.correct_answers / myResult.total_questions) * 100) : 0}%`, 'Accuracy'],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="font-display text-[32px] font-semibold text-card-light leading-none">{v}</div>
                <div className="text-[9px] tracking-[1.5px] text-card-light/[0.34] uppercase mt-1.5">{l}</div>
              </div>
            ))}
            <div className="text-center pl-7 border-l border-card-light/[0.08]">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-1.5">Avg Time</div>
              <div className="font-display text-[26px] font-semibold text-card-light leading-none">
                {(myResult.average_time_ms / 1000).toFixed(1)}
                <span className="text-[13px] text-card-light/[0.34]">s</span>
              </div>
              <div className="text-[10px] text-card-light/[0.27] mt-1.5">per question</div>
            </div>
          </div>
        </div>
      )}

      {/* 2-col layout */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '280px 1fr' }}>
        {/* Left: top finishers + game summary */}
        <div className="flex flex-col">
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2.5">Top Finishers</div>
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark">
            {results.slice(0, 3).map((p, i) => (
              <div
                key={p.user_id}
                className={`flex items-center gap-3.5 px-[18px] py-3.5 ${
                  i < 2 ? 'border-b border-divider dark:border-divider-on-dark' : ''
                } ${
                  i === 0
                    ? 'bg-accent-gold-soft border-l-[3px] border-l-accent-gold'
                    : 'border-l-[3px] border-l-transparent'
                }`}
              >
                <div className={`font-display text-[24px] font-bold flex-shrink-0 w-6 ${i === 0 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                  {p.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-ink dark:text-ink-on-dark mb-0.5">
                    {p.display_name}
                    {p.user_id === user?.id && (
                      <span className="text-[9px] tracking-[1px] text-accent-gold ml-1.5">YOU</span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark">
                    {p.correct_answers}/{p.total_questions} correct · {p.total_questions > 0 ? Math.round((p.correct_answers / p.total_questions) * 100) : 0}%
                  </div>
                </div>
                <div className={`font-display text-[17px] font-bold flex-shrink-0 ${i === 0 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                  {p.total_score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Game summary */}
          <div className="mt-3 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark border-t-[3px] border-t-accent-gold px-[18px] py-3.5">
            <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-2.5">Game Summary</div>
            {([
              ['Questions', String(results[0]?.total_questions ?? '—')],
              ['Players', String(results.length)],
              ['Winner', results[0]?.display_name ?? '—'],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-divider dark:border-divider-on-dark last:border-b-0">
                <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{k}</span>
                <span className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: full standings */}
        <div>
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2.5">
            Final Standings · All {results.length} Players
          </div>
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark">
            {/* Header row */}
            <div
              className="grid px-4 py-1.5 border-b border-divider dark:border-divider-on-dark"
              style={{ gridTemplateColumns: '36px 1fr 60px 52px 52px 80px' }}
            >
              {['#', 'Player', 'Correct', 'Acc', 'Avg', 'Score'].map((h) => (
                <div key={h} className="text-[9px] tracking-[1.5px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase">
                  {h}
                </div>
              ))}
            </div>
            {/* Player rows */}
            {results.map((p, i) => {
              const isMe = p.user_id === user?.id;
              const acc = p.total_questions > 0 ? Math.round((p.correct_answers / p.total_questions) * 100) : 0;
              const avgSec = (p.average_time_ms / 1000).toFixed(1);
              return (
                <div
                  key={p.user_id}
                  className={`grid px-4 py-[9px] items-center ${
                    i < results.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''
                  } ${
                    isMe
                      ? 'bg-accent-gold-soft border-l-[3px] border-l-accent-gold'
                      : 'border-l-[3px] border-l-transparent'
                  }`}
                  style={{ gridTemplateColumns: '36px 1fr 60px 52px 52px 80px' }}
                >
                  <span className={`font-display text-[14px] font-bold ${p.rank <= 3 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                    {p.rank}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-full grid place-items-center text-[8px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-card-light' : 'bg-sidebar text-card-light'}`}>
                      {p.display_name[0]}
                    </div>
                    <span className={`text-[12px] truncate ${isMe ? 'font-bold' : 'font-normal'} text-ink dark:text-ink-on-dark`}>
                      {p.display_name}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-secondary-ink dark:text-muted-ink-on-dark">{p.correct_answers}/{p.total_questions}</span>
                  <span className="text-[11.5px] text-secondary-ink dark:text-muted-ink-on-dark">{acc}%</span>
                  <span className="text-[11.5px] text-secondary-ink dark:text-muted-ink-on-dark">{avgSec}s</span>
                  <span className={`font-display text-[16px] font-bold ${isMe ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                    {p.total_score.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
