import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ErrorLogger } from '../../utils/errorLogger';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  difficulty?: string;
}

interface MultiplayerMenuProps {
  onLobbyJoined: (lobbyId: string) => void;
  onBack?: () => void;
  questionSetId?: string;
  questionsJson?: Question[];
}

export default function MultiplayerMenu({ onLobbyJoined, onBack, questionSetId, questionsJson }: MultiplayerMenuProps) {
  const { user } = useAuth();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [gameName, setGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [questionCount, setQuestionCount] = useState(10);
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGameCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createLobby = async () => {
    if (!user || !gameName.trim()) {
      setError('Please enter a game name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const code = generateGameCode();
      const [{ data: profile }, { data: lobby, error: lobbyError }] = await Promise.all([
        supabase.from('user_profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('multiplayer_game_lobbies').insert({
          host_user_id: user.id,
          game_code: code,
          game_name: gameName,
          max_players: maxPlayers,
          current_players: 1,
          status: 'waiting',
          game_config: { timePerQuestion, questionCount },
          question_set_id: questionSetId,
          questions_json: questionsJson
        }).select().single(),
      ]);

      const displayName = profile?.full_name || 'Anonymous';

      if (lobbyError) throw lobbyError;

      const { error: playerError } = await supabase
        .from('multiplayer_game_players')
        .insert({
          lobby_id: lobby.id,
          user_id: user.id,
          display_name: displayName,
          is_host: true,
          is_ready: true
        });

      if (playerError) throw playerError;

      ErrorLogger.info('Host player created successfully', { component: 'MultiplayerMenu', action: 'createLobby', lobbyId: lobby.id, userId: user.id, displayName, isHost: true, isReady: true, currentPlayers: lobby.current_players });

      await new Promise(resolve => setTimeout(resolve, 300));

      ErrorLogger.debug('Navigating to lobby', { component: 'MultiplayerMenu', action: 'createLobby', lobbyId: lobby.id });
      onLobbyJoined(lobby.id);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'MultiplayerMenu', action: 'handleCreateLobby', metadata: { questionCount } });
      setError(error.message || 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const joinLobby = async () => {
    if (!user || !gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [{ data: profile }, { data: lobby, error: lobbyError }] = await Promise.all([
        supabase.from('user_profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('multiplayer_game_lobbies').select('*').eq('game_code', gameCode.toUpperCase()).eq('status', 'waiting').single(),
      ]);

      const displayName = profile?.full_name || 'Anonymous';

      if (lobbyError || !lobby) {
        throw new Error('Game not found or already started');
      }

      if (lobby.current_players >= lobby.max_players) {
        throw new Error('Game is full');
      }

      const { data: existingPlayer } = await supabase
        .from('multiplayer_game_players')
        .select('id')
        .eq('lobby_id', lobby.id)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (existingPlayer) {
        onLobbyJoined(lobby.id);
        return;
      }

      const { error: playerError } = await supabase
        .from('multiplayer_game_players')
        .insert({
          lobby_id: lobby.id,
          user_id: user.id,
          display_name: displayName,
          is_host: false,
          is_ready: true
        });

      if (playerError) throw playerError;

      ErrorLogger.info('Player joined successfully', { component: 'MultiplayerMenu', action: 'joinLobby', lobbyId: lobby.id, userId: user.id, displayName, isHost: false, isReady: true });

      await new Promise(resolve => setTimeout(resolve, 300));

      ErrorLogger.debug('Navigating to lobby', { component: 'MultiplayerMenu', action: 'joinLobby', lobbyId: lobby.id });
      onLobbyJoined(lobby.id);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'MultiplayerMenu', action: 'handleJoinLobby', gameCode });
      setError(error.message || 'Failed to join lobby');
    } finally {
      setLoading(false);
    }
  };

  const closeCreateForm = () => { setShowCreateForm(false); setError(null); };
  const closeJoinForm = () => { setShowJoinForm(false); setError(null); };

  if (showCreateForm) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-sidebar px-[26px] py-[20px] flex items-center justify-between">
          <div>
            <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-[5px]">The Games Room · Brain Rush</div>
            <div className="font-display text-[24px] font-semibold text-ink-on-dark">Host a Game.</div>
          </div>
          <button
            onClick={closeCreateForm}
            className="px-4 py-[7px] bg-accent-gold text-white text-[12px] font-bold hover:opacity-90 transition"
          >
            ← Back
          </button>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-t-0 px-[26px] py-6">
          {error && (
            <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 mb-5">
              <span className="text-[12px] text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <div className="text-[10px] font-bold tracking-[1px] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-2">Game Name</div>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Enter game name"
                className="w-full px-[14px] py-[10px] border border-divider dark:border-divider-on-dark bg-page-light dark:bg-page-dark text-[13px] text-ink dark:text-ink-on-dark focus:outline-none focus:border-accent-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-bold tracking-[1px] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-2">Max Players</div>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full px-[14px] py-[10px] border border-divider dark:border-divider-on-dark bg-page-light dark:bg-page-dark text-[13px] text-ink dark:text-ink-on-dark focus:outline-none"
                >
                  {[2, 3, 4, 5, 6, 8, 10].map(num => (
                    <option key={num} value={num}>{num} players</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[1px] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-2">Questions</div>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-[14px] py-[10px] border border-divider dark:border-divider-on-dark bg-page-light dark:bg-page-dark text-[13px] text-ink dark:text-ink-on-dark focus:outline-none"
                >
                  {[5, 10, 15, 20, 25].map(num => (
                    <option key={num} value={num}>{num} questions</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold tracking-[1px] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-2">Time per Question</div>
              <select
                value={timePerQuestion}
                onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                className="w-full px-[14px] py-[10px] border border-divider dark:border-divider-on-dark bg-page-light dark:bg-page-dark text-[13px] text-ink dark:text-ink-on-dark focus:outline-none"
              >
                {[15, 20, 30, 45, 60].map(num => (
                  <option key={num} value={num}>{num} seconds</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={createLobby}
              disabled={loading || !gameName.trim()}
              className="flex-1 py-[11px] bg-accent-gold text-white font-display text-[14px] font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating…' : 'Create Game →'}
            </button>
            <button
              onClick={closeCreateForm}
              className="px-6 py-[11px] border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[13px] hover:opacity-70 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showJoinForm) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-sidebar px-[26px] py-[20px] flex items-center justify-between">
          <div>
            <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-[5px]">The Games Room · Brain Rush</div>
            <div className="font-display text-[24px] font-semibold text-ink-on-dark">Join a Game.</div>
          </div>
          <button
            onClick={closeJoinForm}
            className="px-4 py-[7px] bg-accent-gold text-white text-[12px] font-bold hover:opacity-90 transition"
          >
            ← Back
          </button>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-t-0 px-[26px] py-6">
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-4">Enter Room Code</div>

          {error && (
            <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 mb-4">
              <span className="text-[12px] text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}

          <input
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="XXXXXX"
            maxLength={6}
            className="w-full border-2 border-accent-gold bg-accent-gold-soft px-6 py-4 text-center font-display text-[30px] font-bold text-ink tracking-[8px] focus:outline-none mb-2"
          />
          <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-6 text-center">
            Ask the host for their 6-character room code
          </div>

          <div className="flex gap-3">
            <button
              onClick={joinLobby}
              disabled={loading || gameCode.length !== 6}
              className="flex-1 py-[11px] bg-accent-gold text-white font-display text-[14px] font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining…' : 'Join Game →'}
            </button>
            <button
              onClick={closeJoinForm}
              className="px-6 py-[11px] border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[13px] hover:opacity-70 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-sidebar px-[26px] py-[20px] mb-[22px] flex items-center justify-between">
        <div>
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-[5px]">The Games Room · Brain Rush</div>
          <div className="font-display text-[26px] font-semibold text-ink-on-dark tracking-[-0.5px] mb-[5px]">Brain Rush.</div>
          <div className="text-[12px] text-white/35">Real-time quiz duels · First to answer correctly earns the most points</div>
        </div>
        {onBack && (
          <button onClick={onBack} className="px-4 py-[7px] bg-accent-gold text-white text-[12px] font-bold hover:opacity-90 transition">
            ← Back
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-[22px]">
        <div>
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">How do you want to play?</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-[22px]">
            <div className="bg-sidebar p-[18px] flex flex-col">
              <div className="text-[18px] mb-2 text-accent-gold">⊕</div>
              <div className="font-display text-[15px] font-semibold text-ink-on-dark mb-1.5">Host a Game.</div>
              <div className="text-[11.5px] text-white/40 leading-[1.65] flex-1 mb-3.5">
                Create a private room and share a code with your classmates.
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="py-[7px] bg-accent-gold text-white text-[12px] font-bold hover:opacity-90 transition text-center"
              >
                Host →
              </button>
            </div>

            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-[18px] flex flex-col">
              <div className="text-[18px] mb-2 text-muted-ink dark:text-muted-ink-on-dark">→</div>
              <div className="font-display text-[15px] font-semibold text-ink dark:text-ink-on-dark mb-1.5">Join a Game.</div>
              <div className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark leading-[1.65] flex-1 mb-3.5">
                Enter a room code from your classmate to join their session.
              </div>
              <button
                onClick={() => setShowJoinForm(true)}
                className="py-[7px] bg-transparent border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-[12px] hover:opacity-75 transition text-center"
              >
                Join →
              </button>
            </div>

            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-[18px] flex flex-col">
              <div className="text-[18px] mb-2 text-muted-ink dark:text-muted-ink-on-dark">◈</div>
              <div className="font-display text-[15px] font-semibold text-ink dark:text-ink-on-dark mb-1.5">Play Online.</div>
              <div className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark leading-[1.65] flex-1 mb-3.5">
                Enter the ranked queue and get matched against players live.
              </div>
              <button
                disabled
                className="py-[7px] bg-transparent border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[12px] opacity-50 cursor-not-allowed text-center"
              >
                Coming soon
              </button>
            </div>
          </div>

          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">How it works</div>
          <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark p-5">
            <ol className="space-y-3">
              {[
                'Create a game or join using a code shared by a friend',
                'Wait for players to join — everyone is automatically ready',
                'Answer questions as fast and accurately as possible',
                'See who comes out on top in the final leaderboard!',
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-[12px]">
                  <span className="font-bold text-accent-gold flex-shrink-0">{i + 1}.</span>
                  <span className="text-secondary-ink dark:text-muted-ink-on-dark">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex flex-col gap-[14px]">
          <div className="bg-sidebar px-[18px] py-[18px]">
            <div className="text-[9px] tracking-[2px] text-white/45 font-bold uppercase mb-2">Quick Join</div>
            <div className="text-[11px] text-white/55 mb-3">Have a room code? Enter it to jump straight in.</div>
            <input
              type="text"
              placeholder="Room code…"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full px-3 py-2 bg-white/10 border border-white/15 text-ink-on-dark font-display text-[12px] font-bold tracking-[4px] placeholder:text-white/25 focus:outline-none mb-2 text-center"
            />
            <button
              onClick={() => setShowJoinForm(true)}
              disabled={gameCode.length === 0}
              className="w-full py-[7px] bg-accent-gold text-white text-[12px] font-bold hover:opacity-90 transition disabled:opacity-40"
            >
              Join →
            </button>
          </div>

          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-4">
            <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">Brain Rush</div>
            <div className="text-[11.5px] text-secondary-ink dark:text-muted-ink-on-dark leading-[1.65]">
              Real-time quiz duels against your classmates. First to answer correctly earns the most points.
            </div>
            {questionSetId && (
              <div className="mt-3 pt-3 border-t border-divider dark:border-divider-on-dark">
                <div className="text-[9px] tracking-[1.5px] text-muted-ink dark:text-muted-ink-on-dark uppercase font-bold mb-1">Using Question Set</div>
                <div className="text-[11px] text-ink dark:text-ink-on-dark font-semibold">Custom Questions</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
