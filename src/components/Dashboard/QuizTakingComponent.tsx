import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { ReadAloudButton } from './ReadAloud/ReadAloudButton';

type QuestionKind = 'multiple_choice' | 'true_false' | 'fill_in_blank' | 'open_ended';

interface Question {
  index: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  type?: QuestionKind;
}

function getQuestionKind(q: Question): QuestionKind {
  const x = q.type;
  if (x === 'true_false' || x === 'fill_in_blank' || x === 'open_ended' || x === 'multiple_choice') return x;
  return 'multiple_choice';
}

function validateQuestionShape(q: Question, i: number): string | null {
  if (!q.question?.trim()) return `Question ${i + 1} is missing text.`;
  const kind = getQuestionKind(q);
  if (!q.correct_answer?.trim()) return `Question ${i + 1} is missing an expected answer.`;
  if (kind === 'open_ended' || kind === 'fill_in_blank') {
    if (!Array.isArray(q.options)) return `Question ${i + 1} has invalid options.`;
    return null;
  }
  if (!Array.isArray(q.options) || q.options.length < 2) {
    return `Question ${i + 1} needs at least two answer choices.`;
  }
  return null;
}

function normalizeAnswerStatic(answer: string): string {
  return answer
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:'"()-]/g, '')
    .replace(/\u00A0/g, ' ')
    .trim();
}

function openEndedLooseMatch(userRaw: string, rubricRaw: string): boolean {
  const u = normalizeAnswerStatic(userRaw);
  const r = normalizeAnswerStatic(rubricRaw);
  if (!u || u.length < 2) return false;
  if (u === r) return true;
  if (r.includes(u) || u.includes(r)) return true;
  const words = r.split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return u.length >= 8;
  const hits = words.filter((w) => u.includes(w)).length;
  return hits >= Math.min(2, Math.max(1, Math.ceil(words.length * 0.35)));
}

function isUserAnswerCorrect(q: Question, userAnswer: string | undefined): boolean {
  if (!userAnswer?.trim()) return false;
  const kind = getQuestionKind(q);
  const u = normalizeAnswerStatic(userAnswer);
  const c = normalizeAnswerStatic(q.correct_answer);
  if (kind === 'open_ended') return openEndedLooseMatch(userAnswer, q.correct_answer);
  if (kind === 'fill_in_blank') return u === c || u.includes(c) || c.includes(u);
  return u === c;
}

interface QuizTakingProps {
  quizId: string;
  onComplete: () => void;
  onExit: () => void;
}

