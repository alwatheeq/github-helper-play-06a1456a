import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Clock, Layers, BookOpen, Target } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';

interface QuizScorePoint {
  label: string;
  score: number;
}

interface CourseAnalyticsProps {
  courseId: string;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CourseAnalytics: React.FC<CourseAnalyticsProps> = ({ courseId }) => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();

  const [quizScores, setQuizScores] = useState<QuizScorePoint[]>([]);
  const [masteryPct, setMasteryPct] = useState(0);
  const [srsNew, setSrsNew] = useState(0);
  const [srsLearning, setSrsLearning] = useState(0);
  const [srsMastered, setSrsMastered] = useState(0);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  const accentStroke = 'var(--accent-gold)';

  const loadAnalytics = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    try {
      // Quiz scores
      const { data: courseQuizzes } = await supabase
        .from('academics_course_quizzes')
        .select('quiz_session_id, quiz_sessions(id, quiz_title, questions_json)')
        .eq('course_id', courseId);

      const quizSessionIds = (courseQuizzes || []).map((q) => q.quiz_session_id);

      let scores: QuizScorePoint[] = [];
      if (quizSessionIds.length > 0) {
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('quiz_session_id, score, created_at')
          .in('quiz_session_id', quizSessionIds)
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        const sessionTitleMap: Record<string, string> = {};
        (courseQuizzes || []).forEach((q, idx) => {
          const qs = q.quiz_sessions as unknown as { id: string; quiz_title: string; questions_json: unknown[] } | null;
          sessionTitleMap[q.quiz_session_id] = qs?.quiz_title || `Quiz ${idx + 1}`;
        });

        scores = (attempts || []).map((a) => ({
          label: sessionTitleMap[a.quiz_session_id] || 'Quiz',
          score: typeof a.score === 'number' ? a.score : 0,
        }));
      }
      setQuizScores(scores);

      // SRS state breakdown
      const { data: courseItems } = await supabase
        .from('academics_course_items')
        .select('item_id')
        .eq('course_id', courseId);

      const itemIds = (courseItems || []).map((ci) => ci.item_id);

      if (itemIds.length > 0) {
        const { data: srsStates } = await supabase
          .from('srs_flashcard_state')
          .select('interval_days')
          .eq('user_id', user.id)
          .in('item_id', itemIds);

        const states = srsStates || [];
        const newCards = states.filter((s) => s.interval_days <= 1).length;
        const learning = states.filter((s) => s.interval_days > 1 && s.interval_days <= 21).length;
        const mastered = states.filter((s) => s.interval_days > 21).length;
        setSrsNew(newCards);
        setSrsLearning(learning);
        setSrsMastered(mastered);
        setMasteryPct(states.length > 0 ? Math.round((mastered / states.length) * 100) : 0);

        // Study time: total + per weekday (last 7 days)
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('duration_seconds, created_at')
          .eq('user_id', user.id)
          .in('item_id', itemIds);

        const allSessions = sessions || [];
        const totalSeconds = allSessions.reduce(
          (sum, s) => sum + (typeof s.duration_seconds === 'number' ? s.duration_seconds : 0), 0
        );
        setTotalStudyMinutes(Math.round(totalSeconds / 60));

        // Bucket last 7 days by weekday (Mon=0 … Sun=6)
        const now = new Date();
        const buckets = [0, 0, 0, 0, 0, 0, 0];
        allSessions.forEach((s) => {
          const d = new Date(s.created_at);
          const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
          if (diffDays < 7) {
            const dow = (d.getDay() + 6) % 7; // Mon=0
            buckets[dow] += typeof s.duration_seconds === 'number' ? s.duration_seconds / 60 : 0;
          }
        });
        setWeeklyMinutes(buckets.map(Math.round));
      } else {
        setMasteryPct(0);
        setTotalStudyMinutes(0);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  }, [user, courseId, showErrorToast]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const studyHours = Math.floor(totalStudyMinutes / 60);
  const studyMins = totalStudyMinutes % 60;
  const hasData = quizScores.length > 0 || masteryPct > 0 || totalStudyMinutes > 0;
  const weekMax = Math.max(...weeklyMinutes, 1);
  const todayDow = (new Date().getDay() + 6) % 7;

  if (loading) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
        <div className="animate-pulse text-sm text-muted-ink dark:text-muted-ink-on-dark">
          {t('course_analytics.loading') || 'Loading analytics…'}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6" dir={dir}>
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
          <span className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
            {t('course_analytics.no_data') || 'No analytics data yet'}
          </span>
        </div>
      </div>
    );
  }

  const avgScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((s, q) => s + q.score, 0) / quizScores.length)
    : 0;

  return (
    <div className="space-y-5" dir={dir}>
      {/* Stats row — 4 tiles spanning full width */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[14px]">
        {[
          { icon: BookOpen, value: quizScores.length, label: t('course_analytics.quizzes_taken') || 'Quizzes taken' },
          { icon: Target,   value: `${avgScore}%`,   label: t('course_analytics.avg_score') || 'Avg score' },
          { icon: Layers,   value: `${masteryPct}%`, label: t('course_analytics.mastery') || 'Mastery' },
          { icon: Clock,    value: studyHours > 0 ? `${studyHours}h ${studyMins}m` : `${studyMins}m`, label: t('course_analytics.study_time') || 'Study time' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[10px] py-4 px-[18px]">
            <div className="text-2xl font-extrabold font-display text-ink dark:text-ink-on-dark mb-1">{value}</div>
            <div className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-accent-gold flex-shrink-0" />
              <p className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2-column body: chart LEFT — mastery+study RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quiz score chart */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] p-5">
          <p className="text-[11px] font-bold text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-[0.08em] mb-4">
            {t('course_analytics.quiz_scores') || 'Quiz Scores Over Time'}
          </p>
          {quizScores.length > 0 ? (
            <div className="w-full h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={quizScores} margin={{ top: 10, right: 10, bottom: 28, left: 30 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-ink dark:text-muted-ink-on-dark" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="currentColor" className="text-muted-ink dark:text-muted-ink-on-dark" ticks={[0, 50, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '4px', fontSize: '12px', border: '1px solid var(--color-border-divider)', background: 'var(--color-bg-card-light)' }} />
                  <Line type="monotone" dataKey="score" stroke={accentStroke} strokeWidth={2} dot={{ r: 4, fill: 'var(--accent-gold)', stroke: 'var(--accent-gold)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-sm text-muted-ink dark:text-muted-ink-on-dark">
              No quiz data yet
            </div>
          )}
        </div>

        {/* Right column: mastery + study time stacked */}
        <div className="flex flex-col gap-4">
          {/* Flashcard mastery */}
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-[0.08em]">
                {t('course_analytics.flashcard_mastery') || 'Flashcard Mastery'}
              </p>
              <span className="text-[13px] font-bold text-ink dark:text-ink-on-dark">{masteryPct}%</span>
            </div>
            <div className="h-[10px] bg-subtle dark:bg-subtle-on-dark rounded-[5px] mb-2">
              <div className="h-full bg-accent-gold rounded-[5px] transition-[width] duration-500" style={{ width: `${masteryPct}%` }} />
            </div>
            <p className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mb-4">
              {srsMastered} of {srsNew + srsLearning + srsMastered} cards with interval &gt; 21 days
            </p>
            {/* New / Learning / Mastered breakdown */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: t('course_analytics.new') || 'New',      value: srsNew,      color: '#3b82f6' },
                { label: t('course_analytics.learning') || 'Learning', value: srsLearning, color: '#f59e0b' },
                { label: t('course_analytics.mastered') || 'Mastered', value: srsMastered, color: '#22c55e' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center py-2 bg-page-light dark:bg-page-dark border border-divider dark:border-divider-on-dark rounded-[8px]">
                  <div className="text-[18px] font-extrabold leading-none mb-0.5" style={{ color }}>{value}</div>
                  <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Study time */}
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] p-5">
            <p className="text-[11px] font-bold text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-[0.08em] mb-3">
              {t('course_analytics.study_time') || 'Study Time'}
            </p>
            <div className="flex items-baseline gap-1.5 mb-3">
              {studyHours > 0 && (
                <>
                  <span className="text-[32px] font-extrabold leading-none text-ink dark:text-ink-on-dark">{studyHours}</span>
                  <span className="text-base text-muted-ink dark:text-muted-ink-on-dark">h</span>
                </>
              )}
              <span className="text-[32px] font-extrabold leading-none text-ink dark:text-ink-on-dark">{studyMins}</span>
              <span className="text-base text-muted-ink dark:text-muted-ink-on-dark">m</span>
              <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark ml-1.5">this course</span>
            </div>
            {/* 7-day mini bar chart */}
            <div className="flex gap-1 items-end h-12">
              {weeklyMinutes.map((mins, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-[3px] min-h-[4px] transition-all duration-300"
                  style={{
                    height: `${Math.max(8, (mins / weekMax) * 100)}%`,
                    background: i === todayDow ? 'var(--color-accent-gold)' : 'var(--color-accent-gold-soft, #f0e0a8)',
                    opacity: i === todayDow ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {DAY_LABELS.map((d) => (
                <span key={d} className="flex-1 text-center text-[9px] text-muted-ink dark:text-muted-ink-on-dark">{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
