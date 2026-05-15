import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Upload, ChevronDown } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTutorial } from '../../../hooks/usePageTutorial';
import { PageTutorial } from '../../Onboarding/PageTutorial';
import { useToast } from '../../Toast/Toast';
import { supabase } from '../../../lib/supabase';
import { hasBasicProfanity } from '../../../utils/academicsProfanity';
import { throwIfEdgeFunctionInvokeFailed } from '../../../utils/edgeFunctionInvoke';
import { computeFlashcardTopicScores, computeTopicQuizScores, mergeTopicScores } from '../../../utils/academicsAnalytics';
import { extractTextFromFile } from '../../../utils/fileProcessor';
import { haikuClient, type HaikuEdgeInvokeExtras } from '../../../utils/haikuClient';
import { processSummaryBatches } from '../../../utils/queueProcessor';
import {
  ALL_QUIZ_QUESTION_TYPES,
  type AcademicsGenerationPreferences,
  type QuizQuestionTypePreference,
  DEFAULT_ACADEMICS_GENERATION_PREFERENCES,
  hasAnyGenerationOutput,
  mergeGenerationPreferences,
} from '../../../utils/academicsGenerationPreferences';
import { SRSReviewPanel } from './SRSReviewPanel';
const CourseAnalytics = React.lazy(() => import('./CourseAnalytics').then(m => ({ default: m.CourseAnalytics })));
import { ExamScheduler } from './ExamScheduler';
import { CourseTutor } from './CourseTutor';
import { PageHeader, SectionTabs } from '../../Scholar';

/** Routed to Edge `usageChannel`; optional `ANTHROPIC_API_KEY_ACADEMICS` for a dedicated key later. */
const ACADEMICS_AI_EXTRAS: HaikuEdgeInvokeExtras = { usageChannel: 'academics' };

type QuizQuestionJson = {
  index?: number;
  topic?: string;
  correct_answer?: string;
};

type AcademicsCourseItemMappingRow = {
  course_id: string;
  item_id: string;
  user_library_items?: { id: string; topics: string[] | null } | null;
};

type AcademicsCourseQuizAnalyticsRow = {
  course_id: string;
  quiz_session_id: string;
  quiz_sessions?: { id: string; questions_json?: QuizQuestionJson[] | null } | null;
};

type QuizAttemptRow = {
  quiz_session_id: string;
  answers_json: Record<string, string> | null;
};

type FlashcardStudyLogRow = {
  item_id: string | null;
  user_rating: string;
};

type Topic = { id: string; name: string };
type Course = {
  id: string;
  course_name: string;
  course_code: string | null;
  topic_id: string;
  content_generation_options?: unknown;
  academics_topics?: { name: string } | null;
};
type CourseItem = {
  id: string;
  item_id: string;
  user_library_items?: { id: string; title: string; topics: string[] | null } | null;
};
type CourseQuiz = {
  id: string;
  quiz_session_id: string;
  quiz_sessions?: { id: string; quiz_title: string; questions_json: QuizQuestionJson[] } | null;
};

const SelectCourseEmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-8 text-center">
    <p className="text-muted-ink dark:text-muted-ink-on-dark text-sm">{message}</p>
  </div>
);

/** PostgREST / Postgres errors when academics tables are missing or cache is stale */
const ACADEMICS_SCHEMA_ERROR_RE =
  /relation|does not exist|schema cache|Could not find the table/i;

function isAcademicsSchemaErrorMessage(msg: string): boolean {
  return ACADEMICS_SCHEMA_ERROR_RE.test(msg);
}

/** Missing migration 20260421120000 only — academics_courses exists but column does not. */
function isUnknownContentGenerationOptionsColumnError(msg: string): boolean {
  const m = (msg || '').toLowerCase();
  return (
    m.includes('content_generation_options') &&
    (m.includes('does not exist') || m.includes('could not find') || m.includes('unknown column'))
  );
}

/** True “academics not installed / table missing” — not the single missing-prefs column case. */
function isSevereAcademicsSchemaError(msg: string): boolean {
  return isAcademicsSchemaErrorMessage(msg) && !isUnknownContentGenerationOptionsColumnError(msg);
}

const COURSE_ACCENT_COLORS = [
  'var(--color-ink)',
  'var(--color-accent-gold)',
  'var(--color-secondary-ink)',
  'var(--color-muted-ink)',
];

const WEEK_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Academics: courses, uploads (summary / flashcards / quiz), and topic/course analytics.
 */
