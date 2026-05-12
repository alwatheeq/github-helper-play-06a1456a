import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Gamepad2, Play, Users, Copy, Check, LogOut, Crown, Target, Sparkles, Edit } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useSubscription } from '../../hooks/useSubscription';
import { getGameJoinUrl } from '../../utils/getBaseUrl';
import { ManualQuestionBuilder } from './ManualQuestionBuilder';
import { AIQuestionGenerator } from './AIQuestionGenerator';
import { BrainRushGamePlay } from './BrainRushGamePlay';
import { BrainRushResults } from './BrainRushResults';
import MultiplayerMenu from './MultiplayerMenu';
import MultiplayerLobby from './MultiplayerLobby';
import MultiplayerGamePlay from './MultiplayerGamePlay';
import MultiplayerResults from './MultiplayerResults';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { usePageTutorial } from '../../hooks/usePageTutorial';
import { PageTutorial } from '../Onboarding/PageTutorial';
import { PageHeader } from '../Scholar';

interface GameSession {
  id: string;
  host_id: string;
  game_code: string;
  game_title: string;
  quiz_session_id: string | null;
  question_timer_seconds: number;
  total_questions: number;
  difficulty_level: string;
  status: string;
  current_question_index: number;
  created_at: string;
  game_type: string;
  question_source_type: string;
}

interface Participant {
  id: string;
  game_session_id: string;
  user_id: string | null;
  display_name: string;
  score: number;
  rank: number | null;
  is_host: boolean;
  joined_at: string;
}

interface BrainRushQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
}

interface _GameQuestion {
  id?: string;
  game_session_id: string;
  question_index: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  time_limit_seconds: number;
}

type ViewMode = 'menu' | 'game-selection' | 'question-source' | 'ai-generate' | 'manual-build' | 'game-settings' | 'join-game' | 'lobby' | 'game-active' | 'results' | 'multiplayer-menu' | 'multiplayer-lobby' | 'multiplayer-game' | 'multiplayer-results';
type QuestionSource = 'auto_generated' | 'manual' | 'saved_set' | 'quiz_session' | null;

