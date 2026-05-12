import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Gamepad2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { ErrorLogger } from '../../utils/errorLogger';
interface GameSession {
  id: string;
  game_title: string;
  status: string;
  host_id: string;
}

export const GameJoinPage: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [joinAsGuest, setJoinAsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<GameSession | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (gameCode) {
      validateGameCode();
    }
  }, [gameCode]);

  const validateGameCode = async () => {
    if (!gameCode) {
      setError('No game code provided');
      setLoading(false);
      return;
    }

    try {
      const { data, error: gameError } = await supabase
        .from('eduplay_game_sessions')
        .select('id, game_title, status, host_id')
        .eq('game_code', gameCode.toUpperCase())
        .maybeSingle();

      if (gameError || !data) {
        setError('Invalid game code. Please check and try again.');
        setLoading(false);
        return;
      }

      if (data.status !== 'waiting') {
        setError('This game has already started or ended.');
        setLoading(false);
        return;
      }

      setGameInfo(data);

      if (user) {
        setDisplayName(user.email?.split('@')[0] || 'Player');
      } else {
        setShowAuthModal(true);
      }

      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'GameJoinPage', action: 'validateGameCode', gameCode });
      setError('Failed to validate game code. Please try again.');
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!gameInfo) return;

    if (!user && !joinAsGuest) {
      setShowAuthModal(true);
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const { error: participantError } = await supabase
        .from('eduplay_participants')
        .insert({
          game_session_id: gameInfo.id,
          user_id: user?.id || null,
          display_name: displayName.trim(),
          is_host: false
        });

      if (participantError) {
        if (participantError.message.includes('duplicate')) {
          setError('You have already joined this game.');
        } else {
          setError('Failed to join game. Please try again.');
        }
        setJoining(false);
        return;
      }

      navigate(`/dashboard?view=eduplay&game=${gameInfo.id}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'GameJoinPage', action: 'handleJoinGame', gameId: gameInfo?.id, userId: user?.id });
      setError('Failed to join game. Please try again.');
      setJoining(false);
    }
  };

  const handleSignUp = () => {
    navigate(`/?redirect=/join/${gameCode}`);
  };

  const handleSignIn = () => {
    navigate(`/?redirect=/join/${gameCode}`);
  };

  const handleContinueAsGuest = () => {
    setJoinAsGuest(true);
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-12 text-center max-w-md w-full shadow-[var(--s4-shadow-hairline)]">
          <Loader2 className="h-12 w-12 text-accent-gold animate-spin mx-auto mb-4" />
          <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">Validating game code...</p>
        </div>
      </div>
    );
  }

  if (error && !gameInfo) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-12 text-center max-w-md w-full shadow-[var(--s4-shadow-hairline)]">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="font-display text-[22px] font-semibold text-ink dark:text-ink-on-dark mb-3">Unable to Join Game</h2>
          <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard?view=eduplay')}
            className="px-6 py-3 bg-accent-gold text-sidebar text-[13px] font-bold hover:opacity-90 transition"
          >
            Go to EduPlay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      {/* Scholar v4 Play4Join layout: centered card */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Main join card */}
        <div className="md:col-span-2">
          {/* Dark banner header */}
          <div className="bg-sidebar px-7 py-5 mb-0 flex items-center justify-between shadow-[var(--s4-shadow-hairline)]">
            <div>
              <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-1">The Games Room · Brain Rush</div>
              <div className="font-display text-[24px] font-semibold text-ink-on-dark">Join a Game.</div>
            </div>
            <button
              onClick={() => navigate('/dashboard?view=eduplay')}
              className="text-[11px] font-bold text-sidebar bg-accent-gold px-3 py-1.5 hover:opacity-90 transition"
            >← Back</button>
          </div>

          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-t-0 px-7 py-6 shadow-[var(--s4-shadow-hairline)]">
            <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-4">Enter Room Code</div>

            {/* Game code display — large monospace */}
            <div className="border-2 border-accent-gold bg-chip dark:bg-card-dark px-6 py-4 text-center mb-2">
              <div className="font-display text-[30px] font-bold text-ink dark:text-ink-on-dark tracking-[8px]">
                {gameCode?.toUpperCase()}
              </div>
            </div>
            {gameInfo && (
              <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-6 text-center">{gameInfo.game_title}</div>
            )}

            {/* Display name */}
            <div className="text-[10px] font-bold tracking-[1px] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-2">Your Display Name</div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              className="w-full border border-divider dark:border-divider-on-dark px-4 py-3 text-[13px] bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark focus:outline-none focus:border-accent-gold mb-1"
            />
            <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-6">This is how you'll appear to others in the game.</div>

            {error && (
              <div className="border border-red-500/40 bg-red-500/10 px-4 py-3 flex items-start gap-3 mb-4">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleJoinGame}
              disabled={joining || !displayName.trim()}
              className="w-full py-3 bg-accent-gold text-sidebar font-display text-[14px] font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Game →'
              )}
            </button>
          </div>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-5 shadow-[var(--s4-shadow-hairline)]">
            <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">How to Join</div>
            {[
              'Get the room code from your host or teacher',
              'Enter the code and press Join',
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
          <div className="bg-sidebar p-5 shadow-[var(--s4-shadow-hairline)]">
            <Gamepad2 className="h-7 w-7 text-accent-gold mb-3" />
            <div className="font-display text-[15px] font-semibold text-ink-on-dark mb-1">Brain Rush.</div>
            <div className="text-[11px] text-muted-ink-on-dark">Real-time quiz duels against your classmates. First to answer correctly earns the most points.</div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-8 max-w-md w-full shadow-[var(--s4-shadow-hairline)]">
            <h3 className="font-display text-[22px] font-semibold text-ink dark:text-ink-on-dark mb-2">Join the Game</h3>
            <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark mb-6">
              Choose how you'd like to join this game:
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSignIn}
                className="w-full py-3 bg-accent-gold text-sidebar text-[13px] font-bold hover:opacity-90 transition"
              >
                Sign In to Your Account
              </button>

              <button
                onClick={handleSignUp}
                className="w-full py-3 bg-sidebar text-ink-on-dark text-[13px] font-bold hover:opacity-90 transition"
              >
                Create New Account
              </button>

              <button
                onClick={handleContinueAsGuest}
                className="w-full py-3 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[13px] hover:opacity-70 transition"
              >
                Continue as Guest
              </button>
            </div>

            <p className="mt-4 text-[11px] text-muted-ink dark:text-muted-ink-on-dark text-center">
              Guest users won't have their progress saved
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