export const AcademicsPage: React.FC = React.memo(() => {
  const { t } = useI18n();
  const { user } = useAuth();
  const {
    shouldShowTutorial,
    showTutorial,
    hideTutorial,
    isTutorialOpen,
    completeTutorial,
    skipTutorial,
    config: tutorialConfig
  } = usePageTutorial('academics');
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseItems, setCourseItems] = useState<CourseItem[]>([]);
  const [courseQuizzes, setCourseQuizzes] = useState<CourseQuiz[]>([]);
  const [topicScores, setTopicScores] = useState<Array<{ topic: string; score: number }>>([]);
  const [courseScore, setCourseScore] = useState<number>(0);

  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [workingGenPrefs, setWorkingGenPrefs] = useState<AcademicsGenerationPreferences>(() => ({
    ...DEFAULT_ACADEMICS_GENERATION_PREFERENCES,
    quizQuestionTypes: [...DEFAULT_ACADEMICS_GENERATION_PREFERENCES.quizQuestionTypes],
  }));
  const [savingGenPrefs, setSavingGenPrefs] = useState(false);
  /** False when DB lacks `content_generation_options` (course list loaded via fallback select). */
  const [canPersistGenerationPrefsToDb, setCanPersistGenerationPrefsToDb] = useState(true);

  /** Avoid duplicate migration toasts (e.g. React StrictMode double effects in dev). */
  const migrationErrorToastShownRef = useRef(false);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  useEffect(() => {
    if (!selectedCourseId) return;
    const c = courses.find((x) => x.id === selectedCourseId);
    if (!c) return;
    setWorkingGenPrefs(mergeGenerationPreferences(c.content_generation_options));
  }, [selectedCourseId, courses]);

  useEffect(() => {
    setSelectedFiles([]);
    setUploadProgress(null);
  }, [selectedCourseId]);

  const toggleQuizType = (
    setter: React.Dispatch<React.SetStateAction<AcademicsGenerationPreferences>>,
    t: QuizQuestionTypePreference
  ) => {
    setter((prev) => {
      const has = prev.quizQuestionTypes.includes(t);
      const next = has ? prev.quizQuestionTypes.filter((x) => x !== t) : [...prev.quizQuestionTypes, t];
      return { ...prev, quizQuestionTypes: next };
    });
  };

  const generationSettingsLine = useMemo(() => {
    const parts: string[] = [];
    if (workingGenPrefs.includeSummary) parts.push(t('academics.include_summary'));
    if (workingGenPrefs.includeFlashcards) parts.push(t('academics.include_flashcards'));
    const n = workingGenPrefs.quizQuestionTypes.length;
    if (n > 0) {
      parts.push(t('academics.quiz_types_count', { count: n }));
    }
    return parts.length > 0 ? parts.join(' · ') : t('academics.generation_none_selected');
  }, [workingGenPrefs, t]);

  const loadTopicsAndCourses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [{ data: topicsData, error: topicsError }, { data: coursesData, error: coursesError }] =
        await Promise.all([
          supabase.from('academics_topics').select('id,name').order('name', { ascending: true }),
          supabase
            .from('academics_courses')
            .select('id,course_name,course_code,topic_id,content_generation_options,academics_topics(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        ]);

      if (topicsError) {
        const msg = topicsError.message || String(topicsError);
        if (isSevereAcademicsSchemaError(msg)) {
          if (!migrationErrorToastShownRef.current) {
            migrationErrorToastShownRef.current = true;
            showErrorToast(t('academics.db_not_migrated'));
          }
        } else {
          showErrorToast(msg);
        }
        return;
      }

      let finalCourses: Course[] | null = (coursesData as unknown as Course[] | null) ?? null;
      let finalCoursesError = coursesError;
      let usedFallbackCourseSelectWithoutGenOptions = false;

      if (
        finalCoursesError &&
        isUnknownContentGenerationOptionsColumnError(finalCoursesError.message || String(finalCoursesError))
      ) {
        usedFallbackCourseSelectWithoutGenOptions = true;
        const retry = await supabase
          .from('academics_courses')
          .select('id,course_name,course_code,topic_id,academics_topics(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        finalCourses = (retry.data as unknown as Course[] | null) ?? null;
        finalCoursesError = retry.error;
      }

      if (finalCoursesError) {
        const msg = finalCoursesError.message || String(finalCoursesError);
        if (isSevereAcademicsSchemaError(msg)) {
          if (!migrationErrorToastShownRef.current) {
            migrationErrorToastShownRef.current = true;
            showErrorToast(t('academics.db_not_migrated'));
          }
        } else {
          showErrorToast(msg);
        }
        return;
      }

      migrationErrorToastShownRef.current = false;
      setCanPersistGenerationPrefsToDb(!usedFallbackCourseSelectWithoutGenOptions);
      setTopics((topicsData || []) as Topic[]);
      setCourses(finalCourses || []);
    } finally {
      setLoading(false);
    }
  }, [user, showErrorToast, t]);

  /** Keep selected course valid after reload; auto-pick first when none selected */
  useEffect(() => {
    if (loading) return;
    if (courses.length === 0) {
      if (selectedCourseId) setSelectedCourseId(null);
      return;
    }
    const valid = selectedCourseId && courses.some((c) => c.id === selectedCourseId);
    if (!valid) {
      setSelectedCourseId(courses[0].id);
    }
  }, [loading, courses, selectedCourseId]);

  const loadCourseContent = useCallback(async () => {
    if (!selectedCourseId) return;
    const [{ data: itemsData }, { data: quizzesData }] = await Promise.all([
      supabase
        .from('academics_course_items')
        .select('id,item_id,user_library_items(id,title,topics)')
        .eq('course_id', selectedCourseId)
        .order('created_at', { ascending: false }),
      supabase
        .from('academics_course_quizzes')
        .select('id,quiz_session_id,quiz_sessions(id,quiz_title,questions_json)')
        .eq('course_id', selectedCourseId)
        .order('created_at', { ascending: false })
    ]);

    setCourseItems((itemsData || []) as unknown as CourseItem[]);
    setCourseQuizzes((quizzesData || []) as unknown as CourseQuiz[]);
  }, [selectedCourseId]);

  const loadAnalytics = useCallback(async () => {
    if (!user) return;

    const { data: allMappings } = await supabase
      .from('academics_course_items')
      .select('course_id,item_id,user_library_items(id,topics)');

    const { data: allCourseQuizzes } = await supabase
      .from('academics_course_quizzes')
      .select('course_id,quiz_session_id,quiz_sessions(id,questions_json)');

    const mappings = (allMappings || []) as unknown as AcademicsCourseItemMappingRow[];
    const courseQuizRows = (allCourseQuizzes || []) as unknown as AcademicsCourseQuizAnalyticsRow[];

    const quizSessionIds = courseQuizRows.map((q) => q.quiz_session_id);
    const { data: attemptsData } = quizSessionIds.length
      ? await supabase
          .from('quiz_attempts')
          .select('quiz_session_id,answers_json')
          .in('quiz_session_id', quizSessionIds)
          .eq('user_id', user.id)
      : { data: [] as QuizAttemptRow[] };

    const itemIds = mappings.map((m) => m.item_id);
    const { data: logsData } = itemIds.length
      ? await supabase
          .from('flashcard_study_log')
          .select('item_id,user_rating')
          .in('item_id', itemIds)
          .eq('user_id', user.id)
      : { data: [] as FlashcardStudyLogRow[] };

    const itemTopicMap: Record<string, string[]> = {};
    mappings.forEach((m) => {
      const id = m.item_id;
      const topicsForItem = m.user_library_items?.topics || ['General'];
      itemTopicMap[id] = topicsForItem;
    });

    const sessions = courseQuizRows
      .map((q) => q.quiz_sessions)
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .map((s) => ({
        id: s.id,
        questions_json: Array.isArray(s.questions_json) ? s.questions_json : []
      }));

    const attempts = (attemptsData || []).map((a) => ({
      quiz_session_id: a.quiz_session_id,
      answers_json: (a.answers_json || {}) as Record<string, string>
    }));

    const quizScores = computeTopicQuizScores(sessions, attempts);
    const flashScores = computeFlashcardTopicScores((logsData || []) as FlashcardStudyLogRow[], itemTopicMap);
    setTopicScores(mergeTopicScores(quizScores, flashScores));

    if (selectedCourseId) {
      const courseQuizIds = courseQuizRows
        .filter((q) => q.course_id === selectedCourseId)
        .map((q) => q.quiz_session_id);
      const filteredAttempts = attempts.filter((a) => courseQuizIds.includes(a.quiz_session_id));
      const filteredSessions = sessions.filter((s) => courseQuizIds.includes(s.id));
      const courseQuizScores = computeTopicQuizScores(filteredSessions, filteredAttempts);
      const courseQuizAvg = Object.keys(courseQuizScores).length
        ? Math.round(Object.values(courseQuizScores).reduce((acc, v) => acc + v, 0) / Object.values(courseQuizScores).length)
        : 0;
      setCourseScore(courseQuizAvg);
    } else {
      setCourseScore(0);
    }
  }, [user, selectedCourseId]);

  useEffect(() => {
    loadTopicsAndCourses();
  }, [loadTopicsAndCourses]);

  useEffect(() => {
    if (shouldShowTutorial && !loading) {
      const timer = setTimeout(() => {
        showTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTutorial, loading, showTutorial]);

  useEffect(() => {
    loadCourseContent();
  }, [loadCourseContent]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, courses.length, courseItems.length, courseQuizzes.length]);

  const handleCreateCourse = async () => {
    if (!user) return;
    const courseName = newCourseName.trim();
    const typedTopic = newTopicName.trim();
    if (!courseName) {
      showErrorToast(t('academics.toast_course_name_required'));
      return;
    }
    if (!selectedTopicId && !typedTopic) {
      showErrorToast(t('academics.toast_topic_required'));
      return;
    }
    if (hasBasicProfanity(courseName) || hasBasicProfanity(typedTopic)) {
      showErrorToast(t('academics.toast_profanity'));
      return;
    }

    setCreatingCourse(true);
    try {
      let topicId = selectedTopicId;
      if (!topicId && typedTopic) {
        const { data: insertedTopic, error: topicInsertError } = await supabase
          .from('academics_topics')
          .insert({ name: typedTopic, created_by: user.id })
          .select('id,name')
          .single();

        if (topicInsertError) {
          const { data: existingTopic } = await supabase
            .from('academics_topics')
            .select('id,name')
            .eq('normalized_name', typedTopic.toLowerCase())
            .maybeSingle();
          if (!existingTopic) throw topicInsertError;
          topicId = existingTopic.id;
        } else {
          topicId = insertedTopic.id;
        }
      }

      const { error } = await supabase.from('academics_courses').insert({
        user_id: user.id,
        topic_id: topicId,
        course_name: courseName,
        course_code: newCourseCode.trim() || null,
      });

      if (error) throw error;

      setShowCreateCourse(false);
      setNewCourseName('');
      setNewCourseCode('');
      setSelectedTopicId('');
      setNewTopicName('');
      await loadTopicsAndCourses();
      showSuccessToast(t('academics.toast_course_created'));
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : t('academics.toast_create_course_failed');
      if (isSevereAcademicsSchemaError(msg)) {
        showErrorToast(t('academics.db_not_migrated'));
      } else {
        showErrorToast(msg);
      }
    } finally {
      setCreatingCourse(false);
    }
  };

  const saveWorkingGenPrefs = async () => {
    if (!user) return;
    if (!canPersistGenerationPrefsToDb) return;
    if (!selectedCourse) {
      showErrorToast(t('academics.select_course_first'));
      return;
    }
    if (!hasAnyGenerationOutput(workingGenPrefs)) {
      showErrorToast(t('academics.toast_generation_prefs_required'));
      return;
    }
    setSavingGenPrefs(true);
    try {
      const { error } = await supabase
        .from('academics_courses')
        .update({
          content_generation_options: workingGenPrefs as unknown as Record<string, unknown>,
        })
        .eq('id', selectedCourse.id)
        .eq('user_id', user.id);
      if (error) throw error;
      await loadTopicsAndCourses();
      showSuccessToast(t('academics.toast_prefs_saved'));
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : t('academics.toast_prefs_save_failed');
      if (isUnknownContentGenerationOptionsColumnError(msg)) {
        showErrorToast(t('academics.missing_generation_options_column'));
      } else {
        showErrorToast(msg);
      }
    } finally {
      setSavingGenPrefs(false);
    }
  };

  const handleGenerateContentForCourse = async () => {
    if (!selectedCourse || selectedFiles.length === 0 || !user) return;
    if (!hasAnyGenerationOutput(workingGenPrefs)) {
      showErrorToast(t('academics.toast_generation_prefs_required'));
      return;
    }
    setUploading(true);
    setUploadProgress(null);
    try {
      for (let fi = 0; fi < selectedFiles.length; fi++) {
        const file = selectedFiles[fi];
        setUploadProgress(
          t('academics.upload_progress')
            .replace('{current}', String(fi + 1))
            .replace('{total}', String(selectedFiles.length))
        );

        const extracted = await extractTextFromFile(file, () => {});
        const text = extracted?.text || '';
        if (!text || text.length < 300) {
          showErrorToast(`${file.name}: ${t('academics.toast_insufficient_text')}`);
          continue;
        }

        let summaryText = '';
        if (workingGenPrefs.includeSummary) {
          const summaryResult = await processSummaryBatches(
            text,
            (_pct, msg) => {
              setUploadProgress(
                t('academics.upload_progress_with_detail')
                  .replace('{current}', String(fi + 1))
                  .replace('{total}', String(selectedFiles.length))
                  .replace('{detail}', msg)
              );
            },
            undefined,
            ACADEMICS_AI_EXTRAS
          );
          summaryText = summaryResult.summary || '';
        }

        let flashcards: Array<{ front: string; back: string }> = [];
        if (workingGenPrefs.includeFlashcards) {
          const useSummary =
            workingGenPrefs.includeSummary && (summaryText || '').trim().length > 0;
          const sourceText = useSummary ? summaryText : text;
          const flashMode = useSummary ? 'summary' : 'full_content';
          const flashcardsResult = await haikuClient.generateFlashcards(
            sourceText,
            10,
            flashMode,
            0,
            extracted?.pageCount || 0,
          );
          flashcards = flashcardsResult.flashcards || [];
        }

        const topicSource =
          (summaryText || '').trim().length > 0 ? summaryText : text;
        const detectedTopics = await haikuClient.detectTopics(topicSource, false, ACADEMICS_AI_EXTRAS);

        const titleBase = file.name.replace(/\.[^/.]+$/, '');
        const { data: libraryItem, error: libraryError } = await supabase
          .from('user_library_items')
          .insert({
            user_id: user.id,
            title: `${titleBase} - ${new Date().toLocaleDateString()}`,
            summary_text: summaryText,
            flashcards_json: flashcards,
            source_type: 'processed',
            original_text_content: text,
            topics: detectedTopics || [],
            is_public: false,
          })
          .select('id,title')
          .single();

        if (libraryError) throw libraryError;

        const { error: mapItemError } = await supabase
          .from('academics_course_items')
          .insert({ course_id: selectedCourse.id, item_id: libraryItem.id });
        if (mapItemError) throw mapItemError;

        if (workingGenPrefs.quizQuestionTypes.length > 0) {
          const { data: quizData, error: quizInvokeError } = await supabase.functions.invoke('generate-quiz', {
            body: {
              text,
              questionCount: 10,
              difficulty: 'medium',
              sourceType: 'library_item',
              sourceId: libraryItem.id,
              quizTitle: `${selectedCourse.course_name} — ${titleBase}`,
              targetLanguage: 'en',
              questionTypes: workingGenPrefs.quizQuestionTypes,
            },
          });
          throwIfEdgeFunctionInvokeFailed(quizData, quizInvokeError);
          if (quizData?.quizSessionId) {
            await supabase.from('academics_course_quizzes').insert({
              course_id: selectedCourse.id,
              quiz_session_id: quizData.quizSessionId,
            });
          }
        }
      }

      setSelectedFiles([]);
      setUploadProgress(null);
      await loadCourseContent();
      await loadAnalytics();
      showSuccessToast(t('academics.toast_content_generated'));
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message: unknown }).message)
            : t('academics.toast_generate_failed');
      showErrorToast(msg);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  // Tab state for Scholar v4 section navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'tutor' | 'exams' | 'srs' | 'analytics'>('overview');

  const academicsTabs = [
    { id: 'overview', label: t('academics.tab_overview') || 'Overview' },
    { id: 'upload', label: 'Upload' },
    { id: 'tutor', label: t('academics.tab_tutor') || 'AI Tutor' },
    { id: 'exams', label: t('academics.tab_exams') || 'Exam Prep' },
    { id: 'srs', label: t('academics.tab_srs') || 'SRS' },
    { id: 'analytics', label: t('academics.tab_analytics') || 'Analytics' },
  ] satisfies import('../../Scholar').SectionTab[];

  const currentWeek = useMemo(() => {
    const today = new Date();
    const dow = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    return WEEK_DAY_LABELS.map((d, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return {
        d,
        n: date.getDate(),
        month: MONTH_NAMES[date.getMonth()],
        isToday: date.toDateString() === today.toDateString(),
      };
    });
  }, []);

  const weekLabel = useMemo(() => {
    if (!currentWeek.length) return '';
    const first = currentWeek[0];
    const last = currentWeek[6];
    const sameMonth = first.month === last.month;
    return sameMonth
      ? `${first.month} ${first.n} — ${last.n}`
      : `${first.month} ${first.n} — ${last.month} ${last.n}`;
  }, [currentWeek]);

  return (
    <>
      <div className="space-y-6">
      <PageHeader
        eyebrow={t('academics.eyebrow') || `Spring '26 · ${courses.length} enrolled`}
        title={t('academics.tab_title') || 'Academics'}
        descriptor={
          t('academics.tab_desc') ||
          'Courses, uploads, and topic-level progress.'
        }
        className="mb-5"
        actions={
          <button
            type="button"
            onClick={() => {
              migrationErrorToastShownRef.current = false;
              setShowCreateCourse(true);
            }}
            className="inline-flex items-center gap-2 px-[18px] py-[9px] bg-accent-gold text-ink-on-dark font-display text-[13px] font-semibold border-none cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('academics.create_course') || 'Enrol a Course'}
          </button>
        }
      />

      {/* Scholar v4 section tabs */}
      <SectionTabs
        tabs={academicsTabs}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
        className="mb-0"
      />

      {/* ── Overview tab ── */}
      {activeTab === 'overview' && (
        <div>
          {/* Weekly calendar strip */}
          <div className="bg-subtle dark:bg-card-dark border border-divider dark:border-divider-on-dark p-4 mb-[18px]">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase">This week</div>
                <div className="font-display text-[17px] font-semibold text-ink dark:text-ink-on-dark mt-[3px]">
                  {weekLabel}
                </div>
              </div>
              <div className="flex gap-1.5">
                {(['‹ Prev', 'Today', 'Next ›'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    className="bg-transparent border border-accent-gold/30 px-[13px] py-[4px] text-[11px] tracking-[0.8px] font-bold text-accent-gold uppercase cursor-pointer"
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {currentWeek.map((day, i) => (
                <div
                  key={i}
                  className={`border p-2 pb-[10px] min-h-[100px] flex flex-col gap-1 ${
                    day.isToday
                      ? 'bg-accent-gold-soft border-accent-gold'
                      : 'bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`text-[9px] tracking-[1.5px] font-bold uppercase ${
                      day.isToday ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'
                    }`}>
                      {day.d}
                    </span>
                    <span className={`font-display text-[15px] font-semibold ${
                      day.isToday ? 'text-accent-gold' : 'text-ink dark:text-ink-on-dark'
                    }`}>
                      {day.n}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mt-auto">open</span>
                </div>
              ))}
            </div>
          </div>

          {/* Body: course cards left (1.7fr), topic mastery right (1fr) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 20 }}>
            {/* Left: course cards */}
            <div>
              {courses.length === 0 ? (
                <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-8 text-center">
                  <p className="text-muted-ink dark:text-muted-ink-on-dark text-sm">
                    {t('academics.courses_empty_state') || 'No courses yet. Create your first course to get started.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* First 2 courses — big variant */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {courses.slice(0, 2).map((course, idx) => {
                      const accentColor = COURSE_ACCENT_COLORS[idx % COURSE_ACCENT_COLORS.length];
                      const isSelected = selectedCourseId === course.id;
                      return (
                        <div
                          key={course.id}
                          className={`bg-subtle dark:bg-card-dark border flex flex-col cursor-pointer transition-colors ${
                            isSelected ? 'border-accent-gold' : 'border-divider dark:border-divider-on-dark'
                          }`}
                          style={{ borderTop: `3px solid ${accentColor}`, padding: 20, gap: 12 }}
                          onClick={() => setSelectedCourseId(course.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="text-[10px] tracking-[1.5px] uppercase font-bold mb-1" style={{ color: accentColor }}>
                                {course.course_code || t('academics.topic_label')}
                                {course.academics_topics?.name ? ` · ${course.academics_topics.name}` : ''}
                              </div>
                              <div className="font-display font-semibold text-ink dark:text-ink-on-dark leading-tight" style={{ fontSize: 20 }}>
                                {course.course_name}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[9px] tracking-[1.5px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark">Score</div>
                              <div className="font-display leading-none mt-0.5" style={{ fontSize: 24, fontWeight: 600, color: accentColor }}>
                                {isSelected ? `${courseScore}%` : '—'}
                              </div>
                            </div>
                          </div>
                          <div className="h-px bg-divider dark:bg-divider-on-dark" />
                          <div className="grid grid-cols-4 gap-1.5">
                            {([
                              { v: isSelected ? `${courseScore}%` : '—', l: 'avg score' },
                              { v: '—', l: 'studied' },
                              { v: '—', l: 'topics' },
                              { v: '—', l: 'cards due' },
                            ] as const).map(({ v, l }) => (
                              <div key={l}>
                                <div className="font-display font-semibold text-ink dark:text-ink-on-dark" style={{ fontSize: 17 }}>{v}</div>
                                <div className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">{l}</div>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedCourseId(course.id); setActiveTab('analytics'); }}
                            className="w-full py-[7px] bg-sidebar text-ink-on-dark font-display text-[12px] font-semibold text-center border-none cursor-pointer"
                          >
                            Open →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {/* Remaining courses — normal variant */}
                  {courses.length > 2 && (
                    <div className="grid grid-cols-2 gap-3">
                      {courses.slice(2).map((course, idx) => {
                        const accentColor = COURSE_ACCENT_COLORS[(idx + 2) % COURSE_ACCENT_COLORS.length];
                        const isSelected = selectedCourseId === course.id;
                        return (
                          <div
                            key={course.id}
                            className={`bg-subtle dark:bg-card-dark border flex flex-col cursor-pointer transition-colors ${
                              isSelected ? 'border-accent-gold' : 'border-divider dark:border-divider-on-dark'
                            }`}
                            style={{ borderTop: `3px solid ${accentColor}`, padding: 16, gap: 10 }}
                            onClick={() => setSelectedCourseId(course.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="text-[10px] tracking-[1.5px] uppercase font-bold mb-1" style={{ color: accentColor }}>
                                  {course.course_code || t('academics.topic_label')}
                                  {course.academics_topics?.name ? ` · ${course.academics_topics.name}` : ''}
                                </div>
                                <div className="font-display font-semibold text-ink dark:text-ink-on-dark leading-tight" style={{ fontSize: 16 }}>
                                  {course.course_name}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-[9px] tracking-[1.5px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark">Score</div>
                                <div className="font-display leading-none mt-0.5" style={{ fontSize: 19, fontWeight: 600, color: accentColor }}>
                                  {isSelected ? `${courseScore}%` : '—'}
                                </div>
                              </div>
                            </div>
                            <div className="h-px bg-divider dark:bg-divider-on-dark" />
                            <div className="grid grid-cols-4 gap-1.5">
                              {([
                                { v: isSelected ? `${courseScore}%` : '—', l: 'avg score' },
                                { v: '—', l: 'studied' },
                                { v: '—', l: 'topics' },
                                { v: '—', l: 'cards due' },
                              ] as const).map(({ v, l }) => (
                                <div key={l}>
                                  <div className="font-display font-semibold text-ink dark:text-ink-on-dark" style={{ fontSize: 14 }}>{v}</div>
                                  <div className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">{l}</div>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setSelectedCourseId(course.id); setActiveTab('analytics'); }}
                              className="w-full py-[7px] bg-sidebar text-ink-on-dark font-display text-[12px] font-semibold text-center border-none cursor-pointer"
                            >
                              Open →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right: topic mastery panel */}
            <div className="bg-subtle dark:bg-card-dark border border-divider dark:border-divider-on-dark p-[18px] self-start">
              <div className="mb-[14px]">
                <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase">Mastery</div>
                <div className="font-display text-[17px] font-semibold text-ink dark:text-ink-on-dark mt-[3px]">Topics — strongest first</div>
                <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-[3px]">Sorted by mastery score, high to low.</div>
              </div>
              {topicScores.length > 0 ? (
                <div className="flex flex-col gap-[9px]">
                  {[...topicScores].sort((a, b) => b.score - a.score).map((tp, i) => (
                    <div key={`${tp.topic}-${i}`}>
                      <div className="flex justify-between items-baseline mb-[3px]">
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="text-[12px] font-semibold text-ink dark:text-ink-on-dark">{tp.topic}</span>
                        </div>
                        <span className="font-display text-[12px] font-semibold text-accent-gold flex-shrink-0">
                          {tp.score}<span className="text-[9px] text-muted-ink dark:text-muted-ink-on-dark">%</span>
                        </span>
                      </div>
                      <div className="h-[3px] bg-divider dark:bg-divider-on-dark relative">
                        <div className="absolute inset-0 bg-accent-gold" style={{ width: `${tp.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
                  {selectedCourse
                    ? t('academics.no_analytics_data') || 'No topic data yet. Upload content to generate analytics.'
                    : t('academics.select_course_first')}
                </p>
              )}
              {topicScores.length > 0 && (
                <div className="mt-[14px] pt-3 border-t border-divider dark:border-divider-on-dark text-[11px] text-muted-ink dark:text-muted-ink-on-dark text-center">
                  Average across topics — <span className="text-ink dark:text-ink-on-dark font-semibold">{courseScore}%</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── Upload tab ── */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          {/* Upload / generation section */}
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-ink dark:text-ink-on-dark">
                {selectedCourse?.course_name || t('academics.select_course')}
              </h3>
            </div>
            <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
              {t('academics.upload_section_desc')}
            </p>
            {selectedCourse ? (
              <details className="group border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden text-ink dark:text-ink-on-dark">
                  <span className="text-sm font-medium">{t('academics.generation_for_upload_title')}</span>
                  <span className="flex min-w-0 flex-1 items-center justify-end gap-2 text-xs text-muted-ink dark:text-muted-ink-on-dark">
                    <span className="truncate text-right">{generationSettingsLine}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                  </span>
                </summary>
                <div className="space-y-3 border-t border-divider dark:border-divider-on-dark px-3 py-3">
                  <label className="flex items-center gap-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                    <input
                      type="checkbox"
                      checked={workingGenPrefs.includeSummary}
                      onChange={(e) => setWorkingGenPrefs((p) => ({ ...p, includeSummary: e.target.checked }))}
                      disabled={uploading}
                    />
                    {t('academics.include_summary')}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                    <input
                      type="checkbox"
                      checked={workingGenPrefs.includeFlashcards}
                      onChange={(e) => setWorkingGenPrefs((p) => ({ ...p, includeFlashcards: e.target.checked }))}
                      disabled={uploading}
                    />
                    {t('academics.include_flashcards')}
                  </label>
                  <p className="text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark">{t('academics.quiz_types_label')}</p>
                  <div className="flex flex-wrap gap-3">
                    {ALL_QUIZ_QUESTION_TYPES.map((qt) => (
                      <label key={qt} className="flex items-center gap-1.5 text-xs text-secondary-ink dark:text-muted-ink-on-dark">
                        <input
                          type="checkbox"
                          checked={workingGenPrefs.quizQuestionTypes.includes(qt)}
                          onChange={() => toggleQuizType(setWorkingGenPrefs, qt)}
                          disabled={uploading}
                        />
                        {t(`academics.quiz_type_${qt}`)}
                      </label>
                    ))}
                  </div>
                  {!canPersistGenerationPrefsToDb && (
                    <p className="text-xs leading-relaxed text-muted-ink dark:text-muted-ink-on-dark">
                      {t('academics.missing_generation_options_column')}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => void saveWorkingGenPrefs()}
                    disabled={savingGenPrefs || uploading || !canPersistGenerationPrefsToDb}
                    className="text-sm px-3 py-1.5 border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark disabled:opacity-50"
                  >
                    {savingGenPrefs ? t('academics.saving_prefs') : t('academics.save_generation_prefs')}
                  </button>
                </div>
              </details>
            ) : (
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">{t('academics.select_course_first')}</p>
            )}
            <div className="flex flex-col gap-2">
              <input
                type="file"
                multiple
                accept=".pdf,.pptx,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) =>
                  setSelectedFiles(e.target.files && e.target.files.length > 0 ? Array.from(e.target.files) : [])
                }
                disabled={!selectedCourse || uploading}
                className="text-sm"
              />
              {selectedFiles.length > 0 && (
                <ul className="text-xs space-y-1 text-muted-ink dark:text-muted-ink-on-dark">
                  {selectedFiles.map((f, idx) => (
                    <li key={`${f.name}-${idx}`} className="flex items-center justify-between gap-2">
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        className="shrink-0 text-secondary-ink dark:text-muted-ink-on-dark underline"
                        onClick={() => setSelectedFiles((prev) => prev.filter((_, j) => j !== idx))}
                      >
                        {t('academics.remove_file')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {uploadProgress && (
                <p className="text-xs text-secondary-ink dark:text-muted-ink-on-dark">{uploadProgress}</p>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  disabled={!selectedCourse || selectedFiles.length === 0 || uploading}
                  onClick={() => void handleGenerateContentForCourse()}
                  className={`inline-flex items-center gap-2 px-4 py-2 ${
                    !selectedCourse || selectedFiles.length === 0 || uploading
                      ? 'bg-subtle text-muted-ink dark:text-muted-ink-on-dark cursor-not-allowed'
                      : 'bg-accent-gold text-ink-on-dark'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? t('academics.processing') : t('academics.generate_from_upload')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated content list */}
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-5">
            <h4 className="font-semibold text-ink dark:text-ink-on-dark mb-3">{t('academics.generated_content_heading')}</h4>
            <div className="space-y-2">
              {courseItems.map((item) => (
                <div key={item.id} className="px-3 py-2 bg-chip dark:bg-card-dark text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                  {item.user_library_items?.title || item.item_id}
                </div>
              ))}
              {courseQuizzes.map((quiz) => (
                <div key={quiz.id} className="px-3 py-2 bg-chip dark:bg-card-dark text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                  {quiz.quiz_sessions?.quiz_title || quiz.quiz_session_id}
                </div>
              ))}
              {courseItems.length === 0 && courseQuizzes.length === 0 ? (
                <div className="text-sm text-muted-ink dark:text-muted-ink-on-dark">{t('academics.no_generated_content')}</div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Tutor tab ── */}
      {activeTab === 'tutor' && selectedCourse && (
        <CourseTutor
          courseId={selectedCourse.id}
          courseName={selectedCourse.course_name}
          topicName={selectedCourse.academics_topics?.name || ''}
        />
      )}
      {activeTab === 'tutor' && !selectedCourse && (
        <SelectCourseEmptyState message={t('academics.select_course_first')} />
      )}

      {/* ── Exam Prep tab ── */}
      {activeTab === 'exams' && selectedCourse && (
        <ExamScheduler courseId={selectedCourse.id} />
      )}
      {activeTab === 'exams' && !selectedCourse && (
        <SelectCourseEmptyState message={t('academics.select_course_first')} />
      )}

      {/* ── SRS tab ── */}
      {activeTab === 'srs' && selectedCourse && (
        <SRSReviewPanel
          courseId={selectedCourse.id}
          itemIds={courseItems.map(ci => ci.item_id)}
        />
      )}
      {activeTab === 'srs' && !selectedCourse && (
        <SelectCourseEmptyState message={t('academics.select_course_first')} />
      )}

      {/* ── Analytics tab ── */}
      {activeTab === 'analytics' && selectedCourse && (
        <React.Suspense fallback={
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold" />
          </div>
        }>
          <CourseAnalytics courseId={selectedCourse.id} />
        </React.Suspense>
      )}
      {activeTab === 'analytics' && !selectedCourse && (
        <SelectCourseEmptyState message={t('academics.select_course_first')} />
      )}

      {showCreateCourse ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark w-full max-w-lg p-6">
            <h3 className="font-display text-lg font-semibold text-ink dark:text-ink-on-dark">{t('academics.create_course') || 'Create course'}</h3>
            <div className="space-y-3 mt-4">
              <input
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder={t('academics.placeholder_course_name')}
                className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark text-ink dark:text-ink-on-dark focus:outline-none focus:border-accent-gold"
              />
              <input
                value={newCourseCode}
                onChange={(e) => setNewCourseCode(e.target.value)}
                placeholder={t('academics.placeholder_course_code')}
                className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark text-ink dark:text-ink-on-dark focus:outline-none focus:border-accent-gold"
              />
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark text-ink dark:text-ink-on-dark focus:outline-none focus:border-accent-gold"
              >
                <option value="">{t('academics.select_existing_topic')}</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              <input
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder={t('academics.placeholder_new_topic')}
                className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark text-ink dark:text-ink-on-dark focus:outline-none focus:border-accent-gold"
              />
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateCourse(false)}
                className="px-4 py-2 border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition-opacity"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                disabled={creatingCourse}
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-accent-gold text-sidebar font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {creatingCourse ? t('academics.creating') : (t('common.save') || 'Save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
      {tutorialConfig ? (
        <PageTutorial
          config={tutorialConfig}
          isOpen={isTutorialOpen}
          onClose={hideTutorial}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      ) : null}
    </>
  );
});

