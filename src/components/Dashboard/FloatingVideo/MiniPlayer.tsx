import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Maximize2, X } from 'lucide-react';
import { useFloatingVideoStore } from '../../../stores/useFloatingVideoStore';
import { useI18n } from '../../../contexts/I18nContext';

const MiniPlayer: React.FC = () => {
  const { activeRoom, isMuted, toggleMute, leaveRoom } = useFloatingVideoStore();
  const { t } = useI18n();

  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const getInitialPosition = useCallback(() => {
    return {
      x: window.innerWidth - 160 - 24,
      y: window.innerHeight - 112 - 96,
    };
  }, []);

  useEffect(() => {
    if (!position) {
      setPosition(getInitialPosition());
    }
  }, [position, getInitialPosition]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const pos = position ?? getInitialPosition();
      dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position, getInitialPosition],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 160, dragState.current.origX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 112, dragState.current.origY + dy)),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  const handleExpand = useCallback(() => {
    window.dispatchEvent(new CustomEvent('mindstudy:focus-study-rooms'));
  }, []);

  if (!activeRoom) return null;

  const pos = position ?? getInitialPosition();

  return (
    <div
      ref={containerRef}
      className="fixed z-[9998] w-[180px] rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.32)] overflow-hidden flex flex-col select-none border border-white/[0.08]"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Drag handle + room name */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-[7px] cursor-grab active:cursor-grabbing"
        style={{ background: '#1a1a2e' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex gap-0.5 flex-shrink-0">
          {[0,1,2].map(i => <div key={i} className="w-3.5 h-0.5 rounded-[1px]" style={{ background: 'rgba(255,255,255,0.25)' }} />)}
        </div>
        <span className="text-[9px] text-white/[0.6] font-semibold flex-1 text-center truncate">
          {activeRoom.name}
        </span>
      </div>

      {/* Video preview placeholder */}
      <div className="h-[100px] flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
        <span className="text-[9px] text-white/40">
          {t('floating_video.video_preview') || 'Video Preview'}
        </span>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-around px-2.5 py-2" style={{ background: '#111827' }}>
        <button
          type="button"
          onClick={toggleMute}
          className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity"
          style={isMuted ? { background: 'rgba(239,68,68,0.13)', border: '1px solid rgba(239,68,68,0.31)' } : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          title={isMuted ? (t('floating_video.unmute') || 'Unmute') : (t('floating_video.mute') || 'Mute')}
        >
          {isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-red-400" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-white/70" />
          )}
        </button>

        <button
          type="button"
          onClick={handleExpand}
          className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          title={t('floating_video.expand') || 'Expand'}
        >
          <Maximize2 className="w-3.5 h-3.5 text-white/70" />
        </button>

        <button
          type="button"
          onClick={leaveRoom}
          className="w-7 h-7 rounded-[8px] flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: 'rgba(239,68,68,0.13)', border: '1px solid rgba(239,68,68,0.31)' }}
          title={t('floating_video.leave_room') || 'Leave'}
        >
          <X className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