export const EduPlayPage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();
  const { shouldShowTutorial, showTutorial, isTutorialOpen, completeTutorial, skipTutorial, config: tutorialConfig } = usePageTutorial('eduplay');
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [questionSource, setQuestionSource] = useState<QuestionSource>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<BrainRushQuestion[]>([]);
  const [multiplayerLobbyId, setMultiplayerLobbyId] = useState<string | null>(null);

  const [currentGame, setCurrentGame] = useState<GameSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Game settings
  const [gameTitle, setGameTitle] = useState('');
  const [questionTimer, setQuestionTimer] = useState(30);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, _setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [creating, setCreating] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const { hasActiveSubscription } = useSubscription();

  // Check for game parameter in URL and auto-join game
  useEffect(() => {
    const gameId = searchParams.get('game');
    if (gameId && user && !currentGame) {
      loadGameFromUrl(gameId);
    }
  }, [searchParams, user]);

  // Show tutorial on first visit
  useEffect(() => {
    if (shouldShowTutorial && viewMode === 'menu') {
      const timer = setTimeout(() => {
        showTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, viewMode, showTutorial]);

  const loadGameFromUrl = async (gameId: string) => {
    try {
      ErrorLogger.debug('Loading game from URL parameter', { component: 'EduPlayPage', action: 'loadGameFromUrl', gameId });

      // Fetch the game session
      const { data: gameData, error: gameError } = await supabase
        .from('eduplay_game_sessions')
        .select('*')
        .eq('id', gameId)
        .maybeSingle();

      if (gameError || !gameData) {
        const error = gameError instanceof Error ? gameError : new Error('Failed to load game');
        ErrorLogger.error(error, { component: 'EduPlayPage', action: 'loadGameFromUrl', metadata: { gameId } });
        showErrorToast('Invalid game link or game not found');
        return;
      }

      // Check if user is already a participant
      const { data: participantData, error: participantError } = await supabase
        .from('eduplay_participants')
        .select('*')
        .eq('game_session_id', gameId)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (participantError) {
        const error = participantError instanceof Error ? participantError : new Error('Failed to check participant status');
        ErrorLogger.error(error, { component: 'EduPlayPage', action: 'loadGameFromUrl', metadata: { gameId } });
        return;
      }

      if (!participantData) {
        ErrorLogger.warn('User is not a participant in this game', { component: 'EduPlayPage', action: 'loadGameFromUrl', gameId, userId: user?.id });
        showErrorToast('You are not a participant in this game');
        return;
      }

      // Set the game state
      setCurrentGame(gameData);
      setIsHost(participantData.is_host);

      // Navigate to appropriate view based on game status
      if (gameData.status === 'waiting') {
        setViewMode('lobby');
      } else if (gameData.status === 'in_progress') {
        setViewMode('game-active');
      } else if (gameData.status === 'completed') {
        setViewMode('results');
      }

      ErrorLogger.info('Game loaded successfully from URL', { component: 'EduPlayPage', action: 'loadGameFromUrl', gameId });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'EduPlayPage', action: 'loadGameFromUrl' });
      showErrorToast('Failed to load game. Please try again.');
    }
  };

  useEffect(() => {
    if (currentGame) {
      fetchParticipants();

      const participantsChannel = supabase
        .channel(`game-${currentGame.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'eduplay_participants',
            filter: `game_session_id=eq.${currentGame.id}`
          },
          () => {
            fetchParticipants();
          }
        )
        .subscribe();

      const gameStateChannel = supabase
        .channel(`game-state-${currentGame.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'eduplay_game_sessions',
            filter: `id=eq.${currentGame.id}`
          },
          (payload) => {
            const updated = payload.new as GameSession;
            setCurrentGame(updated);

            if (updated.status === 'in_progress' && viewMode === 'lobby') {
              setViewMode('game-active');
            } else if (updated.status === 'completed' && viewMode === 'game-active') {
              setViewMode('results');
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(participantsChannel);
        supabase.removeChannel(gameStateChannel);
      };
    }
  }, [currentGame, viewMode]);

  const fetchParticipants = async () => {
    if (!currentGame) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('eduplay_participants')
        .select('*')
        .eq('game_session_id', currentGame.id)
        .is('left_at', null)
        .order('score', { ascending: false });

      if (error) {
        const message = handleSupabaseError(error, { component: 'EduPlayPage', action: 'fetchParticipants', metadata: { gameId: currentGame.id } });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'EduPlayPage', action: 'fetchParticipants', metadata: { gameId: currentGame.id } });
        showErrorToast(message);
        return;
      }

      if (data) {
        setParticipants(data);
      }
    } catch (error) {
      const message = handleApiError(error, { component: 'EduPlayPage', action: 'fetchParticipants', metadata: { gameId: currentGame?.id } });
      showErrorToast(message);
    }
  };

  const handleQuestionsGenerated = (questions: BrainRushQuestion[]) => {
    setGeneratedQuestions(questions);
    setQuestionCount(questions.length);
    setViewMode('game-settings');
  };

  const handleManualQuestionsSaved = (questions: Array<{ question: string; options: string[]; correct_answer: number | string; difficulty?: string }>, _setName?: string) => {
    const brainRushQuestions: BrainRushQuestion[] = questions.map(q => {
      // Handle both number index and string value for correct_answer
      const correctAnswer = typeof q.correct_answer === 'number' 
        ? q.options[q.correct_answer] 
        : q.correct_answer;
      
      return {
        question: q.question,
        options: q.options,
        correct_answer: correctAnswer,
        difficulty: q.difficulty || 'medium'
      };
    });

    setGeneratedQuestions(brainRushQuestions);
    setQuestionCount(questions.length);
    setViewMode('game-settings');
  };

  const handleCreateGame = async () => {
    if (!user || !gameTitle.trim() || generatedQuestions.length === 0) {
      showErrorToast('Please enter a game title and generate questions first');
      return;
    }

    // Check subscription first
    if (!hasActiveSubscription()) {
      showErrorToast('Active subscription required to create games');
      return;
    }

    try {
      setCreating(true);

      // Validate questions before proceeding
      ErrorLogger.debug('Validating generated questions', { component: 'EduPlayPage', action: 'handleCreateGame', questionCount: generatedQuestions.length });

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('No questions available. Please generate questions first.');
      }

      // Validate question format
      const invalidQuestions = generatedQuestions.filter((q, index) => {
        const isValid = q.question &&
                       Array.isArray(q.options) &&
                       q.options.length === 4 &&
                       q.correct_answer &&
                       q.options.includes(q.correct_answer);
        if (!isValid) {
          const error = new Error(`Invalid question at index ${index}`);
          ErrorLogger.error(error, { component: 'EduPlayPage', action: 'validateQuestions', questionIndex: index, question: q });
        }
        return !isValid;
      });

      if (invalidQuestions.length > 0) {
        throw new Error(`${invalidQuestions.length} question(s) have invalid format. Please regenerate questions.`);
      }

      ErrorLogger.info('All questions validated successfully', { component: 'EduPlayPage', action: 'handleCreateGame', questionCount: generatedQuestions.length });
      ErrorLogger.debug('Step 1: Generating game code', { component: 'EduPlayPage', action: 'handleCreateGame' });

      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_eduplay_game_code');

      if (codeError) {
        const error = new Error(`Failed to generate game code: ${codeError.message || 'Unknown error'}`);
        ErrorLogger.error(error, { component: 'EduPlayPage', action: 'handleCreateGame', codeError });
        throw error;
      }

      const gameCode = codeData;
      ErrorLogger.info('Game code generated', { component: 'EduPlayPage', action: 'handleCreateGame', gameCode });
      ErrorLogger.debug('Step 2: Creating game session', { component: 'EduPlayPage', action: 'handleCreateGame' });

      const gameSessionData = {
        host_id: user.id,
        game_code: gameCode,
        game_title: gameTitle.trim(),
        quiz_session_id: null,
        question_timer_seconds: questionTimer,
        total_questions: generatedQuestions.length,
        difficulty_level: difficulty,
        status: 'waiting',
        game_type: 'brain_rush',
        question_source_type: questionSource || 'auto_generated',
        current_question_index: 0
      };

      ErrorLogger.debug('Game session data to insert', { component: 'EduPlayPage', action: 'handleCreateGame', gameSessionData });

      const { data: gameData, error: gameError } = await supabase
        .from('eduplay_game_sessions')
        .insert(gameSessionData)
        .select()
        .maybeSingle();

      if (gameError) {
        let errorMessage = 'Failed to create game session.';
        if (gameError.message) {
          errorMessage += ` Database error: ${gameError.message}`;
        }
        if (gameError.details) {
          errorMessage += ` Details: ${gameError.details}`;
        }
        if (gameError.hint) {
          errorMessage += ` Hint: ${gameError.hint}`;
        }
        throw new Error(errorMessage);
      }

      if (!gameData) {
        const error = new Error('Game was not created properly');
        ErrorLogger.error(error, { component: 'EduPlayPage', action: 'handleCreateGame' });
        throw error;
      }

      ErrorLogger.info('Game session created', { component: 'EduPlayPage', action: 'handleCreateGame', gameSessionId: gameData.id });

      ErrorLogger.debug('Step 3: Inserting questions', { component: 'EduPlayPage', action: 'handleCreateGame', questionCount: generatedQuestions.length });
      const questionInserts = generatedQuestions.map((q, index) => ({
        game_session_id: gameData.id,
        question_index: index,
        question_text: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        difficulty: q.difficulty,
        time_limit_seconds: questionTimer
      }));

      ErrorLogger.debug('Question inserts to database', { component: 'EduPlayPage', action: 'handleCreateGame', questionCount: questionInserts.length });

      const { error: questionsError } = await supabase
        .from('eduplay_game_questions')
        .insert(questionInserts);

      if (questionsError) {
        let errorMessage = 'Failed to insert questions.';
        if (questionsError.message) {
          errorMessage += ` Database error: ${questionsError.message}`;
        }
        if (questionsError.details) {
          errorMessage += ` Details: ${questionsError.details}`;
        }
        throw new Error(errorMessage);
      }

      ErrorLogger.info('Questions inserted successfully', { component: 'EduPlayPage', action: 'handleCreateGame', questionCount: questionInserts.length });

      ErrorLogger.debug('Step 4: Adding host as participant', { component: 'EduPlayPage', action: 'handleCreateGame' });
      const hostData = {
        game_session_id: gameData.id,
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'Host',
        is_host: true
      };

      ErrorLogger.debug('Host participant data', { component: 'EduPlayPage', action: 'handleCreateGame', hostData });

      const { error: participantError } = await supabase
        .from('eduplay_participants')
        .insert(hostData);

      if (participantError) {
        const errorMessage = handleSupabaseError(participantError, { component: 'EduPlayPage', action: 'handleCreateGame', metadata: { step: 'addHostParticipant' } });
        ErrorLogger.error(participantError instanceof Error ? participantError : new Error(String(participantError)), { component: 'EduPlayPage', action: 'handleCreateGame', metadata: { step: 'addHostParticipant' } });
        throw new Error(errorMessage);
      }

      ErrorLogger.info('Host added as participant', { component: 'EduPlayPage', action: 'handleCreateGame', gameSessionId: gameData.id });
      ErrorLogger.debug('Step 5: Setting game state', { component: 'EduPlayPage', action: 'handleCreateGame' });

      setCurrentGame(gameData);
      setIsHost(true);
      setViewMode('lobby');

      ErrorLogger.info('Game created successfully', { component: 'EduPlayPage', action: 'handleCreateGame', gameSessionId: gameData.id, gameCode });
    } catch (error) {
      const errorMessage = handleApiError(error, { component: 'EduPlayPage', action: 'handleCreateGame' });
      ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'EduPlayPage', action: 'handleCreateGame' });
      showErrorToast(errorMessage);
    } finally {
      ErrorLogger.debug('Setting creating to false', { component: 'EduPlayPage', action: 'handleCreateGame' });
      setCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!user || !joinCode.trim() || !displayName.trim()) {
      showErrorToast('Please enter game code and your name');
      return;
    }

    try {
      const { data: gameData, error: gameError } = await supabase
        .from('eduplay_game_sessions')
        .select('*')
        .eq('game_code', joinCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (gameError) {
        if (gameError.code === 'PGRST116') {
          showErrorToast('Game code not found. Please check the code and try again.');
        } else {
          showErrorToast('Failed to find game. Please try again.');
        }
        return;
      }

      if (!gameData) {
        showErrorToast('Game not found. The code may be incorrect or the game may have ended.');
        return;
      }

      if (gameData.status !== 'waiting') {
        showErrorToast('This game has already started. Please join another game.');
        return;
      }

      const { error: participantError } = await supabase
        .from('eduplay_participants')
        .insert({
          game_session_id: gameData.id,
          user_id: user.id,
          display_name: displayName.trim(),
          is_host: false
        });

      if (participantError) {
        showErrorToast('Failed to join game. You may already be in this game.');
        return;
      }

      setCurrentGame(gameData);
      setIsHost(false);
      setViewMode('lobby');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'EduPlayPage', action: 'handleJoinGame', metadata: { joinCode } });
      showErrorToast('Failed to join game. Please try again.');
    }
  };

  const handleStartGame = async () => {
    if (!currentGame || !isHost || startingGame) return;

    setStartingGame(true);
    try {
      const { error } = await supabase
        .from('eduplay_game_sessions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', currentGame.id);

      if (error) {
        const errorMessage = handleSupabaseError(error, { 
          component: 'EduPlayPage', 
          action: 'handleStartGame',
          gameSessionId: currentGame.id
        });
        ErrorLogger.error(error, { 
          component: 'EduPlayPage', 
          action: 'handleStartGame',
          gameSessionId: currentGame.id
        });
        showErrorToast(errorMessage);
        return;
      }

      setViewMode('game-active');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'EduPlayPage', action: 'handleStartGame', gameSessionId: currentGame?.id });
      const errorMessage = handleApiError(error, { component: 'EduPlayPage', action: 'handleStartGame' });
      showErrorToast(errorMessage);
    } finally {
      setStartingGame(false);
    }
  };

  const handleLeaveGame = async () => {
    if (!currentGame) return;

    try {
      const myParticipant = participants.find(p => p.user_id === user?.id);

      if (myParticipant) {
        await supabase
          .from('eduplay_participants')
          .update({ left_at: new Date().toISOString() })
          .eq('id', myParticipant.id);
      }

      if (isHost) {
        await supabase
          .from('eduplay_game_sessions')
          .update({ status: 'cancelled' })
          .eq('id', currentGame.id);
      }

      setCurrentGame(null);
      setParticipants([]);
      setIsHost(false);
      setGeneratedQuestions([]);
      setViewMode('menu');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'EduPlayPage', action: 'handleLeaveGame', metadata: { gameSessionId: currentGame?.id } });
    }
  };

  const copyGameCode = () => {
    if (currentGame) {
      navigator.clipboard.writeText(currentGame.game_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const renderMenu = () => {
    const games = [
      {
        k: 'rush', live: true,
        sub: 'Multiplayer · Real-time',
        title: 'Brain Rush.',
        desc: 'Head-to-head quiz duels against classmates. First to 7 correct wins. Host a room, join a friend\'s game, or enter a ranked online match.',
        cta: 'Enter the arena →',
        onClick: () => setViewMode('game-selection'),
      },
      { k: 'flash', live: false, sub: 'Solo · Flashcards',      title: 'Flash Sprint.',    desc: 'Race through a deck against the clock. Every correct answer extends your time.' },
      { k: 'daily', live: false, sub: 'Community · Shared set', title: 'Daily Challenge.', desc: 'One curated question set per day, shared across the whole community.' },
      { k: 'tourn', live: false, sub: 'Competitive · Bracket',  title: 'Tournament.',      desc: 'Bracket-style competitions across a full course. Win rounds to advance.' },
    ];
    const recentSessions = [
      { mode: 'Brain Rush', detail: 'vs. Classmate', result: 'Won 7–4',  pts: '+350', date: 'Today' },
      { mode: 'Brain Rush', detail: 'vs. Classmate', result: 'Won 7–5',  pts: '+350', date: 'Today' },
      { mode: 'Brain Rush', detail: 'vs. Classmate', result: 'Lost 4–7', pts: '+80',  date: 'Yesterday' },
      { mode: 'Brain Rush', detail: 'Ranked Online', result: 'Won 7–3',  pts: '+420', date: 'Monday' },
    ];
    const leaderboard = [
      { rank: 1, init: 'Y', name: 'Yusuf B.',  pts: 2840, you: false },
      { rank: 2, init: 'J', name: 'You',        pts: 2610, you: true  },
      { rank: 3, init: 'L', name: 'Layla A.',   pts: 2480, you: false },
      { rank: 4, init: 'K', name: 'Karim H.',   pts: 1920, you: false },
      { rank: 5, init: 'R', name: 'Reem S.',    pts: 1750, you: false },
    ];

    return (
      <div className="w-full">
        <PageHeader
          eyebrow="The Games Room"
          title="Play & Learn"
          descriptor="choose your game — every session sharpens your edge."
          className="mb-5"
        />

        {/* Main 2-col layout: games left, right rail */}
        <div className="grid gap-[22px]" style={{ gridTemplateColumns: '1fr 300px' }}>
          {/* Left: game cards 2×2 */}
          <div>
            <div className="grid grid-cols-2 gap-[14px] mb-[22px]">
              {games.map((g) => (
                <div
                  key={g.k}
                  className={`p-[22px_22px_20px] flex flex-col ${g.live ? 'bg-sidebar' : 'bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark'}`}
                >
                  <div className="flex justify-between items-start mb-[10px]">
                    <div>
                      <div className={`text-[9px] tracking-[1.5px] uppercase font-bold mb-[5px] ${g.live ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{g.sub}</div>
                      <div className={`font-display text-[18px] font-semibold tracking-tight ${g.live ? 'text-card-light' : 'text-ink dark:text-ink-on-dark'}`}>{g.title}</div>
                    </div>
                    {g.live
                      ? <div className="text-[9px] tracking-[1.5px] px-[10px] py-[3px] bg-accent-gold text-sidebar font-bold uppercase rounded-full flex-shrink-0">Live</div>
                      : <div className="text-[9px] tracking-[1.5px] px-2 py-[3px] border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase flex-shrink-0">Soon</div>
                    }
                  </div>
                  <div className={`text-[12px] leading-relaxed flex-1 mb-4 ${g.live ? 'text-card-light/50' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{g.desc}</div>
                  {g.live && g.onClick
                    ? <button onClick={g.onClick} className="py-2 bg-accent-gold text-sidebar font-display text-[12.5px] font-bold text-center cursor-pointer border-none hover:opacity-90 transition">
                        {g.cta}
                      </button>
                    : <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark italic">Coming soon.</div>
                  }
                </div>
              ))}
            </div>

            {/* Recent Sessions table */}
            <div>
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-[10px]">Recent Sessions</div>
              <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark">
                <div className="grid py-[6px] px-[16px] border-b border-divider dark:border-divider-on-dark" style={{ gridTemplateColumns: '1fr 80px 70px 70px' }}>
                  {['Game · Details', 'Result', 'Pts', 'Date'].map(h => (
                    <div key={h} className="text-[9px] tracking-[1.5px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase">{h}</div>
                  ))}
                </div>
                {recentSessions.map((r, i) => (
                  <div
                    key={i}
                    className={`grid py-[10px] px-[16px] items-center ${i < recentSessions.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''}`}
                    style={{ gridTemplateColumns: '1fr 80px 70px 70px' }}
                  >
                    <div>
                      <div className="text-[12.5px] font-semibold text-ink dark:text-ink-on-dark">{r.mode}</div>
                      <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-[1px]">{r.detail}</div>
                    </div>
                    <div className={`text-[12px] font-${r.result.startsWith('Won') ? 'semibold' : 'normal'} ${r.result.startsWith('Won') ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{r.result}</div>
                    <div className="font-display text-[13px] font-semibold text-accent-gold">{r.pts}</div>
                    <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{r.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div className="flex flex-col gap-[14px]">
            {/* Your Record — dark panel */}
            <div className="bg-sidebar p-[20px_18px]">
              <div className="text-[9px] tracking-[2px] uppercase font-bold text-card-light/40 mb-3">Your Record</div>
              <div className="flex items-baseline gap-[6px] mb-1">
                <span className="font-display text-[36px] font-bold text-card-light">7</span>
                <span className="text-[14px] text-accent-gold font-semibold">W</span>
                <span className="font-display text-[22px] font-light text-card-light/20 mx-1">—</span>
                <span className="font-display text-[36px] font-bold text-card-light/50">3</span>
                <span className="text-[14px] text-card-light/40 font-semibold">L</span>
              </div>
              <div className="text-[11px] text-card-light/50 mb-3.5">this week · Brain Rush</div>
              <div className="h-px bg-card-light/10 mb-3.5" />
              <div className="grid grid-cols-2 gap-[10px]">
                {[['70%','win rate'],['2,610','total pts'],['10','games'],['8.2s','avg time']].map(([v,l]) => (
                  <div key={l}>
                    <div className="font-display text-[16px] font-semibold text-card-light">{v}</div>
                    <div className="text-[9px] tracking-[1px] uppercase text-card-light/40 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-[16px]">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">Leaderboard · This Week</div>
              {leaderboard.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-[9px] py-[7px] px-[6px] ${i < leaderboard.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''} ${p.you ? 'bg-accent-gold-soft' : ''}`}
                >
                  <span className={`font-display text-[12px] w-[13px] flex-shrink-0 ${p.rank === 1 ? 'text-accent-gold font-bold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{p.rank}</span>
                  <div
                    className="w-6 h-6 rounded-full grid place-items-center text-[9px] font-bold text-sidebar flex-shrink-0"
                    style={{ background: p.you ? 'var(--color-accent-gold)' : 'var(--color-sidebar)' }}
                  >
                    {p.init}
                  </div>
                  <span className={`flex-1 text-[12px] ${p.you ? 'font-bold text-ink dark:text-ink-on-dark' : 'font-medium text-secondary-ink dark:text-muted-ink-on-dark'}`}>{p.name}</span>
                  <span className={`font-display text-[12px] flex-shrink-0 ${p.you ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{p.pts.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGameSelection = () => (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header banner — dark bg-sidebar */}
      <div className="bg-sidebar p-5 mb-5 flex items-center justify-between shadow-[var(--s4-shadow-hairline)]">
        <div>
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-2">The Games Room · Brain Rush</div>
          <div className="font-display text-[26px] font-semibold text-ink-on-dark tracking-tight">Brain Rush.</div>
          <div className="text-[12px] text-muted-ink-on-dark mt-1">Real-time quiz duels · First to answer wins · +350 pts per win</div>
        </div>
        <button
          onClick={() => setViewMode('menu')}
          className="text-[12px] font-bold text-sidebar bg-accent-gold px-4 py-2 hover:opacity-90 transition"
        >← Back</button>
      </div>

      {/* Lobby options — 3-col grid */}
      <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">How do you want to play?</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {[
          { icon: Crown, label: 'Host a Game.', sub: 'Create a private room and share a code with your classmate.', cta: 'Host →', primary: true, action: () => setViewMode('question-source') },
          { icon: Users, label: 'Join a Game.', sub: 'Enter a room code from your classmate to join their session.', cta: 'Join →', primary: false, action: () => setViewMode('join-game') },
          { icon: Target, label: 'Play Online.', sub: 'Enter the ranked queue and get matched against players live.', cta: 'Find match →', primary: false, action: () => setViewMode('multiplayer-menu') },
        ].map(({ icon: Icon, label, sub, cta, primary, action }) => (
          <div
            key={label}
            className={`p-5 flex flex-col shadow-[var(--s4-shadow-hairline)] ${
              primary ? 'bg-sidebar' : 'bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark'
            }`}
          >
            <Icon className={`h-5 w-5 mb-3 ${primary ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`} />
            <div className={`font-display text-[15px] font-semibold mb-2 ${primary ? 'text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>{label}</div>
            <div className={`text-[11.5px] leading-relaxed flex-1 mb-4 ${primary ? 'text-muted-ink-on-dark' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{sub}</div>
            <button
              onClick={action}
              className={`text-center text-[12px] font-bold py-2 transition ${
                primary
                  ? 'bg-accent-gold text-sidebar hover:opacity-90'
                  : 'border border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark hover:opacity-70'
              }`}
            >{cta}</button>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-sidebar p-5 shadow-[var(--s4-shadow-hairline)]">
        <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3 opacity-60">How it works</div>
        <div className="space-y-3">
          {[
            'AI generates questions based on your topic',
            'Share the room code with your class',
            'Players join from any device',
            'Most correct answers across all rounds wins',
          ].map((tip, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[9px] text-accent-gold font-bold">{i + 1}</span>
              </div>
              <span className="text-[11.5px] text-muted-ink-on-dark leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuestionSource = () => (
    <div className="w-full max-w-4xl mx-auto">
      <button
        onClick={() => setViewMode('game-selection')}
        className={`mb-6 flex items-center space-x-2 text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition`}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back</span>
      </button>

      <div className="mb-6 text-center">
        <h2 className={`s4-h1 text-ink dark:text-ink-on-dark mb-2`}>Choose Question Source</h2>
        <p className={"text-secondary-ink dark:text-muted-ink-on-dark"}>How would you like to create your questions?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => {
            setQuestionSource('auto_generated');
            setViewMode('ai-generate');
          }}
          className={`bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[var(--s4-shadow-hairline)] hover:shadow-[var(--s4-shadow-modal)] transition-[background-color,border-color,color,opacity,transform,box-shadow] border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400`}
        >
          <div className={`bg-accent-gold-soft/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className={`s4-h3 text-[20px] text-ink dark:text-ink-on-dark mb-2`}>AI Generate</h3>
          <p className={"text-secondary-ink dark:text-muted-ink-on-dark"}>Let AI create questions about any topic</p>
        </button>

        <button
          onClick={() => {
            setQuestionSource('manual');
            setViewMode('manual-build');
          }}
          className={`bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[var(--s4-shadow-hairline)] hover:shadow-[var(--s4-shadow-modal)] transition-[background-color,border-color,color,opacity,transform,box-shadow] border-2 border-transparent hover:border-divider dark:border-divider-on-dark`}
        >
          <div className={`bg-accent-gold-soft/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
            <Edit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="s4-h3 text-[20px] text-ink dark:text-muted-ink-on-dark mb-2">Manual Build</h3>
          <p className="text-secondary-ink dark:text-muted-ink">Create your own custom questions</p>
        </button>
      </div>
    </div>
  );

  const renderGameSettings = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border border-divider dark:border-divider-on-dark dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[var(--s4-shadow-hairline)] p-8">
        <h2 className="s4-h2 text-ink dark:text-muted-ink-on-dark mb-6">Game Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
              Game Title
            </label>
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="e.g., Biology Quiz Battle"
              className={`w-full px-4 py-3 border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                Questions
              </label>
              <input
                type="number"
                value={questionCount}
                disabled
                className={`w-full px-4 py-3 border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] bg-accent-gold-soft/10 text-ink dark:text-ink-on-dark`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                Timer (seconds)
              </label>
              <input
                type="number"
                value={questionTimer}
                onChange={(e) => setQuestionTimer(Number(e.target.value))}
                min="5"
                max="60"
                className={`w-full px-4 py-3 border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark`}
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setViewMode('question-source')}
              className={`flex-1 px-6 py-3 border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark rounded-[var(--s4-radius-card)] hover:opacity-60 transition`}
            >
              Back
            </button>
            <button
              onClick={handleCreateGame}
              disabled={creating || !gameTitle.trim()}
              className={`flex-1 px-6 py-3 bg-accent-gold text-white rounded-[var(--s4-radius-card)] hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
            >
              <Play className="h-5 w-5" />
              <span>{creating ? 'Creating...' : 'Create Game'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJoinGame = () => (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header banner */}
      <div className="bg-sidebar p-5 mb-5 flex items-center justify-between shadow-[var(--s4-shadow-hairline)]">
        <div>
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-2">The Games Room · Brain Rush</div>
          <div className="font-display text-[24px] font-semibold text-ink-on-dark">Join a Game.</div>
        </div>
        <button
          onClick={() => setViewMode('game-selection')}
          className="text-[12px] font-bold text-sidebar bg-accent-gold px-4 py-2 hover:opacity-90 transition"
        >← Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main join card */}
        <div className="md:col-span-2 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-7 shadow-[var(--s4-shadow-hairline)]">
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-5">Enter Room Code</div>

          {/* Code input — large monospace */}
          <div className="mb-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              maxLength={8}
              className="w-full border-2 border-accent-gold bg-bg-chip dark:bg-card-dark px-5 py-4 font-display text-[30px] font-bold text-ink dark:text-ink-on-dark tracking-[8px] text-center focus:outline-none"
            />
          </div>
          <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-6">Ask your host or teacher for the 8-character room code.</div>

          {/* Display name */}
          <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark font-bold tracking-[1px] uppercase mb-2">Your Display Name</div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name in the game"
            maxLength={50}
            className="w-full border border-divider dark:border-divider-on-dark px-4 py-3 text-[13px] bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark focus:outline-none focus:border-accent-gold mb-2"
          />
          <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-6">This is how you'll appear to others in the game.</div>

          <button
            onClick={handleJoinGame}
            disabled={!joinCode.trim() || !displayName.trim()}
            className="w-full py-3 bg-accent-gold text-sidebar text-[14px] font-bold font-display hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Join Game →
          </button>
        </div>

        {/* Right rail — how to join */}
        <div className="flex flex-col gap-4">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-4 shadow-[var(--s4-shadow-hairline)]">
            <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">How to Join</div>
            {[
              'Get the room code from your host or teacher',
              'Enter the code above and press Join',
              'Wait in the lobby until the host starts',
              'Answer as fast as you can — speed counts!',
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <div className="w-5 h-5 rounded-full bg-subtle dark:bg-chip flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] text-accent-gold font-bold">{i + 1}</span>
                </div>
                <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLobby = () => {
    const joinUrl = currentGame ? getGameJoinUrl(currentGame.game_code) : '';

    return (
      <div className="w-full max-w-5xl mx-auto">
        {/* Banner — dark, room open header */}
        <div className="bg-sidebar p-5 mb-5 flex items-center justify-between shadow-[var(--s4-shadow-hairline)]">
          <div>
            <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-2">Brain Rush · Waiting Room</div>
            <div className="flex items-center gap-4">
              <div className="font-display text-[22px] font-semibold text-ink-on-dark">Room Open.</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-gold" />
                <span className="text-[12px] text-muted-ink-on-dark">{participants.length} player{participants.length !== 1 ? 's' : ''} joined</span>
              </div>
            </div>
            <div className="text-[12px] text-muted-ink-on-dark mt-1">{currentGame?.game_title}</div>
          </div>
          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={participants.length < 1 || startingGame}
              className="font-display text-[13px] font-bold text-sidebar bg-accent-gold px-5 py-3 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {startingGame ? 'Starting...' : 'Start Game →'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left: QR + code + room settings */}
          <div>
            <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">Share with your class</div>

            {/* QR Code */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-3 mb-3 shadow-[var(--s4-shadow-hairline)]">
              <div className="flex justify-center">
                <div className="bg-white p-2 inline-block">
                  <QRCodeSVG value={joinUrl} size={168} level="H" includeMargin={false} />
                </div>
              </div>
            </div>

            {/* Room code */}
            <div className="bg-sidebar p-4 text-center mb-3 shadow-[var(--s4-shadow-hairline)]">
              <div className="text-[9px] tracking-[2px] text-muted-ink-on-dark font-bold uppercase mb-2">Room Code</div>
              <div className="font-display text-[28px] font-bold text-ink-on-dark tracking-[6px] leading-none mb-1">
                {currentGame?.game_code}
              </div>
              <div className="text-[10px] text-muted-ink-on-dark mb-3">Share this code with your class</div>
              <button
                onClick={copyGameCode}
                className="flex items-center justify-center gap-2 w-full py-2 border border-muted-ink-on-dark/30 text-ink-on-dark text-[11px] hover:bg-white/10 transition"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Room settings */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-4 shadow-[var(--s4-shadow-hairline)]">
              <div className="text-[9px] tracking-[1.5px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-3">Room Settings</div>
              {[
                ['Questions', String(currentGame?.total_questions || '—')],
                ['Time / Q', `${currentGame?.question_timer_seconds || 30}s`],
                ['Difficulty', currentGame?.difficulty_level || 'Medium'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-divider dark:border-divider-on-dark last:border-0">
                  <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{k}</span>
                  <span className="text-[11px] text-ink dark:text-ink-on-dark font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: player grid (2-col-span) */}
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase">Players in Room</div>
              <div className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark">{participants.length} joined</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-2 p-3 border shadow-[var(--s4-shadow-hairline)] ${
                    participant.is_host
                      ? 'bg-sidebar border-accent-gold/40'
                      : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    participant.is_host ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-ink-on-dark'
                  }`}>
                    {participant.display_name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-[11px] font-semibold truncate ${participant.is_host ? 'text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>
                      {participant.display_name}
                    </div>
                    {participant.is_host && (
                      <div className="text-[9px] text-accent-gold font-bold uppercase tracking-wider">Host</div>
                    )}
                  </div>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="col-span-full text-center py-10 text-muted-ink dark:text-muted-ink-on-dark">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-[12px]">Waiting for players to join...</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleLeaveGame}
                className="px-5 py-2.5 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[11.5px] hover:opacity-70 transition flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Leave Game
              </button>
              {!isHost && (
                <div className="flex items-center gap-2 text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
                  <Gamepad2 className="h-4 w-4 opacity-60" />
                  Waiting for host to start...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGameActive = () => {
    if (!currentGame) return null;

    return (
      <BrainRushGamePlay
        gameSession={currentGame}
        participants={participants}
        isHost={isHost}
        onGameEnd={() => setViewMode('results')}
      />
    );
  };

  const renderResults = () => {
    if (!currentGame) return null;

    return (
      <BrainRushResults
        gameSession={currentGame}
        participants={participants}
        onReturnHome={() => {
          setCurrentGame(null);
          setParticipants([]);
          setIsHost(false);
          setGeneratedQuestions([]);
          setViewMode('menu');
        }}
      />
    );
  };

  const renderMultiplayerMenu = () => (
    <MultiplayerMenu
      onLobbyJoined={(lobbyId) => {
        setMultiplayerLobbyId(lobbyId);
        setViewMode('multiplayer-lobby');
      }}
      onBack={() => setViewMode('game-selection')}
    />
  );

  const renderMultiplayerLobby = () => {
    if (!multiplayerLobbyId) return null;

    return (
      <MultiplayerLobby
        lobbyId={multiplayerLobbyId}
        onExit={() => {
          setMultiplayerLobbyId(null);
          setViewMode('multiplayer-menu');
        }}
      />
    );
  };

  const renderMultiplayerGame = () => {
    if (!multiplayerLobbyId) return null;

    return <MultiplayerGamePlay lobbyId={multiplayerLobbyId} />;
  };

  const renderMultiplayerResults = () => {
    if (!multiplayerLobbyId) return null;

    return <MultiplayerResults lobbyId={multiplayerLobbyId} />;
  };

  return (
    <div className="w-full">
      {viewMode === 'menu' && renderMenu()}
      {viewMode === 'game-selection' && renderGameSelection()}
      {viewMode === 'question-source' && renderQuestionSource()}
      {viewMode === 'ai-generate' && (
        <AIQuestionGenerator
          onQuestionsGenerated={handleQuestionsGenerated}
          onCancel={() => setViewMode('question-source')}
          questionCount={questionCount}
          difficulty={difficulty}
        />
      )}
      {viewMode === 'manual-build' && (
        <ManualQuestionBuilder
          onSaveQuestions={handleManualQuestionsSaved}
          onCancel={() => setViewMode('question-source')}
        />
      )}
      {viewMode === 'game-settings' && renderGameSettings()}
      {viewMode === 'join-game' && renderJoinGame()}
      {viewMode === 'lobby' && renderLobby()}
      {viewMode === 'game-active' && renderGameActive()}
      {viewMode === 'results' && renderResults()}
      {viewMode === 'multiplayer-menu' && renderMultiplayerMenu()}
      {viewMode === 'multiplayer-lobby' && renderMultiplayerLobby()}
      {viewMode === 'multiplayer-game' && renderMultiplayerGame()}
      {viewMode === 'multiplayer-results' && renderMultiplayerResults()}

      {/* EduPlay Tutorial */}
      {tutorialConfig && (
        <PageTutorial
          config={tutorialConfig}
          isOpen={isTutorialOpen}
          onClose={() => {}}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </div>
  );
});
