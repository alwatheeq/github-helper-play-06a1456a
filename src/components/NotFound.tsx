import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-page-light dark:bg-page-dark p-6">
      <div className="flex flex-col items-center gap-0 max-w-[420px] text-center">

        {/* Large 404 */}
        <div
          className="font-display text-[120px] font-black leading-none select-none tracking-[-6px] text-accent-gold-soft"
          style={{ letterSpacing: '-6px' }}
        >
          404
        </div>

        <div className="font-display text-[22px] font-bold text-ink dark:text-ink-on-dark mt-2">Page Not Found</div>

        <p className="text-[14px] text-muted-ink dark:text-muted-ink-on-dark leading-relaxed mt-2.5 mb-8 px-5">
          The page you're looking for has been moved, deleted, or never existed. Let's get you back on track.
        </p>

        {/* Broken link icon tile */}
        <div className="w-[72px] h-[72px] rounded-[20px] bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark flex items-center justify-center mb-7">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-ink dark:text-muted-ink-on-dark">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            <line x1="8" y1="2" x2="8" y2="5"/>
            <line x1="2" y1="8" x2="5" y2="8"/>
            <line x1="16" y1="19" x2="16" y2="22"/>
            <line x1="19" y1="16" x2="22" y2="16"/>
          </svg>
        </div>

        {/* CTAs */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-[11px] rounded-[10px] bg-transparent border-[1.5px] border-divider dark:border-divider-on-dark text-ink dark:text-ink-on-dark text-[14px] font-semibold hover:opacity-75 transition"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-[11px] rounded-[10px] bg-accent-gold text-ink-on-dark border-none text-[14px] font-semibold hover:opacity-90 transition"
            style={{ boxShadow: '0 3px 12px rgba(184,137,58,0.4)' }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};
