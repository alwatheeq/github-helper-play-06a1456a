import React from 'react';
import { X, Globe, Clock, FileQuestion, BookOpen, Target, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScholarCard, ScholarButton } from '../Scholar';

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
}

interface GlobalExamDetailModalProps {
  exam: GlobalExam | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalExamDetailModal: React.FC<GlobalExamDetailModalProps> = ({
  exam,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  if (!isOpen || !exam) return null;

  const handleStartPractice = () => {
    navigate('/quiz', {
      state: {
        examId: exam.id,
        examName: exam.exam_name,
        examType: 'global_exam',
        totalQuestions: exam.total_questions,
        timeLimit: exam.time_limit_minutes
      }
    });
    onClose();
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-subtle dark:bg-subtle-on-dark text-secondary-ink dark:text-secondary-ink-on-dark';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <ScholarCard variant="elevated" padding="none" className="max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        <div className="bg-accent-gold p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-[var(--s4-radius-card)] transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-[var(--s4-radius-card)]">
              <Globe className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="s4-h2 mb-1">{exam.exam_name}</h2>
              <p className="text-ink-on-dark text-opacity-90 text-sm mb-2">{exam.exam_code}</p>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exam.difficulty_level)}`}>
                  {exam.difficulty_level}
                </span>
                <span className="text-ink-on-dark text-opacity-90 text-sm">
                  {exam.country}{exam.region && ` • ${exam.region}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-2">About This Exam</h3>
            <p className="text-secondary-ink dark:text-secondary-ink-on-dark leading-relaxed">{exam.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-[var(--s4-radius-card)]">
                  <FileQuestion className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Total Questions</p>
                  <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{exam.total_questions}</p>
                </div>
              </div>
            </div>

            <div className="bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-[var(--s4-radius-card)]">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Time Limit</p>
                  <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{exam.time_limit_minutes} min</p>
                </div>
              </div>
            </div>

            {exam.subject && (
              <div className="bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-[var(--s4-radius-card)]">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Subject</p>
                    <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{exam.subject}</p>
                  </div>
                </div>
              </div>
            )}

            {exam.passing_score && (
              <div className="bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded-[var(--s4-radius-card)]">
                    <Target className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Passing Score</p>
                    <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{exam.passing_score}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-[var(--s4-radius-card)] p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Practice Mode</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This is a practice session. Take your time to understand each question and improve your knowledge.
                  Your results will be saved to track your progress.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark">
          <div className="flex flex-col sm:flex-row gap-3">
            <ScholarButton
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </ScholarButton>
            <ScholarButton
              variant="primary"
              onClick={handleStartPractice}
              className="flex-1"
              icon={<ChevronRight className="h-5 w-5" />}
              iconPosition="right"
            >
              Start Practice
            </ScholarButton>
          </div>
        </div>
      </ScholarCard>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
