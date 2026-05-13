import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { BrainRushQuestionResults } from './BrainRushQuestionResults';

import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { ReadAloudButton } from './ReadAloud/ReadAloudButton';

interface GameSession {
  id: string;
  host_id: string;
  game_code: string;
  game_title: string;
  question_timer_seconds: number;
  total_questions: number;
  difficulty_level: string;
  status: string;
  current_question_index: number;
}

interface GameQuestion {
  id: string;
  game_session_id: string;
  question_index: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  time_limit_seconds: number;
}

interface Participant {
  id: string;
  display_name: string;
  score: number;
  is_host: boolean;
  user_id: string | null;
}

interface Answer {
  participant_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken_seconds: number;
}

interface BrainRushGamePlayProps {
  gameSession: GameSession;
  participants: Participant[];
  isHost: boolean;
  onGameEnd: () => void;
}

export const BrainRushGamePlay: React.FC<BrainRushGamePlayProps> = ({
  gameSession,
  participants: initialParticipants,
  isHost,
  onGameEnd
}) => {
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [timeLeft, setTimeLeft] = useState(gameSession.question_timer_seconds);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showQuestionResults, setShowQuestionResults] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [loading, setLoading] = useState(true);
  const [_currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [gameState, setGameState] = useState(gameSession);

  useEffect(() => {
    if (!gameSession?.id) return;

    loadCurrentQuestion();
    const gameCleanup = subscribeToGameUpdates();
    const participantCleanup = subscribeToParticipantUpdates();

    return () => {
      gameCleanup();
      participantCleanup();
    };
  }, [gameSession.id]);

  useEffect(() => {
    if (gameState.current_question_index !== currentQuestion?.question_index) {
      loadCurrentQuestion();
      resetQuestionState();
    }
  }, [gameState.current_question_index]);

  useEffect(() => {
    if (timeLeft > 0 && !hasAnswered && !showQuestionResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, hasAnswered, showQuestionResults]);

  const subscribeToGameUpdates = () => {
    const channel = supabase
      .channel(`game-state-${gameSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'eduplay_game_sessions',
          filter: `id=eq.${gameSession.id}`
        },
        (payload) => {
          const updated = payload.new as GameSession;
          setGameState(updated);

          if (updated.status === 'completed') {
            onGameEnd();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToParticipantUpdates = () => {
    const channel = supabase
      .channel(`participants-${gameSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'eduplay_participants',
          filter: `game_session_id=eq.${gameSession.id}`
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchParticipants = async () => {
    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('eduplay_participants')
        .select('*')
        .eq('game_session_id', gameSession.id)
        .is('left_at', null)
        .order('score', { ascending: false });

      if (error) {
        ErrorLogger.error(error, { 
          component: 'BrainRushGamePlay', 
          action: 'fetchParticipants',
          userId: user?.id,
          metadata: { gameSessionId: gameSession.id }
        });
        // Non-blocking for game flow
        return;
      }

      if (data) {
        setParticipants(data);
      }
    } catch (error) {
      ErrorLogger.error(error, { 
        component: 'BrainRushGamePlay', 
        action: 'fetchParticipants',
        userId: user?.id,
        metadata: { gameSessionId: gameSession.id }
      });
      // Non-blocking for game flow
    }
  };

  const loadCurrentQuestion = async () => {
    if (isOffline()) {
      handleOfflineError(showErrorToast);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('eduplay_game_questions')
        .select('*')
        .eq('game_session_id', gameSession.id)
        .eq('question_index', gameState.current_question_index)
        .single();

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'BrainRushGamePlay', 
          action: 'loadCurrentQuestion',
          gameSessionId: gameSession.id,
          questionIndex: gameState.current_question_index
        });
        ErrorLogger.error(error, { 
          component: 'BrainRushGamePlay', 
          action: 'loadCurrentQuestion',
          userId: user?.id,
          metadata: { 
            gameSessionId: gameSession.id,
            questionIndex: gameState.current_question_index
          }
        });
        showErrorToast(message);
        return;
      }

      if (data) {
        setCurrentQuestion(data);
        setTimeLeft(data.time_limit_seconds);
      }
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'BrainRushGamePlay', 
        action: 'loadCurrentQuestion',
        gameSessionId: gameSession.id
      });
      ErrorLogger.error(error, { 
        component: 'BrainRushGamePlay', 
        action: 'loadCurrentQuestion',
        userId: user?.id,
        metadata: { gameSessionId: gameSession.id }
      });
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setShowQuestionResults(false);
    setAnswerFeedback(null);
    setCurrentAnswers([]);
  };

  const handleTimeUp = async () => {
    if (!hasAnswered) {
      await submitAnswer(null, Math.max(0, gameState.question_timer_seconds));
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (hasAnswered || showQuestionResults) return;

    setHasAnswered(true); // Set immediately to prevent double-clicks
    setSelectedAnswer(answer);
    const timeTaken = Math.max(0, gameState.question_timer_seconds - timeLeft);
    await submitAnswer(answer, timeTaken);

    // Wait 3 seconds after answering, then show question results
    setTimeout(() => {
      setShowQuestionResults(true);
    }, 3000);
  };

  const submitAnswer = async (answer: string | null, timeTaken: number) => {
    if (!currentQuestion || !user || hasAnswered) return;

    const myParticipant = participants.find(p => p.user_id === user.id);
    if (!myParticipant) return;

    setHasAnswered(true);

    const isCorrect = answer === currentQuestion.correct_answer;
    setAnswerFeedback(isCorrect ? 'correct' : 'incorrect');

    let pointsEarned = 0;
    if (isCorrect) {
      const basePoints = 1000;
      const timeBonus = Math.floor((timeLeft / currentQuestion.time_limit_seconds) * 500);
      pointsEarned = basePoints + timeBonus;
    }

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { error: answerError } = await supabase.from('eduplay_answers').insert({
        game_session_id: gameSession.id,
        participant_id: myParticipant.id,
        question_index: currentQuestion.question_index,
        selected_answer: answer,
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
        points_earned: pointsEarned
      });

      if (answerError) {
        ErrorLogger.error(answerError, { 
          component: 'BrainRushGamePlay', 
          action: 'submitAnswer',
          userId: user.id,
          metadata: { 
            step: 'insertAnswer',
            gameSessionId: gameSession.id,
            participantId: myParticipant.id
          }
        });
        showErrorToast('Failed to submit answer. Please try again.');
        return;
      }

      if (isCorrect) {
        const { error: updateError } = await supabase
          .from('eduplay_participants')
          .update({ score: myParticipant.score + pointsEarned })
          .eq('id', myParticipant.id);

        if (updateError) {
          ErrorLogger.error(updateError, { 
            component: 'BrainRushGamePlay', 
            action: 'submitAnswer',
            userId: user.id,
            metadata: { 
              step: 'updateScore',
              gameSessionId: gameSession.id,
              participantId: myParticipant.id
            }
          });
          // Non-blocking: answer was submitted, score update can fail
        }
      }
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'BrainRushGamePlay', 
        action: 'submitAnswer',
        gameSessionId: gameSession.id,
        userId: user.id
      });
      ErrorLogger.error(error, { 
        component: 'BrainRushGamePlay', 
        action: 'submitAnswer',
        userId: user.id,
        metadata: { gameSessionId: gameSession.id }
      });
      showErrorToast(message);
    }
  };

  const handleNextQuestion = async () => {
    if (!isHost) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    const nextIndex = gameState.current_question_index + 1;

    try {
      if (nextIndex >= gameState.total_questions) {
        const { error } = await supabase
          .from('eduplay_game_sessions')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq('id', gameSession.id);

        if (error) {
          const message = handleSupabaseError(error, { 
            component: 'BrainRushGamePlay', 
            action: 'handleNextQuestion',
            step: 'completeGame',
            gameSessionId: gameSession.id,
            userId: user?.id
          });
          ErrorLogger.error(error, { 
            component: 'BrainRushGamePlay', 
            action: 'handleNextQuestion',
            userId: user?.id,
            metadata: { 
              step: 'completeGame',
              gameSessionId: gameSession.id
            }
          });
          showErrorToast(message);
          // Still call onGameEnd to allow game to end even if update fails
        }

        onGameEnd();
      } else {
        const { error } = await supabase
          .from('eduplay_game_sessions')
          .update({ current_question_index: nextIndex })
          .eq('id', gameSession.id);

        if (error) {
          const message = handleSupabaseError(error, { 
            component: 'BrainRushGamePlay', 
            action: 'handleNextQuestion',
            step: 'updateQuestionIndex',
            gameSessionId: gameSession.id,
            nextIndex,
            userId: user?.id
          });
          ErrorLogger.error(error, { 
            component: 'BrainRushGamePlay', 
            action: 'handleNextQuestion',
            userId: user?.id,
            metadata: { 
              step: 'updateQuestionIndex',
              gameSessionId: gameSession.id,
              nextIndex
            }
          });
          showErrorToast(message);
        }
      }
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'BrainRushGamePlay', 
        action: 'handleNextQuestion',
        gameSessionId: gameSession.id,
        userId: user?.id
      });
      ErrorLogger.error(error, { 
        component: 'BrainRushGamePlay', 
        action: 'handleNextQuestion',
        userId: user?.id,
        metadata: { gameSessionId: gameSession.id }
      });
      showErrorToast(message);
    }
  };

  if (loading || !currentQuestion) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-card-dark p-12 text-center ">
          <Loader2 className="h-12 w-12 text-accent-gold animate-spin mx-auto mb-4" />
          <p className="text-ink-on-dark text-[13px]">Loading question...</p>
        </div>
      </div>
    );
  }

  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const questionProgress = `${gameState.current_question_index + 1} / ${gameState.total_questions}`;
  const timerPct = Math.round((timeLeft / currentQuestion.time_limit_seconds) * 100);

  // Show question results after timer expires or all players have answered
  if (showQuestionResults && currentQuestion) {
    return (
      <BrainRushQuestionResults
        gameSessionId={gameSession.id}
        questionIndex={currentQuestion.question_index}
        correctAnswer={currentQuestion.correct_answer}
        participants={participants}
        isHost={isHost}
        onNextQuestion={handleNextQuestion}
        currentUserId={user?.id}
      />
    );
  }

  // Colour palette for 4 answer cards (blue / orange / green / red)
  const cardColors = [
    { bg: '#1e3a5f', border: '#2d5a8e', label: '#7ab3e0' },
    { bg: '#5c2d0a', border: '#8a4412', label: '#f0a05a' },
    { bg: '#0d3d2e', border: '#1a6449', label: '#5dd4a4' },
    { bg: '#4a1020', border: '#7a1a35', label: '#e07a9a' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Top bar: question label + leave */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[10px] tracking-[2.5px] text-accent-gold font-bold uppercase">Brain Rush · Question {questionProgress}</div>
          <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">{gameSession.game_title} · {participants.length} players</div>
        </div>
        <button className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark border border-divider dark:border-divider-on-dark px-3 py-1.5 hover:opacity-70 transition">
          Leave Game
        </button>
      </div>

      {/* Live player strip */}
      <div className="flex gap-[5px] mb-4 overflow-x-auto pb-1">
        {sortedParticipants.slice(0, 6).map((p, i) => {
          const isMe = user && p.user_id === user.id;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-[11px] py-[7px] flex-shrink-0 border ${
                isMe
                  ? 'bg-sidebar border-accent-gold'
                  : i === 0
                  ? 'bg-chip dark:bg-chip border-divider dark:border-divider-on-dark'
                  : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark'
              }`}
            >
              <span className={`text-[9px] font-bold ${i === 0 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>#{i + 1}</span>
              <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 border border-divider ${isMe ? 'bg-accent-gold text-sidebar' : i === 0 ? 'bg-sidebar text-ink-on-dark' : 'bg-subtle dark:bg-subtle-on-dark text-ink dark:text-ink-on-dark'}`}>
                {p.display_name[0].toUpperCase()}
              </div>
              <span className={`text-[11px] font-semibold ${isMe ? 'text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>{p.display_name}</span>
              <span className={`text-[13px] font-bold font-display ml-1 ${i === 0 || isMe ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{p.score.toLocaleString()}</span>
            </div>
          );
        })}
        {sortedParticipants.length > 6 && (
          <div className="flex items-center px-3 py-2 bg-chip dark:bg-chip border border-divider dark:border-divider-on-dark text-[10px] text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0">
            +{sortedParticipants.length - 6} more
          </div>
        )}
      </div>

      {/* Timer bar — full-width accent-gold fill */}
      <div className="mb-[18px]">
        <div className="h-1 bg-divider dark:bg-divider-on-dark">
          <div
            className="h-full bg-accent-gold transition-all duration-1000"
            style={{ width: `${timerPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">time remaining</span>
          <span className={`font-display text-[13px] font-semibold ${timeLeft <= 5 ? 'text-red-500' : 'text-ink dark:text-ink-on-dark'}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Question — centered, font-display, borderLeft accent */}
      <div className="border-l-[3px] border-accent-gold pl-[18px] mb-[18px]">
        <div className="flex items-start gap-3">
          <h2 className="font-display text-[20px] font-semibold text-ink dark:text-ink-on-dark leading-snug flex-1">
            {currentQuestion.question_text}
          </h2>
          <ReadAloudButton text={currentQuestion.question_text} />
        </div>
      </div>

      {/* Answer cards — 2x2 grid with distinct colours */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px] mb-4">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correct_answer;
          const showResult = hasAnswered;
          const colors = cardColors[index];

          let bgColor = colors.bg;
          let borderColor = colors.border;
          if (showResult && isCorrect) { bgColor = '#1a4d2e'; borderColor = '#4caf50'; }
          else if (showResult && isSelected && !isCorrect) { bgColor = '#4a1212'; borderColor = '#d9534f'; }
          else if (isSelected) { borderColor = '#e2c06a'; }

          return (
            <div
              key={index}
              role="button"
              tabIndex={hasAnswered ? -1 : 0}
              onClick={() => !hasAnswered && handleAnswerSelect(option)}
              onKeyDown={(e) => !hasAnswered && e.key === 'Enter' && handleAnswerSelect(option)}
              style={{ backgroundColor: bgColor, borderColor }}
              className={`flex gap-4 items-start px-5 py-[18px] ${isSelected ? 'border-2' : 'border'} rounded-[12px] min-h-[80px] transition-colors ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}`}
            >
              <span style={{ color: colors.label }} className="text-[11px] tracking-wider font-bold flex-shrink-0 mt-0.5">
                {['A','B','C','D'][index]}
              </span>
              <span className="text-[13.5px] text-white leading-snug font-medium flex-1">{option}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-green-400" />}
                {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-400" />}
                <span onClick={(e) => e.stopPropagation()}>
                  <ReadAloudButton text={option} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Answer feedback banner */}
      {answerFeedback && (
        <div className={`p-4 mb-4 flex items-center gap-3 ${answerFeedback === 'correct' ? 'bg-green-900/40 border border-green-600' : 'bg-red-900/40 border border-red-600'}`}>
          {answerFeedback === 'correct' ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-300 text-[13px]">Correct!</p>
                <p className="text-[11px] text-green-400">+{1000 + Math.floor((timeLeft / currentQuestion.time_limit_seconds) * 500)} points</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-300 text-[13px]">Incorrect</p>
                <p className="text-[11px] text-red-400">Correct answer: {currentQuestion.correct_answer}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Game info strip */}
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-4 py-3 flex gap-6 mb-4 ">
        {[['Game', gameSession.game_title], ['Format', 'Most correct answers wins'], ['Points', '+1000 correct · time bonus']].map(([k, v]) => (
          <div key={k} className="flex gap-2 items-baseline">
            <span className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark font-bold tracking-wider uppercase">{k}</span>
            <span className="text-[11px] text-ink dark:text-ink-on-dark font-medium">{v}</span>
          </div>
        ))}
      </div>

      {/* Live leaderboard — compact 3-col grid */}
      <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">Live Standings · {participants.length} Players</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[6px] mb-4">
        {/* Rank 1 spans full row */}
        {sortedParticipants.slice(0, 1).map(p => {
          const isMe = user && p.user_id === user.id;
          return (
            <div key={p.id} className={`sm:col-span-3 flex items-center gap-3 px-4 py-3 border-2 border-accent-gold ${isMe ? 'bg-sidebar' : 'bg-chip dark:bg-chip'}`}>
              <span className="font-display text-[22px] font-bold text-accent-gold w-7">1</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-ink-on-dark'}`}>
                {p.display_name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className={`text-[13px] font-bold ${isMe ? 'text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>{p.display_name}</div>
                <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">Leading the room</div>
              </div>
              <span className="font-display text-[26px] font-bold text-accent-gold">{p.score.toLocaleString()}</span>
            </div>
          );
        })}
        {sortedParticipants.slice(1).map((p, i) => {
          const isMe = user && p.user_id === user.id;
          return (
            <div key={p.id} className={`flex items-center gap-2 px-3 py-3 border ${isMe ? 'bg-sidebar border-accent-gold' : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark'}`}>
              <span className="font-display text-[14px] font-bold text-muted-ink dark:text-muted-ink-on-dark w-5">{i + 2}</span>
              <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-ink-on-dark'}`}>
                {p.display_name[0].toUpperCase()}
              </div>
              <span className={`text-[11px] flex-1 truncate ${isMe ? 'text-ink-on-dark font-bold' : 'text-ink dark:text-ink-on-dark'}`}>{p.display_name}</span>
              <span className={`font-display text-[13px] font-bold ${isMe ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{p.score.toLocaleString()}</span>
            </div>
          );
        })}
      </div>

      {/* Host Controls */}
      {isHost && hasAnswered && (
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-4 ">
          <button
            onClick={handleNextQuestion}
            className="w-full py-3 bg-sidebar text-ink-on-dark text-[14px] font-bold font-display hover:opacity-90 transition"
          >
            {gameState.current_question_index + 1 >= gameState.total_questions ? 'Finish Game →' : 'Next Question →'}
          </button>
        </div>
      )}

      {/* Waiting for Host */}
      {!isHost && hasAnswered && (
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-5 text-center ">
          <Loader2 className="h-7 w-7 text-accent-gold animate-spin mx-auto mb-2" />
          <p className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark">Waiting for next question...</p>
        </div>
      )}
    </div>
  );
};
