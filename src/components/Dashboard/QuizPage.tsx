import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileQuestion, Clock, Trophy, Play, Trash2, Search, Globe, ChevronDown, Check } from 'lucide-react';
import { PageHeader, SectionTabs, type SectionTab } from '../Scholar';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useDebounce } from '../../hooks/useDebounce';
import { QuizTakingComponent } from './QuizTakingComponent';
import { useI18n } from '../../contexts/I18nContext';
import { useSubscriptionUpsellGate } from '../../contexts/SubscriptionUpsellGateContext';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { PerformanceMonitor } from '../../utils/performanceMonitor';
import { useConfirm } from '../../hooks/useConfirm';
import { LoadingSkeleton } from '../Common/LoadingSkeleton';
import { usePageTutorial } from '../../hooks/usePageTutorial';
import { PageTutorial } from '../Onboarding/PageTutorial';
import { GlobalExamDetailModal } from './GlobalExamDetailModal';
import { ALL_QUIZ_QUESTION_TYPES } from '../../utils/academicsGenerationPreferences';
import { throwIfEdgeFunctionInvokeFailed } from '../../utils/edgeFunctionInvoke';

interface QuizSession {
  id: string;
  quiz_title: string;
  source_type: string;
  question_count: number;
  time_limit_minutes: number | null;
  difficulty_level: string;
  created_at: string;
  folder_id?: string | null;
  quiz_language?: string;
  available_languages?: string[];
  translated_questions_json?: Record<string, any[]>;
}

interface QuizAttempt {
  id: string;
  quiz_session_id: string;
  score_percentage: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  time_taken_seconds: number;
  completed_at: string;
  quiz_sessions: {
    quiz_title: string;
  };
}

interface LibraryItem {
  id: string;
  title: string;
  summary_text: string;
}

interface QuizFolder {
  id: string;
  name: string;
  color?: string;
  user_id: string;
  created_at?: string;
}

interface GlobalExam {
  id: string;
  exam_name: string;
  exam_code: string;
  description: string;
  country: string;
  region?: string;
  exam_type: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  total_questions: number;
  time_limit_minutes: number;
  subject?: string;
  passing_score?: number;
  is_active: boolean;
}

interface GlobalExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  score_percentage: number;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  time_taken_seconds: number;
  started_at: string;
  completed_at: string;
  global_exams: GlobalExam;
}

