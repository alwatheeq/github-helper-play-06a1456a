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
import { MasteryBar } from '../../Scholar';

interface QuizScorePoint {
  label: string;
  score: number;
}

interface CourseAnalyticsProps {
  courseId: string;
}

export const CourseAnalytics: React.FC<CourseAnalyticsProps> = ({ courseId }) => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();

  const [quizScores, setQuizScores] = useState<QuizScorePoint[]>([]);
  const [masteryPct, setMasteryPct] = useState(0);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  // Accent stroke (CSS var redefines per theme)
  const accentStroke = 'var(--accent-gold)';

  const loadAnalytics = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

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

      // SRS mastery: % of cards with interval > 21 days
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

        const total = (srsStates || []).length;
        const mastered = (srsStates || []).filter((s) => s.interval_days > 21).length;
        setMasteryPct(total > 0 ? Math.round((mastered / total) * 100) : 0);
      } else {
        setMasteryPct(0);
      }

      // Study time
      if (itemIds.length > 0) {
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('duration_seconds')
          .eq('user_id', user.id)
          .in('item_id', itemIds);

        const totalSeconds = (sessions || []).reduce(
          (sum, s) => sum + (typeof s.duration_seconds === 'number' ? s.duration_seconds : 0),
          0
        );
        setTotalStudyMinutes(Math.round(totalSeconds / 60));
      } else {
        setTotalStudyMinutes(0);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  }, [user, courseId, showErrorToast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const studyHours = Math.floor(totalStudyMinutes / 60);
  const studyMins = totalStudyMinutes % 60;
  const hasData = quizScores.length > 0 || masteryPct > 0 || totalStudyMinutes > 0;

  if (loading) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-6">
        <div className="animate-pulse text-sm text-muted-ink dark:text-muted-ink-on-dark">
          {t('course_analytics.loading') || 'Loading analytics…'}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-6" dir={dir}>
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
    /* Aca4Analytics layout: stats row → chart area → subject bars */
    <div className="space-y-5" dir={dir}>
      {/* Stats row — 4 tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[14px]">
        {[
          {
            icon: BookOpen,
            value: quizScores.length,
            label: t('course_analytics.quizzes_taken') || 'Quizzes taken',
          },
          {
            icon: Target,
            value: `${avgScore}%`,
            label: t('course_analytics.avg_score') || 'Avg score',
          },
          {
            icon: Layers,
            value: `${masteryPct}%`,
            label: t('course_analytics.mastery') || 'Mastery',
          },
          {
            icon: Clock,
            value: studyHours > 0 ? `${studyHours}h ${studyMins}m` : `${studyMins}m`,
            label: t('course_analytics.study_time') || 'Study time',
          },
        ].map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-accent-gold" />
              <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{label}</p>
            </div>
            <p className="font-display text-2xl font-bold text-ink dark:text-ink-on-dark">{value}</p>
          </div>
        ))}
      </div>

      {/* Quiz scores chart */}
      {quizScores.length > 0 && (
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-5">
          <p className="text-xs font-semibold text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-widest mb-4">
            {t('course_analytics.quiz_scores') || 'Quiz Scores Over Time'}
          </p>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizScores} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-muted-ink dark:text-muted-ink-on-dark"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  className="text-muted-ink dark:text-muted-ink-on-dark"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '6px',
                    fontSize: '12px',
                    border: '1px solid var(--divider)',
                    background: 'var(--bg-card)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={accentStroke}
                  strokeWidth={2}
                  dot={{ r: 4, fill: 'var(--accent-gold)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Flashcard mastery — horizontal bar */}
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent-gold" />
            <p className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">
              {t('course_analytics.flashcard_mastery') || 'Flashcard Mastery'}
            </p>
          </div>
          <span className="text-sm font-bold text-ink dark:text-ink-on-dark">{masteryPct}%</span>
        </div>
        <MasteryBar topic="" percent={masteryPct} />
        <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
          {t('course_analytics.mastery_desc') || 'Cards with interval > 21 days'}
        </p>
      </div>
    </div>
  );
};
