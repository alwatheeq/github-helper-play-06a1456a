import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Clock, Trash2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { useConfirm } from '../../hooks/useConfirm';

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

export const StudyGoalsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { confirm, ConfirmModal } = useConfirm();
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [goalType, setGoalType] = useState<string>('daily_study_time');
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetValue, setTargetValue] = useState(10);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'StudyGoalsPage', 
          action: 'fetchGoals',
          userId: user.id
        });
        ErrorLogger.error(error, { 
          component: 'StudyGoalsPage', 
          action: 'fetchGoals',
          userId: user.id
        });
        showErrorToast(message);
        return;
      }

      if (data) {
        setGoals(data);
      }
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'StudyGoalsPage', 
        action: 'fetchGoals',
        userId: user.id
      });
      ErrorLogger.error(error, { 
        component: 'StudyGoalsPage', 
        action: 'fetchGoals',
        userId: user.id
      });
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!user || !goalTitle.trim()) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase
        .from('study_goals')
        .insert({
          user_id: user.id,
          goal_type: goalType,
          goal_title: goalTitle.trim(),
          goal_description: goalDescription.trim() || null,
          target_value: targetValue,
          deadline_date: deadlineDate || null
        });

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'StudyGoalsPage', 
          action: 'handleCreateGoal',
          userId: user.id
        });
        ErrorLogger.error(error, { 
          component: 'StudyGoalsPage', 
          action: 'handleCreateGoal',
          userId: user.id
        });
        showErrorToast(message || t('goals.create_failed'));
        return;
      }

      setGoalTitle('');
      setGoalDescription('');
      setTargetValue(10);
      setDeadlineDate('');
      setShowCreateModal(false);
      await fetchGoals();
      showSuccessToast(t('goals.goal_created'));
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'StudyGoalsPage', 
        action: 'handleCreateGoal',
        userId: user.id
      });
      ErrorLogger.error(error, { 
        component: 'StudyGoalsPage', 
        action: 'handleCreateGoal',
        userId: user.id
      });
      showErrorToast(message || t('goals.create_failed'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const confirmed = await confirm(t('goals.confirm_delete'), {
      title: t('goals.confirm_delete_title') || 'Delete Goal',
      variant: 'destructive',
      confirmText: t('goals.delete') || 'Delete',
    });
    if (!confirmed) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { error } = await supabase
        .from('study_goals')
        .delete()
        .eq('id', goalId);

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'StudyGoalsPage', 
          action: 'handleDeleteGoal',
          goalId,
          userId: user?.id
        });
        ErrorLogger.error(error, { 
          component: 'StudyGoalsPage', 
          action: 'handleDeleteGoal',
          goalId,
          userId: user?.id
        });
        showErrorToast(message);
        return;
      }

      await fetchGoals();
      showSuccessToast(t('goals.goal_deleted') || 'Goal deleted successfully');
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'StudyGoalsPage', 
        action: 'handleDeleteGoal',
        goalId,
        userId: user?.id
      });
      ErrorLogger.error(error, { 
        component: 'StudyGoalsPage', 
        action: 'handleDeleteGoal',
        goalId,
        userId: user?.id
      });
      showErrorToast(message);
    }
  };

  const handleMarkComplete = async (goalId: string) => {
    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { error } = await supabase
        .from('study_goals')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) {
        const message = handleSupabaseError(error, { 
          component: 'StudyGoalsPage', 
          action: 'handleMarkComplete',
          goalId,
          userId: user?.id
        });
        ErrorLogger.error(error, { 
          component: 'StudyGoalsPage', 
          action: 'handleMarkComplete',
          goalId,
          userId: user?.id
        });
        showErrorToast(message);
        return;
      }

      await fetchGoals();
      showSuccessToast(t('goals.goal_completed') || 'Goal marked as complete!');
    } catch (error) {
      const message = handleApiError(error, { 
        component: 'StudyGoalsPage', 
        action: 'handleMarkComplete',
        goalId,
        userId: user?.id
      });
      ErrorLogger.error(error, { 
        component: 'StudyGoalsPage', 
        action: 'handleMarkComplete',
        goalId,
        userId: user?.id
      });
      showErrorToast(message);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('goals.no_deadline');
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGoalTypeLabel = (type: string) => {
    const labelKey = `goals.type_${type}`;
    return t(labelKey);
  };

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_study_time':
        return <Clock className="h-5 w-5" />;
      case 'weekly_flashcards':
        return <TrendingUp className="h-5 w-5" />;
      case 'quiz_streak':
        return <Target className="h-5 w-5" />;
      case 'items_published':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  const statusColor = (goal: StudyGoal) =>
    !goal.is_completed && goal.deadline_date && new Date(goal.deadline_date) < new Date()
      ? '#dc2626'
      : 'var(--color-accent-gold)';

  const statusLabel = (goal: StudyGoal) => {
    if (goal.is_completed) return 'Complete';
    const pct = calculateProgress(goal.current_value, goal.target_value);
    if (pct >= 100) return 'Complete';
    if (goal.deadline_date && new Date(goal.deadline_date) < new Date()) return 'Behind';
    return 'On track';
  };

  const goalTypeCounts: Record<string, number> = {};
  for (const g of goals) {
    goalTypeCounts[g.goal_type] = (goalTypeCounts[g.goal_type] || 0) + 1;
  }

  const inputCls = "w-full px-4 py-2 border border-divider dark:border-divider-on-dark rounded-[7px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus:border-transparent bg-card-light dark:bg-card-dark text-ink dark:text-muted-ink-on-dark";

  return (
    <div className="p-6 md:p-8">
      {/* Page header */}
      <div className="text-[9px] tracking-[2.5px] uppercase font-bold text-accent-gold">Study Goals</div>
      <div className="flex justify-between items-end">
        <h1 className="font-display text-[38px] font-semibold text-ink dark:text-ink-on-dark mt-[6px] mb-1 tracking-tight leading-tight">
          {t('goals.title') || "This Week's Targets."}
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-[7px] bg-sidebar text-ink-on-dark text-[12px] font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity"
        >
          + {t('goals.new_goal') || 'Add Goal'}
        </button>
      </div>
      <div className="h-px bg-ink/80 mt-3 mb-[22px]" />

      {/* Dark stats strip */}
      <div className="bg-sidebar px-8 py-[22px] mb-6 flex justify-around items-center">
        {[
          [String(activeGoals.length), 'Active Goals'],
          [String(completedGoals.length), 'Completed'],
          [String(goals.length), 'Total Goals'],
          [`${goals.length > 0 ? Math.round(goals.reduce((s, g) => s + calculateProgress(g.current_value, g.target_value), 0) / goals.length) : 0}%`, 'Avg. Progress'],
        ].map(([v, l], i) => (
          <div key={i} className="text-center">
            <div className="font-display text-[36px] font-semibold text-ink-on-dark leading-none">{v}</div>
            <div className="text-[9px] tracking-[2px] uppercase text-accent-gold mt-2">{l}</div>
          </div>
        ))}
      </div>

      {/* 2-col: goal cards + right rail */}
      <div className="grid gap-[22px]" style={{ gridTemplateColumns: '1fr 240px' }}>

        {/* Goal cards — 2-col grid */}
        <div>
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-accent-gold border-t-transparent rounded-full" />
            </div>
          ) : goals.length === 0 ? (
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark py-16 flex flex-col items-center">
              <Target className="h-10 w-10 text-muted-ink dark:text-muted-ink-on-dark mb-4" />
              <p className="font-display text-[15px] font-semibold text-ink dark:text-ink-on-dark mb-1">No goals yet</p>
              <p className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark mb-5">Create your first study goal to start tracking progress.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-[9px] bg-sidebar text-ink-on-dark text-[12px] font-semibold hover:opacity-90 transition-opacity"
              >
                {t('goals.create_goal') || '+ Create Goal'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => {
                const pct = calculateProgress(goal.current_value, goal.target_value);
                const color = statusColor(goal);
                const label = statusLabel(goal);
                return (
                  <div
                    key={goal.id}
                    className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark"
                    style={{ borderLeft: `3px solid ${color}`, padding: '14px 16px' }}
                  >
                    <div className="flex justify-between items-start mb-[10px]">
                      <div className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark leading-[1.35] flex-1 pr-2">
                        {goal.goal_title}
                      </div>
                      <span
                        className="text-[8px] tracking-[1.5px] uppercase font-bold flex-shrink-0 px-[7px] py-[2px]"
                        style={{ color, background: `${color}15` }}
                      >{label}</span>
                    </div>
                    <div className="h-1 bg-subtle dark:bg-subtle-on-dark rounded-[2px] mb-2">
                      <div className="h-full rounded-[2px] transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">
                        {goal.deadline_date ? `Due ${formatDate(goal.deadline_date)}` : t('goals.no_deadline')}
                      </span>
                      <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">
                        {goal.is_completed ? '✓ Done' : `${goal.current_value} / ${goal.target_value}`}
                      </span>
                    </div>
                    <div className="flex gap-[6px] mt-3">
                      {!goal.is_completed && pct >= 100 && (
                        <button
                          onClick={() => handleMarkComplete(goal.id)}
                          className="flex-1 py-[5px] bg-accent-gold-soft border border-accent-gold text-accent-gold text-[10px] font-bold hover:opacity-90 transition-opacity"
                        >
                          <CheckCircle className="h-3 w-3 inline mr-1" />Mark done
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-[5px] border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4">
          {completedGoals.length > 0 && (
            <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark border-t-[3px] border-t-accent-gold p-4">
              <div className="text-[9px] tracking-[2px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark mb-3">
                {t('goals.completed_goals') || 'Completed'}
              </div>
              {completedGoals.slice(0, 5).map((g, i) => (
                <div key={g.id} className={`flex justify-between items-center py-[7px] ${i < Math.min(completedGoals.length, 5) - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''}`}>
                  <div className="flex items-center gap-[7px] min-w-0">
                    <div className="w-[14px] h-[14px] rounded-full bg-accent-gold-soft border border-accent-gold flex items-center justify-center text-[8px] text-accent-gold flex-shrink-0">✓</div>
                    <span className="text-[11.5px] text-secondary-ink dark:text-muted-ink-on-dark truncate">{g.goal_title}</span>
                  </div>
                  <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark flex-shrink-0 ml-2">{formatDate(g.completed_at)}</span>
                </div>
              ))}
            </div>
          )}

          {Object.keys(goalTypeCounts).length > 0 && (
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-4">
              <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-[10px]">Goal Types</div>
              {Object.entries(goalTypeCounts).map(([type, count]) => (
                <div key={type} className="flex justify-between py-[5px]">
                  <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{getGoalTypeLabel(type)}</span>
                  <span className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark">{count}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="py-[11px] bg-transparent border border-dashed border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-[12px] cursor-pointer hover:bg-subtle dark:hover:bg-subtle-on-dark transition-colors text-center"
          >
            + {t('goals.new_goal') || 'Add a new goal'}
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/[0.62] backdrop-blur-[5px] flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-[24px] font-bold text-ink dark:text-muted-ink-on-dark">Create New Goal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-muted-ink dark:text-muted-ink-on-dark hover:bg-subtle dark:hover:bg-subtle-on-dark rounded-[8px]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                  {t('goals.goal_type')}
                </label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value)}
                  className={inputCls}
                >
                  <option value="daily_study_time">{t('goals.type_daily_study_time')}</option>
                  <option value="weekly_flashcards">{t('goals.type_weekly_flashcards')}</option>
                  <option value="quiz_streak">{t('goals.type_quiz_streak')}</option>
                  <option value="items_published">{t('goals.type_items_published')}</option>
                  <option value="custom">{t('goals.type_custom')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                  {t('goals.goal_title')}
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g., Study 30 minutes daily"
                  maxLength={200}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                  {t('goals.goal_description')}
                </label>
                <textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Describe your goal..."
                  maxLength={1000}
                  rows={3}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  min="1"
                  max="10000"
                  className={inputCls}
                />
                <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mt-1">
                  Set the target number to achieve your goal
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-divider dark:border-divider-on-dark text-ink dark:text-muted-ink-on-dark hover:bg-subtle dark:hover:bg-subtle-on-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGoal}
                  disabled={creating || !goalTitle.trim()}
                  className="flex-1 px-4 py-2 bg-accent-gold text-sidebar font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? t('goals.creating') : t('goals.create_goal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {ConfirmModal}
    </div>
  );
};
