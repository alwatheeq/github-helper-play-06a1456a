import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const timerPct = Math.round((timeLeft / timePerQuestion) * 100);
  const answeredCount = playerScores.filter(p => p.score > 0 || p.correct > 0).length;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] tracking-[2.5px] text-accent-gold font-bold uppercase">
            Brain Rush · Question {currentQuestionIndex + 1} / {questions.length}
          </div>
          <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-[2px]">
            {playerScores.length} players · {answeredCount} answered
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard?view=eduplay')}
          className="px-3 py-[4px] bg-transparent border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[11px] cursor-pointer"
        >
          Leave Game
        </button>
      </div>
      <div className="h-px bg-ink dark:bg-ink-on-dark opacity-80 mt-[10px] mb-[14px]" />

      {/* Live Rankings Strip — horizontal */}
      <div className="flex gap-[5px] mb-[14px] overflow-x-auto">
        {playerScores.slice(0, 7).map((p, i) => {
          const isMe = p.user_id === user?.id;
          return (
            <div
              key={p.user_id}
              className={`flex items-center gap-[7px] px-[11px] py-[7px] border flex-shrink-0 min-w-0 ${i < 2 ? 'flex-none' : 'flex-1'}
                ${isMe ? 'bg-sidebar border-accent-gold' : (i === 0 ? 'bg-accent-gold-soft border-divider dark:border-divider-on-dark' : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark')}`}
            >
              <span className={`text-[9px] font-bold flex-shrink-0 ${i === 0 || isMe ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>#{i + 1}</span>
              <div className={`w-[22px] h-[22px] rounded-full grid place-items-center text-[9px] font-bold flex-shrink-0 border border-divider dark:border-divider-on-dark ${isMe ? 'bg-accent-gold text-sidebar' : (i === 0 ? 'bg-sidebar text-card-light' : 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark')}`}>
                {p.display_name[0].toUpperCase()}
              </div>
              <span className={`text-[11px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 ${isMe ? 'font-bold text-card-light' : 'text-ink dark:text-ink-on-dark font-medium'}`}>
                {isMe ? 'You' : p.display_name}
              </span>
              <span className={`font-display text-[14px] font-bold flex-shrink-0 ${isMe || i === 0 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{p.correct}</span>
            </div>
          );
        })}
        {playerScores.length > 7 && (
          <div className="flex items-center px-[11px] py-[7px] bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark flex-shrink-0 gap-[3px]">
            {playerScores.slice(7, 10).map((p) => (
              <div key={p.user_id} className="w-[20px] h-[20px] rounded-full bg-sidebar text-card-light grid place-items-center text-[8px] font-bold">
                {p.display_name[0].toUpperCase()}
              </div>
            ))}
            <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark ml-[3px]">+{Math.max(0, playerScores.length - 7)}</span>
          </div>
        )}
      </div>

      {/* Timer bar */}
      <div className="mb-[18px]">
        <div className="h-[4px] bg-divider dark:bg-divider-on-dark rounded-sm">
          <div className="h-full bg-accent-gold rounded-sm transition-all duration-1000" style={{ width: `${timerPct}%` }} />
        </div>
        <div className="flex justify-between mt-[5px]">
          <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">time remaining</span>
          <span className={`font-display text-[13px] font-semibold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-ink dark:text-ink-on-dark'}`}>{timeLeft}s</span>
        </div>
      </div>

      {/* Question — left accent border */}
      <div className="font-display text-[20px] font-semibold text-ink dark:text-ink-on-dark leading-snug border-l-[3px] border-l-accent-gold pl-[18px] mb-[18px]">
        {currentQuestion.question}
      </div>

      {/* Answer options — 2×2 grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correct_answer;
          const showResult = hasAnswered;

          const bgBorder = showResult && isCorrect
            ? 'border-[2px] border-green-500 bg-green-500/10'
            : showResult && isSelected && !isCorrect
            ? 'border-[2px] border-red-500 bg-red-500/10'
            : isSelected
            ? 'border-[2px] border-accent-gold bg-accent-gold-soft'
            : 'border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark';

          return (
            <button
              key={i}
              onClick={() => !hasAnswered && submitAnswer(option)}
              disabled={hasAnswered}
              className={`flex gap-[14px] items-start p-[18px_20px] text-left min-h-[80px] transition ${bgBorder} ${!hasAnswered ? 'cursor-pointer hover:opacity-80' : 'cursor-not-allowed'}`}
            >
              <span className={`text-[11px] tracking-[1px] font-bold flex-shrink-0 mt-[2px] ${isSelected || (showResult && isCorrect) ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                {letters[i]}
              </span>
              <span className={`text-[13.5px] leading-[1.55] flex-1 ${isSelected ? 'text-ink dark:text-ink-on-dark font-semibold' : 'text-secondary-ink dark:text-muted-ink-on-dark'}`}>
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {/* Game info strip */}
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-[16px] py-[9px] flex gap-[24px] mb-[18px]">
        {([
          ['Format', 'Most correct answers wins'],
          ['Players', `${answeredCount} / ${playerScores.length} answered`],
          ['Progress', `Q ${currentQuestionIndex + 1} of ${questions.length}`],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="flex gap-[6px] items-baseline">
            <span className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase tracking-[1px]">{k}</span>
            <span className="text-[11px] text-ink dark:text-ink-on-dark font-medium">{v}</span>
          </div>
        ))}
      </div>

      {/* Live Leaderboard grid — rank 1 spans full row */}
      <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-[10px]">
        Live Standings · {playerScores.length} Players
      </div>
      <div className="grid grid-cols-3 gap-[6px]">
        {playerScores.slice(0, 1).map((p) => {
          const isMe = p.user_id === user?.id;
          return (
            <div key={p.user_id} className={`col-span-3 flex items-center gap-3 px-4 py-3 border-[2px] border-accent-gold ${isMe ? 'bg-sidebar' : 'bg-accent-gold-soft'}`}>
              <span className="font-display text-[22px] font-bold text-accent-gold min-w-[26px]">1</span>
              <div className={`w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-card-light'}`}>
                {p.display_name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] font-bold truncate ${isMe ? 'text-card-light' : 'text-ink dark:text-ink-on-dark'}`}>
                  {isMe ? `${p.display_name} (You)` : p.display_name}
                </div>
                <div className={`text-[10px] ${isMe ? 'text-card-light/50' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>Leading the room</div>
              </div>
              <span className="font-display text-[26px] font-bold text-accent-gold">{p.correct}</span>
            </div>
          );
        })}
        {playerScores.slice(1, 3).map((p, i) => {
          const isMe = p.user_id === user?.id;
          return (
            <div key={p.user_id} className={`flex items-center gap-2 px-3 py-3 border ${isMe ? 'bg-sidebar border-accent-gold' : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark'}`}>
              <span className="font-display text-[16px] font-bold text-muted-ink dark:text-muted-ink-on-dark min-w-[20px]">{i + 2}</span>
              <div className={`w-[26px] h-[26px] rounded-full grid place-items-center text-[10px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-card-light'}`}>
                {p.display_name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[12px] truncate ${isMe ? 'text-card-light font-bold' : 'text-ink dark:text-ink-on-dark font-medium'}`}>
                  {isMe ? `${p.display_name} (You)` : p.display_name}
                </div>
              </div>
              <span className="font-display text-[15px] font-bold text-muted-ink dark:text-muted-ink-on-dark">{p.correct}</span>
            </div>
          );
        })}
        {playerScores.slice(3).map((p, i) => {
          const isMe = p.user_id === user?.id;
          return (
            <div key={p.user_id} className={`flex items-center gap-2 px-3 py-[9px] border ${isMe ? 'bg-accent-gold-soft border-accent-gold' : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark'}`}>
              <span className={`text-[11px] font-semibold min-w-[18px] ${isMe ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{i + 4}</span>
              <div className={`w-[22px] h-[22px] rounded-full grid place-items-center text-[8px] font-bold flex-shrink-0 ${isMe ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-card-light'}`}>
                {p.display_name[0].toUpperCase()}
              </div>
              <span className={`text-[11px] flex-1 overflow-hidden text-ellipsis whitespace-nowrap ${isMe ? 'text-ink dark:text-ink-on-dark font-bold' : 'text-secondary-ink dark:text-muted-ink-on-dark'}`}>
                {isMe ? `${p.display_name} (You)` : p.display_name}
              </span>
              <span className={`font-display text-[12px] font-semibold ${p.correct > 0 ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{p.correct}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
