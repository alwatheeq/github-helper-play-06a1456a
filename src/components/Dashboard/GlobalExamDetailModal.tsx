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
        return 'bg-subtle dark:bg-subtle-on-dark text-secondary-ink dark:text-muted-ink-on-dark';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <ScholarCard variant="elevated" padding="none" className="max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scaleIn">
        <div className="bg-accent-gold p-6 text-ink-on-dark relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-ink-on-dark/[.20] transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="bg-ink-on-dark/[.20] p-3">
              <Globe className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="font-display text-[24px] font-bold mb-1">{exam.exam_name}</h2>
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
            <p className="text-secondary-ink dark:text-muted-ink-on-dark leading-relaxed">{exam.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-subtle dark:bg-subtle-on-dark p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-accent-gold-soft p-2 border border-divider dark:border-divider-on-dark">
                  <FileQuestion className="h-5 w-5 text-accent-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Total Questions</p>
                  <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{exam.total_questions}</p>
                </div>
              </div>
            </div>

            <div className="bg-subtle dark:bg-subtle-on-dark p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-accent-gold-soft p-2 border border-divider dark:border-divider-on-dark">
                  <Clock className="h-5 w-5 text-accent-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Time Limit</p>
                  <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{exam.time_limit_minutes} min</p>
                </div>
              </div>
            </div>

            {exam.subject && (
              <div className="bg-subtle dark:bg-subtle-on-dark p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-accent-gold-soft p-2 border border-divider dark:border-divider-on-dark">
                    <BookOpen className="h-5 w-5 text-accent-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Subject</p>
                    <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{exam.subject}</p>
                  </div>
                </div>
              </div>
            )}

            {exam.passing_score && (
              <div className="bg-subtle dark:bg-subtle-on-dark p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-accent-gold-soft p-2 border border-divider dark:border-divider-on-dark">
                    <Target className="h-5 w-5 text-accent-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">Passing Score</p>
                    <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{exam.passing_score}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-accent-gold-soft/20 border border-accent-gold/30 dark:border-accent-gold/20 p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Award className="h-5 w-5 text-accent-gold mt-0.5" />
              <div>
                <h4 className="font-semibold text-ink dark:text-ink-on-dark mb-1">Practice Mode</h4>
                <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
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
