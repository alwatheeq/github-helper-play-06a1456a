import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../contexts/I18nContext';
import { LanguageToggle } from '../LanguageToggle';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const { t } = useI18n();
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const adminTapCountRef = useRef(0);
  const adminTapResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (adminTapResetRef.current) clearTimeout(adminTapResetRef.current);
  }, []);

  const handleHiddenAdminTap = useCallback(() => {
    if (adminTapResetRef.current) clearTimeout(adminTapResetRef.current);
    adminTapCountRef.current += 1;
    if (adminTapCountRef.current >= 3) {
      adminTapCountRef.current = 0;
      navigate('/admin/login');
      return;
    }
    adminTapResetRef.current = setTimeout(() => {
      adminTapCountRef.current = 0;
    }, 2000);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent, isRetry = false) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess(t('auth.signup_success_message'));
        setRetryAttempts(0);
        setEmail('');
        setPassword('');
      } else {
        await signIn(email, password);
        setRetryAttempts(0);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('auth.authentication_failed');
      if (isSignUp && msg.toLowerCase().includes('database')) {
        setError(isRetry
          ? 'Signup is temporarily unavailable. Please try again in a few moments.'
          : 'There was a temporary issue creating your account. Would you like to retry?'
        );
        setRetryAttempts(p => p + 1);
      } else {
        setError(msg);
        setRetryAttempts(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.google_sign_in_failed'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-page-light dark:bg-page-dark relative">
      {/* Language toggle — top right */}
      <div className="absolute top-5 right-6 z-20">
        <LanguageToggle />
      </div>

      {/* Hidden admin entry */}
      <button
        type="button"
        tabIndex={-1}
        onClick={handleHiddenAdminTap}
        className="fixed bottom-3 left-4 z-10 text-xs text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity select-none"
        title="Admin Portal"
      >
        Admin
      </button>

      {/* ── Left column — form ── */}
      <div className="w-full lg:w-[520px] flex flex-col justify-center px-10 py-14 lg:border-r border-divider dark:border-divider-on-dark flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-sidebar rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              className="text-page dark:text-card-dark"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <span className="font-display text-[20px] font-bold text-ink dark:text-ink-on-dark tracking-tight">
            {t('app_name')}
          </span>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="font-display text-[30px] font-bold text-ink dark:text-ink-on-dark leading-tight mb-2">
            {isSignUp ? t('auth.create_account') : t('auth.welcome_back')}
          </h1>
          <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
            {isSignUp ? t('auth.signup_subtitle') : t('auth.signin_subtitle')}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] p-6 ">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[12px]">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              {retryAttempts > 0 && retryAttempts < 3 && isSignUp && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as React.FormEvent, true)}
                  disabled={loading}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:opacity-80 underline disabled:opacity-50"
                >
                  Retry Sign-Up
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[12px]">
              <p className="text-green-700 dark:text-green-300 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-divider dark:border-divider-on-dark rounded-lg text-sm font-medium text-ink dark:text-ink-on-dark bg-card-light dark:bg-card-dark hover:bg-subtle dark:hover:bg-subtle-on-dark transition-colors duration-150 disabled:opacity-50 mb-4"
          >
            <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.continue_with_google')}
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
            <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{t('auth.or_continue_with_email')}</span>
            <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-secondary-ink dark:text-muted-ink-on-dark mb-1.5 uppercase tracking-wide">
                {t('auth.email_address')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                placeholder={t('auth.enter_email')}
                className="w-full px-3 py-2.5 border border-divider dark:border-divider-on-darktext-sm text-ink dark:text-ink-on-dark bg-card-light dark:bg-card-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus:border-transparent transition-colors duration-150 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-secondary-ink dark:text-muted-ink-on-dark mb-1.5 uppercase tracking-wide">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                placeholder={t('auth.enter_password')}
                className="w-full px-3 py-2.5 border border-divider dark:border-divider-on-darktext-sm text-ink dark:text-ink-on-dark bg-card-light dark:bg-card-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus:border-transparent transition-colors duration-150 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-5 text-sm font-semibold bg-ink text-ink-on-dark hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold disabled:opacity-50 transition-opacity duration-150"
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : isSignUp ? t('auth.sign_up') : t('auth.sign_in')
              }
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
              className="text-[12px] text-accent-gold hover:opacity-80 font-medium transition-opacity duration-150 disabled:opacity-50"
            >
              {isSignUp ? t('auth.have_account') : t('auth.need_account')}
            </button>
          </div>
        </div>

        {/* Footnotes */}
        <div className="flex items-center justify-center gap-[22px] mt-6 text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
          <span className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            {t('auth.pages_per_month')}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {t('auth.supported_formats')}
          </span>
        </div>
      </div>

      {/* ── Right column — editorial panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col justify-center flex-1 px-16 py-14 bg-sidebar">
        <div className="max-w-md">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-muted-ink-on-dark mb-4">
            {t('app_name')} · Scholar v4
          </p>
          <h2 className="font-display text-[52px] font-bold text-ink-on-dark leading-[1.1] mb-5">
            Study<br />smarter,<br />not harder.
          </h2>
          <p className="text-sm text-muted-ink-on-dark leading-relaxed max-w-sm">
            {t('auth.editorial_subtitle')}
          </p>
        </div>

        {/* Pull quote */}
        <div className="mt-auto pt-10 border-t border-accent-gold/20">
          <p className="font-display text-xs italic text-muted-ink-on-dark leading-relaxed">
            "Read with the pen, write with the mind."
          </p>
          <p className="text-[10px] text-muted-ink-on-dark/60 mt-2">© 2026 {t('app_name')}</p>
        </div>
      </div>
    </div>
  );
};
