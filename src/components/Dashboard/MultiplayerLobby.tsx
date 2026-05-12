import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, Play, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';

interface LobbyPlayer {
  id: string;
  user_id: string;
  display_name: string;
  is_ready: boolean;
  is_host: boolean;
  joined_at: string;
}

interface GameConfig {
  timePerQuestion?: number;
  questionCount?: number;
  [key: string]: unknown;
}

interface GameLobby {
  id: string;
  host_user_id: string;
  game_code: string;
  game_name: string;
  max_players: number;
  current_players: number;
  status: string;
  game_config: GameConfig;
  created_at: string;
}

interface MultiplayerLobbyProps {
  lobbyId?: string;
  onExit: () => void;
}

export default function MultiplayerLobby({ lobbyId: initialLobbyId, onExit }: MultiplayerLobbyProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error: showErrorToast } = useToast();
  const [lobby, setLobby] = useState<GameLobby | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [_isReady, setIsReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialLobbyId) {
      loadLobby(initialLobbyId);
    }
  }, [initialLobbyId]);

  useEffect(() => {
    if (!lobby) return;

    const playersChannel = supabase
      .channel(`lobby_players_${lobby.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'multiplayer_game_players',
          filter: `lobby_id=eq.${lobby.id}`
        },
        () => {
          loadPlayers(lobby.id);
        }
      )
      .subscribe();

    const lobbyChannel = supabase
      .channel(`lobby_${lobby.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'multiplayer_game_lobbies',
          filter: `id=eq.${lobby.id}`
        },
        (payload) => {
          const updatedLobby = payload.new as GameLobby;
          setLobby(updatedLobby);

          if (updatedLobby.status === 'in_progress') {
            navigate(`/dashboard/brain-rush/play/${lobby.id}`);
          }
        }
      )
      .subscribe();

    return () => {
      playersChannel.unsubscribe();
      lobbyChannel.unsubscribe();
    };
  }, [lobby, navigate]);

  const loadLobby = async (id: string) => {
    if (isOffline()) {
      handleOfflineError(showErrorToast);
      setError('You are currently offline. Please check your connection.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('multiplayer_game_lobbies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'MultiplayerLobby', 
          action: 'loadLobby',
          lobbyId: id
        });
        ErrorLogger.error(error, { 
          component: 'MultiplayerLobby', 
          action: 'loadLobby',
          lobbyId: id,
          userId: user?.id
        });
        setError(message);
        return;
      }

      setLobby(data);
      setIsHost(data.host_user_id === user?.id);
      await loadPlayers(id);
    } catch (err) {
      const message = handleApiError(err, { 
        component: 'MultiplayerLobby', 
        action: 'loadLobby',
        lobbyId: id
      });
      ErrorLogger.error(err, { 
        component: 'MultiplayerLobby', 
        action: 'loadLobby',
        lobbyId: id,
        userId: user?.id
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async (id: string) => {
    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('multiplayer_game_players')
        .select('*')
        .eq('lobby_id', id)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) {
        ErrorLogger.error(error, { 
          component: 'MultiplayerLobby', 
          action: 'loadPlayers',
          lobbyId: id,
          userId: user?.id
        });
        // Non-blocking for real-time updates
        return;
      }

      setPlayers(data || []);

      const currentPlayer = data?.find(p => p.user_id === user?.id);
      if (currentPlayer) {
        setIsReady(currentPlayer.is_ready);
      }
    } catch (err) {
      ErrorLogger.error(err, { 
        component: 'MultiplayerLobby', 
        action: 'loadPlayers',
        lobbyId: id,
        userId: user?.id
      });
      // Non-blocking for real-time updates
    }
  };

  const copyGameCode = async () => {
    if (!lobby) return;

    await navigator.clipboard.writeText(lobby.game_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Removed toggleReady - all players are auto-ready on join

  const startGame = async () => {
    if (!lobby || !isHost) {
      return;
    }

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { error } = await supabase
        .from('multiplayer_game_lobbies')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', lobby.id);

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'MultiplayerLobby', 
          action: 'startGame',
          lobbyId: lobby.id,
          userId: user?.id
        });
        ErrorLogger.error(error, { 
          component: 'MultiplayerLobby', 
          action: 'startGame',
          lobbyId: lobby.id,
          userId: user?.id
        });
        showErrorToast(message);
      }
    } catch (err) {
      const message = handleApiError(err, { 
        component: 'MultiplayerLobby', 
        action: 'startGame',
        lobbyId: lobby.id,
        userId: user?.id
      });
      ErrorLogger.error(err, { 
        component: 'MultiplayerLobby', 
        action: 'startGame',
        lobbyId: lobby.id,
        userId: user?.id
      });
      showErrorToast(message);
    }
  };

  const leaveLobby = async () => {
    if (!lobby || !user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      // Still allow exit even if offline
      onExit();
      return;
    }

    try {
      if (isHost) {
        const { error } = await supabase
          .from('multiplayer_game_lobbies')
          .update({ status: 'cancelled' })
          .eq('id', lobby.id);

        if (error) {
          ErrorLogger.error(error, { 
            component: 'MultiplayerLobby', 
            action: 'leaveLobby',
            step: 'cancelLobby',
            lobbyId: lobby.id,
            userId: user.id
          });
          // Still allow exit even if update fails
        }
      } else {
        const { error } = await supabase
          .from('multiplayer_game_players')
          .update({ left_at: new Date().toISOString() })
          .eq('lobby_id', lobby.id)
          .eq('user_id', user.id);

        if (error) {
          ErrorLogger.error(error, { 
            component: 'MultiplayerLobby', 
            action: 'leaveLobby',
            step: 'markPlayerLeft',
            lobbyId: lobby.id,
            userId: user.id
          });
          // Still allow exit even if update fails
        }
      }

      onExit();
    } catch (err) {
      ErrorLogger.error(err, { 
        component: 'MultiplayerLobby', 
        action: 'leaveLobby',
        lobbyId: lobby.id,
        userId: user.id
      });
      // Still allow exit even if error occurs
      onExit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (error || !lobby) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="border border-red-500/30 bg-red-500/10 p-5 text-red-600 dark:text-red-400 text-[13px]">
          {error || 'Lobby not found'}
        </div>
        <button
          onClick={onExit}
          className="mt-4 px-4 py-2.5 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[12px] hover:opacity-70 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const readyCount = players.filter(p => p.is_ready !== false).length;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header — Scholar v4 style */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-1">EduPlay · Multiplayer</div>
          <h1 className="font-display text-[28px] font-semibold text-ink dark:text-ink-on-dark tracking-tight">{lobby.game_name}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={leaveLobby}
            className="flex items-center gap-2 px-3 py-2 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[11.5px] hover:opacity-70 transition"
          >
            <X className="w-4 h-4" />
            Leave
          </button>
          <button
            onClick={copyGameCode}
            className="flex items-center gap-2 px-3 py-2 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[11.5px] hover:opacity-70 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            Copy Code
          </button>
        </div>
      </div>

      {/* Dark room-code banner */}
      <div className="bg-sidebar px-7 py-5 mb-5 flex items-center shadow-[var(--s4-shadow-hairline)]">
        <div className="pr-7 border-r border-white/10 flex-shrink-0">
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">Room Code</div>
          <div className="font-mono text-[34px] font-black text-ink-on-dark tracking-[5px] leading-none">{lobby.game_code}</div>
          <div className="text-[10px] text-muted-ink-on-dark mt-1">Share with participants</div>
        </div>
        <div className="flex-1 flex justify-evenly pl-7">
          {[
            [`${lobby.current_players} / ${lobby.max_players}`, 'Players'],
            [`${readyCount} / ${players.length}`, 'Ready'],
            [String(lobby.game_config?.questionCount || 10), 'Questions'],
            [`${lobby.game_config?.timePerQuestion || 30}s`, 'Per Question'],
          ].map(([v, l], i) => (
            <div key={l} className="text-center">
              <div className={`font-display text-[28px] font-semibold leading-none ${i < 2 ? 'text-accent-gold' : 'text-ink-on-dark'}`}>{v}</div>
              <div className="text-[9px] tracking-[1.5px] text-muted-ink-on-dark uppercase mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-col layout: player table + host controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Players table — 2 cols wide */}
        <div className="md:col-span-2">
          <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">Players in Lobby</div>
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark shadow-[var(--s4-shadow-hairline)]">
            <div className="grid grid-cols-[28px_1fr_80px_64px] px-4 py-2 border-b border-divider dark:border-divider-on-dark">
              {['', 'Player', 'Status', 'Role'].map(h => (
                <div key={h} className="text-[9px] tracking-[1.5px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase">{h}</div>
              ))}
            </div>

            {players.length === 0 && (
              <div className="px-4 py-6 text-center text-[12px] text-muted-ink dark:text-muted-ink-on-dark italic">Loading players...</div>
            )}

            {players.map((player) => (
              <div
                key={player.id}
                className={`grid grid-cols-[28px_1fr_80px_64px] px-4 py-3 items-center border-b border-divider dark:border-divider-on-dark last:border-0`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${player.is_host ? 'bg-accent-gold text-sidebar' : 'bg-sidebar text-ink-on-dark'}`}>
                  {player.display_name[0].toUpperCase()}
                </div>
                <span className={`text-[12px] ${player.is_host ? 'font-semibold text-ink dark:text-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>
                  {player.display_name}
                  {player.user_id === user?.id && <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark ml-2">(You)</span>}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[11px] text-ink dark:text-ink-on-dark">Ready</span>
                </div>
                <span className={`text-[11px] ${player.is_host ? 'text-accent-gold font-semibold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                  {player.is_host ? 'Host' : '—'}
                </span>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 2 - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="grid grid-cols-[28px_1fr_80px_64px] px-4 py-3 items-center border-b border-divider dark:border-divider-on-dark last:border-0 opacity-40">
                <div className="w-6 h-6 rounded-full bg-divider dark:bg-divider-on-dark" />
                <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark italic">Waiting for player…</span>
                <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">—</span>
                <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">—</span>
              </div>
            ))}
          </div>
        </div>

        {/* Host controls + game settings */}
        <div className="flex flex-col gap-3">
          <div className="bg-sidebar p-5 shadow-[var(--s4-shadow-hairline)]">
            <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-4">Host Controls</div>
            {isHost ? (
              <>
                <button
                  onClick={startGame}
                  className="w-full py-3 bg-accent-gold text-sidebar font-display text-[13px] font-bold flex items-center justify-center gap-2 mb-2 hover:opacity-90 transition"
                >
                  <Play className="w-4 h-4" />
                  Start Game
                </button>
                <button
                  onClick={leaveLobby}
                  className="w-full py-2.5 border border-white/20 text-muted-ink-on-dark text-[11px] hover:bg-white/10 transition"
                >
                  Cancel Game
                </button>
              </>
            ) : (
              <div className="text-[12px] text-muted-ink-on-dark text-center py-3">Waiting for host to start...</div>
            )}
          </div>

          <div className="bg-card-light dark:bg-card-dark border border-t-2 border-accent-gold border-b-divider border-l-divider border-r-divider dark:border-divider-on-dark p-5 shadow-[var(--s4-shadow-hairline)]">
            <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-3">Game Settings</div>
            {[
              ['Questions', String(lobby.game_config?.questionCount || 10)],
              ['Time / Q', `${lobby.game_config?.timePerQuestion || 30}s`],
              ['Max Players', String(lobby.max_players)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-divider dark:border-divider-on-dark last:border-0">
                <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{k}</span>
                <span className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
