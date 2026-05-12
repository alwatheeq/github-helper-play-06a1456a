import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Check, X, Loader2 } from 'lucide-react';
import { ScholarCard, ScholarButton } from '../Scholar';
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

  const renderValidationIcon = () => {
    if (isChecking) return <Loader2 className="h-5 w-5 animate-spin text-accent-gold" />;
    if (!username || username.length < 3) return null;
    if (!isValid) return <X className="h-5 w-5 text-red-500" />;
    if (isAvailable === true) return <Check className="h-5 w-5 text-green-500" />;
    if (isAvailable === false) return <X className="h-5 w-5 text-red-500" />;
    return null;
  };

  const renderValidationMessage = () => {
    if (isChecking || !username || username.length < 3) return null;
    if (!isValid) return <p className="text-sm text-red-500 mt-1">{t('social.username_invalid')}</p>;
    if (isAvailable === true) return <p className="text-sm text-green-500 mt-1">{t('social.username_available')}</p>;
    if (isAvailable === false) return <p className="text-sm text-red-500 mt-1">{t('social.username_taken')}</p>;
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      dir={dir}
      onClick={handleOverlayClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <ScholarCard
        variant="elevated"
        padding="none"
        className="relative w-full max-w-md animate-scaleIn"
      >
        <div className="flex items-center justify-between p-5 border-b border-divider dark:border-divider-on-dark">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent-gold" />
            <h2 className="text-lg font-semibold text-ink dark:text-ink-on-dark">
              {t('social.username_setup')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--s4-radius-card)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-secondary-ink dark:text-muted-ink-on-dark"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {cooldownDays !== null ? (
            <div className="p-4 rounded-[var(--s4-radius-card)] bg-subtle text-center">
              <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                {t('social.username_cooldown').replace('{days}', String(cooldownDays))}
              </p>
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-sm text-muted-ink dark:text-muted-ink-on-dark">@</span>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={username}
                  onChange={handleInputChange}
                  maxLength={20}
                  placeholder={t('social.username_placeholder')}
                  className="w-full pl-8 pr-10 py-2.5 rounded-[var(--s4-radius-card)] border border-divider dark:border-divider-on-dark bg-subtle text-ink dark:text-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {renderValidationIcon()}
                </div>
              </div>
              {renderValidationMessage()}
              <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
                3–20 characters: lowercase letters, numbers, underscores
              </p>
            </>
          )}
        </div>

        {cooldownDays === null && (
          <div className="p-5 border-t border-divider dark:border-divider-on-dark">
            <ScholarButton
              variant="primary"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting || isAvailable === false || isChecking}
              className="w-full"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('social.save_username')}
            </ScholarButton>
          </div>
        )}
      </ScholarCard>
    </div>
  );
};
