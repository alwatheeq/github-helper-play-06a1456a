import React, { useState, useEffect } from 'react';
import { User, Award, Save, X, Crown, Gift, Copy, Check, Hash } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useCredits } from '../../contexts/CreditContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { useTheme, themeDefinitions, VALID_COLOR_THEMES } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../Toast/Toast';
import { UsernameSetupModal } from './UsernameSetupModal';
import { usePageTutorial } from '../../hooks/usePageTutorial';
import { PageTutorial } from '../Onboarding/PageTutorial';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { getToolsCreditsPlanCap } from '../../utils/subscriptionHelpers';

interface UserStats {
  level: number;
  experience_points: number;
  study_streak_current: number;
  study_streak_longest: number;
  items_published_count: number;
  total_flashcards_studied: number;
  total_quizzes_completed: number;
  total_study_time_minutes: number;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}

interface Achievement {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  icon_name: string;
  badge_tier: string;
  xp_reward: number;
  category: string;
  earned_at?: string;
}


export const ProfilePage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { updateColorTheme } = useUserPreferences();
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const navigate = useNavigate();
  const { balance: creditBalance, refreshBalance } = useCredits();
  const { preferences, updateSidebarMode, updateTtsHoverEnabled } = useUserPreferences();
  const { currentTheme, setTheme } = useTheme();
  const { theme: darkMode } = useI18n();
  const {
    subscription,
    hasActiveSubscription,
    isTrialUser,
    isPaidUser,
    getDaysRemaining,
    getTierDisplayName
  } = useSubscription();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [claimingCredits, setClaimingCredits] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [publicUserId, setPublicUserId] = useState<string | null>(null);
  const [_usernameChangedAt, setUsernameChangedAt] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const { shouldShowTutorial, showTutorial, isTutorialOpen, completeTutorial, skipTutorial, config: tutorialConfig } = usePageTutorial('profile');

  useEffect(() => {
    if (shouldShowTutorial && !loading) {
      const timer = setTimeout(() => {
        showTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, loading, showTutorial]);

  useEffect(() => {
    if (user) {
      supabase.from('user_profiles').select('username, public_user_id, username_changed_at').eq('id', user.id).single().then(({ data }) => {
        if (data) {
          setUsername(data.username);
          setPublicUserId(data.public_user_id);
          setUsernameChangedAt(data.username_changed_at);
        }
      });
    }
  }, [user]);

  const handleCopyField = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClaimFreeCredits = async () => {
    if (!user || claimingCredits) return;
    if (isOffline()) { handleOfflineError(showErrorToast); return; }
    setClaimingCredits(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) { showErrorToast('Authentication required. Please log in again.'); return; }
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claim-free-credits`,
        { method: 'POST', headers: { 'Authorization': `Bearer ${session.data.session.access_token}`, 'Content-Type': 'application/json' } }
      );
      if (!response.ok) { const errorText = await response.text(); throw new Error(`API error: ${response.status} - ${errorText}`); }
      const result = await response.json();
      if (result.success) { showSuccessToast('Successfully claimed 300 free credits!'); await refreshBalance(); }
      else { const message = handleApiError(new Error(result.error || 'Failed to claim credits'), { component: 'ProfilePage', action: 'handleClaimFreeCredits' }); showErrorToast(message); }
    } catch (error) {
      const message = handleApiError(error, { component: 'ProfilePage', action: 'handleClaimFreeCredits', userId: user.id });
      ErrorLogger.error(error, { component: 'ProfilePage', action: 'handleClaimFreeCredits', userId: user.id });
      showErrorToast(message);
    } finally { setClaimingCredits(false); }
  };

  const fetchUserData = async () => {
    if (!user) { ErrorLogger.warn('fetchUserData called without user', { component: 'ProfilePage', action: 'fetchUserData' }); return; }
    if (isOffline()) { ErrorLogger.warn('Offline detected, cannot fetch profile', { component: 'ProfilePage', action: 'fetchUserData', userId: user.id }); handleOfflineError(showErrorToast); setLoading(false); return; }
    try {
      setLoading(true);
      ErrorLogger.debug('Starting profile fetch', { component: 'ProfilePage', action: 'fetchUserData', userId: user.id, userEmail: user.email });
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { ErrorLogger.error(new Error('No active session found'), { component: 'ProfilePage', action: 'fetchUserData', step: 'authCheck', userId: user.id }); showErrorToast('You are not authenticated. Please log in again.'); setLoading(false); return; }
      ErrorLogger.debug('Session verified', { component: 'ProfilePage', action: 'fetchUserData', step: 'authCheck', userId: user.id, hasSession: !!session, sessionUserId: session.user?.id });
      const { data: profileData, error: profileError } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
      ErrorLogger.debug('Profile fetch completed', { component: 'ProfilePage', action: 'fetchUserData', step: 'initialFetch', userId: user.id, hasData: !!profileData, hasError: !!profileError, errorCode: profileError?.code, errorMessage: profileError?.message, errorDetails: profileError?.details, errorHint: profileError?.hint });
      if (profileError) {
        if (profileError.code === '42501' || profileError.message?.includes('permission') || profileError.message?.includes('policy') || profileError.message?.includes('Forbidden')) {
          ErrorLogger.error(profileError, { component: 'ProfilePage', action: 'fetchUserData', step: 'fetchProfile', userId: user.id, errorCode: profileError.code, errorMessage: profileError.message, errorDetails: profileError.details, errorHint: profileError.hint, sessionUserId: session.user?.id, userAuthId: user.id });
          showErrorToast('Permission denied: Unable to access profile. Please try logging out and back in, or contact support.');
          setLoading(false);
          return;
        }
        if (profileError.code === 'PGRST116' || profileError.message?.includes('No rows') || profileError.message?.includes('not found')) {
          ErrorLogger.debug('Profile not found (expected) - will create', { component: 'ProfilePage', action: 'fetchUserData', userId: user.id });
        } else {
          ErrorLogger.error(profileError, { component: 'ProfilePage', action: 'fetchUserData', step: 'fetchProfile', userId: user.id, errorCode: profileError.code, errorMessage: profileError.message, errorDetails: profileError.details, errorHint: profileError.hint });
          const message = handleSupabaseError(profileError, { component: 'ProfilePage', action: 'fetchUserData', step: 'fetchProfile' });
          showErrorToast(message);
          setLoading(false);
          return;
        }
      }
      if (!profileData || (profileError && (profileError.code === 'PGRST116' || profileError.message?.includes('No rows')))) {
        ErrorLogger.debug('Profile missing - attempting creation', { component: 'ProfilePage', action: 'fetchUserData', userId: user.id });
        let profileCreated = false;
        let createdProfile: any = null;
        try {
          ErrorLogger.debug('Attempting direct INSERT for profile', { component: 'ProfilePage', action: 'fetchUserData', step: 'directInsert', userId: user.id });
          const profileDataToInsert: any = { id: user.id, email: user.email || null, level: 1, experience_points: 0, study_streak_current: 0, study_streak_longest: 0, items_published_count: 0, total_flashcards_studied: 0, total_quizzes_completed: 0, total_study_time_minutes: 0 };
          const { data: insertData, error: insertError } = await supabase.from('user_profiles').insert(profileDataToInsert).select().single();
          if (!insertError && insertData) { ErrorLogger.info('Profile created via direct INSERT', { component: 'ProfilePage', action: 'fetchUserData', userId: user.id }); profileCreated = true; createdProfile = insertData; }
          else if (insertError) {
            if (insertError.code === '42501' || insertError.message?.includes('permission') || insertError.message?.includes('policy')) { ErrorLogger.debug('Direct INSERT blocked by RLS, trying RPC', { component: 'ProfilePage', action: 'fetchUserData', step: 'directInsert', userId: user.id, error: insertError.message }); }
            else if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
              ErrorLogger.debug('Profile already exists (duplicate key), fetching', { component: 'ProfilePage', action: 'fetchUserData', userId: user.id });
              const { data: existingProfile } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
              if (existingProfile) { profileCreated = true; createdProfile = existingProfile; }
            } else { ErrorLogger.warn('Direct INSERT failed with unexpected error', { component: 'ProfilePage', action: 'fetchUserData', step: 'directInsert', userId: user.id, error: insertError }); }
          }
        } catch (insertErr) { ErrorLogger.debug('Direct INSERT exception, trying RPC', { component: 'ProfilePage', action: 'fetchUserData', step: 'directInsert', userId: user.id, error: insertErr }); }
        if (!profileCreated) {
          try {
            ErrorLogger.debug('Attempting RPC create_missing_profile', { component: 'ProfilePage', action: 'fetchUserData', step: 'rpcCreate', userId: user.id });
            const { data: createResult, error: createError } = await supabase.rpc('create_missing_profile', { p_user_id: user.id, p_email: user.email || null });
            if (createError) {
              ErrorLogger.error(createError, { component: 'ProfilePage', action: 'fetchUserData', step: 'rpcCreate', userId: user.id, errorCode: createError.code, errorMessage: createError.message, errorDetails: createError.details, errorHint: createError.hint });
              if (createError.code === '42501' || createError.message?.includes('permission') || createError.message?.includes('policy')) { showErrorToast('Permission denied: Unable to create profile. This may be a temporary issue. Please try logging out and back in, or contact support if the problem persists.'); }
              else if (createError.code === 'PGRST301' || createError.message?.includes('function') || createError.message?.includes('not found')) { showErrorToast('Profile creation service is unavailable. Please contact support.'); }
              else { showErrorToast(`Failed to create profile: ${createError.message || 'Unknown error'}. Please try again or contact support.`); }
              setLoading(false);
              return;
            }
            let rpcSuccess = false;
            let rpcError: string | null = null;
            if (createResult === null || createResult === undefined) { ErrorLogger.warn('RPC returned null/undefined', { component: 'ProfilePage', action: 'fetchUserData', step: 'rpcParse', userId: user.id }); }
            else if (typeof createResult === 'boolean') { rpcSuccess = createResult; }
            else if (typeof createResult === 'object') {
              if ('success' in createResult) { rpcSuccess = Boolean(createResult.success); if ('error' in createResult && createResult.error) { rpcError = String(createResult.error); } }
              else { rpcSuccess = !('error' in createResult && createResult.error); if ('error' in createResult) { rpcError = String(createResult.error); } }
            }
            if (!rpcSuccess) {
              const errorMsg = rpcError || 'Profile creation failed';
              ErrorLogger.error(new Error(errorMsg), { component: 'ProfilePage', action: 'fetchUserData', step: 'rpcCreate', userId: user.id });
              if (rpcError?.includes('already exists')) {
                const { data: existingProfile } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
                if (existingProfile) { profileCreated = true; createdProfile = existingProfile; }
              } else { showErrorToast(`Failed to create profile: ${errorMsg}. Please contact support.`); setLoading(false); return; }
            } else {
              let retryProfile = null;
              let retryError = null;
              const maxRetries = 3;
              const baseDelay = 500;
              for (let attempt = 0; attempt < maxRetries; attempt++) {
                const delay = baseDelay * Math.pow(2, attempt);
                if (attempt > 0) { ErrorLogger.debug(`Retrying profile fetch (attempt ${attempt + 1}/${maxRetries})`, { component: 'ProfilePage', action: 'fetchUserData', step: 'retryFetchAfterRpc', userId: user.id, attempt, delay }); await new Promise(resolve => setTimeout(resolve, delay)); }
                const { data: fetchedProfile, error: fetchErr } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
                if (fetchErr) { retryError = fetchErr; if (attempt < maxRetries - 1) { continue; } }
                else if (fetchedProfile) { retryProfile = fetchedProfile; retryError = null; break; }
              }
              if (retryError) { ErrorLogger.error(retryError, { component: 'ProfilePage', action: 'fetchUserData', step: 'retryFetchAfterRpc', userId: user.id }); showErrorToast('Profile was created but could not be loaded. Please refresh the page or try again in a moment.'); setLoading(false); return; }
              if (retryProfile) { profileCreated = true; createdProfile = retryProfile; }
              else { ErrorLogger.error(new Error('Profile fetch failed after all retries'), { component: 'ProfilePage', action: 'fetchUserData', step: 'retryFetchAfterRpc', userId: user.id }); showErrorToast('Profile was created but could not be loaded. Please refresh the page.'); setLoading(false); return; }
            }
          } catch (rpcErr) {
            const err = rpcErr instanceof Error ? rpcErr : new Error(String(rpcErr));
            ErrorLogger.error(err, { component: 'ProfilePage', action: 'fetchUserData', step: 'rpcCreate', userId: user.id });
            showErrorToast('Unexpected error creating profile. Please contact support.');
            setLoading(false);
            return;
          }
        }
        if (profileCreated && createdProfile) {
          ErrorLogger.info('Profile created and loaded successfully', { component: 'ProfilePage', action: 'fetchUserData', userId: user.id });
          const profileStats: UserStats = { level: createdProfile.level ?? 1, experience_points: createdProfile.experience_points ?? 0, study_streak_current: createdProfile.study_streak_current ?? 0, study_streak_longest: createdProfile.study_streak_longest ?? 0, items_published_count: createdProfile.items_published_count ?? 0, total_flashcards_studied: createdProfile.total_flashcards_studied ?? 0, total_quizzes_completed: createdProfile.total_quizzes_completed ?? 0, total_study_time_minutes: createdProfile.total_study_time_minutes ?? 0, display_name: createdProfile.display_name, bio: createdProfile.bio, avatar_url: createdProfile.avatar_url };
          setStats(profileStats);
          setEditedName(createdProfile.display_name || '');
          setEditedBio(createdProfile.bio || '');
        } else {
          ErrorLogger.error(new Error('Failed to create profile - both direct INSERT and RPC methods failed'), { component: 'ProfilePage', action: 'fetchUserData', userId: user.id, attemptedMethods: ['directInsert', 'rpcCreate'] });
          showErrorToast('Unable to create your profile. This may be a temporary issue. Please try logging out and back in, or contact support if the problem persists.');
          setLoading(false);
          return;
        }
      } else {
        const profileStats: UserStats = { level: profileData.level ?? 1, experience_points: profileData.experience_points ?? 0, study_streak_current: profileData.study_streak_current ?? 0, study_streak_longest: profileData.study_streak_longest ?? 0, items_published_count: profileData.items_published_count ?? 0, total_flashcards_studied: profileData.total_flashcards_studied ?? 0, total_quizzes_completed: profileData.total_quizzes_completed ?? 0, total_study_time_minutes: profileData.total_study_time_minutes ?? 0, display_name: profileData.display_name, bio: profileData.bio, avatar_url: profileData.avatar_url };
        setStats(profileStats);
        setEditedName(profileData.display_name || '');
        setEditedBio(profileData.bio || '');
      }
      const { data: achievementsData, error: achievementsError } = await supabase.from('user_achievements').select(`earned_at, achievements_definitions ( id, achievement_key, title, description, icon_name, badge_tier, xp_reward, category )`).eq('user_id', user.id).order('earned_at', { ascending: false }).limit(20);
      if (achievementsError) { ErrorLogger.error(achievementsError, { component: 'ProfilePage', action: 'fetchUserData', step: 'fetchAchievements', userId: user.id }); }
      else if (achievementsData) {
        const formattedAchievements = achievementsData.filter(a => a.achievements_definitions).map((a: any) => ({ ...(Array.isArray(a.achievements_definitions) ? a.achievements_definitions[0] : a.achievements_definitions), earned_at: a.earned_at }));
        setAchievements(formattedAchievements);
      }
    } catch (error) {
      const message = handleApiError(error, { component: 'ProfilePage', action: 'fetchUserData', userId: user.id });
      ErrorLogger.error(error, { component: 'ProfilePage', action: 'fetchUserData', userId: user.id });
      showErrorToast(message);
    } finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    if (!user || saving) return;
    if (isOffline()) { handleOfflineError(showErrorToast); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('user_profiles').update({ display_name: editedName.trim() || null, bio: editedBio.trim() || null }).eq('id', user.id);
      if (error) { const message = handleSupabaseError(error, { component: 'ProfilePage', action: 'handleSaveProfile', userId: user.id }); ErrorLogger.error(error, { component: 'ProfilePage', action: 'handleSaveProfile', userId: user.id }); showErrorToast(message); return; }
      setIsEditing(false);
      showSuccessToast('Profile updated successfully');
      await fetchUserData();
    } catch (error) {
      const message = handleApiError(error, { component: 'ProfilePage', action: 'handleSaveProfile', userId: user.id });
      ErrorLogger.error(error, { component: 'ProfilePage', action: 'handleSaveProfile', userId: user.id });
      showErrorToast(message);
    } finally { setSaving(false); }
  };

  const handleSidebarModeChange = async (mode: 'collapsible' | 'pinnable') => {
    if (!user || savingSettings) return;
    if (isOffline()) { handleOfflineError(showErrorToast); return; }
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      await updateSidebarMode(mode);
      setSettingsMessage('Settings saved successfully!');
      showSuccessToast('Settings saved successfully!');
      setTimeout(() => setSettingsMessage(null), 3000);
    } catch (error) {
      const message = handleApiError(error, { component: 'ProfilePage', action: 'handleSidebarModeChange', mode, userId: user.id });
      ErrorLogger.error(error, { component: 'ProfilePage', action: 'handleSidebarModeChange', mode, userId: user.id });
      setSettingsMessage('Failed to save settings. Please try again.');
      showErrorToast(message);
      setTimeout(() => setSettingsMessage(null), 3000);
    } finally { setSavingSettings(false); }
  };

  const calculateLevelProgress = (xp: number) => {
    const currentLevel = Math.floor(Math.sqrt(xp / 100)) + 1;
    const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
    const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
    const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return { currentLevel, progress, xpForNextLevel };
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const tierHexColor: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#9E9E9E',
    gold: '#C9A85C',
    platinum: '#4FC3F7',
    diamond: '#CE93D8',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page-light dark:bg-page-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto"></div>
          <p className="mt-4 text-sm tracking-widest uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <User className="h-16 w-16 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
            <h2 className="font-display text-[20px] text-ink dark:text-ink-on-dark mb-2">{t('profile.load_error') || 'Unable to Load Profile'}</h2>
            <p className="text-secondary-ink dark:text-secondary-ink-on-dark mb-4">We couldn't load your profile data. This might be a temporary issue.</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => { if (user) { ErrorLogger.info('User clicked retry button', { component: 'ProfilePage', action: 'retry', userId: user.id }); setLoading(true); fetchUserData(); } }} disabled={loading} className="px-6 py-3 bg-accent-gold text-white rounded-[var(--s4-radius-card)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium">
              {loading ? 'Loading...' : 'Retry'}
            </button>
            <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mt-4">If this problem persists, please try logging out and back in, or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  const { currentLevel, progress, xpForNextLevel } = calculateLevelProgress(stats.experience_points);

  const toolPlanCap = getToolsCreditsPlanCap(subscription);
  const toolRem = creditBalance?.credits_remaining ?? 0;
  const zegoRem = creditBalance?.zego_credits_remaining ?? 0;
  const zegoTot = creditBalance?.zego_credits_total ?? 0;
  const hasAiAddonProfile = !!subscription && ((subscription.subscription_tier === 'standard' && (subscription.chat_blocks_per_cycle ?? 0) > 0) || (subscription.token_limit ?? 0) > 520000);
  const aiChatCreditsTotalProfile = hasAiAddonProfile && subscription ? (subscription.token_limit && subscription.token_limit > 520000 ? Math.round((subscription.token_limit - 520000) / 1000) : (subscription.chat_blocks_per_cycle ?? 0) * 100) : 0;
  const aiChatCreditsUsedProfile = hasAiAddonProfile && subscription ? Math.round((subscription.tokens_used_current_cycle ?? 0) / 1000) : 0;

  const credits = [
    { label: 'Tools & Services', used: toolRem, total: toolPlanCap, refresh: creditBalance?.cycle_end ? new Date(creditBalance.cycle_end).toLocaleDateString() : '—' },
    { label: 'Study Room (Zego)', used: zegoRem, total: zegoTot, refresh: creditBalance?.cycle_end ? new Date(creditBalance.cycle_end).toLocaleDateString() : '—' },
    ...(hasAiAddonProfile ? [{ label: 'AI Assistant', used: Math.max(0, aiChatCreditsTotalProfile - aiChatCreditsUsedProfile), total: aiChatCreditsTotalProfile, refresh: creditBalance?.cycle_end ? new Date(creditBalance.cycle_end).toLocaleDateString() : '—' }] : []),
  ];

  const statTiles = [
    { label: t('profile.current_streak'), value: stats.study_streak_current.toString(), sub: `${t('profile.best')}: ${stats.study_streak_longest} ${t('profile.days')}` },
    { label: t('profile.items_published'), value: stats.items_published_count.toString(), sub: null },
    { label: t('profile.flashcards_studied'), value: stats.total_flashcards_studied.toLocaleString(), sub: null },
    { label: t('profile.quizzes_completed'), value: stats.total_quizzes_completed.toString(), sub: null },
    { label: t('profile.total_study_time'), value: formatStudyTime(stats.total_study_time_minutes), sub: null },
  ];

  return (
    <div className="w-full min-h-0 p-4 sm:p-6">
      <div className="w-full space-y-1">

        {/* ── Subscription Status Banner ─────────────────────────────── */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-t-[3px] border-t-accent-gold px-5 py-4 flex items-center justify-between mb-1">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-1">{t('profile.subscription_status') || 'Subscription Status'}</div>
              <div className="flex items-center gap-2.5">
                <span className="font-display text-[17px] font-semibold text-ink dark:text-ink-on-dark">
                  {getTierDisplayName()}
                </span>
                {hasActiveSubscription() && (
                  <span className="text-[10px] bg-accent-gold-soft text-accent-gold px-2 py-0.5 font-bold tracking-[1px]">
                    {isTrialUser() ? 'TRIAL' : 'ACTIVE'}
                  </span>
                )}
              </div>
            </div>
            <div className="w-px h-7 bg-divider dark:bg-divider-on-dark" />
            {isPaidUser() && subscription && (
              <div className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                {subscription.auto_renew ? t('profile.renews_on') : t('profile.expires_on')}{' '}
                <span className="text-ink dark:text-ink-on-dark font-semibold">{new Date(subscription.end_date).toLocaleDateString()}</span>
              </div>
            )}
            {isTrialUser() && (
              <div className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                {t('profile.trial_expires', { days: getDaysRemaining() })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!creditBalance?.free_credits_claimed && (
              <button onClick={handleClaimFreeCredits} disabled={claimingCredits} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition">
                <Gift className="h-3.5 w-3.5" />
                {claimingCredits ? t('profile.claiming') : t('profile.claim_free_credits')}
              </button>
            )}
            {hasActiveSubscription() && !isTrialUser() ? (
              <button onClick={() => navigate('/profile/subscription')} className="px-[18px] py-2 bg-ink dark:bg-ink-on-dark text-ink-on-dark dark:text-ink text-xs font-bold border-none hover:opacity-90 transition">
                {t('profile.manage_subscription')}
              </button>
            ) : (
              <button onClick={() => navigate('/pricing')} className="flex items-center gap-1.5 px-[18px] py-2 bg-ink dark:bg-ink-on-dark text-ink-on-dark dark:text-ink text-xs font-bold border-none hover:opacity-90 transition">
                <Crown className="h-3.5 w-3.5" />
                {isTrialUser() ? t('profile.upgrade_plan') : t('profile.subscribe_now')}
              </button>
            )}
          </div>
        </div>

        {/* ── Credits ─────────────────────────────────────────────────── */}
        {creditBalance && (
          <div className="bg-card-dark dark:bg-card-dark border border-divider dark:border-divider-on-dark px-5 py-4 mb-1">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase">Credits</div>
              <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">Tools &amp; services balance · resets on renewal</div>
            </div>
            <div className="flex flex-col gap-3">
              {credits.map((c, i) => {
                const pct = c.total > 0 ? Math.min((c.used / c.total) * 100, 100) : 0;
                const over = c.used > c.total;
                return (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[12.5px] text-secondary-ink dark:text-secondary-ink-on-dark font-medium">{c.label}</span>
                      <span className="font-display text-[13px] font-bold" style={{ color: over ? '#dc2626' : undefined }}>
                        <span className={over ? 'text-red-600' : 'text-ink dark:text-ink-on-dark'}>{c.used.toLocaleString()}</span>
                        {' '}<span className="font-normal text-[11px] text-muted-ink dark:text-muted-ink-on-dark">/ {c.total.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="h-[5px] bg-card-light dark:bg-subtle-on-dark rounded-full">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: over ? '#dc2626' : 'var(--color-accent-gold)' }} />
                    </div>
                    <div className="text-[9.5px] text-muted-ink dark:text-muted-ink-on-dark mt-1">Credits refresh on {c.refresh}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Settings ─────────────────────────────────────────────────── */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-5 py-4 mb-1">
          <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-4">Settings</div>

          {settingsMessage && (
            <div className={`mb-4 p-3 text-sm ${settingsMessage.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
              {settingsMessage}
            </div>
          )}

          {/* Sidebar Behavior */}
          <div className="mb-5">
            <div className="text-[13px] font-semibold text-ink dark:text-ink-on-dark mb-1">Sidebar Behavior</div>
            <div className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark mb-3">Choose how you want the sidebar to behave on desktop</div>
            {[
              { k: 'collapsible' as const, label: 'Auto-collapse Sidebar (Default)', desc: 'The sidebar automatically shows when you move your mouse near the left edge and hides when you move away. Perfect for maximizing screen space.' },
              { k: 'pinnable' as const, label: 'Pin/Unpin Sidebar', desc: 'Manually control the sidebar with a pin button. Click to pin it open or unpin to collapse it.' },
            ].map((opt, i) => {
              const isSelected = preferences?.sidebar_mode === opt.k;
              return (
                <label key={i} className={`flex items-start gap-2.5 px-3.5 py-2.5 border rounded-[6px] mb-2 cursor-pointer transition-colors ${isSelected ? 'border-accent-gold bg-accent-gold-soft/20' : 'border-divider dark:border-divider-on-dark bg-transparent'}`}>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'border-accent-gold' : 'border-divider dark:border-divider-on-dark'}`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />}
                  </div>
                  <div>
                    <input type="radio" name="sidebar_mode" value={opt.k} checked={isSelected} onChange={() => handleSidebarModeChange(opt.k)} disabled={savingSettings} className="sr-only" />
                    <div className={`text-[12.5px] ${isSelected ? 'font-semibold' : 'font-normal'} text-ink dark:text-ink-on-dark mb-0.5`}>{opt.label}</div>
                    {isSelected && <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark leading-relaxed">{opt.desc}</div>}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Navigation Voice */}
          <div className="flex justify-between items-center mb-5 pb-5 border-b border-divider dark:border-divider-on-dark">
            <div>
              <div className="text-[13px] font-semibold text-ink dark:text-ink-on-dark mb-0.5">{t('profile.tts_hover_label')}</div>
              <div className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{t('profile.tts_hover_desc')}</div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={preferences?.tts_hover_enabled !== false} onChange={(e) => updateTtsHoverEnabled(e.target.checked)} />
                <div className={`w-10 h-[22px] rounded-full transition-colors ${preferences?.tts_hover_enabled !== false ? 'bg-accent-gold/30' : 'bg-subtle dark:bg-subtle-on-dark'}`} />
                <div className={`absolute top-[3px] left-[3px] w-4 h-4 bg-card-light dark:bg-card-dark rounded-full shadow transition-transform ${preferences?.tts_hover_enabled !== false ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </div>
              <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">
                {preferences?.tts_hover_enabled !== false ? t('subscription_management.enabled') : t('subscription_management.disabled')}
              </span>
            </label>
          </div>

          {/* Color Theme */}
          <div>
            <div className="text-[13px] font-semibold text-ink dark:text-ink-on-dark mb-1">{t('profile.theme_picker_title')}</div>
            <div className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark mb-3">{t('profile.theme_picker_desc')}</div>
            <div className="grid grid-cols-3 gap-2.5">
              {VALID_COLOR_THEMES.map((theme) => {
                const isSelected = currentTheme === theme;
                const themeDef = themeDefinitions[theme];
                const bgGradient = darkMode === 'dark' ? themeDef.background.dark.gradient : themeDef.background.light.gradient;
                const uiGradient = darkMode === 'dark' ? themeDef.ui.dark.gradient : themeDef.ui.light.gradient;
                return (
                  <button
                    key={theme}
                    onClick={async () => {
                      if (savingSettings || isSelected) return;
                      setSavingSettings(true);
                      setSettingsMessage(null);
                      try {
                        await setTheme(theme, async () => { await updateColorTheme(theme); });
                        setSettingsMessage('Theme updated successfully!');
                        showSuccessToast('Theme updated successfully!');
                        setTimeout(() => setSettingsMessage(null), 3000);
                      } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        if (errorMessage.includes('Please wait')) { setSettingsMessage(errorMessage); showErrorToast(errorMessage); setTimeout(() => setSettingsMessage(null), 5000); }
                        else { handleApiError(error, { component: 'ProfilePage', action: 'handleThemeChange', theme, userId: user?.id }); ErrorLogger.error(error, { component: 'ProfilePage', action: 'handleThemeChange', theme, userId: user?.id }); setSettingsMessage('Failed to update theme. Please try again.'); setTimeout(() => setSettingsMessage(null), 3000); }
                      } finally { setSavingSettings(false); }
                    }}
                    disabled={savingSettings}
                    className={`relative border-2 rounded-[8px] p-2.5 cursor-pointer transition-[border-color,background] ${isSelected ? 'border-ink dark:border-ink-on-dark bg-card-dark dark:bg-subtle' : 'border-divider dark:border-divider-on-dark bg-transparent hover:border-ink/40'} ${savingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-ink dark:bg-ink-on-dark grid place-items-center">
                        <svg className="w-[9px] h-[9px] text-ink-on-dark dark:text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                    <div className={`h-10 rounded bg-gradient-to-br ${bgGradient} flex items-center justify-center mb-1.5`}>
                      <div className={`h-5 w-full rounded-sm bg-gradient-to-r ${uiGradient}`} />
                    </div>
                    <div className={`text-[10.5px] text-center ${isSelected ? 'font-semibold' : 'font-normal'} text-ink dark:text-ink-on-dark`}>
                      {t(`profile.theme_${theme.replace(/-/g, '_')}`)}
                    </div>
                    {theme === 'navy-gold' && <div className="text-[9px] text-accent-gold text-center mt-0.5">{t('profile.theme_default_badge')}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Profile Header ───────────────────────────────────────────── */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-5 py-4 mb-1">
          <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-accent-gold flex items-center justify-center font-display text-2xl font-bold text-ink dark:text-ink-on-dark">
                {(stats.display_name || user?.email)?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -left-1 bg-ink dark:bg-ink-on-dark text-ink-on-dark dark:text-ink text-[8px] font-bold px-1.5 py-0.5 rounded">Lv {currentLevel}</div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} placeholder={t('profile.display_name')} maxLength={50} className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark rounded focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-ink-on-dark text-sm" />
                  <textarea value={editedBio} onChange={(e) => setEditedBio(e.target.value)} placeholder={t('profile.bio_placeholder')} maxLength={500} rows={2} className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark rounded focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-ink-on-dark text-sm" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h1 className="font-display text-[18px] font-semibold text-ink dark:text-ink-on-dark truncate">{stats.display_name || user?.email}</h1>
                    <button onClick={() => setIsEditing(true)} className="shrink-0 px-2 py-0.5 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[10px] hover:border-ink dark:hover:border-ink-on-dark transition rounded-[3px]">Edit ✎</button>
                  </div>
                  {stats.bio && <p className="text-[12px] text-secondary-ink dark:text-muted-ink-on-dark mt-0.5 mb-1">{stats.bio}</p>}
                </>
              )}

              {/* Username & ID */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {username && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">#</span>
                    <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark font-mono">@{username}</span>
                    <button onClick={() => handleCopyField(`@${username}`, 'username')} className="p-0.5 text-muted-ink dark:text-muted-ink-on-dark hover:text-accent-gold">
                      {copiedField === 'username' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                    <button onClick={() => setShowUsernameModal(true)} className="text-[10px] text-accent-gold hover:underline ml-1">{t('social.change_username')}</button>
                  </div>
                )}
                {publicUserId && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-muted-ink dark:text-muted-ink-on-dark" />
                    <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark font-mono">{publicUserId}</span>
                    <span className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark">({t('social.your_id')})</span>
                    <button onClick={() => handleCopyField(publicUserId, 'user-id')} className="p-0.5 text-muted-ink dark:text-muted-ink-on-dark hover:text-accent-gold">
                      {copiedField === 'user-id' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* XP bar */}
              <div className="mt-2.5">
                <div className="flex justify-between text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-1">
                  <span>{t('profile.level')} {currentLevel}</span>
                  <span>{stats.experience_points} / {xpForNextLevel} {t('profile.xp')}</span>
                </div>
                <div className="h-1.5 bg-card-dark dark:bg-subtle-on-dark rounded-full">
                  <div className="h-full bg-accent-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
            {/* Save/Cancel when editing */}
            {isEditing && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={handleSaveProfile} disabled={saving} className="p-1.5 bg-ink dark:bg-ink-on-dark text-ink-on-dark dark:text-ink rounded hover:opacity-90 disabled:opacity-50" title="Save">
                  <Save className="h-4 w-4" />
                </button>
                <button onClick={() => { setIsEditing(false); setEditedName(stats.display_name || ''); setEditedBio(stats.bio || ''); }} className="p-1.5 bg-subtle dark:bg-subtle-on-dark text-secondary-ink dark:text-muted-ink-on-dark rounded hover:opacity-90" title="Cancel">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-1">
          {statTiles.map((s, i) => (
            <div key={i} className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-3.5 py-3 flex flex-col">
              <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-1.5">{s.label}</div>
              <div className="font-display text-[22px] font-bold text-ink dark:text-ink-on-dark leading-none">{s.value}</div>
              {s.sub && <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mt-1">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* ── Recent Achievements ──────────────────────────────────────── */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase">
              Recent Achievements ({achievements.filter(a => a.earned_at).length})
            </div>
            <button onClick={() => navigate('/achievements')} className="px-2.5 py-1 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[10px] hover:border-ink dark:hover:border-ink-on-dark transition rounded-[3px]">
              View all →
            </button>
          </div>
          {achievements.length === 0 ? (
            <div className="text-center py-10">
              <Award className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-3" />
              <p className="text-secondary-ink dark:text-muted-ink">{t('profile.no_achievements')}</p>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mt-1">{t('profile.start_studying')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {achievements.map((achievement) => {
                const tierColor = tierHexColor[achievement.badge_tier] || '#9E9E9E';
                const isEarned = !!achievement.earned_at;
                return (
                  <div
                    key={achievement.id}
                    className="border text-center py-3 px-2.5 transition-opacity"
                    style={{
                      borderColor: isEarned ? `${tierColor}44` : undefined,
                      borderTopWidth: isEarned ? 2 : 1,
                      borderTopColor: isEarned ? tierColor : undefined,
                      background: isEarned ? 'var(--color-bg-card-dark, #f5f5f5)' : 'transparent',
                      opacity: isEarned ? 1 : 0.45,
                    }}
                  >
                    <div className="text-[22px] mb-1.5" style={{ color: isEarned ? tierColor : undefined }}>
                      <Award className="h-6 w-6 mx-auto" style={{ color: isEarned ? tierColor : 'var(--color-text-muted-ink)' }} />
                    </div>
                    <div className="font-display text-[11px] font-semibold text-ink dark:text-ink-on-dark mb-0.5 leading-snug">{achievement.title}</div>
                    <div className="text-[8px] tracking-[1px] font-bold mb-1" style={{ color: tierColor }}>{achievement.badge_tier.toUpperCase()}</div>
                    <div className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark">
                      {isEarned ? `Earned ${formatDate(achievement.earned_at!)} · +${achievement.xp_reward} XP` : achievement.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Profile Tutorial */}
      {tutorialConfig && (
        <PageTutorial config={tutorialConfig} isOpen={isTutorialOpen} onClose={() => {}} onComplete={completeTutorial} onSkip={skipTutorial} />
      )}

      <UsernameSetupModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onComplete={(newUsername) => { setUsername(newUsername); setUsernameChangedAt(new Date().toISOString()); setShowUsernameModal(false); }}
      />
    </div>
  );
});
