import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MultiplayerMenu from './MultiplayerMenu';
import MultiplayerLobby from './MultiplayerLobby';
import MultiplayerGamePlay from './MultiplayerGamePlay';
import MultiplayerResults from './MultiplayerResults';

type MultiplayerView = 'menu' | 'lobby' | 'game' | 'results';

export const BrainRushMultiplayerWrapper: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [currentView, setCurrentView] = useState<MultiplayerView>('menu');
  const [lobbyId, setLobbyId] = useState<string | null>(params.lobbyId || null);

  const handleLobbyJoined = (id: string) => {
    setLobbyId(id);
    setCurrentView('lobby');
  };

  const handleExitLobby = () => {
    setLobbyId(null);
    setCurrentView('menu');
  };

  const handleBackToEduPlay = () => {
    navigate(-1);
  };

  if (currentView === 'menu') {
    return (
      <div className={`min-h-screen bg-page-light dark:bg-page-dark`}>
        <div className="p-4">
          <button
            onClick={handleBackToEduPlay}
            className={`flex items-center gap-2 text-secondary-ink dark:text-secondary-ink-on-dark hover:opacity-80 transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to EduPlay
          </button>
        </div>
        <MultiplayerMenu onLobbyJoined={handleLobbyJoined} />
      </div>
    );
  }

  if (currentView === 'lobby' && lobbyId) {
    return (
      <div className={`min-h-screen bg-page-light dark:bg-page-dark`}>
        <MultiplayerLobby lobbyId={lobbyId} onExit={handleExitLobby} />
      </div>
    );
  }

  if (currentView === 'game' && lobbyId) {
    return (
      <div className="min-h-screen">
        <MultiplayerGamePlay lobbyId={lobbyId} />
      </div>
    );
  }

  if (currentView === 'results' && lobbyId) {
    return (
      <div className="min-h-screen">
        <MultiplayerResults lobbyId={lobbyId} />
      </div>
    );
  }

  return null;
};
