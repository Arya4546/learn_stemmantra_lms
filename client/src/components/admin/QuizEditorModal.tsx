import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface QuizQuestion {
  id?: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  points: number;
}

interface QuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItemId: string;
  contentTitle: string;
}

export function QuizEditorModal({ isOpen, onClose, contentItemId, contentTitle }: QuizEditorModalProps) {
  const [passingScore, setPassingScore] = useState<number>(60);
  const [allowedAttempts, setAllowedAttempts] = useState<number>(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/quizzes/${contentItemId}`);
        if (res.data.data) {
          setPassingScore(res.data.data.passingScore);
          setAllowedAttempts(res.data.data.allowedAttempts);
          setQuestions(res.data.data.questions || []);
        } else {
          // Initialize with one blank question
          setQuestions([
            {
              questionText: '',
              options: ['', '', '', ''],
              correctOptionIndex: 0,
              explanation: '',
              points: 1,
            },
          ]);
        }
      } catch (err) {
        toast.error('Failed to load quiz details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [isOpen, contentItemId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        points: 1,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = text;
    setQuestions(updated);
  };

  const handleCorrectOptionChange = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = oIndex;
    setQuestions(updated);
  };

  const handleExplanationChange = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].explanation = text;
    setQuestions(updated);
  };

  const handlePointsChange = (qIndex: number, pts: number) => {
    const updated = [...questions];
    updated[qIndex].points = Math.max(1, pts);
    setQuestions(updated);
  };

  const handleSave = async () => {
    // Validate all questions have content
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is empty`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        return;
      }
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Saving quiz questions...');
    try {
      await api.post(`/quizzes/${contentItemId}`, {
        passingScore,
        allowedAttempts,
        questions,
      });
      toast.success('Quiz saved successfully!', { id: loadingToast });
      onClose();
    } catch (err) {
      toast.error('Failed to save quiz details', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-border animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-text-primary tracking-tight">Configure Quiz</h3>
            <p className="text-xs text-text-secondary font-bold truncate max-w-md">{contentTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <X size={18} className="text-text-primary" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-text-secondary font-bold">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
            <span>Loading quiz configuration...</span>
          </div>
        ) : (
          <>
            {/* Scrollable content container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Settings Group */}
              <div className="bg-surface/50 border border-border p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-text-primary mb-2 uppercase tracking-wider">
                    Passing Score Required (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full bg-white border border-border px-4 py-2.5 rounded-xl font-bold outline-none focus:border-primary"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                  />
                  <p className="text-[10px] text-text-secondary font-bold mt-1">Students must score this percentage or higher to pass.</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-text-primary mb-2 uppercase tracking-wider">
                    Allowed Attempts
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-white border border-border px-4 py-2.5 rounded-xl font-bold outline-none focus:border-primary"
                    value={allowedAttempts}
                    onChange={(e) => setAllowedAttempts(Number(e.target.value))}
                  />
                  <p className="text-[10px] text-text-secondary font-bold mt-1">Set to 0 for unlimited retry attempts.</p>
                </div>
              </div>

              {/* Questions Title */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-black text-text-primary tracking-tight uppercase">Questions ({questions.length})</span>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 text-xs text-primary font-black bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Plus size={14} /> Add Question
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-white border border-border p-5 rounded-2xl shadow-sm relative group animate-in slide-in-from-bottom duration-300">
                    
                    {/* Floating Delete */}
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="absolute top-4 right-4 p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Question"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Question Header & Points */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-black">
                        {qIndex + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-text-primary uppercase">Question Points:</span>
                        <input
                          type="number"
                          min="1"
                          className="w-16 bg-surface border border-border px-2 py-1 rounded-lg text-center font-bold text-xs"
                          value={q.points}
                          onChange={(e) => handlePointsChange(qIndex, Number(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* Question Text */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-text-secondary mb-1">Question Input</label>
                      <textarea
                        rows={2}
                        className="w-full bg-surface border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all resize-none"
                        placeholder="Enter your multiple-choice question here..."
                        value={q.questionText}
                        onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                      />
                    </div>

                    {/* Question Options */}
                    <div className="mb-4 space-y-2">
                      <label className="block text-xs font-bold text-text-secondary mb-1">Answer Options & Correct Option Selection</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, oIndex) => (
                          <div
                            key={oIndex}
                            className={`flex items-center gap-3 px-3 py-2 border rounded-xl transition-all ${
                              q.correctOptionIndex === oIndex
                                ? 'border-emerald-500 bg-emerald-50/20'
                                : 'border-border'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleCorrectOptionChange(qIndex, oIndex)}
                              className="p-1 hover:scale-110 transition-transform"
                              title="Set as correct answer"
                            >
                              <CheckCircle
                                size={18}
                                className={q.correctOptionIndex === oIndex ? 'text-emerald-500' : 'text-text-secondary opacity-30'}
                              />
                            </button>
                            <input
                              type="text"
                              className="flex-1 bg-transparent text-sm font-bold outline-none"
                              placeholder={`Option ${oIndex + 1}`}
                              value={opt}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 flex items-center gap-1">
                        <AlertCircle size={12} className="text-indigo-500" /> Explanation / Solution Note
                      </label>
                      <input
                        type="text"
                        className="w-full bg-surface border border-border px-4 py-2 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 transition-all"
                        placeholder="Explain why this option is correct (shown to students after submission)..."
                        value={q.explanation}
                        onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                      />
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Footer actions */}
            <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white text-text-primary rounded-xl border border-border font-bold text-sm hover:bg-black/5 transition-all"
              >
                Close Editor
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-50 transition-all"
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>,
    document.body
  );
}
