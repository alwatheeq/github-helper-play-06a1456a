import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ErrorLogger } from '../../utils/errorLogger';
interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
}

interface AIQuestionGeneratorProps {
  onQuestionsGenerated: (questions: Question[]) => void;
  onCancel: () => void;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({
  onQuestionsGenerated,
  onCancel,
  questionCount,
  difficulty
}) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const subjects = [
    'General Knowledge',
    'Science',
    'Mathematics',
    'History',
    'Geography',
    'Literature',
    'Arts',
    'Technology',
    'Sports',
    'Entertainment',
    'Business',
    'Health'
  ];

  const handleGenerate = async () => {
    if (!topic.trim() || topic.trim().length < 3) {
      setError('Please enter a topic (at least 3 characters)');
      return;
    }

    setGenerating(true);
    setProgress(10);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to generate questions');
      }

      setProgress(30);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brain-rush-questions`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          questionCount,
          difficulty,
          subject: subject || undefined
        })
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to generate questions');
        ErrorLogger.error(error, { component: 'AIQuestionGenerator', action: 'handleGenerate', metadata: { questionCount, difficulty } });
        throw error;
      }

      const result = await response.json();

      ErrorLogger.debug('Backend response received', {
        component: 'AIQuestionGenerator',
        action: 'handleGenerateQuestions',
        metadata: {
          hasSuccess: 'success' in result,
          successValue: result.success,
          hasQuestions: 'questions' in result,
          questionCount: result.questions?.length,
          hasQuestionCount: 'questionCount' in result,
        },
      });

      if (!result.success) {
        const errorMsg = result.error || 'Question generation was not successful';
        const error = new Error(errorMsg);
        ErrorLogger.error(error, {
          component: 'AIQuestionGenerator',
          action: 'generateQuestions',
          metadata: { topic, subject, questionCount, difficulty },
        });
        throw error;
      }

      if (!result.questions || !Array.isArray(result.questions)) {
        const error = new Error('Invalid response: questions array is missing or malformed');
        ErrorLogger.error(error, {
          component: 'AIQuestionGenerator',
          action: 'generateQuestions',
          metadata: { topic, subject, result },
        });
        throw error;
      }

      if (result.questions.length === 0) {
        const error = new Error('No questions were generated. Please try again.');
        ErrorLogger.error(error, {
          component: 'AIQuestionGenerator',
          action: 'generateQuestions',
          metadata: { topic, subject, questionCount },
        });
        throw error;
      }

      ErrorLogger.info('Validation passed. Questions generated', {
        component: 'AIQuestionGenerator',
        action: 'handleGenerateQuestions',
        metadata: {
          questionCount: result.questions.length,
          firstQuestion: result.questions[0],
        },
      });

      setProgress(100);

      setTimeout(() => {
        ErrorLogger.debug('Passing questions to parent component', {
          component: 'AIQuestionGenerator',
          action: 'handleGenerateQuestions',
          metadata: { questionCount: result.questions.length },
        });
        onQuestionsGenerated(result.questions);
      }, 500);

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, {
        component: 'AIQuestionGenerator',
        action: 'generateQuestions',
        metadata: { topic, subject, questionCount, difficulty },
      });
      let errorMessage = 'Failed to generate questions';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check for specific error types
        if (err.message.includes('token limit')) {
          errorMessage = err.message; // Keep the detailed token limit message
        } else if (err.message.includes('ANTHROPIC_API_KEY')) {
          errorMessage = 'AI service configuration error. Please contact support.';
        } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      setError(errorMessage);
      setGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display text-[38px] font-semibold text-ink dark:text-muted-ink-on-dark mb-2">AI Question Generator</h2>
        <p className="text-secondary-ink dark:text-muted-ink-on-dark">Let AI create questions about any topic</p>
      </div>

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-8">
        {!generating ? (
          <div className="space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Ancient Rome, Photosynthesis, World War II..."
                className="w-full px-4 py-3 border border-divider rounded-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:border-divider-on-dark dark:text-muted-ink-on-dark"
              />
              <p className="mt-1 text-sm text-muted-ink dark:text-muted-ink-on-dark">
                Be specific for better questions
              </p>
            </div>

            {/* Subject Category (Optional) */}
            <div>
              <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
                Subject Category (Optional)
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-divider rounded-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:border-divider-on-dark dark:text-muted-ink-on-dark"
              >
                <option value="">Any Subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Settings Display */}
            <div className="bg-accent-gold-soft/10 border border-divider dark:border-divider-on-dark p-4">
              <h4 className="font-semibold text-ink dark:text-muted-ink-on-dark mb-2">Generation Settings</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-ink dark:text-muted-ink">Questions:</span>
                  <span className="ml-2 font-medium text-ink dark:text-muted-ink-on-dark">{questionCount}</span>
                </div>
                <div>
                  <span className="text-secondary-ink dark:text-muted-ink">Difficulty:</span>
                  <span className="ml-2 font-medium text-ink dark:text-muted-ink-on-dark capitalize">{difficulty}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 dark:text-red-200">Generation Failed</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:bg-subtle dark:hover:opacity-80 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || topic.trim().length < 3}
                className="flex-1 px-6 py-3 bg-accent-gold text-ink-on-dark hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Generate Questions</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="relative inline-block mb-6">
              <Loader2 className="h-16 w-16 text-accent-gold dark:text-accent-gold animate-spin" />
              <Sparkles className="h-8 w-8 text-accent-gold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="font-display text-[24px] font-bold text-ink dark:text-muted-ink-on-dark mb-2">
              Generating Questions...
            </h3>
            <p className="text-secondary-ink dark:text-muted-ink-on-dark mb-6">
              AI is creating {questionCount} questions about "{topic}"
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-4">
              <div className="h-[5px] bg-subtle dark:bg-card-dark overflow-hidden">
                <div
                  className={`h-full bg-accent-gold transition-colors duration-150 ease-out`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
              This may take a few moments...
            </p>
          </div>
        )}
      </div>

      {/* Tips Section */}
      {!generating && (
        <div className="mt-6 bg-page-light dark:bg-page-dark p-6">
          <h4 className="font-bold text-ink dark:text-muted-ink-on-dark mb-3 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-accent-gold dark:text-accent-gold" />
            <span>Tips for Better Questions</span>
          </h4>
          <ul className="space-y-2 text-sm text-secondary-ink dark:text-muted-ink-on-dark">
            <li className="flex items-start space-x-2">
              <span className="text-accent-gold dark:text-accent-gold font-bold">•</span>
              <span>Be specific: "Causes of World War I" is better than just "History"</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-accent-gold dark:text-accent-gold font-bold">•</span>
              <span>Choose the right difficulty: Easy = basic facts, Hard = complex analysis</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-accent-gold dark:text-accent-gold font-bold">•</span>
              <span>Add a subject category to get more focused questions</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
