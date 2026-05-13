import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Save } from 'lucide-react';
import { useToast } from '../Toast/Toast';
interface Question {
  question: string;
  options: [string, string, string, string];
  correct_answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ManualQuestionBuilderProps {
  onSaveQuestions: (questions: Question[], setName?: string) => void;
  onCancel: () => void;
  initialQuestions?: Question[];
}

export const ManualQuestionBuilder: React.FC<ManualQuestionBuilderProps> = ({
  onSaveQuestions,
  onCancel,
  initialQuestions = []
}) => {
  const { error: showErrorToast } = useToast();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentOptions, setCurrentOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveSetName, setSaveSetName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion.trim()) return false;
    if (currentOptions.some(opt => !opt.trim())) return false;
    return true;
  };

  const handleAddQuestion = () => {
    if (!validateCurrentQuestion()) {
      showErrorToast('Please fill in the question and all 4 options');
      return;
    }

    const newQuestion: Question = {
      question: currentQuestion.trim(),
      options: currentOptions.map(opt => opt.trim()) as [string, string, string, string],
      correct_answer: correctAnswer,
      difficulty
    };

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = newQuestion;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    resetForm();
  };

  const resetForm = () => {
    setCurrentQuestion('');
    setCurrentOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setDifficulty('medium');
  };

  const handleEditQuestion = (index: number) => {
    const q = questions[index];
    setCurrentQuestion(q.question);
    setCurrentOptions([...q.options] as [string, string, string, string]);
    setCorrectAnswer(q.correct_answer);
    setDifficulty(q.difficulty);
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    resetForm();
  };

  const handleFinish = () => {
    if (questions.length === 0) {
      showErrorToast('Please add at least one question');
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveAndFinish = (shouldSave: boolean) => {
    if (shouldSave && !saveSetName.trim()) {
      showErrorToast('Please enter a name for your question set');
      return;
    }

    onSaveQuestions(questions, shouldSave ? saveSetName.trim() : undefined);
    setShowSaveDialog(false);
  };

  return (
    <div className="w-full">
      {/* Dark banner — Play4HostManual */}
      <div className="bg-sidebar flex items-center justify-between mb-[22px]" style={{ padding: '20px 26px' }}>
        <div>
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-[5px]">The Games Room · Brain Rush</div>
          <div className="font-display text-[24px] font-semibold text-ink-on-dark" style={{ letterSpacing: -0.5 }}>Build Your Questions.</div>
          <div className="text-[12px] text-ink-on-dark/35 mt-1">
            {questions.length} question{questions.length !== 1 ? 's' : ''} added
          </div>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-[7px] bg-accent-gold text-sidebar text-[12px] font-bold"
          style={{ borderRadius: 3 }}
        >
          ← Back
        </button>
      </div>

      {/* Question Form */}
      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6 mb-[14px]">
        <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-4">
          {editingIndex !== null ? 'Edit Question' : 'Add New Question'}
        </div>

        <div className="space-y-4">
          {/* Question Text */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-ink dark:text-muted-ink-on-dark mb-2">
              Question
            </label>
            <textarea
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              className="w-full px-4 py-3 border border-divider dark:border-divider-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-muted-ink-on-dark text-[13px]"
            />
          </div>

          {/* Answer Options — 2×2 grid */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-ink dark:text-muted-ink-on-dark mb-2">
              Answer Options
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={currentOptions[idx]}
                    onChange={(e) => {
                      const newOptions = [...currentOptions] as [string, string, string, string];
                      newOptions[idx] = e.target.value;
                      setCurrentOptions(newOptions);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className={`flex-1 px-3 py-2.5 border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-muted-ink-on-dark text-[13px] ${
                      correctAnswer === idx
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-divider dark:border-divider-on-dark'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(idx)}
                    className={`w-[38px] h-[38px] flex items-center justify-center flex-shrink-0 transition ${
                      correctAnswer === idx
                        ? 'bg-green-600 text-white'
                        : 'bg-subtle dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark border border-divider dark:border-divider-on-dark'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            {correctAnswer !== undefined && (
              <p className="text-[11px] text-green-600 dark:text-green-400 mt-1.5">
                Option {correctAnswer + 1} is marked as correct
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.2px] text-muted-ink dark:text-muted-ink-on-dark mb-2">
              Difficulty
            </label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`px-5 py-2 text-[12px] font-semibold transition ${
                    difficulty === level
                      ? 'bg-accent-gold text-sidebar'
                      : 'bg-subtle dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark border border-divider dark:border-divider-on-dark'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            {editingIndex !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-[13px] flex items-center gap-2 hover:bg-subtle transition"
              >
                <X className="h-4 w-4" />
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              onClick={handleAddQuestion}
              disabled={!validateCurrentQuestion()}
              className="flex-1 py-2.5 bg-accent-gold text-sidebar text-[13px] font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {editingIndex !== null ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingIndex !== null ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6 mb-[14px]">
          <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-4">
            Questions Added ({questions.length})
          </div>
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div
                key={index}
                className="border border-divider dark:border-divider-on-dark p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Number badge */}
                  <div className="w-7 h-7 bg-sidebar text-ink-on-dark text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-[1px] text-muted-ink dark:text-muted-ink-on-dark bg-subtle dark:bg-card-dark px-2 py-0.5">
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-ink dark:text-ink-on-dark mb-2">{q.question}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`px-3 py-1.5 text-[12px] ${
                            optIdx === q.correct_answer
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 font-semibold border border-green-200 dark:border-green-700'
                              : 'bg-subtle dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark border border-divider dark:border-divider-on-dark'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditQuestion(index)}
                      className="w-8 h-8 flex items-center justify-center text-accent-gold border border-accent-gold/30 hover:bg-accent-gold-soft transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      className="w-8 h-8 flex items-center justify-center text-red-500 border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex justify-between gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-[13px] hover:bg-subtle transition"
        >
          Cancel
        </button>
        <button
          onClick={handleFinish}
          disabled={questions.length === 0}
          className="px-8 py-3 bg-accent-gold text-sidebar text-[13px] font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Finish & Create Game
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark shadow-[0_8px_32px_rgba(0,0,0,0.18)] p-6 max-w-md w-full">
            <div className="text-[9px] tracking-[2px] uppercase font-bold text-accent-gold mb-3">Save Question Set?</div>
            <p className="text-[13px] text-secondary-ink dark:text-muted-ink dark:text-muted-ink-on-dark mb-4 leading-relaxed">
              Would you like to save these questions for future use?
            </p>
            <input
              type="text"
              value={saveSetName}
              onChange={(e) => setSaveSetName(e.target.value)}
              placeholder="Name for this question set..."
              className="w-full px-4 py-3 border border-divider dark:border-divider-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold dark:bg-card-dark dark:text-muted-ink-on-dark text-[13px] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleSaveAndFinish(false)}
                className="flex-1 px-4 py-2.5 border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-[13px] hover:bg-subtle transition"
              >
                Don't Save
              </button>
              <button
                onClick={() => handleSaveAndFinish(true)}
                className="flex-1 px-4 py-2.5 bg-accent-gold text-sidebar text-[13px] font-bold hover:opacity-90 transition"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
