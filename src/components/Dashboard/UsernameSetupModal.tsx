import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, Loader2, Lock, Clock } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../Toast/Toast';
import { supabase } from '../../lib/supabase';

interface UsernameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (username: string) => void;
}

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
const COOLDOWN_DAYS = 10;

export const UsernameSetupModal: React.FC<UsernameSetupModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    const checkCooldown = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('username, username_changed_at')
        .eq('id', user.id)
        .single();

      if (data?.username && data.username_changed_at) {
        const changedAt = new Date(data.username_changed_at);
        const now = new Date();
        const diffMs = now.getTime() - changedAt.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays < COOLDOWN_DAYS) {
          setCooldownDays(Math.ceil(COOLDOWN_DAYS - diffDays));
        } else {
          setCooldownDays(null);
        }

        setUsername(data.username);
      }
    };

    checkCooldown();
  }, [isOpen, user]);

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (wasOpenRef.current && !isOpen) {
      setUsername('');
      setIsAvailable(null);
      setCooldownDays(null);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const checkAvailability = useCallback(
    async (value: string) => {
      if (!USERNAME_REGEX.test(value) || !user) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', value)
        .neq('id', user.id)
        .maybeSingle();

      setIsChecking(false);

      if (error) {
        setIsAvailable(null);
        return;
      }

      setIsAvailable(data === null);
    },
    [user],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
    setIsAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 3) {
      debounceRef.current = setTimeout(() => checkAvailability(value), 300);
    }
  };

  const isValid = USERNAME_REGEX.test(username);

  const handleSubmit = async () => {
    if (!isValid || !user || cooldownDays) return;
    if (isAvailable === false || isChecking) return;

    setIsSubmitting(true);
    const { data: available, error: rpcError } = await supabase.rpc('check_username_available', {
      p_username: username,
    });
    if (rpcError) {
      setIsSubmitting(false);
      showError(rpcError.message);
      return;
    }
    if (available !== true) {
      setIsSubmitting(false);
      setIsAvailable(false);
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ username, username_changed_at: new Date().toISOString() })
      .eq('id', user.id);

    setIsSubmitting(false);

    if (error) {
      showError(error.message);
      return;
    }

    showSuccess(t('social.username_available'));
    onComplete(username);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const renderInputIcon = () => {
    if (isChecking) return <Loader2 className="h-[15px] w-[15px] animate-spin text-accent-gold" />;
    if (!username || username.length < 3) return null;
    if (isAvailable === true) return <Check className="h-[15px] w-[15px] text-accent-gold" />;
    if (isAvailable === false || !isValid) return <X className="h-[15px] w-[15px] text-red-600" />;
    return null;
  };

  const isTaken = isAvailable === false && !isChecking;
  const isAvailableConfirmed = isAvailable === true && !isChecking;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/[0.58] grid place-items-center p-4"
      dir={dir}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-page-light dark:bg-page-dark w-full max-w-[430px] shadow-[0_24px_56px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ink header */}
        <div className="bg-sidebar px-6 py-5">
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-2">Account · Profile</div>
          <div className="flex items-center justify-between">
            <div className="font-display text-[20px] font-semibold text-card-light">Set Username.</div>
            <button
              onClick={onClose}
              className="w-[26px] h-[26px] grid place-items-center bg-transparent border border-white/[0.13] text-white/[0.27] text-[14px] cursor-pointer hover:text-white/50 transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-[22px]">
          <p className="text-[12.5px] text-muted-ink dark:text-muted-ink-on-dark leading-[1.7] mb-5">
            Choose a public username. Changeable once every <strong className="text-ink dark:text-ink-on-dark">10 days</strong>.
          </p>

          {cooldownDays !== null ? (
            <>
              {/* Cooldown notice */}
              <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark border-l-[3px] border-l-accent-gold px-[18px] py-4 mb-[18px]">
                <div className="flex items-start gap-3">
                  <Clock className="h-[18px] w-[18px] text-accent-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[12.5px] font-semibold text-ink dark:text-ink-on-dark mb-1">Username recently changed</div>
                    <div className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark leading-[1.6]">
                      You can change your username again in <strong className="text-ink dark:text-ink-on-dark">{cooldownDays} days</strong>.
                      {username && <> Your current username is <strong className="text-ink dark:text-ink-on-dark font-mono">@{username}</strong>.</>}
                    </div>
                  </div>
                </div>
              </div>
              {/* Locked input */}
              <div className="flex border border-divider dark:border-divider-on-dark overflow-hidden opacity-50">
                <div className="px-[14px] py-3 bg-subtle dark:bg-subtle-on-dark flex items-center">
                  <span className="font-display text-[20px] font-bold text-muted-ink dark:text-muted-ink-on-dark">@</span>
                </div>
                <div className="flex-1 px-[14px] py-[10px] flex items-center justify-between bg-subtle dark:bg-subtle-on-dark">
                  <span className="text-[14px] text-muted-ink dark:text-muted-ink-on-dark font-mono">{username}</span>
                  <Lock className="h-[14px] w-[14px] text-muted-ink dark:text-muted-ink-on-dark" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Input — available/taken state */}
              <div className={`flex mb-2 overflow-hidden ${isTaken ? 'border-2 border-red-600' : 'border-2 border-sidebar dark:border-sidebar'}`}>
                <div className="px-[14px] py-3 bg-sidebar flex items-center">
                  <span className="font-display text-[20px] font-bold text-card-light">@</span>
                </div>
                <div className="flex-1 px-[14px] py-[10px] flex items-center justify-between bg-page-light dark:bg-page-dark">
                  <input
                    ref={inputRef}
                    type="text"
                    value={username}
                    onChange={handleInputChange}
                    maxLength={20}
                    placeholder={t('social.username_placeholder')}
                    className={`flex-1 font-mono text-[14px] bg-transparent border-none outline-none placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark ${isTaken ? 'text-red-600' : 'text-ink dark:text-ink-on-dark'}`}
                  />
                  <div className="flex-shrink-0 ml-2">{renderInputIcon()}</div>
                </div>
              </div>

              {/* Status line — fixed height to prevent layout shift */}
              <div className="flex items-center gap-1.5 mb-4 h-[18px]">
                {isAvailableConfirmed && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-gold flex-shrink-0" />
                    <span className="text-[11.5px] text-accent-gold font-semibold">{t('social.username_available')}</span>
                  </>
                )}
                {isTaken && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                    <span className="text-[11.5px] text-red-600 font-semibold">{t('social.username_taken')}</span>
                  </>
                )}
                {!isValid && username.length >= 3 && !isTaken && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                    <span className="text-[11.5px] text-red-600 font-semibold">{t('social.username_invalid')}</span>
                  </>
                )}
              </div>

              {/* Hint box */}
              <div className="text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark leading-[1.6] px-3 py-[9px] bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark">
                3–20 characters · lowercase, numbers, underscores only
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cooldownDays !== null ? (
          <div className="px-6 pb-[22px]">
            <button
              onClick={onClose}
              className="w-full py-[11px] bg-transparent border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[12px] cursor-pointer hover:bg-subtle dark:hover:bg-subtle-on-dark transition"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="flex gap-[10px] px-6 pb-[22px]">
            <button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting || isAvailable === false || isChecking}
              className="flex-1 py-[11px] bg-sidebar text-card-light text-[13px] font-bold border-none disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin inline mr-1" />}
              {t('social.save_username')}
            </button>
            <button
              onClick={onClose}
              className="py-[11px] px-[18px] bg-transparent border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[12px] hover:bg-subtle dark:hover:bg-subtle-on-dark transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
