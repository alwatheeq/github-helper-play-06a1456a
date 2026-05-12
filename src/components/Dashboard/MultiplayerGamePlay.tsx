import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

interface PlayerScore {
  user_id: string;
  display_name: string;
  score: number;
  correct: number;
}

interface GameConfig {
  timePerQuestion?: number;
  questionCount?: number;
  [key: string]: unknown;
}

interface GameLobby {
  id: string;
  questions_json: Question[];
  game_config: GameConfig | null;
}

interface MultiplayerGamePlayProps {
  lobbyId: string;
}

export default function MultiplayerGamePlay({ lobbyId }: MultiplayerGamePlayProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error: showErrorToast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_gameEnded, setGameEnded] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(30);

  useEffect(() => {
    loadGameData();
  }, [lobbyId]);

  useEffect(() => {
    if (!lobbyId) return;

    const answersChannel = supabase
      .channel(`game_answers_${lobbyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'multiplayer_game_answers',
          filter: `lobby_id=eq.${lobbyId}`
        },
        () => {
          updateLiveScores();
        }
      )
      .subscribe();

    return () => {
      answersChannel.unsubscribe();
    };
  }, [lobbyId]);

  useEffect(() => {
    if (hasAnswered || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAnswered, timeLeft]);

  const loadGameData = async () => {
    if (isOffline()) {
      handleOfflineError(showErrorToast);
      setIsLoading(false);
      return;
    }

    try {
      const { data: lobby, error: lobbyError } = await supabase
        .from('multiplayer_game_lobbies')
        .select('questions_json, game_config')
        .eq('id', lobbyId)
        .single();

      if (lobbyError) {
        const message = handleSupabaseError(lobbyError, { 
          component: 'MultiplayerGamePlay', 
          action: 'loadGameData',
          step: 'fetchLobby',
          lobbyId
        });
        ErrorLogger.error(lobbyError, { 
          component: 'MultiplayerGamePlay', 
          action: 'loadGameData',
          step: 'fetchLobby',
          lobbyId,
          userId: user?.id
        });
        showErrorToast(message);
        setIsLoading(false);
        return;
      }

      if (!lobby) {
        const error = new Error('Lobby not found');
        ErrorLogger.error(error, { 
          component: 'MultiplayerGamePlay', 
          action: 'loadGameData',
          step: 'fetchLobby',
          lobbyId,
          userId: user?.id
        });
        showErrorToast('Lobby not found');
        setIsLoading(false);
        return;
      }

      const typedLobby = lobby as GameLobby;
      const questionData = typedLobby.questions_json || [];
      
      // Type guard to ensure questions are valid
      if (!Array.isArray(questionData)) {
        const error = new Error('Invalid questions data format');
        ErrorLogger.error(error, { 
          component: 'MultiplayerGamePlay', 
          action: 'loadGameData',
          step: 'validateQuestions',
          lobbyId,
          userId: user?.id
        });
        showErrorToast('Invalid game data format');
        setIsLoading(false);
        return;
      }

      setQuestions(questionData);
      const gameConfig = typedLobby.game_config as GameConfig | null;
      setTimePerQuestion(gameConfig?.timePerQuestion || 30);
      setTimeLeft(gameConfig?.timePerQuestion || 30);

      const { data: players, error: playersError } = await supabase
        .from('multiplayer_game_players')
        .select('user_id, display_name')
        .eq('lobby_id', lobbyId)
        .is('left_at', null);

      if (playersError) {
        const message = handleSupabaseError(playersError, { 
          component: 'MultiplayerGamePlay', 
          action: 'loadGameData',
          step: 'fetchPlayers',
          lobbyId
        });
        ErrorLogger.error(playersError, { 
          component: 'MultiplayerGamePlay', 
          action: 'loadGameData',
          step: 'fetchPlayers',
          lobbyId,
          userId: user?.id
        });
        showErrorToast(message);
        setIsLoading(false);
        return;
      }

      setPlayerScores(
        players.map(p => ({
          user_id: p.user_id,
          display_name: p.display_name,
          score: 0,
          correct: 0
        }))
      );

      setGameStartTime(Date.now());
      setIsLoading(false);
    } catch (err: unknown) {
      const message = handleApiError(err, { 
        component: 'MultiplayerGamePlay', 
        action: 'loadGameData',
        lobbyId,
        userId: user?.id
      });
      ErrorLogger.error(err, { 
        component: 'MultiplayerGamePlay', 
        action: 'loadGameData',
        lobbyId,
        userId: user?.id
      });
      showErrorToast(message);
      setIsLoading(false);
    }
  };

  const updateLiveScores = async () => {
    if (isOffline()) {
      // Non-blocking for real-time updates
      return;
    }

    try {
      const { data: answers, error } = await supabase
        .from('multiplayer_game_answers')
        .select('user_id, points_earned, is_correct')
        .eq('lobby_id', lobbyId);

      if (error) {
        ErrorLogger.error(error, { 
          component: 'MultiplayerGamePlay', 
          action: 'updateLiveScores',
          lobbyId,
          userId: user?.id
        });
        // Non-blocking for real-time updates
        return;
      }

      const scoreMap = new Map<string, { score: number; correct: number }>();

      answers.forEach(answer => {
        const current = scoreMap.get(answer.user_id) || { score: 0, correct: 0 };
        scoreMap.set(answer.user_id, {
          score: current.score + answer.points_earned,
          correct: current.correct + (answer.is_correct ? 1 : 0)
        });
      });

      setPlayerScores(prev =>
        prev.map(player => {
          const stats = scoreMap.get(player.user_id) || { score: 0, correct: 0 };
          return {
            ...player,
            score: stats.score,
            correct: stats.correct
          };
        }).sort((a, b) => b.score - a.score)
      );
    } catch (err: unknown) {
      ErrorLogger.error(err, { 
        component: 'MultiplayerGamePlay', 
        action: 'updateLiveScores',
        lobbyId,
        userId: user?.id
      });
      // Non-blocking for real-time updates
    }
  };

  const calculatePoints = useCallback((timeTaken: number) => {
    const timeBonus = Math.max(0, Math.floor((timePerQuestion - timeTaken) * 10));
    const basePoints = 100;
    return basePoints + timeBonus;
  }, [timePerQuestion]);

  const submitAnswer = async (answer: string) => {
    if (hasAnswered || !user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct_answer;
    const points = isCorrect ? calculatePoints(timeTaken) : 0;

    setHasAnswered(true);
    setSelectedAnswer(answer);

    try {
      const { error } = await supabase
        .from('multiplayer_game_answers')
        .insert({
          lobby_id: lobbyId,
          user_id: user.id,
          question_index: currentQuestionIndex,
          selected_answer: answer,
          is_correct: isCorrect,
          time_taken_ms: timeTaken * 1000,
          points_earned: points
        });

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'MultiplayerGamePlay', 
          action: 'submitAnswer',
          lobbyId,
          questionIndex: currentQuestionIndex,
          userId: user.id
        });
        ErrorLogger.error(error, { 
          component: 'MultiplayerGamePlay', 
          action: 'submitAnswer',
          lobbyId,
          questionIndex: currentQuestionIndex,
          userId: user.id
        });
        showErrorToast(message);
        // Allow game to continue even if answer submission fails
        setTimeout(() => {
          moveToNextQuestion();
        }, 2000);
        return;
      }

      await updateLiveScores();

      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    } catch (err: unknown) {
      const message = handleApiError(err, { 
        component: 'MultiplayerGamePlay', 
        action: 'submitAnswer',
        lobbyId,
        userId: user.id
      });
      ErrorLogger.error(err, { 
        component: 'MultiplayerGamePlay', 
        action: 'submitAnswer',
        lobbyId,
        userId: user.id
      });
      showErrorToast(message);
      // Allow game to continue even if answer submission fails
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    }
  };

  const handleTimeout = () => {
    if (!hasAnswered && user) {
      submitAnswer('');
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setTimeLeft(timePerQuestion);
      setGameStartTime(Date.now());
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      // Still navigate to results even if offline
      setGameEnded(true);
      navigate(`/dashboard/brain-rush/results/${lobbyId}`);
      return;
    }

    try {
      const { error: scoreError } = await supabase.rpc('calculate_player_final_score', {
        p_lobby_id: lobbyId,
        p_user_id: user.id
      });

      if (scoreError) {
        ErrorLogger.error(scoreError, { 
          component: 'MultiplayerGamePlay', 
          action: 'endGame',
          step: 'calculateUserScore',
          lobbyId,
          userId: user.id
        });
        // Continue even if score calculation fails
      }

      const { data: players, error: playersError } = await supabase
        .from('multiplayer_game_players')
        .select('user_id')
        .eq('lobby_id', lobbyId)
        .is('left_at', null);

      if (playersError) {
        ErrorLogger.error(playersError, { 
          component: 'MultiplayerGamePlay', 
          action: 'endGame',
          step: 'fetchPlayers',
          lobbyId,
          userId: user.id
        });
        // Continue even if fetch fails
      } else if (players) {
        for (const player of players) {
          if (player.user_id !== user.id) {
            const { error: otherScoreError } = await supabase.rpc('calculate_player_final_score', {
              p_lobby_id: lobbyId,
              p_user_id: player.user_id
            });
            if (otherScoreError) {
              ErrorLogger.error(otherScoreError, { 
                component: 'MultiplayerGamePlay', 
                action: 'endGame',
                step: 'calculateOtherPlayerScore',
                lobbyId,
                otherUserId: player.user_id,
                userId: user.id
              });
              // Continue even if other player score calculation fails
            }
          }
        }
      }

      const { error: updateError } = await supabase
        .from('multiplayer_game_lobbies')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', lobbyId);

      if (updateError) {
        ErrorLogger.error(updateError, { 
          component: 'MultiplayerGamePlay', 
          action: 'endGame',
          step: 'updateLobbyStatus',
          lobbyId,
          userId: user.id
        });
        // Still navigate to results even if update fails
      }

      setGameEnded(true);
      navigate(`/dashboard/brain-rush/results/${lobbyId}`);
    } catch (err: unknown) {
      ErrorLogger.error(err, { 
        component: 'MultiplayerGamePlay', 
        action: 'endGame',
        lobbyId,
        userId: user.id
      });
      // Still navigate to results even if error occurs
      setGameEnded(true);
      navigate(`/dashboard/brain-rush/results/${lobbyId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">Loading game...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">No questions available</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const timerPct = Math.round((timeLeft / timePerQuestion) * 100);
  const answeredCount = playerScores.filter(p => p.score > 0 || p.correct > 0).length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Label + timer pill row */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase">
          Brain Rush Multiplayer · Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{answeredCount} / {playerScores.length} answered</span>
          {/* Timer pill */}
          <div className="flex items-center gap-2 bg-chip dark:bg-chip border border-accent-gold px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-accent-gold" />
            <span className={`font-display text-[20px] font-bold leading-none ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-accent-gold'}`}>{timeLeft}</span>
            <span className="text-[10px] text-accent-gold opacity-70 font-semibold">s</span>
          </div>
        </div>
      </div>

      {/* Progress bar — accent-gold fill */}
      <div className="h-px bg-divider dark:bg-divider-on-dark mb-2" />
      <div className="h-[3px] bg-divider dark:bg-divider-on-dark mb-4">
        <div className="h-full bg-accent-gold transition-all duration-1000" style={{ width: `${timerPct}%` }} />
      </div>

      {/* Question card — bordered top with accent */}
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-t-[3px] border-t-accent-gold px-6 py-5 mb-3 shadow-[var(--s4-shadow-hairline)]">
        <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-3">Question</div>
        <p className="font-display text-[18px] font-semibold text-ink dark:text-ink-on-dark leading-snug m-0">
          {currentQuestion.question}
        </p>
      </div>

      {/* Options — full-width vertical list */}
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark mb-3 shadow-[var(--s4-shadow-hairline)]">
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correct_answer;
          const showResult = hasAnswered;
          const letters = ['A', 'B', 'C', 'D'];

          let borderLeft = '3px solid transparent';
          let bg = 'transparent';
          if (showResult && isCorrect) { borderLeft = '3px solid #4caf50'; bg = 'rgba(76,175,80,0.08)'; }
          else if (showResult && isSelected && !isCorrect) { borderLeft = '3px solid #d9534f'; bg = 'rgba(217,83,79,0.08)'; }
          else if (isSelected) { borderLeft = '3px solid var(--color-accent-gold)'; bg = 'rgba(226,192,106,0.07)'; }

          return (
            <button
              key={i}
              onClick={() => !hasAnswered && submitAnswer(option)}
              disabled={hasAnswered}
              style={{ borderLeft, background: bg }}
              className={`w-full flex items-center gap-4 px-6 py-4 border-b border-divider dark:border-divider-on-dark last:border-0 text-left transition-colors ${!hasAnswered ? 'cursor-pointer hover:bg-chip/30' : 'cursor-not-allowed'}`}
            >
              <span className={`font-display text-[17px] font-bold flex-shrink-0 w-6 ${isSelected || (showResult && isCorrect) ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                {letters[i]}
              </span>
              <span className={`text-[14px] leading-snug flex-1 ${isSelected ? 'text-ink dark:text-ink-on-dark font-semibold' : 'text-ink dark:text-ink-on-dark'}`}>{option}</span>
              {showResult && isCorrect && (
                <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
              {showResult && isSelected && !isCorrect && (
                <Zap className="w-4 h-4 text-red-400 flex-shrink-0 ml-auto" />
              )}
            </button>
          );
        })}
      </div>

      {/* Players answered status panel */}
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark shadow-[var(--s4-shadow-hairline)]">
        <div className="px-4 py-2 border-b border-divider dark:border-divider-on-dark flex items-center gap-3">
          <span className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase">Players</span>
          <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">{answeredCount} answered · {playerScores.length - answeredCount} waiting</span>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {playerScores.map((player, i) => {
            const answered = player.correct > 0 || (hasAnswered && player.user_id === user?.id);
            const isMe = player.user_id === user?.id;
            return (
              <div
                key={player.user_id}
                className={`flex items-center gap-2 px-3 py-1.5 border ${answered ? 'bg-chip dark:bg-chip border-accent-gold/20' : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark opacity-60'}`}
              >
                {answered ? (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-gold"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <div className="w-2 h-2 rounded-full border border-muted-ink dark:border-muted-ink-on-dark" />
                )}
                <span className={`text-[11.5px] ${answered ? 'text-ink dark:text-ink-on-dark font-medium' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                  {player.display_name}{isMe ? ' (You)' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
