import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ErrorLogger } from '../../utils/errorLogger';
interface Participant {
  id: string;
  display_name: string;
  score: number;
  user_id: string | null;
}

interface Answer {
  participant_id: string;
  selected_answer: string | null;
  is_correct: boolean;
  time_taken_seconds: number;
  points_earned: number;
}

interface ParticipantResult extends Participant {
  answer: Answer | null;
  answered: boolean;
}

interface BrainRushQuestionResultsProps {
  gameSessionId: string;
  questionIndex: number;
  correctAnswer: string;
  participants: Participant[];
  isHost: boolean;
  onNextQuestion: () => void;
  currentUserId?: string;
}

export const BrainRushQuestionResults: React.FC<BrainRushQuestionResultsProps> = ({
  gameSessionId,
  questionIndex,
  correctAnswer,
  participants,
  isHost,
  onNextQuestion,
  currentUserId
}) => {
  const [participantResults, setParticipantResults] = useState<ParticipantResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const loadAnswers = useCallback(async () => {
    setLoading(true);

    try {
      const { data: answers, error } = await supabase
        .from('eduplay_answers')
        .select('*')
        .eq('game_session_id', gameSessionId)
        .eq('question_index', questionIndex);

      if (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ErrorLogger.error(err, {
          component: 'BrainRushQuestionResults',
          action: 'loadAnswers',
          metadata: { gameSessionId, questionIndex }
        });
        setLoading(false);
        return;
      }

      const results: ParticipantResult[] = participants.map(participant => {
        const answer = answers?.find(a => a.participant_id === participant.id) || null;
        return {
          ...participant,
          answer,
          answered: answer !== null
        };
      });

      results.sort((a, b) => {
        if (a.answer?.is_correct && !b.answer?.is_correct) return -1;
        if (!a.answer?.is_correct && b.answer?.is_correct) return 1;
        if (a.answer && b.answer) {
          return a.answer.time_taken_seconds - b.answer.time_taken_seconds;
        }
        return 0;
      });

      setParticipantResults(results);
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, {
        component: 'BrainRushQuestionResults',
        action: 'loadAnswers',
        metadata: { gameSessionId, questionIndex }
      });
      setLoading(false);
    }
  }, [gameSessionId, questionIndex, participants]);

  useEffect(() => {
    void loadAnswers();
  }, [loadAnswers]);

  useEffect(() => {
    if (!isHost && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isHost]);

  const correctCount = participantResults.filter(p => p.answer?.is_correct).length;
  const myResult = participantResults.find(p => p.user_id === currentUserId);
  const sortedByScore = useMemo(
    () => [...participantResults].sort((a, b) => b.score - a.score),
    [participantResults]
  );
  const myRank = currentUserId ? sortedByScore.findIndex(p => p.user_id === currentUserId) + 1 : 0;
  const myPointsThisRound = myResult?.answer?.points_earned ?? 0;
  const correctThisRound = sortedByScore.filter(p => p.answer?.is_correct).length;

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="animate-pulse text-[13px] text-muted-ink dark:text-muted-ink-on-dark py-10 text-center">
          Loading results...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Label row */}
      <div className="flex items-center justify-between mb-[4px]">
        <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase">
          Brain Rush · After Question {questionIndex + 1}
        </div>
        <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
          {participants.length} players
        </div>
      </div>
      <div className="h-px bg-divider dark:bg-divider-on-dark mt-[8px] mb-[14px]" />

      {/* Your result banner */}
      {myResult && myRank > 0 && (
        <div className="bg-sidebar px-[28px] py-[20px] mb-3 flex items-center gap-7">
          <div className="pr-7 border-r border-ink-on-dark/[.08] flex-shrink-0">
            <div className="text-[9px] tracking-[2px] text-ink-on-dark/40 font-bold uppercase mb-[6px]">Your Rank</div>
            <div className="font-display text-[54px] font-bold text-ink-on-dark leading-none tracking-[-2px]">#{myRank}</div>
            <div className="text-[9px] tracking-[1.5px] text-accent-gold font-bold mt-[6px] uppercase">
              {myResult.answer?.is_correct ? '— Correct answer' : '— Keep going'}
            </div>
          </div>
          {([
            [String(myResult.score), 'Total pts'],
            [`${correctThisRound} / ${questionIndex + 1}`, 'Correct'],
            [myResult.answer ? `${myResult.answer.time_taken_seconds.toFixed(1)}s` : '—', 'Time'],
          ] as [string, string][]).map(([v, l], i) => (
            <div key={l} className={`${i < 2 ? 'pr-7 border-r border-ink-on-dark/[.08]' : ''} text-center`}>
              <div className="font-display text-[30px] font-bold text-ink-on-dark leading-none">{v}</div>
              <div className="text-[9px] tracking-[1.5px] text-ink-on-dark/40 uppercase mt-[5px]">{l}</div>
            </div>
          ))}
          <div className="ml-auto text-right">
            <div className="text-[9px] tracking-[2px] text-ink-on-dark/30 uppercase mb-[4px]">This round</div>
            <div className="font-display text-[36px] font-bold text-accent-gold leading-none">
              {myPointsThisRound > 0 ? `+${myPointsThisRound}` : myPointsThisRound < 0 ? String(myPointsThisRound) : '0'}
            </div>
          </div>
        </div>
      )}

      {/* Answer reveal */}
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-l-[3px] border-l-accent-gold px-[20px] py-[14px] mb-[14px]">
        <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-[6px]">Correct Answer</div>
        <div className="font-display text-[15px] font-semibold text-ink dark:text-ink-on-dark mb-[6px]">{correctAnswer}</div>
        <div className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark">
          <strong className="text-secondary-ink dark:text-muted-ink-on-dark">{correctCount} of {participants.length} players</strong> answered correctly.
        </div>
      </div>

      {/* Two-column: leaderboard + countdown/next */}
      <div className="grid gap-[18px]" style={{ gridTemplateColumns: '1fr 200px' }}>
        {/* Leaderboard table */}
        <div>
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-[10px]">
            Class Standing · After Round {questionIndex + 1}
          </div>
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark">
            <div className="grid px-[14px] py-[6px] border-b border-divider dark:border-divider-on-dark" style={{ gridTemplateColumns: '30px 1fr 44px 52px 64px' }}>
              {['#', 'Player', 'Q', 'Score', 'Pts'].map(h => (
                <div key={h} className="text-[9px] tracking-[1.5px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase">{h}</div>
              ))}
            </div>
            {sortedByScore.map((p, i) => {
              const isMe = p.user_id === currentUserId;
              const pts = p.answer?.points_earned ?? 0;
              return (
                <div
                  key={p.id}
                  className={`grid px-[14px] py-[9px] border-b border-divider dark:border-divider-on-dark last:border-0 items-center ${isMe ? 'bg-accent-gold-soft' : ''}`}
                  style={{ gridTemplateColumns: '30px 1fr 44px 52px 64px' }}
                >
                  <span className={`font-display text-[14px] font-bold ${i < 3 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{i + 1}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-[26px] h-[26px] rounded-full grid place-items-center text-[9px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-ink-on-dark'}`}>
                      {p.display_name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap ${isMe ? 'font-bold text-ink dark:text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>
                        {p.display_name}
                      </div>
                      <div className={`text-[9px] ${p.answer?.is_correct ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                        {pts > 0 ? `+${pts}` : pts < 0 ? String(pts) : '—'} this round
                      </div>
                    </div>
                  </div>
                  <span className={`text-[13px] font-bold ${p.answer?.is_correct ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                    {p.answer?.is_correct ? '✓' : p.answered ? '✗' : '—'}
                  </span>
                  <span className="font-display text-[14px] font-semibold text-muted-ink dark:text-muted-ink-on-dark">{p.score}</span>
                  <span className={`font-display text-[12px] font-semibold ${pts !== 0 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                    {pts > 0 ? `+${pts}` : pts < 0 ? String(pts) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: countdown + round stats */}
        <div className="flex flex-col gap-3">
          {isHost ? (
            <div className="bg-sidebar px-[16px] py-[20px] text-center">
              <div className="text-[9px] tracking-[2px] text-ink-on-dark/40 font-bold uppercase mb-[10px]">Ready?</div>
              <button
                onClick={onNextQuestion}
                className="w-full py-[10px] bg-accent-gold text-sidebar font-display text-[13px] font-bold hover:opacity-90 transition"
              >
                Next Question →
              </button>
            </div>
          ) : (
            <div className="bg-sidebar px-[16px] py-[20px] text-center">
              <div className="text-[9px] tracking-[2px] text-ink-on-dark/40 font-bold uppercase mb-[10px]">Next Question In</div>
              <div className="font-display text-[64px] font-bold text-ink-on-dark leading-none">{countdown}</div>
              <div className="h-[4px] bg-ink-on-dark/[.18] mt-[14px]">
                <div className="h-full bg-accent-gold transition-all duration-1000" style={{ width: `${(countdown / 5) * 100}%` }} />
              </div>
            </div>
          )}
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-[14px] py-[14px]">
            <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-[10px]">Round Stats</div>
            {([
              ['Correct', `${correctCount} / ${participants.length}`],
              ['Top pts', sortedByScore[0] ? `${sortedByScore[0].answer?.points_earned ?? 0}` : '—'],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex justify-between mb-2">
                <span className="text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark">{k}</span>
                <span className="font-display text-[11px] font-semibold text-accent-gold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
