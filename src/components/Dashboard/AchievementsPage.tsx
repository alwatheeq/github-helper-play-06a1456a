import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Award, Lock, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../contexts/I18nContext';
import { ErrorLogger } from '../../utils/errorLogger';

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

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [allAchievements, setAllAchievements] = useState<AchievementDefinition[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [achievementsRes, userAchievementsRes] = await Promise.all([
        supabase.from('achievements_definitions').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        supabase.from('user_achievements').select('achievement_id, earned_at, progress_value').eq('user_id', user.id)
      ]);
      if (!achievementsRes.error && achievementsRes.data) { setAllAchievements(achievementsRes.data); }
      if (!userAchievementsRes.error && userAchievementsRes.data) { setUserAchievements(userAchievementsRes.data); }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'AchievementsPage', action: 'fetchAchievements', userId: user?.id });
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    if (user) { void fetchData(); }
  }, [user, fetchData]);

  const unlockedSet = useMemo(() => new Set(userAchievements.map(ua => ua.achievement_id)), [userAchievements]);
  const earnedDateMap = useMemo(() => new Map(userAchievements.map(ua => [ua.achievement_id, ua.earned_at])), [userAchievements]);

  const isAchievementUnlocked = (achievementId: string) => unlockedSet.has(achievementId);
  const getEarnedDate = (achievementId: string) => earnedDateMap.get(achievementId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredAchievements = selectedCategory === 'all' ? allAchievements : allAchievements.filter(a => a.category === selectedCategory);
  const earnedCount = allAchievements.filter(a => isAchievementUnlocked(a.id)).length;
  const totalXPEarned = allAchievements.filter(a => isAchievementUnlocked(a.id)).reduce((sum, a) => sum + a.xp_reward, 0);

  const categories = [
    { id: 'all', label: t('achievements.all') },
    { id: 'study', label: t('achievements.category_study') },
    { id: 'social', label: t('achievements.category_social') },
    { id: 'achievement', label: t('achievements.category_achievement') },
    { id: 'special', label: t('achievements.category_special') }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-page-light dark:bg-page-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto"></div>
          <p className="mt-4 text-secondary-ink dark:text-muted-ink-on-dark">{t('achievements.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark p-6">
      <div className="max-w-7xl mx-auto">

        {/* ── v4 Header ─────────────────────────────────────────────── */}
        <div className="flex justify-between items-end mb-0">
          <div>
            <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase">Achievements</div>
            <h1 className="font-display text-[38px] font-semibold text-ink dark:text-ink-on-dark mt-1.5 mb-1 tracking-[-0.8px]">{t('achievements.title') || 'Your Badges.'}</h1>
            <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">{earnedCount} earned · {allAchievements.length - earnedCount} locked</p>
          </div>
          <div className="text-right">
            <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-1">Scholar — Level 4</div>
            <div className="w-[200px] h-[5px] bg-subtle dark:bg-subtle-on-dark rounded-full mb-1.5">
              <div className="h-full bg-accent-gold rounded-full" style={{ width: '68%' }} />
            </div>
            <div className="font-display text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{totalXPEarned} XP · 680 to Level 5</div>
          </div>
        </div>
        <div className="h-px bg-ink dark:bg-ink-on-dark mt-3.5 mb-5 opacity-80" />

        {/* Two-column layout */}
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

            {/* Badge grid — 4 cols */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {filteredAchievements.map((achievement) => {
                const isUnlocked = isAchievementUnlocked(achievement.id);
                const earnedDate = getEarnedDate(achievement.id);
                return (
                  <div
                    key={achievement.id}
                    className={`border border-divider dark:border-divider-on-dark px-3 py-3.5 text-center transition-opacity ${isUnlocked ? 'bg-card-light dark:bg-card-dark' : 'bg-subtle dark:bg-subtle-on-dark opacity-45'}`}
                  >
                    <div className="mb-2 flex items-center justify-center h-[26px]">
                      {isUnlocked ? (
                        <Award className="h-[26px] w-[26px] text-ink dark:text-ink-on-dark" />
                      ) : (
                        <Lock className="h-[26px] w-[26px] text-muted-ink dark:text-muted-ink-on-dark" />
                      )}
                    </div>

                    <div className="font-display text-[11px] font-semibold text-ink dark:text-ink-on-dark mb-1 leading-snug">{achievement.title}</div>
                    <div className="text-[9.5px] text-muted-ink dark:text-muted-ink-on-dark leading-snug mb-1.5">{achievement.description}</div>

                    <div className="text-[8px] tracking-wide font-bold text-muted-ink dark:text-muted-ink-on-dark uppercase mb-1.5">{achievement.badge_tier}</div>

                    <div className="flex items-center justify-center gap-0.5 text-[9px] text-muted-ink dark:text-muted-ink-on-dark mb-1">
                      <Zap className="h-2.5 w-2.5" />
                      {achievement.xp_reward} XP
                    </div>

                    {isUnlocked && earnedDate ? (
                      <div className="text-[9px] text-accent-gold font-semibold">Earned {formatDate(earnedDate)}</div>
                    ) : (
                      <div className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark italic">{t('achievements.locked')}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-12 text-center mt-4">
                <Award className="h-16 w-16 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-4" />
                <p className="text-secondary-ink dark:text-muted-ink-on-dark">{t('achievements.no_achievements')}</p>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div className="flex flex-col gap-4">
            {/* XP total dark tile */}
            <div className="bg-sidebar px-[18px] py-5 text-center">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2">Total XP</div>
              <div className="font-display text-[46px] font-bold text-ink-on-dark leading-none">{totalXPEarned}</div>
              <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mt-1.5">Scholar · Level 4</div>
              <div className="h-[3px] bg-white/10 dark:bg-white/5 rounded-full mt-3 mb-1">
                <div className="h-full bg-accent-gold rounded-full" style={{ width: '68%' }} />
              </div>
              <div className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark">68% to Level 5</div>
            </div>

            {/* By category breakdown */}
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

            {/* Overall summary */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-4 py-4">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-2.5">Overall Progress</div>
              <div className="flex justify-between py-1.5">
                <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{t('achievements.unlocked')}</span>
                <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">{earnedCount} / {allAchievements.length}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{t('achievements.completion')}</span>
                <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">{allAchievements.length > 0 ? Math.round((earnedCount / allAchievements.length) * 100) : 0}%</span>
              </div>
              <div className="h-1 bg-subtle dark:bg-subtle-on-dark rounded-full mt-2">
                <div className="h-full bg-accent-gold rounded-full" style={{ width: `${allAchievements.length > 0 ? Math.round((earnedCount / allAchievements.length) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