export const QuizPage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { setBusy } = useSubscriptionUpsellGate();
  const { error: showErrorToast, success: showSuccessToast, warning: showWarningToast } = useToast();
  const { confirm, ConfirmModal } = useConfirm();
  const { shouldShowTutorial, showTutorial, isTutorialOpen, completeTutorial, skipTutorial, config: tutorialConfig } = usePageTutorial('quiz');
  const [activeTab, setActiveTab] = useState<'create' | 'quizzes' | 'explore' | 'history' | 'exams'>('create');
  const [quizViewMode, setQuizViewMode] = useState<'quizzes' | 'exams'>('quizzes');
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryItemsLoading, setLibraryItemsLoading] = useState(false);
  const [quizFolders, setQuizFolders] = useState<QuizFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(true);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  const [selectedSource, setSelectedSource] = useState<'library' | 'upload'>('library');
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<string>('');
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const libraryPickerRef = useRef<HTMLDivElement>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizTitle, setQuizTitle] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [globalExams, setGlobalExams] = useState<GlobalExam[]>([]);
  const [selectedExam, setSelectedExam] = useState<GlobalExam | null>(null);
  const [examCountry, setExamCountry] = useState<string>('all');
  const [examType, setExamType] = useState<string>('all');
  const [examAttempts, setExamAttempts] = useState<GlobalExamAttempt[]>([]);
  const [incompleteExams, setIncompleteExams] = useState<GlobalExamAttempt[]>([]);

  const quizStats = useMemo(() => {
    if (!quizHistory.length) return { maxScore: 0, best: null, average: 0 };
    const maxScore = Math.max(...quizHistory.map(h => Math.round(h.score_percentage)));
    const best = quizHistory.reduce((b, h) => h.score_percentage > b.score_percentage ? h : b, quizHistory[0]);
    const average = Math.round(quizHistory.reduce((s, h) => s + h.score_percentage, 0) / quizHistory.length);
    return { maxScore, best, average };
  }, [quizHistory]);

  // Best score per quiz session (for conditional border-left and score display)
  const sessionBestScore = useMemo(() => {
    const map = new Map<string, number>();
    for (const h of quizHistory) {
      const prev = map.get(h.quiz_session_id);
      if (prev === undefined || h.score_percentage > prev) map.set(h.quiz_session_id, h.score_percentage);
    }
    return map;
  }, [quizHistory]);

  // Stats for "My Quizzes" dark strip
  const myQuizzesStats = useMemo(() => {
    const totalQ = quizSessions.reduce((s, q) => s + q.question_count, 0);
    const scored = quizSessions.filter(q => sessionBestScore.has(q.id)).length;
    const avg = scored > 0
      ? Math.round(quizSessions.filter(q => sessionBestScore.has(q.id)).reduce((s, q) => s + sessionBestScore.get(q.id)!, 0) / scored)
      : 0;
    return { total: quizSessions.length, scored, avg, totalQ };
  }, [quizSessions, sessionBestScore]);

  // Month navigator state (for History tab)
  const [historyMonth, setHistoryMonth] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });

  const historyMonthLabel = useMemo(() => {
    const d = new Date(historyMonth.year, historyMonth.month, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }, [historyMonth]);

  // Filter quiz history to selected month
  const monthlyHistory = useMemo(() => {
    return quizHistory.filter(h => {
      const d = new Date(h.completed_at);
      return d.getFullYear() === historyMonth.year && d.getMonth() === historyMonth.month;
    });
  }, [quizHistory, historyMonth]);

  const monthlyExamAttempts = useMemo(() => {
    return examAttempts.filter(a => {
      const d = new Date(a.completed_at);
      return d.getFullYear() === historyMonth.year && d.getMonth() === historyMonth.month;
    });
  }, [examAttempts, historyMonth]);

  // Monthly stats for History sidebar panel
  const monthlyStats = useMemo(() => {
    const entries = monthlyHistory;
    if (!entries.length) return { avg: 0, best: 0, sittings: 0, globalCount: monthlyExamAttempts.length };
    const avg = Math.round(entries.reduce((s, h) => s + h.score_percentage, 0) / entries.length);
    const best = Math.max(...entries.map(h => Math.round(h.score_percentage)));
    return { avg, best, sittings: entries.length, globalCount: monthlyExamAttempts.length };
  }, [monthlyHistory, monthlyExamAttempts]);

  useEffect(() => {
    setBusy('quiz', !!activeQuizId);
    return () => setBusy('quiz', false);
  }, [activeQuizId, setBusy]);

  // Show tutorial on first visit
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
      // Fetch data based on active tab and view mode
      if (quizViewMode === 'exams') {
        // Global Exams mode
        if (activeTab === 'explore') {
          fetchGlobalExams();
        } else if (activeTab === 'history') {
          fetchExamAttempts();
        } else if (activeTab === 'quizzes') {
          fetchIncompleteExams();
        }
        // Create tab doesn't need data fetching in exams mode
      } else {
        // My Quizzes mode
        fetchQuizSessions();
        fetchQuizHistory();
        fetchQuizFolders();
        if (selectedSource === 'library') {
          fetchLibraryItems();
        }
      }
    }
  }, [user, activeTab, selectedSource, selectedFolder, quizViewMode, examCountry, examType, debouncedSearchQuery]);

  // Dedicated effect: always load library items when "From Library" is selected
  useEffect(() => {
    if (user && selectedSource === 'library') {
      fetchLibraryItems();
    }
  }, [user, selectedSource]);

  // Close library picker on click outside or Escape
  useEffect(() => {
    if (!libraryPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (libraryPickerRef.current && !libraryPickerRef.current.contains(e.target as Node)) {
        setLibraryPickerOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLibraryPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [libraryPickerOpen]);

  const fetchLibraryItems = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    setLibraryItemsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_library_items')
        .select('id, title, summary_text')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        const message = handleSupabaseError(error, { component: 'QuizPage', action: 'fetchLibraryItems' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchLibraryItems' });
        showErrorToast(message);
        return;
      }

      if (data) {
        setLibraryItems(data);
      }
    } catch (error) {
      const message = handleApiError(error, { component: 'QuizPage', action: 'fetchLibraryItems' });
      showErrorToast(message);
    } finally {
      setLibraryItemsLoading(false);
    }
  };

  const fetchQuizSessions = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      setLoading(false);
      return;
    }

    return PerformanceMonitor.measureAsync('QuizPage.fetchQuizSessions', async () => {
      try {
        const { data, error } = await supabase
        .from('quiz_sessions')
        .select('id, quiz_title, source_type, question_count, time_limit_minutes, difficulty_level, created_at, quiz_language, available_languages')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        const message = handleSupabaseError(error, { component: 'QuizPage', action: 'fetchQuizSessions' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchQuizSessions' });
        showErrorToast(message);
        setLoading(false);
        return;
      }

        if (data) {
          setQuizSessions(data);
        }
        setLoading(false);
      } catch (error) {
        const message = handleApiError(error, { component: 'QuizPage', action: 'fetchQuizSessions' });
        showErrorToast(message);
        setLoading(false);
      }
    });
  };

  const fetchQuizHistory = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    return PerformanceMonitor.measureAsync('QuizPage.fetchQuizHistory', async () => {
      try {
        const { data, error } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quiz_sessions!inner(quiz_title)
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      if (error) {
        const message = handleSupabaseError(error, { component: 'QuizPage', action: 'fetchQuizHistory' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchQuizHistory' });
        showErrorToast(message);
        return;
      }

        if (data) {
          setQuizHistory(data as QuizAttempt[]);
        }
      } catch (error) {
        const message = handleApiError(error, { component: 'QuizPage', action: 'fetchQuizHistory' });
        showErrorToast(message);
      }
    });
  };

  const fetchQuizFolders = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quiz_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        const message = handleSupabaseError(error, { component: 'QuizPage', action: 'fetchQuizFolders' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchQuizFolders' });
        showErrorToast(message);
        return;
      }

      if (data) {
        setQuizFolders(data);
      }
    } catch (error) {
      const message = handleApiError(error, { component: 'QuizPage', action: 'fetchQuizFolders' });
      showErrorToast(message);
    }
  };

  const fetchExamAttempts = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      setLoading(false);
      return;
    }

    return PerformanceMonitor.measureAsync('QuizPage.fetchExamAttempts', async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('global_exam_attempts')
          .select(`
            *,
            global_exams (*)
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(50);

        if (error) {
          const message = handleSupabaseError(error, { component: 'QuizPage', action: 'fetchExamAttempts' });
          ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchExamAttempts' });
          showErrorToast(message);
          setLoading(false);
          return;
        }

        if (data) {
          setExamAttempts(data as GlobalExamAttempt[]);
        }
        setLoading(false);
      } catch (error) {
        const message = handleApiError(error, { component: 'QuizPage', action: 'fetchExamAttempts' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchExamAttempts' });
        showErrorToast(message);
        setLoading(false);
      }
    });
  };

  const fetchIncompleteExams = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      setLoading(false);
      return;
    }

    return PerformanceMonitor.measureAsync('QuizPage.fetchIncompleteExams', async () => {
      try {
        setLoading(true);
        // Fetch all attempts for the user
        const { data: allAttempts, error } = await supabase
          .from('global_exam_attempts')
          .select(`
            *,
            global_exams (*)
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(100);

        if (error) {
          const message = handleSupabaseError(error, { component: 'QuizPage', action: 'fetchIncompleteExams' });
          ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchIncompleteExams' });
          showErrorToast(message);
          setLoading(false);
          return;
        }

        if (allAttempts) {
          // Filter for incomplete exams: high unanswered count or very short time taken
          const incomplete = allAttempts.filter((attempt: GlobalExamAttempt) => {
            const exam = attempt.global_exams;
            if (!exam || exam.total_questions === 0) return false;

            const unansweredRatio = attempt.unanswered_count / exam.total_questions;

            // Check time ratio only if time limit is valid (> 0)
            let timeRatio = 0;
            if (exam.time_limit_minutes > 0) {
              timeRatio = attempt.time_taken_seconds / (exam.time_limit_minutes * 60);
            }

            // Consider incomplete if:
            // 1. More than 50% unanswered, OR
            // 2. Less than 10% of time limit used (likely abandoned) - only if time limit exists
            return unansweredRatio > 0.5 || (exam.time_limit_minutes > 0 && timeRatio < 0.1);
          }).filter((attempt: GlobalExamAttempt) => attempt.global_exams !== null) as GlobalExamAttempt[];

          setIncompleteExams(incomplete);
        }
        setLoading(false);
      } catch (error) {
        const message = handleApiError(error, { component: 'QuizPage', action: 'fetchIncompleteExams' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchIncompleteExams' });
        showErrorToast(message);
        setLoading(false);
      }
    });
  };

  const fetchGlobalExams = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    return PerformanceMonitor.measureAsync('QuizPage.fetchGlobalExams', async () => {
      try {
        setLoading(true);

        let query = supabase
          .from('global_exams')
          .select('*')
          .eq('is_active', true);

        // Apply country filter
        if (examCountry !== 'all') {
          query = query.eq('country', examCountry);
        }

        // Apply exam type filter
        if (examType !== 'all') {
          query = query.eq('exam_type', examType);
        }

        // Apply search filter (using debounced value)
        if (debouncedSearchQuery) {
          const escapedQuery = debouncedSearchQuery.replace(/[%_*]/g, '\\$&');
          query = query.or(`exam_name.ilike.*${escapedQuery}*,exam_code.ilike.*${escapedQuery}*,description.ilike.*${escapedQuery}*`);
        }

        query = query.order('exam_name');

        const { data, error } = await query;

        if (error) {
          const message = handleSupabaseError(error, { component: 'QuizPage', action: 'fetchGlobalExams' });
          ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'fetchGlobalExams' });
          showErrorToast(message);
          return;
        }

        setGlobalExams(data || []);
      } catch (err) {
        const message = handleApiError(err, { component: 'QuizPage', action: 'fetchGlobalExams' });
        ErrorLogger.error(err instanceof Error ? err : new Error(String(err)), { component: 'QuizPage', action: 'fetchGlobalExams' });
        showErrorToast(message);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim()) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { error } = await supabase
        .from('quiz_folders')
        .insert({
          user_id: user.id,
          name: newFolderName.trim(),
          color: newFolderColor
        });

      if (error) {
        const message = handleSupabaseError(error, { component: 'QuizPage', action: 'handleCreateFolder' });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'handleCreateFolder' });
        showErrorToast(message);
        return;
      }

      await fetchQuizFolders();
      setNewFolderName('');
      setNewFolderColor('#3B82F6');
      setShowCreateFolder(false);
      showSuccessToast('Folder created successfully');
    } catch (error) {
      const message = handleApiError(error, { component: 'QuizPage', action: 'handleCreateFolder' });
      showErrorToast(message);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!user) return;
    const confirmed = await confirm('Delete this folder? Quizzes will not be deleted.', {
      title: 'Delete Folder',
      variant: 'destructive',
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      await supabase
        .from('quiz_sessions')
        .update({ folder_id: null })
        .eq('folder_id', folderId);

      const { error } = await supabase
        .from('quiz_folders')
        .delete()
        .eq('id', folderId);

      if (error) {
        const message = handleSupabaseError(error, { component: 'QuizPage', action: 'handleDeleteFolder', metadata: { folderId } });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'handleDeleteFolder', metadata: { folderId } });
        showErrorToast(message);
        return;
      }

      await fetchQuizFolders();
      setSelectedFolder('all');
      showSuccessToast('Folder deleted successfully');
    } catch (error) {
      const message = handleApiError(error, { component: 'QuizPage', action: 'handleDeleteFolder', metadata: { folderId } });
      showErrorToast(message);
    }
  };

  const handleMoveQuizToFolder = async (quizId: string, folderId: string | null) => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .update({ folder_id: folderId })
        .eq('id', quizId);

      if (error) {
        const message = handleSupabaseError(error, { component: 'QuizPage', action: 'handleMoveQuizToFolder', metadata: { quizId, folderId } });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'handleMoveQuizToFolder', metadata: { quizId, folderId } });
        showErrorToast(message);
        return;
      }

      await fetchQuizSessions();
    } catch (error) {
      const message = handleApiError(error, { component: 'QuizPage', action: 'handleMoveQuizToFolder', metadata: { quizId, folderId } });
      showErrorToast(message);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!user) return;

    if (selectedSource === 'library' && !selectedLibraryItem) {
      showErrorToast(t('quiz.select_library_item'));
      return;
    }

    if (selectedSource === 'upload' && !uploadedFile) {
      showErrorToast(t('quiz.upload_document'));
      return;
    }

    if (!quizTitle.trim()) {
      showErrorToast(t('quiz.enter_title'));
      return;
    }

    setGenerating(true);
    ErrorLogger.debug('Starting quiz generation', { component: 'QuizPage', action: 'handleGenerateQuiz', source: selectedSource, questionCount, difficulty, title: quizTitle });

    const timeoutId = setTimeout(() => {
      if (generating) {
        showWarningToast('Quiz generation is taking longer than expected. This might indicate an issue with the API configuration. Please check that ANTHROPIC_API_KEY is configured in your Supabase project settings.');
      }
    }, 30000);

    try {
      let textContent = '';
      let sourceId: string | undefined;

      if (selectedSource === 'library') {
        ErrorLogger.debug('Fetching content from library item', { component: 'QuizPage', action: 'handleGenerateQuiz', libraryItemId: selectedLibraryItem });
        const item = libraryItems.find(i => i.id === selectedLibraryItem);
        if (item) {
          textContent = item.summary_text;
          sourceId = item.id;
          ErrorLogger.debug('Library item found', { component: 'QuizPage', action: 'handleGenerateQuiz', libraryItemId: selectedLibraryItem, contentLength: textContent.length });
        } else {
          throw new Error('Selected library item not found');
        }
      } else {
        const fileType = uploadedFile!.name.split('.').pop()?.toUpperCase() || 'FILE';
        ErrorLogger.debug('Extracting text from file', { component: 'QuizPage', action: 'handleGenerateQuiz', fileType, fileName: uploadedFile!.name, fileSizeKB: (uploadedFile!.size / 1024).toFixed(2) });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          const error = new Error('No active session');
          ErrorLogger.error(error, { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name });
          throw error;
        }
        ErrorLogger.debug('Active session verified', { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name });

        const formData = new FormData();
        formData.append('file', uploadedFile!);
        ErrorLogger.debug('FormData created, calling extract-text function', { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name });

        const extractStartTime = Date.now();
        const extractResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-text`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: formData,
          }
        );
        const extractDuration = Date.now() - extractStartTime;
        ErrorLogger.debug('Extract-text function responded', { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name, durationSeconds: (extractDuration / 1000).toFixed(2) });

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json().catch(() => ({}));

          let userFriendlyError = errorData.error || `Text extraction failed: ${extractResponse.statusText}`;

          if (fileType === 'PPTX' && userFriendlyError.includes('no readable text')) {
            userFriendlyError += '\n\nTips for PowerPoint files:\n- Ensure slides contain actual text (not just images)\n- Check that text boxes are not empty\n- Try copying text from slides and pasting directly instead';
          } else if (fileType === 'DOCX' && userFriendlyError.includes('no readable text')) {
            userFriendlyError += '\n\nTips for Word documents:\n- Ensure document contains actual text (not just images/tables)\n- Check that document is not corrupted\n- Try saving as a new .docx file and uploading again';
          }

          const error = new Error(userFriendlyError);
          ErrorLogger.error(error, { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name, status: extractResponse.status, errorData });
          throw error;
        }

        ErrorLogger.debug('Extract-text succeeded, parsing response', { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name });
        const extractData = await extractResponse.json();
        ErrorLogger.debug('Extraction results', { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name, textLength: extractData?.text?.length || 0, pageCount: extractData?.pageCount || 'unknown', extractionMethod: extractData?.extractionMethod || 'unknown' });

        if (extractData?.text) {
          textContent = extractData.text;
          const wordCount = textContent.split(/\s+/).filter((w: string) => w.length > 0).length;
          ErrorLogger.info('Text extraction complete and validated', { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name, wordCount, textLength: textContent.length });
        } else {
          const error = new Error(extractData?.error || 'Failed to extract text from file');
          ErrorLogger.error(error, { component: 'QuizPage', action: 'handleGenerateQuiz', fileName: uploadedFile!.name });
          throw error;
        }
      }

      ErrorLogger.debug('Validating content length for quiz generation', { component: 'QuizPage', action: 'handleGenerateQuiz', textLength: textContent.length });
      if (textContent.length < 300) {
        ErrorLogger.warn('Content too short', { component: 'QuizPage', action: 'handleGenerateQuiz', textLength: textContent.length });
        const wordCount = textContent.split(/\s+/).filter((w: string) => w.length > 0).length;
        showErrorToast(
          `Content is too short to generate a meaningful quiz.\n\n` +
          `Current: ${textContent.length} characters (${wordCount} words)\n` +
          `Required: At least 300 characters\n\n` +
          `Please provide more content or try a different file.`
        );
        setGenerating(false);
        clearTimeout(timeoutId);
        return;
      }
      ErrorLogger.info('Content length validated', { component: 'QuizPage', action: 'handleGenerateQuiz', textLength: textContent.length });

      ErrorLogger.debug('Sending quiz generation request to Edge Function', { component: 'QuizPage', action: 'handleGenerateQuiz', textLength: textContent.length, questionCount, difficulty, sourceType: selectedSource === 'library' ? 'library_item' : 'uploaded_document', quizTitle: quizTitle.trim() });

      const quizGenStartTime = Date.now();
      const { data: quizData, error: invokeError } = await supabase.functions.invoke('generate-quiz', {
        body: {
          text: textContent,
          questionCount,
          difficulty,
          sourceType: selectedSource === 'library' ? 'library_item' : 'uploaded_document',
          sourceId,
          quizTitle: quizTitle.trim(),
          targetLanguage,
          questionTypes: [...ALL_QUIZ_QUESTION_TYPES],
        }
      });
      const quizGenDuration = Date.now() - quizGenStartTime;
      ErrorLogger.debug('Quiz generation completed', { component: 'QuizPage', action: 'handleGenerateQuiz', durationSeconds: (quizGenDuration / 1000).toFixed(2) });

      throwIfEdgeFunctionInvokeFailed(quizData, invokeError);

      ErrorLogger.debug('Quiz generation response', { component: 'QuizPage', action: 'handleGenerateQuiz', success: quizData.success, questionCount: quizData.questionCount });

      if (quizData.success) {
        ErrorLogger.info('Quiz generated successfully', { component: 'QuizPage', action: 'handleGenerateQuiz', quizSessionId: quizData.quizSessionId, questionCount: quizData.questionCount });
        showSuccessToast(t('quiz.generation_success', { count: quizData.questionCount, difficulty: t(`quiz.difficulty_${difficulty}`) }));
        setQuizTitle('');
        setSelectedLibraryItem('');
        setUploadedFile(null);
        setTargetLanguage('en');
        setActiveTab('quizzes');
        ErrorLogger.debug('Refreshing quiz sessions list', { component: 'QuizPage', action: 'handleGenerateQuiz' });
        await fetchQuizSessions();
        ErrorLogger.info('Quiz creation flow complete', { component: 'QuizPage', action: 'handleGenerateQuiz', quizSessionId: quizData.quizSessionId });
      } else {
        const errorMessage = quizData.error || 'Failed to generate quiz';

        if (errorMessage.includes('API key') || errorMessage.includes('ANTHROPIC_API_KEY')) {
          throw new Error('Quiz generation failed: ANTHROPIC_API_KEY is not configured in Supabase Edge Functions. Please add it to your Supabase project settings under Edge Functions > Secrets.');
        } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
          throw new Error('Quiz generation failed: API quota exceeded. Please try again later or check your Anthropic API usage.');
        } else if (errorMessage.includes('parse') || errorMessage.includes('JSON') || errorMessage.includes('SyntaxError')) {
          throw new Error('Quiz generation encountered a formatting error from the AI service. This is usually temporary. Please try again.');
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          throw new Error('Quiz generation timed out. The AI service may be busy. Please try again in a moment.');
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = handleApiError(error, {
        component: 'QuizPage',
        action: 'handleGenerateQuiz',
        metadata: { questionCount, difficulty, selectedSource }
      });

      ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), {
        component: 'QuizPage',
        action: 'handleGenerateQuiz',
        metadata: { questionCount, difficulty, selectedSource }
      });

      showErrorToast(errorMessage);
    } finally {
      clearTimeout(timeoutId);
      setGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    const confirmed = await confirm(t('quiz.confirm_delete'), {
      title: t('quiz.confirm_delete_title') || 'Delete Quiz',
      variant: 'destructive',
      confirmText: t('quiz.delete') || 'Delete',
    });
    if (!confirmed) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      return;
    }

    try {
      const { error } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', quizId);

      if (error) {
        const message = handleSupabaseError(error, { component: 'QuizPage', action: 'handleDeleteQuiz', metadata: { quizId } });
        ErrorLogger.error(error instanceof Error ? error : new Error(String(error)), { component: 'QuizPage', action: 'handleDeleteQuiz', metadata: { quizId } });
        showErrorToast(message);
        return;
      }

      await fetchQuizSessions();
      showSuccessToast(t('quiz.deleted_successfully') || 'Quiz deleted successfully');
    } catch (error) {
      const message = handleApiError(error, { component: 'QuizPage', action: 'handleDeleteQuiz', metadata: { quizId } });
      showErrorToast(message);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
  };

  const handleQuizComplete = () => {
    setActiveQuizId(null);
    fetchQuizHistory();
  };

  const handleQuizExit = async () => {
    try {
      ErrorLogger.debug('Quiz exit requested', {
        component: 'QuizPage',
        action: 'handleQuizExit',
        userId: user?.id,
        metadata: { activeQuizId }
      });

      const confirmed = await confirm(t('quiz.confirm_exit'), {
        title: t('quiz.confirm_exit_title') || 'Exit Quiz',
        variant: 'default',
        confirmText: t('quiz.exit') || 'Exit',
      });

      if (confirmed) {
        ErrorLogger.debug('Quiz exit confirmed, resetting activeQuizId', {
          component: 'QuizPage',
          action: 'handleQuizExit',
          userId: user?.id,
          metadata: { activeQuizId }
        });
        setActiveQuizId(null);
        // Ensure we're back to the quizzes tab
        setActiveTab('quizzes');
      } else {
        ErrorLogger.debug('Quiz exit cancelled', {
          component: 'QuizPage',
          action: 'handleQuizExit',
          userId: user?.id
        });
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, {
        component: 'QuizPage',
        action: 'handleQuizExit',
        userId: user?.id,
        metadata: { activeQuizId, error: 'Exit confirmation failed' }
      });
      // Fallback: exit without confirmation if confirm dialog fails
      showWarningToast('Exiting quiz...');
      setActiveQuizId(null);
      setActiveTab('quizzes');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDifficultyBadgeClass = (level: string) => {
    const map: Record<string, string> = {
      easy: 'bg-chip text-muted-ink dark:text-muted-ink-on-dark',
      beginner: 'bg-chip text-muted-ink dark:text-muted-ink-on-dark',
      medium: 'bg-chip text-secondary-ink dark:text-muted-ink-on-dark',
      intermediate: 'bg-chip text-secondary-ink dark:text-muted-ink-on-dark',
      hard: 'bg-ink text-ink-on-dark',
      advanced: 'bg-ink text-ink-on-dark',
    };
    return map[level] ?? map.medium;
  };

  if (activeQuizId) {
    return (
      <QuizTakingComponent
        quizId={activeQuizId}
        onComplete={handleQuizComplete}
        onExit={handleQuizExit}
      />
    );
  }

  return (
    <>
    <div className="w-full min-h-0 p-4 sm:p-6">
      <div className="w-full">
        <div className="mb-6">
          <PageHeader
            eyebrow={t('quiz.eyebrow') || 'Examinations'}
            title={t('quiz.page_title') || t('quiz.quizzes_and_exams') || 'Quizzes & Exams'}
            descriptor={t('quiz.descriptor') || 'Compose a new quiz, sit a global exam, or revisit your previous attempts.'}
            className="mb-5"
            actions={
              <div
                role="tablist"
                aria-label={t('quiz.view_mode') || 'View mode'}
                className="flex gap-6 items-baseline pb-1 border-b border-divider dark:border-divider-on-dark"
              >
                {([['quizzes', t('quiz.my_quizzes') || 'My Quizzes'], ['exams', t('quiz.global_exams') || 'Global Exams']] as const).map(([k, l]) => {
                  const on = quizViewMode === k;
                  return (
                    <button
                      key={k}
                      role="tab"
                      aria-selected={on}
                      onClick={() => {
                        setQuizViewMode(k);
                        if (k === 'exams' && activeTab === 'quizzes') setActiveTab('explore');
                        if (k === 'quizzes' && activeTab === 'exams') setActiveTab('quizzes');
                      }}
                      className={`bg-transparent border-none pb-[6px] cursor-pointer font-display text-[14px] font-medium transition-colors ${
                        on
                          ? 'text-ink dark:text-ink-on-dark font-semibold border-b-2 border-accent-gold'
                          : 'text-muted-ink dark:text-muted-ink-on-dark border-b-2 border-transparent'
                      }`}
                      style={{ marginBottom: '-1px' }}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            }
          />

          <SectionTabs
            className="mt-6"
            ariaLabel={t('quiz.sections') || 'Quiz sections'}
            activeId={activeTab}
            onChange={(id) => {
              const next = id as 'create' | 'quizzes' | 'explore' | 'history';
              setActiveTab(next);
              if (next === 'quizzes' && quizViewMode !== 'exams') {
                setQuizViewMode('quizzes');
              }
            }}
            tabs={[
              { id: 'create', label: t('quiz.create_quiz') },
              {
                id: 'quizzes',
                label: quizViewMode === 'exams'
                  ? (t('quiz.my_exams') || 'My Exams')
                  : (t('quiz.my_quizzes') || 'My Quizzes'),
                count: quizViewMode === 'exams' ? incompleteExams.length : quizSessions.length,
              },
              { id: 'explore', label: t('quiz.explore') || 'Explore' },
              {
                id: 'history',
                label: quizViewMode === 'exams'
                  ? (t('quiz.exam_history') || 'Exam History')
                  : (t('quiz.history') || 'History'),
                count: quizViewMode === 'exams' ? examAttempts.length : quizHistory.length,
              },
            ] as SectionTab[]}
          />
        </div>

        {/* ── Create Tab ── */}
        {activeTab === 'create' && (
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
            {quizViewMode === 'exams' ? (
              <div className="text-center py-16">
                <Globe className="h-10 w-10 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-5" />
                <p className="font-display text-xl font-semibold text-ink dark:text-ink-on-dark mb-2">
                  {t('quiz.exams_cannot_be_created') || 'Global exams cannot be created'}
                </p>
                <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-6">
                  {t('quiz.exams_cannot_be_created_message') || "Switch to My Quizzes mode to compose a custom examination."}
                </p>
                <button
                  onClick={() => setQuizViewMode('quizzes')}
                  className="px-6 py-2.5 bg-ink text-ink-on-dark text-sm font-semibold hover:opacity-80 transition-opacity"
                >
                  {t('quiz.switch_to_quizzes') || 'Switch to My Quizzes'}
                </button>
              </div>
            ) : (
              <div className="grid gap-[22px]" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
              {/* Left: form */}
              <div>
                {/* Eyebrow label */}
                <p className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-[5px]">
                  {t('quiz.create_new') || 'Subject of examination'}
                </p>
                {/* Title underline input */}
                <div className="pb-2 border-b border-ink dark:border-ink-on-dark mb-4">
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder={t('quiz.quiz_title_placeholder') || 'An examination on…'}
                    maxLength={200}
                    className="w-full bg-transparent font-display text-[21px] text-muted-ink dark:text-muted-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark focus:outline-none"
                  />
                </div>

                <div className="space-y-[14px]">
                  {/* Content Source — 2-col selector matching Quiz4 design */}
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { k: 'library' as const, l: t('quiz.from_library') || 'From Library', sub: `${libraryItems.length} volumes` },
                      { k: 'upload'  as const, l: t('quiz.upload_file')   || 'Submit anew',  sub: 'upload a file' },
                    ]).map(s => {
                      const on = selectedSource === s.k;
                      return (
                        <button
                          key={s.k}
                          type="button"
                          onClick={() => setSelectedSource(s.k)}
                          className={`py-[16px] px-[14px] text-center cursor-pointer transition-colors ${
                            on
                              ? 'border-2 border-accent-gold bg-accent-gold-soft'
                              : 'border border-divider dark:border-divider-on-dark bg-transparent'
                          }`}
                        >
                          <div className={`font-display text-[15px] font-semibold ${on ? 'text-accent-gold' : 'text-secondary-ink dark:text-muted-ink-on-dark'}`}>{s.l}</div>
                          <div className={`font-display text-[11px] mt-[3px] ${on ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>{s.sub}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Library Item or Upload File — searchable picker */}
                  {selectedSource === 'library' && (
                    <div ref={libraryPickerRef} className="relative">
                      <label className="block text-xs font-semibold text-muted-ink dark:text-muted-ink-on-dark mb-1.5 uppercase tracking-wider">
                        {t('quiz.select_item')}
                      </label>
                      <button
                        type="button"
                        onClick={() => !libraryItemsLoading && setLibraryPickerOpen((o) => !o)}
                        disabled={libraryItemsLoading}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border text-left transition-all min-h-[42px] bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark hover:border-ink/40 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span className={`truncate text-sm ${selectedLibraryItem ? 'text-ink dark:text-ink-on-dark' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                          {libraryItemsLoading
                            ? t('quiz.loading_library')
                            : selectedLibraryItem
                              ? (libraryItems.find((i) => i.id === selectedLibraryItem)?.title ?? selectedLibraryItem)
                              : libraryItems.length === 0
                                ? t('quiz.no_library_items_yet')
                                : t('quiz.choose_item')}
                        </span>
                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform text-muted-ink ${libraryPickerOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {libraryPickerOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 border  overflow-hidden bg-card-light dark:bg-card-dark border-divider dark:border-divider-on-dark">
                          <div className="p-2 border-b sticky top-0 z-10 border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark">
                            <div className="flex items-center gap-2 px-2 py-1.5 bg-subtle dark:bg-subtle-on-dark">
                              <Search className="h-4 w-4 shrink-0 text-muted-ink" />
                              <input
                                type="text"
                                value={librarySearchQuery}
                                onChange={(e) => setLibrarySearchQuery(e.target.value)}
                                placeholder={t('quiz.search_library_placeholder')}
                                className="flex-1 bg-transparent text-sm outline-none min-w-0 text-ink dark:text-ink-on-dark"
                              />
                            </div>
                          </div>
                          <div className="max-h-56 overflow-y-auto p-1">
                            {libraryItemsLoading ? (
                              <div className="py-4 text-center text-sm text-muted-ink dark:text-muted-ink-on-dark">{t('quiz.loading_library')}</div>
                            ) : (() => {
                              const q = librarySearchQuery.trim().toLowerCase();
                              const filtered = q
                                ? libraryItems.filter(
                                    (i) =>
                                      i.title.toLowerCase().includes(q) ||
                                      (i.summary_text && i.summary_text.toLowerCase().includes(q))
                                  )
                                : libraryItems;
                              if (filtered.length === 0) {
                                return (
                                  <div className="py-4 text-center text-sm text-muted-ink dark:text-muted-ink-on-dark">
                                    {libraryItems.length === 0 ? t('quiz.no_library_items_yet') : t('quiz.no_matches')}
                                  </div>
                                );
                              }
                              return (
                                <ul className="space-y-0.5">
                                  {filtered.map((item) => (
                                    <li key={item.id}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedLibraryItem(item.id);
                                          setLibraryPickerOpen(false);
                                          setLibrarySearchQuery('');
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${item.id === selectedLibraryItem ? 'bg-accent-gold/15 text-accent-gold' : 'text-ink dark:text-ink-on-dark hover:bg-subtle dark:hover:bg-subtle-on-dark'}`}
                                      >
                                        {item.id === selectedLibraryItem && <Check className="h-4 w-4 shrink-0 text-accent-gold" />}
                                        <span className="flex-1 min-w-0">
                                          <span className="font-medium block truncate">{item.title}</span>
                                          {item.summary_text && (
                                            <span className="text-xs block truncate mt-0.5 text-muted-ink dark:text-muted-ink-on-dark">
                                              {item.summary_text.slice(0, 80)}{item.summary_text.length > 80 ? '…' : ''}
                                            </span>
                                          )}
                                        </span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSource === 'upload' && (
                    <div>
                      <label className="block text-xs font-semibold text-muted-ink dark:text-muted-ink-on-dark mb-1.5 uppercase tracking-wider">
                        {t('quiz.upload_document_label')}
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.docx,.pptx"
                        onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 input-clean text-sm"
                      />
                    </div>
                  )}

                  {/* Row: Question count */}
                  <div className="flex justify-between items-center">
                    <span className="font-display text-[12px] text-secondary-ink dark:text-muted-ink-on-dark">{t('quiz.question_count') || 'Number of questions'}</span>
                    <div className="flex items-stretch">
                      <button type="button" onClick={() => setQuestionCount(c => Math.max(5, c - 5))} className="w-7 h-7 bg-transparent border border-divider dark:border-divider-on-dark text-muted-ink text-lg grid place-items-center cursor-pointer">−</button>
                      <div className="w-11 h-7 border-y border-divider dark:border-divider-on-dark flex items-center justify-center font-display text-[14px] font-semibold text-ink dark:text-ink-on-dark">{questionCount}</div>
                      <button type="button" onClick={() => setQuestionCount(c => Math.min(50, c + 5))} className="w-7 h-7 bg-transparent border border-divider dark:border-divider-on-dark text-muted-ink text-lg grid place-items-center cursor-pointer">+</button>
                    </div>
                  </div>

                  {/* Row: Difficulty */}
                  <div className="flex justify-between items-center">
                    <span className="font-display text-[12px] text-secondary-ink dark:text-muted-ink-on-dark">{t('quiz.difficulty_level') || 'Difficulty'}</span>
                    <div className="flex border border-divider dark:border-divider-on-dark overflow-hidden">
                      {(['easy', 'medium', 'hard'] as const).map((d, j) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`px-4 py-[7px] font-display text-[12px] font-semibold cursor-pointer border-none transition-colors ${
                            j < 2 ? 'border-r border-divider dark:border-divider-on-dark' : ''
                          } ${difficulty === d ? 'bg-sidebar text-card-light' : 'bg-card-light dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark'}`}
                        >
                          {t(`quiz.difficulty_${d}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Row: Language */}
                  <div className="flex justify-between items-center">
                    <span className="font-display text-[12px] text-secondary-ink dark:text-muted-ink-on-dark">{t('quiz.quiz_language') || 'Language'}</span>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="min-w-[170px] px-3 py-[7px] border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark font-display text-[13px] font-semibold cursor-pointer"
                    >
                      <option value="en">{t('quiz.language_en')}</option>
                      <option value="ar">{t('quiz.language_ar')}</option>
                      <option value="fr">{t('quiz.language_fr')}</option>
                      <option value="tr">{t('quiz.language_tr')}</option>
                    </select>
                  </div>

                  {/* Generate CTA */}
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={generating || !quizTitle.trim()}
                    className="w-full py-[11px] bg-sidebar text-card-light font-display text-[13px] font-medium text-center border-none cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {generating ? t('quiz.generating') : `${t('quiz.generate') || 'Compose the examination'} →`}
                  </button>
                </div>
              </div>

              {/* Right: dark stats panel */}
              <div>
                <div className="bg-sidebar p-[22px] mb-4">
                  <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold">Highest mark</div>
                  <div className="font-display leading-none mt-2" style={{ fontSize: 58, fontWeight: 600, color: 'var(--color-card-light, #f8f4ec)' }}>
                    {quizHistory.length > 0 ? `${quizStats.maxScore}` : '—'}
                    <span className="text-[22px] text-accent-gold">%</span>
                  </div>
                  {quizStats.best && (
                    <div className="font-display text-[12px] text-accent-gold mt-1.5">{quizStats.best.quiz_sessions?.quiz_title?.slice(0, 32) || '—'}</div>
                  )}
                  <div className="h-px bg-accent-gold opacity-20 mt-3.5" />
                  <div className="flex justify-between mt-2.5">
                    {([
                      [String(quizHistory.length), 'sittings'],
                      [quizHistory.length > 0 ? `${quizStats.average}%` : '—', 'average'],
                      [String(myQuizzesStats.totalQ), 'questions'],
                    ] as [string, string][]).map(([v, l]) => (
                      <div key={l} className="text-center">
                        <div className="font-display text-[18px] font-bold text-card-light">{v}</div>
                        <div className="text-[9px] tracking-[1.5px] uppercase text-accent-gold mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {quizHistory.length > 0 && (
                  <>
                    <div className="text-[9px] tracking-[2px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark mb-2.5">Recent sittings</div>
                    {quizHistory.slice(0, 3).map((r, i) => (
                      <div key={r.id} className={`flex items-start gap-[10px] py-[11px] ${i < Math.min(2, quizHistory.length - 1) ? 'border-b border-divider dark:border-divider-on-dark' : ''}`}>
                        <span className="font-display text-[12px] text-accent-gold w-6 pt-[1px] flex-shrink-0">{['i.','ii.','iii.'][i]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-ink dark:text-ink-on-dark leading-snug truncate">{r.quiz_sessions?.quiz_title}</div>
                          <div className="font-display text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">
                            {new Date(r.completed_at).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="font-display text-[16px] font-semibold text-ink dark:text-ink-on-dark flex-shrink-0">
                          {Math.round(r.score_percentage)}<span className="text-[10px] text-accent-gold">%</span>
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
              </div>
            )}
          </div>
        )}

        {/* ── My Quizzes / My Exams Tab ── */}
        {activeTab === 'quizzes' && (
          <div className="space-y-[10px]">
            {quizViewMode === 'quizzes' ? (
              /* My Quizzes — stats strip + 2-col card grid */
              <>
                {/* Stats strip (dark) */}
                {!loading && quizSessions.length > 0 && (
                  <div className="flex bg-sidebar mb-[6px]">
                    {([
                      [`${myQuizzesStats.scored}/${myQuizzesStats.total}`, 'completed'],
                      [`${myQuizzesStats.avg}%`, 'average score'],
                      [String(myQuizzesStats.totalQ), 'total questions'],
                      [String(new Set(quizSessions.map(q => q.difficulty_level)).size), 'difficulty levels'],
                    ] as [string, string][]).map(([v, l], i) => (
                      <div key={i} className="flex-1 py-3 px-5 text-center border-r border-page-light/[.08] last:border-r-0">
                        <div className="font-display text-[22px] font-semibold text-ink-on-dark leading-none">{v}</div>
                        <div className="text-[9px] tracking-[2px] uppercase text-accent-gold mt-1">{l}</div>
                      </div>
                    ))}
                  </div>
                )}
                {loading ? (
                  <LoadingSkeleton type="card" count={3} />
                ) : quizSessions.length === 0 ? (
                  <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark py-16 flex flex-col items-center">
                    <FileQuestion className="h-9 w-9 text-muted-ink dark:text-muted-ink-on-dark mb-4" />
                    <p className="font-display text-lg font-semibold text-ink dark:text-ink-on-dark mb-1">{t('quiz.no_quizzes')}</p>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">{t('quiz.create_first')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                    {quizSessions.map((quiz) => {
                      const bestScore = sessionBestScore.get(quiz.id);
                      const hasScore = bestScore !== undefined;
                      return (
                        <div
                          key={quiz.id}
                          className={`bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-l-[3px]  flex gap-[14px] ${hasScore ? 'border-l-accent-gold' : 'border-l-divider dark:border-l-divider-on-dark'}`}
                          style={{ padding: '14px 16px' }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] tracking-[2px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark mb-1">
                              {new Date(quiz.created_at).toLocaleDateString()}
                            </p>
                            <h3 className="font-display font-semibold text-[14px] text-ink dark:text-ink-on-dark leading-[1.3] mb-[9px]">
                              {quiz.quiz_title}
                            </h3>
                            <div className="flex flex-wrap gap-[5px]">
                              {[quiz.difficulty_level, `${quiz.question_count} q.`, quiz.source_type].map((chip, ci) => (
                                <span key={ci} className="text-[9.5px] font-bold tracking-[0.5px] px-[7px] py-[3px] bg-subtle dark:bg-subtle-on-dark text-secondary-ink dark:text-muted-ink-on-dark border border-divider dark:border-divider-on-dark">
                                  {chip}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-end justify-between">
                            {hasScore
                              ? <div className="font-display text-[30px] font-semibold text-ink dark:text-ink-on-dark leading-none text-right">
                                  {Math.round(bestScore)}<span className="text-[12px] text-accent-gold">%</span>
                                </div>
                              : <div className="font-display text-[11px] text-muted-ink dark:text-muted-ink-on-dark text-right">Not started</div>
                            }
                            <div className="flex flex-col gap-[5px] items-end">
                              {hasScore && (
                                <button className="inline-flex px-[10px] py-1 bg-transparent border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-[11px] font-display cursor-pointer">
                                  Review
                                </button>
                              )}
                              <button
                                onClick={() => handleStartQuiz(quiz.id)}
                                className="inline-flex px-[10px] py-1 bg-ink dark:bg-ink-on-dark border border-ink dark:border-ink-on-dark text-ink-on-dark dark:text-ink text-[11px] font-display font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                {hasScore ? 'Retake →' : 'Begin →'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* My Exams — Incomplete Exams */
              <>
                {loading ? (
                  <LoadingSkeleton type="card" count={3} />
                ) : incompleteExams.length === 0 ? (
                  <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark py-16 flex flex-col items-center">
                    <Clock className="h-9 w-9 text-muted-ink dark:text-muted-ink-on-dark mb-4" />
                    <p className="font-display text-lg font-semibold text-ink dark:text-ink-on-dark mb-1">
                      {t('quiz.no_incomplete_exams') || 'No incomplete exams'}
                    </p>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                      {t('quiz.start_exam_to_continue') || 'Start an exam to continue it later'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incompleteExams
                      .filter((attempt) => attempt.global_exams !== null)
                      .map((attempt) => {
                        const exam = attempt.global_exams!;
                        const progress = Math.max(0, Math.min(100, ((exam.total_questions - attempt.unanswered_count) / exam.total_questions) * 100));
                        return (
                          <div key={attempt.id} className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark  p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-display font-semibold text-sm text-ink dark:text-ink-on-dark mb-1.5">
                                  {exam.exam_name}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted-ink dark:text-muted-ink-on-dark mb-3">
                                  <span>{exam.total_questions - attempt.unanswered_count} / {exam.total_questions} q.</span>
                                  <span className={`px-1.5 py-0.5 font-bold ${getDifficultyBadgeClass(exam.difficulty_level)}`}>
                                    {exam.difficulty_level}
                                  </span>
                                  <span>{new Date(attempt.started_at).toLocaleDateString()}</span>
                                </div>
                                <div className="w-full bg-subtle dark:bg-subtle-on-dark h-[3px] mb-1.5">
                                  <div className="h-[3px] bg-accent-gold" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">{Math.round(progress)}% {t('quiz.completed') || 'completed'}</p>
                              </div>
                              <button
                                onClick={() => setSelectedExam(exam)}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-ink text-ink-on-dark text-xs font-semibold hover:opacity-80 transition-opacity"
                              >
                                <Play className="h-3 w-3" />
                                {t('quiz.continue_exam') || 'Continue'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Explore Tab ── */}
        {activeTab === 'explore' && (
          <>
            {quizViewMode === 'exams' ? (
              /* Global Exams — Explore */
              <div className="space-y-4">
                {/* Filter bar */}
                <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark  p-[14px]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
                    <div>
                      <p className="text-[9px] tracking-[2px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark mb-2">Country / Region</p>
                      <select
                        value={examCountry}
                        onChange={(e) => setExamCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark text-sm"
                      >
                        <option value="all">All Countries</option>
                        <option value="USA">USA</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Turkey">Turkey</option>
                        <option value="UAE">UAE</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[2px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark mb-2">Exam Type</p>
                      <select
                        value={examType}
                        onChange={(e) => setExamType(e.target.value)}
                        className="w-full px-3 py-2 border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="standardized">Standardized Tests</option>
                        <option value="entrance">Entrance Exams</option>
                        <option value="proficiency">Language Proficiency</option>
                        <option value="certification">Professional Certification</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[2px] uppercase font-bold text-muted-ink dark:text-muted-ink-on-dark mb-2">Search</p>
                      <div className="flex items-center gap-2 px-3 py-2 border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark">
                        <Search className="h-4 w-4 text-muted-ink flex-shrink-0" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search exams…"
                          className="flex-1 bg-transparent text-sm outline-none text-ink dark:text-ink-on-dark placeholder:text-muted-ink"
                        />
                        {loading && (
                          <div className="animate-spin h-4 w-4 border-2 border-muted-ink border-t-transparent rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exam cards grid */}
                {loading ? (
                  <LoadingSkeleton type="card" count={3} />
                ) : globalExams.length === 0 ? (
                  <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark py-16 flex flex-col items-center">
                    <Globe className="h-9 w-9 text-muted-ink dark:text-muted-ink-on-dark mb-4" />
                    <p className="font-display text-lg font-semibold text-ink dark:text-ink-on-dark mb-1">No exams found</p>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {globalExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark  p-4 flex flex-col gap-2 relative"
                      >
                        {/* Level badge */}
                        <span className={`absolute top-[14px] right-[14px] text-[9.5px] font-bold tracking-[0.5px] px-[9px] py-[3px] ${
                          exam.difficulty_level === 'advanced'
                            ? 'bg-ink/[.08] dark:bg-white/[.08] text-ink dark:text-ink-on-dark'
                            : 'bg-accent-gold-soft text-accent-gold'
                        }`}>
                          {exam.difficulty_level}
                        </span>
                        <div className="pr-20">
                          <p className="text-[10px] font-bold tracking-widest text-accent-gold mb-0.5">{exam.exam_code}</p>
                          <h3 className="font-display font-semibold text-[17px] text-ink dark:text-ink-on-dark leading-snug">{exam.exam_name}</h3>
                        </div>
                        <p className="text-xs text-secondary-ink dark:text-muted-ink-on-dark leading-relaxed line-clamp-2">
                          {exam.description}
                        </p>
                        <div className="h-px bg-divider dark:bg-divider-on-dark mt-1" />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
                            <span className="font-semibold text-secondary-ink dark:text-muted-ink-on-dark">{exam.country}</span>
                            {exam.region && <span className="italic"> · {exam.region}</span>}
                          </p>
                          <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{exam.total_questions} q.</p>
                        </div>
                        <button
                          onClick={() => setSelectedExam(exam)}
                          className="w-full mt-1 py-2 bg-ink text-ink-on-dark text-xs font-semibold hover:opacity-80 transition-opacity flex items-center justify-center gap-1.5"
                        >
                          <Play className="h-3 w-3" />
                          Preview
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Quizzes — Explore (community card grid) */
              <div className="space-y-[10px]">
                {/* Search + subject filter + sort bar */}
                <div className="flex gap-[10px] items-stretch">
                  <div className="flex-1 flex items-center gap-2 px-[13px] py-[9px] border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark">
                    <Search className="h-3.5 w-3.5 text-muted-ink flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search community quizzes…"
                      className="flex-1 bg-transparent font-display text-[13px] outline-none text-ink dark:text-ink-on-dark placeholder:text-muted-ink dark:placeholder:text-muted-ink-on-dark"
                    />
                    {loading && <div className="animate-spin h-4 w-4 border-2 border-muted-ink border-t-transparent rounded-full flex-shrink-0" />}
                  </div>
                  <div className="relative">
                    <select className="h-full px-[13px] pr-8 border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark font-display text-[13px] appearance-none cursor-pointer min-w-[160px] outline-none">
                      {['All Subjects','Economics','Biology','Mathematics','History','Physics','Chemistry','Literature','Comp. Sci.'].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-muted-ink text-[10px] pointer-events-none">▾</span>
                  </div>
                  <div className="flex border border-divider dark:border-divider-on-dark overflow-hidden">
                    {(['Top rated', 'Most used', 'Newest'] as const).map((s, i) => (
                      <button key={s} className={`px-[14px] py-[9px] border-none text-[12px] font-display cursor-pointer whitespace-nowrap transition-colors ${i === 0 ? 'bg-ink text-ink-on-dark font-bold' : 'bg-card-light dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark'} ${i < 2 ? 'border-r border-divider dark:border-divider-on-dark' : ''}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3-col community quiz card grid */}
                {loading ? (
                  <LoadingSkeleton type="card" count={6} />
                ) : quizSessions.length === 0 ? (
                  <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark py-16 flex flex-col items-center">
                    <FileQuestion className="h-9 w-9 text-muted-ink dark:text-muted-ink-on-dark mb-4" />
                    <p className="font-display text-lg font-semibold text-ink dark:text-ink-on-dark mb-1">No community quizzes yet</p>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Check back soon</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px]">
                    {quizSessions
                      .filter(q => !debouncedSearchQuery || q.quiz_title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
                      .map((quiz) => (
                        <div key={quiz.id} className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark flex flex-col gap-2" style={{ padding: '14px 16px' }}>
                          <div>
                            <div className="text-[9px] tracking-[1.5px] uppercase font-bold text-accent-gold mb-1">{quiz.source_type || 'Generated'}</div>
                            <h3 className="font-display text-[14px] font-semibold text-ink dark:text-ink-on-dark leading-[1.3]">{quiz.quiz_title}</h3>
                          </div>
                          <div className="flex gap-[5px] flex-wrap">
                            {[quiz.difficulty_level, `${quiz.question_count} q.`, quiz.source_type || 'MCQ'].map((tag, ti) => (
                              <span key={ti} className="text-[9.5px] font-bold tracking-[0.5px] px-[7px] py-[2px] bg-subtle dark:bg-subtle-on-dark text-secondary-ink dark:text-muted-ink-on-dark border border-divider dark:border-divider-on-dark">{tag}</span>
                            ))}
                          </div>
                          <div className="h-px bg-divider dark:bg-divider-on-dark" />
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-[11.5px] font-semibold text-ink dark:text-ink-on-dark">{new Date(quiz.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartQuiz(quiz.id)}
                                className="inline-flex px-[10px] py-1 bg-ink text-ink-on-dark border-none text-[11px] font-display font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                              >Use →</button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'history' && (() => {
          const isExams = quizViewMode === 'exams';
          const allEntries = isExams ? examAttempts : quizHistory;
          const allAvg = allEntries.length
            ? Math.round(allEntries.reduce((s, h) => s + h.score_percentage, 0) / allEntries.length)
            : 0;
          const allBest = allEntries.length
            ? Math.max(...allEntries.map(h => Math.round(h.score_percentage)))
            : 0;
          const monthEntries = isExams ? monthlyExamAttempts : monthlyHistory;

          return (
            <div className="space-y-[10px]">
              {loading ? (
                <LoadingSkeleton type="card" count={3} />
              ) : allEntries.length === 0 ? (
                <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark py-16 flex flex-col items-center">
                  <Trophy className="h-9 w-9 text-muted-ink dark:text-muted-ink-on-dark mb-4" />
                  <p className="font-display text-lg font-semibold text-ink dark:text-ink-on-dark mb-1">
                    {isExams ? (t('quiz.no_exam_attempts') || 'No exam attempts yet') : t('quiz.no_attempts')}
                  </p>
                  <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                    {isExams ? (t('quiz.complete_exam_first') || 'Complete an exam to see your history') : t('quiz.complete_first')}
                  </p>
                </div>
              ) : (
                <>
                  {/* All-time stats strip */}
                  <div className="flex bg-sidebar">
                    {([
                      [String(allEntries.length), 'total sittings'],
                      [`${allAvg}%`, 'all-time average'],
                      [`${allBest}%`, 'best score'],
                      ['3 mo.', 'span'],
                    ] as [string, string][]).map(([v, l], i) => (
                      <div key={i} className="flex-1 py-[11px] px-5 text-center border-r border-page-light/[.08] last:border-r-0">
                        <div className="font-display text-[22px] font-semibold text-ink-on-dark leading-none">{v}</div>
                        <div className="text-[9px] tracking-[2px] uppercase text-accent-gold mt-1">{l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Month navigator */}
                  <div className="flex items-center gap-[14px]">
                    <button
                      onClick={() => setHistoryMonth(m => {
                        const d = new Date(m.year, m.month - 1, 1);
                        return { year: d.getFullYear(), month: d.getMonth() };
                      })}
                      className="inline-flex items-center justify-center w-[30px] h-[30px] bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-sm cursor-pointer hover:bg-subtle dark:hover:bg-subtle-on-dark transition-colors"
                    >‹</button>
                    <span className="font-display text-[15px] font-semibold text-ink dark:text-ink-on-dark">{historyMonthLabel}</span>
                    <button
                      onClick={() => setHistoryMonth(m => {
                        const d = new Date(m.year, m.month + 1, 1);
                        return { year: d.getFullYear(), month: d.getMonth() };
                      })}
                      className="inline-flex items-center justify-center w-[30px] h-[30px] bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-sm cursor-pointer hover:bg-subtle dark:hover:bg-subtle-on-dark transition-colors"
                    >›</button>
                  </div>

                  {/* 2-col: left monthly summary + right entries */}
                  <div className="grid gap-4" style={{ gridTemplateColumns: '210px 1fr' }}>
                    {/* Left: dark monthly summary */}
                    <div className="bg-sidebar self-start" style={{ padding: '20px 18px' }}>
                      <div className="text-[9px] tracking-[2px] uppercase font-bold text-ink-on-dark/35 mb-2">{historyMonthLabel}</div>
                      <div className="font-display text-[48px] font-semibold text-ink-on-dark leading-none">
                        {monthlyStats.avg}<span className="text-[18px] text-accent-gold">%</span>
                      </div>
                      <div className="font-display text-[11px] text-accent-gold mt-[5px] mb-4">— monthly average</div>
                      <div className="h-px bg-ink-on-dark/[.08] mb-[14px]" />
                      {([
                        [String(monthlyStats.sittings), 'sittings this month'],
                        [`${monthlyStats.best}%`, 'best this month'],
                        [String(monthlyStats.globalCount), 'global exams'],
                      ] as [string, string][]).map(([v, l]) => (
                        <div key={l} className="flex justify-between items-baseline mb-[9px]">
                          <span className="text-[11px] text-ink-on-dark/50">{l}</span>
                          <span className="font-display text-[14px] font-semibold text-ink-on-dark">{v}</span>
                        </div>
                      ))}
                      <div className="h-px bg-ink-on-dark/[.08] mt-[6px] mb-3" />
                      <div className="text-[9px] tracking-[1.5px] uppercase font-bold text-ink-on-dark/30 mb-2">vs. all-time avg</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-[3px] bg-ink-on-dark/[.13]">
                          <div className="h-full bg-accent-gold" style={{ width: `${monthlyStats.avg}%` }} />
                        </div>
                        <span className="font-display text-[11px] text-accent-gold">
                          {monthlyStats.avg >= allAvg ? '+' : ''}{monthlyStats.avg - allAvg}%
                        </span>
                      </div>
                    </div>

                    {/* Right: entries */}
                    <div>
                      {monthEntries.length === 0 ? (
                        <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark py-8 text-center">No sittings in {historyMonthLabel}</p>
                      ) : (
                        monthEntries.map((attempt, i, arr) => {
                          const score = Math.round(attempt.score_percentage);
                          const scoreColor = score >= 90 ? 'text-accent-gold' : score >= 80 ? 'text-secondary-ink dark:text-muted-ink-on-dark' : 'text-muted-ink dark:text-muted-ink-on-dark';
                          const strokeColor = score >= 90 ? 'var(--color-accent-gold)' : score >= 80 ? 'var(--color-secondary-ink)' : 'var(--color-muted-ink)';
                          const total = isExams
                            ? (attempt as GlobalExamAttempt).global_exams?.total_questions ?? (attempt.correct_count + attempt.incorrect_count + attempt.unanswered_count)
                            : (attempt.correct_count + attempt.incorrect_count + attempt.unanswered_count);
                          const title = isExams
                            ? (attempt as GlobalExamAttempt).global_exams?.exam_name ?? '—'
                            : (attempt as QuizAttempt).quiz_sessions?.quiz_title ?? '—';
                          const type = isExams ? 'Global' : 'My Quiz';
                          return (
                            <div
                              key={attempt.id}
                              className={`flex items-start gap-4 py-4 ${i < arr.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''}`}
                            >
                              {/* Score column */}
                              <div className="flex-shrink-0 pl-[10px] min-w-[46px]" style={{ borderLeft: `3px solid ${strokeColor}` }}>
                                <p className={`font-display text-[26px] font-bold leading-none ${scoreColor}`}>{score}</p>
                                <p className={`text-[9px] tracking-[1px] ${scoreColor} opacity-65`}>%</p>
                              </div>
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-display font-semibold text-[14px] text-ink dark:text-ink-on-dark mb-[5px]">{title}</h3>
                                <div className="flex items-center gap-[7px] mb-[9px]">
                                  <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{new Date(attempt.completed_at).toLocaleDateString()}</span>
                                  <span className="text-[11px] text-divider">·</span>
                                  <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{total} q.</span>
                                  <span className="text-[11px] text-divider">·</span>
                                  <span className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{formatTime(attempt.time_taken_seconds)}</span>
                                  <span className="text-[10px] px-[7px] py-px font-bold" style={{ background: type === 'Global' ? 'var(--color-ink-on-dark)0D' : 'var(--color-accent-gold-soft)', color: type === 'Global' ? 'var(--color-ink)' : 'var(--color-accent-gold)' }}>{type}</span>
                                </div>
                                <div className="flex h-[3px] mb-[6px] gap-px">
                                  <div className="bg-accent-gold opacity-75" style={{ width: `${(attempt.correct_count / Math.max(total, 1)) * 100}%` }} />
                                  <div className="bg-muted-ink opacity-45" style={{ width: `${(attempt.incorrect_count / Math.max(total, 1)) * 100}%` }} />
                                  {attempt.unanswered_count > 0 && <div className="bg-divider" style={{ width: `${(attempt.unanswered_count / Math.max(total, 1)) * 100}%` }} />}
                                </div>
                                <div className="flex gap-[14px]">
                                  <span className="text-[10px] text-accent-gold">{attempt.correct_count} correct</span>
                                  <span className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">{attempt.incorrect_count} wrong</span>
                                  {attempt.unanswered_count > 0 && <span className="text-[10px] text-divider">{attempt.unanswered_count} skipped</span>}
                                </div>
                              </div>
                              <button className="inline-flex px-3 py-[5px] bg-transparent border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-[11px] font-display cursor-pointer flex-shrink-0 mt-0.5 hover:bg-subtle dark:hover:bg-subtle-on-dark transition-colors">
                                Retake
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}
      </div>
      {ConfirmModal}

      {/* Global Exam Detail Modal */}
      <GlobalExamDetailModal
        exam={selectedExam}
        isOpen={!!selectedExam}
        onClose={() => setSelectedExam(null)}
      />

      {/* Quiz Tutorial */}
      {tutorialConfig && (
        <PageTutorial
          config={tutorialConfig}
          isOpen={isTutorialOpen}
          onClose={() => {}}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
        />
      )}
    </div>
    </>
  );
});
