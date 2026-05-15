import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react';
import { ErrorLogger } from '../utils/errorLogger';

export const AccountSuspended: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [blockInfo, setBlockInfo] = useState<{
    reason: string | null;
    expiresAt: string | null;
    isPermanent: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockStatus = async () => {
      if (!user?.id) {
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('check_user_block_status', {
          p_user_id: user.id
        });

        if (error) throw error;

        if (data && data.is_blocked) {
          setBlockInfo({
            reason: data.block_reason || null,
            expiresAt: data.expires_at || null,
            isPermanent: data.is_permanent || false,
          });
        } else {
          // User is not blocked, redirect to dashboard
          navigate('/');
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        ErrorLogger.error(err, { component: 'AccountSuspended', action: 'fetchBlockStatus', userId: user?.id });
      } finally {
        setLoading(false);
      }
    };

    fetchBlockStatus();
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-light dark:bg-page-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold" />
      </div>
    );
  }

  if (!blockInfo) {
    return null;
  }

  const expirationDate = blockInfo.expiresAt
    ? new Date(blockInfo.expiresAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-page-light dark:bg-page-dark p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="w-[460px] max-w-full bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[22px] overflow-hidden">

        {/* ── Red header band — semantic, always red ───────────────── */}
        <div className="bg-red-50 border-b border-red-200 px-9 pt-7 pb-6 text-center">
          <div className="w-[60px] h-[60px] rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto mb-3.5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
            </svg>
          </div>
          <div className="font-display text-[24px] font-bold text-red-800">Account Suspended</div>
          <div className="text-[12px] text-red-700 mt-1.5 leading-relaxed">Your account cannot access the platform.</div>
        </div>

        {/* ── Content ──────────────────────────────────────────────── */}
        <div className="px-7 pt-5 pb-7">

          {/* Reason box */}
          {blockInfo.reason && (
            <div className="bg-red-50 border border-red-200 rounded-[12px] px-4 py-3.5 mb-2.5 flex items-start gap-2.5">
              <div className="w-7 h-7 bg-red-100 rounded-[8px] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-bold text-red-800 tracking-[0.1em] uppercase mb-1">Reason</div>
                <div className="text-[13px] text-red-700 leading-relaxed">{blockInfo.reason}</div>
              </div>
            </div>
          )}

          {/* Expiry box */}
          {!blockInfo.isPermanent && expirationDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-[12px] px-4 py-3.5 mb-3.5 flex items-start gap-2.5">
              <div className="w-7 h-7 bg-blue-100 rounded-[8px] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-bold text-blue-800 tracking-[0.1em] uppercase mb-1">Suspension Expires</div>
                <div className="text-[13px] font-semibold text-blue-700 mb-0.5">{expirationDate}</div>
                <div className="text-[11px] text-blue-500">Access restored automatically after this date.</div>
              </div>
            </div>
          )}

          {/* Appeal note */}
          <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark rounded-[10px] px-3.5 py-2.5 mb-[18px] text-[12px] text-muted-ink dark:text-muted-ink-on-dark text-center leading-relaxed">
            If you believe this is an error, contact support to appeal your suspension.
          </div>

          {/* Sign Out button */}
          <button
            onClick={handleSignOut}
            className="w-full bg-sidebar text-ink-on-dark py-[11px] text-[13px] font-semibold rounded-[11px] flex items-center justify-center gap-2 hover:opacity-85 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>

          {/* Support link */}
          <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark text-center mt-3">
            Need help?{' '}
            <a href="mailto:support@scholar.app" className="text-blue-500 hover:underline">
              support@scholar.app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
