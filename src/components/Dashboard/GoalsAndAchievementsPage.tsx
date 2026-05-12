import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle, Trash2, Award, Lock, Star, Users, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { useConfirm } from '../../hooks/useConfirm';
import { SectionTabs } from '../Scholar';

interface StudyGoal {
  id: string;
  goal_type: string;
  goal_title: string;
  goal_description: string;
  target_value: number;
  current_value: number;
  deadline_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface AchievementDefinition {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  icon_name: string;
  badge_tier: string;
  xp_reward: number;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
  progress_value: number;
}

export const GoalsAndAchievementsPage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { confirm, ConfirmModal } = useConfirm();
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements'>('goals');

  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [allAchievements, setAllAchievements] = useState<AchievementDefinition[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [goalType, setGoalType] = useState<string>('daily_study_time');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetValue, setTargetValue] = useState(10);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) { fetchData(); }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    if (isOffline()) { handleOfflineError(showErrorToast); setLoading(false); return; }
    try {
      setLoading(true);
      const [goalsRes, achievementsRes, userAchievementsRes] = await Promise.all([
        supabase.from('study_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('achievements_definitions').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('user_achievements').select('achievement_id, earned_at, progress_value').eq('user_id', user.id)
      ]);
      if (goalsRes.error) { const message = handleSupabaseError(goalsRes.error, { component: 'GoalsAndAchievementsPage', action: 'fetchData', step: 'fetchGoals' }); ErrorLogger.error(goalsRes.error, { component: 'GoalsAndAchievementsPage', action: 'fetchData', step: 'fetchGoals', userId: user.id }); showErrorToast(message); }
      else if (goalsRes.data) { setGoals(goalsRes.data); }
      if (achievementsRes.error) { ErrorLogger.error(achievementsRes.error, { component: 'GoalsAndAchievementsPage', action: 'fetchData', step: 'fetchAchievements', userId: user.id }); }
      else if (achievementsRes.data) { setAllAchievements(achievementsRes.data); }
      if (userAchievementsRes.error) { ErrorLogger.error(userAchievementsRes.error, { component: 'GoalsAndAchievementsPage', action: 'fetchData', step: 'fetchUserAchievements', userId: user.id }); }
      else if (userAchievementsRes.data) { setUserAchievements(userAchievementsRes.data); }
    } catch (error) {
      const message = handleApiError(error, { component: 'GoalsAndAchievementsPage', action: 'fetchData', userId: user.id });
      ErrorLogger.error(error, { component: 'GoalsAndAchievementsPage', action: 'fetchData', userId: user.id });
      showErrorToast(message);
    } finally { setLoading(false); }
  };

  const handleCreateGoal = async () => {
    if (!user || !goalTitle.trim()) return;
    if (isOffline()) { handleOfflineError(showErrorToast); return; }
    setCreating(true);
    try {
      const { error } = await supabase.from('study_goals').insert({ user_id: user.id, goal_type: goalType, goal_title: goalTitle.trim(), goal_description: goalDescription.trim() || null, target_value: targetValue, deadline_date: deadlineDate || null });
      if (error) { const message = handleSupabaseError(error, { component: 'GoalsAndAchievementsPage', action: 'handleCreateGoal', userId: user.id }); ErrorLogger.error(error, { component: 'GoalsAndAchievementsPage', action: 'handleCreateGoal', userId: user.id }); showErrorToast(message || t('goals.create_failed')); return; }
      setGoalTitle(''); setGoalDescription(''); setTargetValue(10); setDeadlineDate(''); setShowCreateModal(false);
      await fetchData();
      showSuccessToast(t('goals.goal_created'));
    } catch (error) {
      const message = handleApiError(error, { component: 'GoalsAndAchievementsPage', action: 'handleCreateGoal', userId: user.id });
      ErrorLogger.error(error, { component: 'GoalsAndAchievementsPage', action: 'handleCreateGoal', userId: user.id });
      showErrorToast(message || t('goals.create_failed'));
    } finally { setCreating(false); }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const confirmed = await confirm(t('goals.confirm_delete'), { title: t('goals.confirm_delete_title') || 'Delete Goal', variant: 'destructive', confirmText: t('goals.delete') || 'Delete' });
    if (!confirmed) return;
    if (isOffline()) { handleOfflineError(showErrorToast); return; }
    try {
      const { error } = await supabase.from('study_goals').delete().eq('id', goalId);
      if (error) { const message = handleSupabaseError(error, { component: 'GoalsAndAchievementsPage', action: 'handleDeleteGoal', goalId, userId: user?.id }); ErrorLogger.error(error, { component: 'GoalsAndAchievementsPage', action: 'handleDeleteGoal', goalId, userId: user?.id }); showErrorToast(message); return; }
      await fetchData();
      showSuccessToast(t('goals.goal_deleted') || 'Goal deleted successfully');
    } catch (error) {
      const message = handleApiError(error, { component: 'GoalsAndAchievementsPage', action: 'handleDeleteGoal', goalId, userId: user?.id });
      ErrorLogger.error(error, { component: 'GoalsAndAchievementsPage', action: 'handleDeleteGoal', goalId, userId: user?.id });
      showErrorToast(message);
    }
  };

  const handleMarkComplete = async (goalId: string) => {
    if (isOffline()) { handleOfflineError(showErrorToast); return; }
    try {
      const { error } = await supabase.from('study_goals').update({ is_completed: true, completed_at: new Date().toISOString() }).eq('id', goalId);
      if (error) { const message = handleSupabaseError(error, { component: 'GoalsAndAchievementsPage', action: 'handleMarkComplete', goalId, userId: user?.id }); ErrorLogger.error(error, { component: 'GoalsAndAchievementsPage', action: 'handleMarkComplete', goalId, userId: user?.id }); showErrorToast(message); return; }
      await fetchData();
      showSuccessToast(t('goals.goal_completed') || 'Goal marked as complete!');
    } catch (error) {
      const message = handleApiError(error, { component: 'GoalsAndAchievementsPage', action: 'handleMarkComplete', goalId, userId: user?.id });
      ErrorLogger.error(error, { component: 'GoalsAndAchievementsPage', action: 'handleMarkComplete', goalId, userId: user?.id });
      showErrorToast(message);
    }
  };

  const calculateProgress = (current: number, target: number) => Math.min((current / target) * 100, 100);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isAchievementUnlocked = (achievementId: string) => userAchievements.some(ua => ua.achievement_id === achievementId);
  const getEarnedDate = (achievementId: string) => userAchievements.find(ua => ua.achievement_id === achievementId)?.earned_at;

  const getBadgeColor = (tier: string) => {
    const colors: Record<string, string> = { bronze: 'from-amber-600 to-amber-800', silver: 'from-gray-400 to-gray-600', gold: 'from-yellow-400 to-yellow-600', platinum: 'from-cyan-400 to-cyan-600', diamond: 'from-purple-400 to-purple-600' };
    return colors[tier] || 'from-gray-400 to-gray-600';
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);
  const filteredAchievements = selectedCategory === 'all' ? allAchievements : allAchievements.filter(a => a.category === selectedCategory);
  const earnedCount = allAchievements.filter(a => isAchievementUnlocked(a.id)).length;
  const totalXPEarned = allAchievements.filter(a => isAchievementUnlocked(a.id)).reduce((sum, a) => sum + a.xp_reward, 0);

  const categories = [
    { id: 'all', label: t('achievements.all'), icon: <Award className="h-4 w-4" /> },
    { id: 'study', label: t('achievements.category_study'), icon: <BookOpen className="h-4 w-4" /> },
    { id: 'social', label: t('achievements.category_social'), icon: <Users className="h-4 w-4" /> },
    { id: 'achievement', label: t('achievements.category_achievement'), icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'special', label: t('achievements.category_special'), icon: <Star className="h-4 w-4" /> }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto"></div>
          <p className="mt-4 text-ink dark:text-ink-on-dark">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = { on_track: 'var(--color-accent-gold)', behind: '#dc2626', complete: 'var(--color-accent-gold)' };
  const statusLabel: Record<string, string> = { on_track: 'On track', behind: 'Behind', complete: 'Complete' };

  const getGoalStatus = (goal: StudyGoal): 'on_track' | 'behind' | 'complete' => {
    if (goal.is_completed) return 'complete';
    if (goal.deadline_date && new Date(goal.deadline_date) < new Date()) return 'behind';
    return 'on_track';
  };

  return (
    <>
    <div className="min-h-screen bg-page-light dark:bg-page-dark p-6">
      <div className="max-w-7xl mx-auto space-y-0">

        {/* ── v4 Header ─────────────────────────────────────────────── */}
        <div className="mb-0">
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase">{t('goals.eyebrow')}</div>
          <div className="flex justify-between items-end">
            <h1 className="font-display text-[38px] font-semibold text-ink dark:text-ink-on-dark mt-1.5 mb-1 tracking-[-0.8px]">
              {activeTab === 'goals' ? (t('sidebar.goals_achievements') || "This Week's Targets.") : (t('achievements.title') || 'Your Badges.')}
            </h1>
            {activeTab === 'goals' && (
              <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-ink dark:bg-ink-on-dark text-ink-on-dark dark:text-ink text-xs font-semibold border-none hover:opacity-90 transition">
                + {t('goals.new_goal')}
              </button>
            )}
          </div>
          <div className="h-px bg-ink dark:bg-ink-on-dark mt-3 mb-5 opacity-80" />
        </div>

        <SectionTabs
          tabs={[
            { id: 'goals', label: t('achievements.goals_tab') },
            { id: 'achievements', label: t('achievements.achievements_tab') },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as 'goals' | 'achievements')}
        />

        {activeTab === 'goals' ? (
          <div className="mt-5">
            {/* Ink strip — 3 stat rings (simplified as number tiles for prod) */}
            <div className="bg-ink dark:bg-card-dark px-8 py-5 mb-6 flex justify-around items-center gap-4">
              {[
                { label: 'Active Goals', value: activeGoals.length.toString() },
                { label: 'Completed', value: completedGoals.length.toString() },
                { label: 'Total Goals', value: goals.length.toString() },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="font-display text-[42px] font-bold text-card-light dark:text-ink leading-none">{s.value}</div>
                  <div className="text-[10px] text-muted-ink-on-dark dark:text-muted-ink uppercase tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Two-column layout: goal cards + right rail */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5">
              {/* Goal cards */}
              <div>
                {activeGoals.length > 0 && (
                  <div className="mb-5">
                    <div className="text-[11px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-3">{t('goals.active_goals')}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeGoals.map((goal) => {
                        const progress = calculateProgress(goal.current_value, goal.target_value);
                        const status = getGoalStatus(goal);
                        const color = statusColor[status];
                        return (
                          <div key={goal.id} className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-4 py-3.5" style={{ borderLeft: `3px solid ${color}` }}>
                            <div className="flex justify-between items-start mb-2.5">
                              <div className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark leading-snug flex-1 pr-2">{goal.goal_title}</div>
                              <span className="text-[8px] tracking-[1.5px] font-bold uppercase shrink-0 px-1.5 py-0.5" style={{ color, background: `${color}15` }}>{statusLabel[status]}</span>
                            </div>
                            {goal.goal_description && <p className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark mb-2">{goal.goal_description}</p>}
                            <div className="h-1 bg-subtle dark:bg-subtle-on-dark rounded-full mb-2">
                              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: color }} />
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">Due {formatDate(goal.deadline_date)}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">
                                  {goal.is_completed ? '✓ Done' : `${goal.current_value} / ${goal.target_value}`}
                                </span>
                                {progress >= 100 && !goal.is_completed && (
                                  <button onClick={() => handleMarkComplete(goal.id)} className="p-0.5 text-emerald-600 hover:text-emerald-700" title="Mark complete">
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                )}
                                <button onClick={() => handleDeleteGoal(goal.id)} className="p-0.5 text-muted-ink dark:text-muted-ink-on-dark hover:text-red-600" title="Delete">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {completedGoals.length > 0 && (
                  <div className="mb-5">
                    <div className="text-[11px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-3">{t('goals.completed_goals')}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {completedGoals.map((goal) => (
                        <div key={goal.id} className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-4 py-3.5 opacity-70" style={{ borderLeft: `3px solid var(--color-accent-gold)` }}>
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark leading-snug flex-1 pr-2">{goal.goal_title}</div>
                            <button onClick={() => handleDeleteGoal(goal.id)} className="p-0.5 text-muted-ink dark:text-muted-ink-on-dark hover:text-red-600 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                          <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">{t('goals.completed_on')} {formatDate(goal.completed_at)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {goals.length === 0 && !loading && (
                  <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-12 text-center">
                    <Target className="h-16 w-16 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
                    <p className="text-secondary-ink dark:text-muted-ink mb-2">{t('goals.no_goals_yet')}</p>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-4">{t('goals.create_first_goal')}</p>
                    <button onClick={() => setShowCreateModal(true)} className="px-6 py-2 bg-ink dark:bg-ink-on-dark text-ink-on-dark dark:text-ink text-xs font-semibold hover:opacity-90 transition">
                      {t('goals.create_goal')}
                    </button>
                  </div>
                )}
              </div>

              {/* Right rail */}
              <div className="flex flex-col gap-4">
                {completedGoals.length > 0 && (
                  <div className="bg-card-dark dark:bg-card-dark border border-divider dark:border-divider-on-dark border-t-[3px] border-t-accent-gold px-4 py-4">
                    <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-3">Completed This Month</div>
                    {completedGoals.slice(0, 4).map((c, i) => (
                      <div key={i} className={`flex justify-between py-1.5 ${i < completedGoals.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''} items-center`}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-accent-gold-soft border border-accent-gold grid place-items-center text-[8px] text-accent-gold">✓</div>
                          <span className="text-[11.5px] text-secondary-ink dark:text-muted-ink-on-dark">{c.goal_title}</span>
                        </div>
                        <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">{formatDate(c.completed_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-4 py-4">
                  <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2.5">Goal Types</div>
                  {[['Daily Study Time', activeGoals.filter(g => g.goal_type === 'daily_study_time').length], ['Weekly Flashcards', activeGoals.filter(g => g.goal_type === 'weekly_flashcards').length], ['Quiz Streak', activeGoals.filter(g => g.goal_type === 'quiz_streak').length], ['Items Published', activeGoals.filter(g => g.goal_type === 'items_published').length], ['Custom', activeGoals.filter(g => g.goal_type === 'custom').length]].map(([l, v], i) => (
                    <div key={i} className="flex justify-between py-1.5">
                      <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{l}</span>
                      <span className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark">{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowCreateModal(true)} className="py-3 bg-transparent border border-dashed border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-xs text-center cursor-pointer hover:border-ink dark:hover:border-ink-on-dark transition">
                  + Add a new goal
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Achievements Tab ─────────────────────────────────────── */
          <div className="mt-5">
            {/* Header stats */}
            <div className="flex justify-between items-end mb-5">
              <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">{earnedCount} earned · {allAchievements.length - earnedCount} locked</p>
              <div className="text-right">
                <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-1">Scholar — Level 4</div>
                <div className="w-[200px] h-[5px] bg-card-dark dark:bg-subtle-on-dark rounded-full mb-1">
                  <div className="h-full bg-accent-gold rounded-full" style={{ width: '68%' }} />
                </div>
                <div className="font-display text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{totalXPEarned} XP · 680 to Level 5</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
              <div>
                {/* Category filter tabs */}
                <div className="flex gap-0 mb-4 border-b border-divider dark:border-divider-on-dark">
                  {categories.map(c => {
                    const on = selectedCategory === c.id;
                    return (
                      <button key={c.id} onClick={() => setSelectedCategory(c.id)} className="bg-transparent border-none px-3.5 py-1.5 pb-2 cursor-pointer text-xs font-medium capitalize transition-colors" style={{ color: on ? 'var(--color-text-ink)' : 'var(--color-text-muted-ink)', borderBottom: on ? '2px solid var(--color-accent-gold)' : '2px solid transparent', marginBottom: -1 }}>
                        {c.label}
                      </button>
                    );
                  })}
                </div>

                {/* Badge grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {filteredAchievements.map((achievement) => {
                    const isUnlocked = isAchievementUnlocked(achievement.id);
                    const earnedDate = getEarnedDate(achievement.id);
                    return (
                      <div key={achievement.id} className={`border border-divider dark:border-divider-on-dark px-3 py-3.5 text-center transition-opacity ${isUnlocked ? 'bg-card-dark dark:bg-subtle' : 'bg-card-light dark:bg-card-dark opacity-45'}`}>
                        <div className={`p-2 rounded mx-auto w-10 h-10 flex items-center justify-center mb-2 ${isUnlocked ? `bg-gradient-to-br ${getBadgeColor(achievement.badge_tier)}` : 'bg-subtle dark:bg-card-dark'}`}>
                          {isUnlocked ? <Award className="h-6 w-6 text-ink-on-dark" /> : <Lock className="h-6 w-6 text-muted-ink dark:text-muted-ink-on-dark" />}
                        </div>
                        <div className="font-display text-[11px] font-semibold text-ink dark:text-ink-on-dark mb-1 leading-snug">{achievement.title}</div>
                        <div className="text-[9.5px] text-muted-ink dark:text-muted-ink-on-dark leading-snug mb-1.5">{achievement.description}</div>
                        <div className={`text-[8px] tracking-wide font-bold px-1.5 py-0.5 mb-1 inline-block ${
                          achievement.badge_tier === 'bronze' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                          : achievement.badge_tier === 'gold' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : achievement.badge_tier === 'platinum' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300'
                          : achievement.badge_tier === 'diamond' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                          : 'bg-subtle dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark'
                        }`}>{achievement.badge_tier.toUpperCase()}</div>
                        {isUnlocked && earnedDate
                          ? <div className="text-[9px] text-accent-gold font-semibold">Earned {formatDate(earnedDate)}</div>
                          : <div className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark italic">{t('achievements.locked')}</div>
                        }
                      </div>
                    );
                  })}
                </div>

                {filteredAchievements.length === 0 && (
                  <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-12 text-center">
                    <Award className="h-16 w-16 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
                    <p className="text-secondary-ink dark:text-muted-ink">{t('achievements.no_achievements')}</p>
                  </div>
                )}
              </div>

              {/* Right rail */}
              <div className="flex flex-col gap-4">
                {/* XP total dark tile */}
                <div className="bg-ink dark:bg-card-dark px-[18px] py-5 text-center">
                  <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">Total XP</div>
                  <div className="font-display text-[46px] font-bold text-card-light dark:text-ink leading-none">{totalXPEarned}</div>
                  <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mt-1.5">Scholar · Level 4</div>
                  <div className="h-[3px] bg-white/10 dark:bg-white/5 rounded-full mt-3 mb-1">
                    <div className="h-full bg-accent-gold rounded-full" style={{ width: '68%' }} />
                  </div>
                  <div className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark">68% to Level 5</div>
                </div>

                {/* Stats by category */}
                <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-4 py-4">
                  <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-2.5">By Category</div>
                  {categories.filter(c => c.id !== 'all').map(c => {
                    const total = allAchievements.filter(b => b.category === c.id).length;
                    const got = allAchievements.filter(b => b.category === c.id && isAchievementUnlocked(b.id)).length;
                    return (
                      <div key={c.id} className="flex justify-between py-1.5">
                        <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark capitalize">{c.label}</span>
                        <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">{got}/{total}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Overall stats */}
                <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-4 py-4">
                  <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2.5">Overall</div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">Unlocked</span>
                    <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">{earnedCount}/{allAchievements.length}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">Total XP earned</span>
                    <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">{totalXPEarned}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">Completion</span>
                    <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">{allAchievements.length > 0 ? Math.round((earnedCount / allAchievements.length) * 100) : 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Goal Modal ──────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark shadow-[0_24px_56px_rgba(0,0,0,0.3)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Dark header */}
            <div className="bg-ink dark:bg-card-dark px-6 py-5">
              <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-2">Goals · New</div>
              <div className="flex justify-between items-center">
                <div className="font-display text-[20px] font-semibold text-card-light dark:text-ink">{t('goals.create_new_goal')}</div>
                <button onClick={() => setShowCreateModal(false)} className="w-6 h-6 grid place-items-center border border-white/20 text-white/50 hover:text-white/80 transition text-sm cursor-pointer">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">{t('goals.goal_type')}</label>
                <select value={goalType} onChange={(e) => setGoalType(e.target.value)} className="w-full px-3 py-2.5 border border-divider dark:border-divider-on-dark focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-ink-on-dark text-sm">
                  <option value="daily_study_time">{t('goals.type_daily_study_time')}</option>
                  <option value="weekly_flashcards">{t('goals.type_weekly_flashcards')}</option>
                  <option value="quiz_streak">{t('goals.type_quiz_streak')}</option>
                  <option value="items_published">{t('goals.type_items_published')}</option>
                  <option value="custom">{t('goals.type_custom')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">{t('goals.goal_title')}</label>
                <input type="text" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} placeholder={t('goals.goal_title_placeholder')} maxLength={200} className="w-full px-3 py-2.5 border border-divider dark:border-divider-on-dark focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-ink-on-dark text-sm" />
              </div>
              <div>
                <label className="block text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">{t('goals.goal_description')}</label>
                <textarea value={goalDescription} onChange={(e) => setGoalDescription(e.target.value)} placeholder={t('goals.description_placeholder')} maxLength={1000} rows={3} className="w-full px-3 py-2.5 border border-divider dark:border-divider-on-dark focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-ink-on-dark text-sm" />
              </div>
              <div>
                <label className="block text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">{t('goals.target_value')}</label>
                <input type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} min="1" max="10000" className="w-full px-3 py-2.5 border border-divider dark:border-divider-on-dark focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-ink-on-dark text-sm" />
                <p className="text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark mt-1">{t('goals.target_value_help')}</p>
              </div>
              <div>
                <label className="block text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">{t('goals.deadline_optional')}</label>
                <input type="date" value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2.5 border border-divider dark:border-divider-on-dark focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-ink-on-dark text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-sm hover:bg-subtle dark:hover:bg-subtle-on-dark transition">
                  {t('common.cancel')}
                </button>
                <button onClick={handleCreateGoal} disabled={creating || !goalTitle.trim()} className="flex-1 px-4 py-2.5 bg-ink dark:bg-ink-on-dark text-ink-on-dark dark:text-ink text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  {creating ? t('goals.creating') : t('goals.create_goal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {ConfirmModal}
    </div>
    </>
  );
});
