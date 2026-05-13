import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';
import { ConfirmationModal } from '../../Common/ConfirmationModal';
import { PageHeader, ScholarButton } from '../../Scholar';

interface Exam {
  id: string;
  exam_name: string;
  exam_date: string;
  created_at: string;
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
}

interface ExamSchedulerProps {
  courseId: string;
}

function getCountdown(examDate: string): Countdown {
  const diff = new Date(examDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, isPast: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, isPast: false };
}

export const ExamScheduler: React.FC<ExamSchedulerProps> = ({ courseId }) => {
  const { t, dir } = useI18n();
  const { user } = useAuth();
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [, setTick] = useState(0);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown ticker — update every 60 s
  useEffect(() => {
    tickRef.current = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const loadExams = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('academics_exams')
        .select('id, exam_name, exam_date, created_at')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true });

      if (error) throw error;
      setExams(data || []);
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [user, courseId, showErrorToast]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleAdd = async () => {
    if (!user) return;
    const name = newName.trim();
    if (!name) {
      showErrorToast(t('exam_scheduler.name_required') || 'Exam name is required');
      return;
    }
    if (!newDate) {
      showErrorToast(t('exam_scheduler.date_required') || 'Date is required');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('academics_exams').insert({
        user_id: user.id,
        course_id: courseId,
        exam_name: name,
        exam_date: new Date(newDate).toISOString(),
      });
      if (error) throw error;

      setNewName('');
      setNewDate('');
      setShowForm(false);
      await loadExams();
      showSuccessToast(t('exam_scheduler.added') || 'Exam added');
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase
        .from('academics_exams')
        .delete()
        .eq('id', deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
      await loadExams();
      showSuccessToast(t('exam_scheduler.deleted') || 'Exam deleted');
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading) {
    return (
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] p-6">
        <div className="animate-pulse text-sm text-muted-ink dark:text-muted-ink-on-dark">
          {t('exam_scheduler.loading') || 'Loading exams…'}
        </div>
      </div>
    );
  }

  // Find the soonest upcoming exam for the banner
  const upcoming = exams.find((e) => !getCountdown(e.exam_date).isPast);

  return (
    <div className="space-y-5" dir={dir}>
      {/* Aca4Exams: PageHeader with Add Exam in right slot */}
      <PageHeader
        eyebrow={t('exam_scheduler.eyebrow') || 'Academics'}
        title={t('exam_scheduler.title') || 'Exam Schedule'}
        hideRule
        period={false}
        actions={
          <ScholarButton
            variant="primary"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowForm((v) => !v)}
          >
            {t('exam_scheduler.add_exam') || 'Add Exam'}
          </ScholarButton>
        }
      />

      {/* Upcoming banner */}
      {upcoming && (
        <div className="flex items-center gap-3 px-[18px] py-3 rounded-[12px] bg-accent-gold-soft border border-accent-gold">
          <CalendarDays className="h-5 w-5 text-accent-gold shrink-0" />
          <div>
            <p className="text-sm font-semibold text-accent-gold">
              {t('exam_scheduler.next_up') || 'Next up'}: {upcoming.exam_name}
            </p>
            <p className="text-xs text-secondary-ink dark:text-muted-ink-on-dark mt-0.5">
              {new Date(upcoming.exam_date).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Inline add form */}
      {showForm && (
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] p-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t('exam_scheduler.name_placeholder') || 'Exam name'}
            className="w-full px-3 py-2 rounded-[12px] border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark text-sm"
          />
          <input
            type="datetime-local"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full px-3 py-2 rounded-[12px] border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark text-sm"
          />
          <div className="flex items-center justify-end gap-2">
            <ScholarButton variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              {t('common.cancel') || 'Cancel'}
            </ScholarButton>
            <ScholarButton
              variant="primary"
              size="sm"
              loading={saving}
              loadingText={t('exam_scheduler.saving') || 'Saving…'}
              onClick={handleAdd}
            >
              {t('common.save') || 'Save'}
            </ScholarButton>
          </div>
        </div>
      )}

      {/* Exam list — Aca4Exams card style */}
      {exams.length === 0 ? (
        <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
          {t('exam_scheduler.empty') || 'No exams scheduled yet'}
        </p>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const countdown = getCountdown(exam.exam_date);
            const isUrgent = !countdown.isPast && countdown.days <= 2;
            return (
              <div
                key={exam.id}
                className={`flex items-center gap-[14px] py-[14px] px-[18px] rounded-[12px] border transition-colors ${
                  countdown.isPast
                    ? 'opacity-[0.65] border-divider dark:border-divider-on-dark'
                    : isUrgent
                      ? 'border-accent-gold bg-accent-gold/5'
                      : 'border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark'
                }`}
              >
                {/* Date icon */}
                <div className={`shrink-0 w-10 h-10 rounded-[12px] flex flex-col items-center justify-center border ${
                  countdown.isPast
                    ? 'bg-subtle border-divider text-muted-ink dark:text-muted-ink-on-dark'
                    : 'bg-accent-gold-soft border-accent-gold/30 text-accent-gold'
                }`}>
                  <span className="text-lg font-bold leading-none">
                    {new Date(exam.exam_date).getDate()}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wide mt-0.5">
                    {new Date(exam.exam_date).toLocaleString('default', { month: 'short' })}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${countdown.isPast ? 'text-muted-ink dark:text-muted-ink-on-dark' : 'text-ink dark:text-ink-on-dark'}`}>
                    {exam.exam_name}
                  </p>
                  <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mt-0.5">
                    {new Date(exam.exam_date).toLocaleString()}
                  </p>
                </div>

                {/* Countdown badge */}
                {countdown.isPast ? (
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-chip dark:bg-bg-chip text-muted-ink dark:text-muted-ink-on-dark">
                    {t('exam_scheduler.past') || 'Past'}
                  </span>
                ) : (
                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-bold ${isUrgent ? 'text-accent-gold' : 'text-ink dark:text-ink-on-dark'}`}>
                      {countdown.days > 0 && `${countdown.days}d `}{countdown.hours}h {countdown.minutes}m
                    </p>
                    <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">remaining</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteTarget(exam)}
                  className="shrink-0 p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  aria-label={t('exam_scheduler.delete') || 'Delete'}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('exam_scheduler.delete_title') || 'Delete Exam'}
        message={
          t('exam_scheduler.delete_message', { name: deleteTarget?.exam_name ?? '' }) ||
          `Are you sure you want to delete "${deleteTarget?.exam_name}"?`
        }
        confirmText={t('common.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        variant="destructive"
      />
    </div>
  );
};
