import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trophy, Clock, Target, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    loadAnswers();
  }, [gameSessionId, questionIndex, participants]);

  useEffect(() => {
    if (!isHost && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isHost]);

  const loadAnswers = async () => {
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
  };

  const correctCount = participantResults.filter(p => p.answer?.is_correct).length;
  const incorrectCount = participantResults.filter(p => p.answer && !p.answer.is_correct).length;
  const unansweredCount = participantResults.filter(p => !p.answer).length;
  const correctPercentage = participants.length > 0
    ? Math.round((correctCount / participants.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className={`bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border-divider dark:border-divider-on-dark dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-sm p-12 text-center`}>
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-secondary-ink dark:text-muted-ink-on-dark"}>Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Correct Answer Display */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-[var(--s4-radius-card)] shadow-sm p-8 border-2 border-green-500 dark:border-green-600">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          <h2 className={`s4-h1 text-ink dark:text-ink-on-dark`}>Correct Answer</h2>
        </div>
        <p className="s4-h2 text-green-700 dark:text-green-300 text-center">
          {correctAnswer}
        </p>
      </div>

      {/* Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-100 dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-sm p-6">
        <h3 className={`s4-h3 text-[20px] text-ink dark:text-ink-on-dark mb-4 flex items-center space-x-2`}>
          <Target className="h-6 w-6 text-blue-600" />
          <span>Question Statistics</span>
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-[var(--s4-radius-card)] p-4 text-center">
            <p className="s4-h1 text-green-600 dark:text-green-400">{correctCount}</p>
            <p className={`text-sm text-secondary-ink dark:text-muted-ink-on-dark`}>Correct</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-[var(--s4-radius-card)] p-4 text-center">
            <p className="s4-h1 text-red-600 dark:text-red-400">{incorrectCount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
          </div>
          <div className={`bg-page-light dark:bg-page-dark rounded-[var(--s4-radius-card)] p-4 text-center`}>
            <p className={`s4-h1 text-secondary-ink dark:text-muted-ink-on-dark`}>{unansweredCount}</p>
            <p className={`text-sm text-secondary-ink dark:text-muted-ink-on-dark`}>No Answer</p>
          </div>
        </div>

        {/* Percentage Bar */}
        <div className={`bg-accent-gold-soft/20 rounded-full h-6 overflow-hidden`}>
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full flex items-center justify-center text-white text-sm font-bold transition-colors duration-150"
            style={{ width: `${correctPercentage}%` }}
          >
            {correctPercentage}% Correct
          </div>
        </div>
      </div>

      {/* Player Results */}
      <div className="bg-white dark:bg-gray-800 rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-100 dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-sm p-6">
        <h3 className={`s4-h3 text-[20px] text-ink dark:text-ink-on-dark mb-4 flex items-center space-x-2`}>
          <Trophy className="h-6 w-6 text-yellow-600" />
          <span>Player Results</span>
        </h3>

        <div className="space-y-2">
          {participantResults.map((result, index) => {
            const isCurrentUser = result.user_id === currentUserId;

            return (
              <div
                key={result.id}
                className={`p-4 rounded-[var(--s4-radius-card)] border-2 transition ${
                  isCurrentUser
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400'
                    : result.answer?.is_correct
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                    : result.answer
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                    : `bg-page-light dark:bg-page-dark border-divider dark:border-divider-on-dark`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      result.answer?.is_correct
                        ? 'bg-green-500 text-white'
                        : result.answer
                        ? 'bg-red-500 text-white'
                        : `bg-accent-gold-soft/20 text-secondary-ink dark:text-muted-ink-on-dark`
                    }`}>
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <p className={`font-bold text-ink dark:text-ink-on-dark`}>
                        {result.display_name}
                        {isCurrentUser && <span className="text-blue-600 dark:text-blue-400 ml-2">(You)</span>}
                      </p>
                      <div className={`flex items-center space-x-4 text-sm text-secondary-ink dark:text-muted-ink-on-dark mt-1`}>
                        {result.answer ? (
                          <>
                            <span className="flex items-center space-x-1">
                              {result.answer.is_correct ? (
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                              <span>{result.answer.selected_answer || 'No answer'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{result.answer.time_taken_seconds.toFixed(1)}s</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-ink dark:text-muted-ink-on-dark"}>Did not answer</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {result.answer && (
                      <>
                        <p className={`s4-h2 text-ink dark:text-ink-on-dark`}>
                          +{result.answer.points_earned}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">points</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Question Button / Countdown */}
      <div className="bg-white dark:bg-gray-800 rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border border-gray-100 dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-sm p-6">
        {isHost ? (
          <button
            onClick={onNextQuestion}
            className={`w-full px-6 py-4 bg-accent-gold text-white rounded-md hover:opacity-90 transition font-semibold flex items-center justify-center space-x-2 text-lg`}
          >
            <span>Next Question</span>
            <ChevronRight className="h-6 w-6" />
          </button>
        ) : (
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 px-6 py-4 rounded-md">
              <div className="animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-secondary-ink dark:text-muted-ink-on-dark"}>
                Waiting for host to continue...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