export const QuizTakingComponent: React.FC<QuizTakingProps> = ({ quizId, onComplete, onExit }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { error: showErrorToast, info: showInfoToast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [startTime] = useState<Date>(new Date());
  const [isSubmitted, setIsSubmitted] = useState(false);
  interface QuizResults {
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
    scorePercentage: number;
    timeTaken: number;
  }

  const [results, setResults] = useState<QuizResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizTitle, setQuizTitle] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
  const [translatedQuestions, setTranslatedQuestions] = useState<Record<string, Question[]>>({});

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    if (timeLimit && timeRemaining !== null && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLimit, timeRemaining, isSubmitted]);

  const fetchQuizData = async () => {
    if (!user) return;

    try {
      ErrorLogger.debug('Fetching quiz data', { component: 'QuizTakingComponent', action: 'fetchQuizData', metadata: { quizId } });
      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('quiz_title, time_limit_minutes, questions_json, quiz_language, available_languages, translated_questions_json')
        .eq('id', quizId)
        .single();

      if (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ErrorLogger.error(err, { component: 'QuizTakingComponent', action: 'loadQuiz', metadata: { quizId } });
        throw error;
      }

      if (!data) {
        throw new Error('Quiz not found');
      }

      ErrorLogger.debug('Quiz data loaded', { component: 'QuizTakingComponent', action: 'fetchQuizData', metadata: { quizId, quizTitle: data.quiz_title } });

      if (!data.questions_json || !Array.isArray(data.questions_json) || data.questions_json.length === 0) {
        const error = new Error(t('quiz.no_questions_error'));
        ErrorLogger.error(error, { component: 'QuizTakingComponent', action: 'loadQuiz', metadata: { quizId } });
        throw error;
      }

      const questions = data.questions_json as Question[];

      setCurrentLanguage(data.quiz_language || 'en');
      setAvailableLanguages(data.available_languages || ['en']);
      setTranslatedQuestions(data.translated_questions_json || {});
      ErrorLogger.debug('Questions loaded', { component: 'QuizTakingComponent', action: 'fetchQuizData', metadata: { questionCount: questions.length } });

      for (let i = 0; i < questions.length; i++) {
        const errMsg = validateQuestionShape(questions[i], i);
        if (errMsg) {
          const error = new Error(errMsg);
          ErrorLogger.error(error, { component: 'QuizTakingComponent', action: 'loadQuiz', metadata: { quizId, questionIndex: i } });
          throw error;
        }
      }

      setQuestions(questions);
      setQuizTitle(data.quiz_title);
      if (data.time_limit_minutes) {
        const totalSeconds = data.time_limit_minutes * 60;
        setTimeLimit(totalSeconds);
        setTimeRemaining(totalSeconds);
      }
      ErrorLogger.info('Quiz initialized successfully', { component: 'QuizTakingComponent', action: 'fetchQuizData', metadata: { quizId, questionCount: questions.length } });
    } catch (error) {
      const errorMessage = handleApiError(error, { component: 'QuizTakingComponent', action: 'fetchQuizData', metadata: { quizId } });
      ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizTakingComponent', action: 'fetchQuizData', metadata: { quizId } });
      showErrorToast(errorMessage);
      onExit();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const ensureUserProfile = async () => {
    if (!user) return false;

    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizTakingComponent', action: 'ensureUserProfile' });
        return false;
      }

      if (!profile) {
        ErrorLogger.debug('User profile not found, creating one', { component: 'QuizTakingComponent', action: 'ensureUserProfile', userId: user.id });
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            total_quizzes_completed: 0,
            experience_points: 0,
            level: 1
          });

        if (insertError) {
          ErrorLogger.error(insertError instanceof Error ? insertError : new Error(String(insertError)), { component: 'QuizTakingComponent', action: 'ensureUserProfile', metadata: { step: 'createProfile' } });
          return false;
        }
        ErrorLogger.info('User profile created successfully', { component: 'QuizTakingComponent', action: 'ensureUserProfile', userId: user.id });
      }

      return true;
    } catch (error) {
      ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizTakingComponent', action: 'ensureUserProfile' });
      return false;
    }
  };

  const normalizeAnswer = (answer: string): string => {
    return answer
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,!?;:'"()-]/g, '')
      .replace(/\u00A0/g, ' ')
      .trim();
  };

  const handleSubmit = async () => {
    if (!user) return;

    const endTime = new Date();
    const timeTaken = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach((question, index) => {
      const userAnswer = answers[index];
      if (!userAnswer) {
        unansweredCount++;
      } else if (normalizeAnswer(userAnswer) === normalizeAnswer(question.correct_answer)) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    const scorePercentage = (correctCount / questions.length) * 100;

    try {
      ErrorLogger.debug('Ensuring user profile exists', { component: 'QuizTakingComponent', action: 'handleSubmit', userId: user.id, metadata: { quizId } });
      const profileReady = await ensureUserProfile();
      if (!profileReady) {
        ErrorLogger.warn('Could not verify user profile, but continuing with quiz submission', { component: 'QuizTakingComponent', action: 'handleSubmit', userId: user.id, metadata: { quizId } });
      }

      ErrorLogger.debug('Submitting quiz attempt', { component: 'QuizTakingComponent', action: 'handleSubmit', userId: user.id, metadata: { quizId, answersCount: Object.keys(answers).length, scorePercentage, correctCount, incorrectCount, unansweredCount, timeTaken } });

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_session_id: quizId,
          user_id: user.id,
          answers_json: answers,
          score_percentage: scorePercentage,
          correct_count: correctCount,
          incorrect_count: incorrectCount,
          unanswered_count: unansweredCount,
          time_taken_seconds: timeTaken,
          started_at: startTime.toISOString()
        })
        .select()
        .single();

      if (error) {
        const errorMessage = handleSupabaseError(error, { component: 'QuizTakingComponent', action: 'handleSubmit', metadata: { quizId } });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizTakingComponent', action: 'handleSubmit', metadata: { quizId } });
        throw new Error(errorMessage);
      }

      ErrorLogger.info('Quiz attempt saved successfully', { component: 'QuizTakingComponent', action: 'handleSubmit', metadata: { quizId, attemptId: data.id } });

      setResults({
        correctCount,
        incorrectCount,
        unansweredCount,
        scorePercentage,
        timeTaken
      });
      setIsSubmitted(true);
    } catch (error) {
      const errorMessage = handleApiError(error, { component: 'QuizTakingComponent', action: 'handleSubmit', metadata: { quizId } });
      showErrorToast(errorMessage);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLanguageSwitch = async (newLanguage: string) => {
    if (newLanguage === currentLanguage) return;

    if (!availableLanguages.includes(newLanguage)) {
      showInfoToast(t('quiz.translating_please_wait'));
      return;
    }

    if (translatedQuestions[newLanguage]) {
      setQuestions(translatedQuestions[newLanguage]);
      setCurrentLanguage(newLanguage);
    } else {
      setCurrentLanguage(newLanguage);
    }
  };

  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page-light dark:bg-page-dark dark:bg-page-dark">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-ink dark:border-ink-on-dark border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">{t('quiz.loading')}</p>
        </div>
      </div>
    );
  }

  /* ── Result screen ── */
  if (isSubmitted && results) {
    const passed = results.scorePercentage >= 60;
    return (
      <div className="min-h-screen bg-page-light dark:bg-page-dark dark:bg-page-dark p-6">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Header + action row */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] tracking-[2.5px] uppercase font-bold text-accent-gold">
                {t('quiz.complete') || 'The Examination · Complete'}
              </p>
              <h1 className="font-display text-3xl font-semibold text-ink dark:text-ink-on-dark mt-1 tracking-tight">
                {quizTitle}
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onComplete}
                className="inline-flex items-center gap-[5px] px-[13px] py-[6px] bg-sidebar text-ink-on-dark text-[11.5px] font-semibold hover:opacity-80 transition-opacity"
              >
                ← {t('quiz.back_to_quizzes')}
              </button>
            </div>
          </div>

          {/* Score banner — dark ink */}
          <div className="bg-ink flex items-center gap-0 px-[30px] py-[22px]">
            {/* Score */}
            <div className="pr-[30px] border-r border-ink-on-dark/10 flex-shrink-0">
              <p className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-2">Final score</p>
              <p className="font-display text-[64px] font-semibold text-ink-on-dark leading-none tracking-tight">
                {Math.round(results.scorePercentage)}
                <span className="text-[26px] text-accent-gold">%</span>
              </p>
              <p className="text-[10px] text-accent-gold mt-2">
                — {passed ? 'Pass' : 'Below passing mark'}
              </p>
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-evenly pl-8">
              {[
                { value: results.correctCount,   label: 'Correct',    icon: <CheckCircle className="h-3 w-3" /> },
                { value: results.incorrectCount, label: 'Incorrect',  icon: <XCircle className="h-3 w-3" /> },
                { value: results.unansweredCount,label: 'Skipped',    icon: <AlertCircle className="h-3 w-3" /> },
              ].map(({ value, label, icon }) => (
                <div key={label} className="text-center">
                  <div className="flex justify-center mb-1.5 text-accent-gold">{icon}</div>
                  <p className="font-display text-[32px] font-semibold text-ink-on-dark leading-none">{value}</p>
                  <p className="text-[9px] tracking-widest text-ink-on-dark/50 uppercase mt-1.5">{label}</p>
                </div>
              ))}

              {/* Time */}
              <div className="text-center border-l border-ink-on-dark/10 pl-7">
                <p className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-2">Time taken</p>
                <p className="font-display text-2xl font-semibold text-ink-on-dark leading-none">
                  {formatTime(results.timeTaken)}
                </p>
                <p className="text-[10px] text-ink-on-dark/40 mt-1.5">
                  {Math.round(results.timeTaken / questions.length)}s / q avg
                </p>
              </div>
            </div>
          </div>

          {/* Answer review */}
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-l-[3px] border-l-accent-gold ">
            <div className="px-5 py-2.5 border-b border-divider dark:border-divider-on-dark">
              <p className="text-[9px] tracking-[2.2px] uppercase font-bold text-ink dark:text-ink-on-dark opacity-[0.45]">
                Answer review
              </p>
            </div>
            <div className="divide-y divide-divider dark:divide-divider-on-dark">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer ? isUserAnswerCorrect(question, userAnswer) : false;
                const wasAnswered = !!userAnswer;

                return (
                  <div key={index} className="flex gap-3 p-5">
                    {/* Status icon */}
                    <div className={`w-[22px] h-[22px] flex-shrink-0 flex items-center justify-center mt-0.5 ${
                      !wasAnswered ? 'bg-subtle dark:bg-subtle-on-dark' :
                      isCorrect ? 'bg-accent-gold/15' : 'bg-ink/10 dark:bg-white/10'
                    }`}>
                      {wasAnswered && isCorrect && <CheckCircle className="h-3 w-3 text-accent-gold" />}
                      {wasAnswered && !isCorrect && <XCircle className="h-3 w-3 text-ink dark:text-ink-on-dark" />}
                      {!wasAnswered && <span className="text-[10px] text-muted-ink">—</span>}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-sm text-ink dark:text-ink-on-dark leading-snug mb-2">
                        {index + 1}. {question.question}
                      </p>

                      {userAnswer && (
                        <p className={`text-xs mb-1.5 ${isCorrect ? 'text-secondary-ink dark:text-muted-ink-on-dark' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                          <span className="text-[9px] tracking-widest uppercase font-bold text-muted-ink mr-1.5">Yours:</span>
                          {userAnswer}
                        </p>
                      )}
                      {!wasAnswered && (
                        <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mb-1.5">Not answered</p>
                      )}
                      {!isCorrect && (
                        <div className="text-xs px-2.5 py-2 bg-accent-gold/10 border-l-2 border-accent-gold mb-1.5">
                          <span className="text-[9px] tracking-widest uppercase font-bold text-accent-gold mr-1.5">Correct:</span>
                          <span className="text-secondary-ink dark:text-muted-ink-on-dark">{question.correct_answer}</span>
                        </div>
                      )}
                      {question.explanation && (
                        <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark italic leading-relaxed">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom CTA */}
          <button
            onClick={onComplete}
            className="w-full py-3 bg-ink text-ink-on-dark font-semibold text-sm hover:opacity-80 transition-opacity"
          >
            ← {t('quiz.back_to_quizzes')}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const kind = currentQuestion ? getQuestionKind(currentQuestion) : 'multiple_choice';
  const answeredCount = Object.keys(answers).length;
  const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark dark:bg-page-dark flex flex-col">
      {/* ── Compact header ── */}
      <div className="border-b border-divider dark:border-divider-on-dark px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[2.5px] uppercase font-bold text-accent-gold leading-none mb-0.5">
            {t('quiz.in_progress') || 'The Examination · In Progress'}
          </p>
          <h1 className="font-display font-semibold text-[32px] text-ink dark:text-ink-on-dark leading-tight tracking-[-0.5px]">
            {quizTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {availableLanguages.length > 1 && (
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageSwitch(e.target.value)}
              className="px-2.5 py-1.5 border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-xs text-ink dark:text-ink-on-dark outline-none"
            >
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>{t(`quiz.language_${lang}`)}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Progress strip */}
      <div className="px-6 py-2 flex items-center gap-3 border-b border-divider dark:border-divider-on-dark">
        <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0 tabular-nums">
          Q {currentQuestionIndex + 1} / {questions.length}
        </span>
        <div className="flex-1 h-[3px] bg-subtle dark:bg-subtle-on-dark">
          <div className="h-full bg-accent-gold transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="text-[11px] font-bold text-accent-gold flex-shrink-0 tabular-nums">
          {answeredCount} answered
        </span>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT — question zone */}
        <div className="flex-1 flex flex-col border-r border-divider dark:border-divider-on-dark p-6 md:p-8 overflow-y-auto">

          {/* Question type label + read aloud */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] tracking-[2.5px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark">
              {kind === 'multiple_choice' ? 'Multiple choice' :
               kind === 'true_false' ? 'True / False' :
               kind === 'fill_in_blank' ? 'Fill in the blank' : 'Open ended'}
            </span>
            <ReadAloudButton text={currentQuestion?.question || ''} />
          </div>

          {/* Question watermark number */}
          <div className="relative flex-1">
            <div
              className="absolute -top-2 -left-1 font-display font-bold text-ink dark:text-ink-on-dark opacity-[0.04] leading-none select-none pointer-events-none"
              style={{ fontSize: '110px' }}
            >
              {String(currentQuestionIndex + 1).padStart(2, '0')}
            </div>

            {/* Question text */}
            <p className="relative font-display font-semibold text-[22px] leading-[1.4] text-ink dark:text-ink-on-dark mb-7">
              {currentQuestion?.question}
            </p>

            {/* ── MCQ options ── */}
            {kind === 'multiple_choice' && (
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((option, i) => {
                  const selected = answers[currentQuestionIndex] === option;
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswerSelect(option)}
                      className={`flex items-stretch text-left border transition-colors w-full overflow-hidden ${
                        selected
                          ? 'bg-ink border-ink'
                          : 'border-divider dark:border-divider-on-dark hover:bg-subtle dark:hover:bg-subtle-on-dark'
                      }`}
                    >
                      {/* Letter badge */}
                      <div className={`w-11 flex-shrink-0 flex items-center justify-center border-r font-display text-sm font-bold ${
                        selected
                          ? 'border-accent-gold bg-accent-gold text-ink-on-dark'
                          : 'border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark'
                      }`}>
                        {OPTION_LETTERS[i] || String(i + 1)}
                      </div>
                      <div className="flex flex-1 items-center justify-between px-4 py-3">
                        <span className={`text-sm leading-snug ${selected ? 'text-ink-on-dark' : 'text-secondary-ink dark:text-muted-ink-on-dark'}`}>
                          {option}
                        </span>
                        <span onClick={(e) => e.stopPropagation()}>
                          <ReadAloudButton text={option} className="ml-2 flex-shrink-0" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── True / False ── */}
            {kind === 'true_false' && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.slice(0, 2).map((option, i) => {
                  const selected = answers[currentQuestionIndex] === option;
                  const icon = i === 0 ? '✓' : '✗';
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswerSelect(option)}
                      className={`h-32 flex flex-col items-center justify-center gap-3 border transition-colors ${
                        selected
                          ? 'bg-ink border-ink text-ink-on-dark'
                          : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark hover:bg-subtle dark:hover:bg-subtle-on-dark'
                      }`}
                    >
                      <span className={`text-xl ${selected ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{icon}</span>
                      <span className={`font-display text-[28px] font-semibold tracking-tight ${selected ? 'text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Fill in blank ── */}
            {kind === 'fill_in_blank' && (
              <div>
                <p className="text-[9px] tracking-[2px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark mb-3">Your answer</p>
                <div className="border-b-2 border-ink dark:border-ink-on-dark pb-2 mb-2">
                  <input
                    type="text"
                    value={answers[currentQuestionIndex] || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    placeholder="Type your answer…"
                    className="w-full bg-transparent font-display text-[17px] italic text-ink dark:text-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
                  Exact or partial match accepted
                </p>
              </div>
            )}

            {/* ── Open ended ── */}
            {kind === 'open_ended' && (
              <div>
                <p className="text-[9px] tracking-[2px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark mb-3">Your response</p>
                <textarea
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  placeholder={t('quiz.type_your_answer')}
                  className="w-full px-4 py-[14px] bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark border-l-[3px] border-l-accent-gold text-[13px] leading-[1.6] text-ink dark:text-ink-on-dark outline-none resize-none min-h-[148px]"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
                    {(answers[currentQuestionIndex] || '').split(/\s+/).filter(Boolean).length} words
                  </span>
                  <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">Keyword matching</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between pt-5 border-t border-divider dark:border-divider-on-dark mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-divider dark:border-divider-on-dark text-xs text-muted-ink dark:text-muted-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← {t('quiz.previous')}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onExit}
                className="px-4 py-2 border border-divider dark:border-divider-on-dark text-xs text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity"
              >
                {t('quiz.exit_quiz')}
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-ink text-ink-on-dark text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  {t('quiz.submit')} →
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 bg-ink text-ink-on-dark text-xs font-semibold hover:opacity-80 transition-opacity"
                >
                  {t('quiz.next')} →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — dark sidebar: timer + question map */}
        <div className="hidden md:flex flex-col bg-ink w-64 xl:w-72 flex-shrink-0">

          {/* Timer */}
          <div className="px-6 pt-6 pb-5 border-b border-ink-on-dark/10">
            <p className="text-[9px] tracking-[2.5px] uppercase font-bold text-accent-gold mb-3">
              {timeRemaining !== null ? 'Time remaining' : 'Elapsed'}
            </p>
            {timeRemaining !== null ? (
              <>
                <div className={`font-display flex items-baseline leading-none ${timeRemaining < 60 ? 'text-red-400' : 'text-ink-on-dark'}`}>
                  <span className="text-[60px] font-semibold tracking-[-3px]">{String(Math.floor(timeRemaining / 60)).padStart(2, '0')}</span>
                  <span className="text-[30px] font-semibold text-accent-gold mx-0.5">:</span>
                  <span className="text-[60px] font-semibold tracking-[-3px]">{String(timeRemaining % 60).padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] text-accent-gold mt-2 tracking-wide">— minutes · seconds</p>
              </>
            ) : (
              <p className="font-display text-[60px] font-semibold text-ink-on-dark leading-none tracking-[-3px]">
                —:——
              </p>
            )}
            <div className="flex gap-5 mt-4">
              {[
                [answeredCount.toString(), 'done'],
                [(questions.length - answeredCount).toString(), 'left'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-semibold text-ink-on-dark leading-none">{v}</p>
                  <p className="text-[9px] tracking-[1.5px] uppercase text-accent-gold mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Question map */}
          <div className="px-6 py-5 flex-1">
            <p className="text-[9px] tracking-[2px] uppercase font-bold text-ink-on-dark/30 mb-3">Question map</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((_, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const hasAnswer = !!answers[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 flex items-center justify-center text-[10px] font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-accent-gold text-ink'
                        : hasAnswer
                        ? 'bg-ink-on-dark/15 text-ink-on-dark/60'
                        : 'bg-transparent text-ink-on-dark/25 border border-ink-on-dark/12'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exit */}
          <div className="px-6 pb-6">
            <button
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-ink-on-dark/15 text-[11px] text-ink-on-dark/40 hover:text-ink-on-dark/60 hover:border-ink-on-dark/25 transition-colors"
            >
              Exit quiz
            </button>
          </div>
        </div>
      </div>

      {/* Mobile question dots (small screens) */}
      <div className="md:hidden flex flex-wrap gap-1.5 px-4 py-3 border-t border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQuestionIndex(idx)}
            className={`w-8 h-8 text-xs font-medium transition-colors ${
              idx === currentQuestionIndex
                ? 'bg-accent-gold text-ink'
                : answers[idx]
                ? 'bg-subtle dark:bg-subtle-on-dark text-accent-gold'
                : 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
