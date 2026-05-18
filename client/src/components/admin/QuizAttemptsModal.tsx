import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Student {
  fullName: string;
  email: string;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string | null;
  points: number;
}

interface QuizAttempt {
  id: string;
  score: number;
  isPassed: boolean;
  answers: Record<string, number>;
  createdAt: string;
  user: Student;
}

interface QuizAttemptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItemId: string;
  contentTitle: string;
}

export function QuizAttemptsModal({ isOpen, onClose, contentItemId, contentTitle }: QuizAttemptsModalProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizAndAttempts = async () => {
    setIsLoading(true);
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        api.get(`/quizzes/${contentItemId}`),
        api.get(`/quizzes/${contentItemId}/attempts`)
      ]);
      setQuizQuestions(quizRes.data.data?.questions || []);
      setAttempts(attemptsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load quiz attempt records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQuizAndAttempts();
      setSelectedAttempt(null);
    }
  }, [isOpen, contentItemId]);

  if (!isOpen) return null;

  // Compute analytics
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.isPassed).length;
  const averageScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) 
    : 0;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-border animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-text-primary tracking-tight">Quiz Attempts & Analytics</h3>
            <p className="text-xs text-text-secondary font-bold truncate max-w-md">{contentTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <X size={18} className="text-text-primary" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-text-secondary font-bold">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
            <span>Loading quiz attempts...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Quick Analytics Bar */}
            <div className="p-6 bg-surface/50 border-b border-border grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  {totalAttempts}
                </div>
                <div>
                  <span className="block text-[10px] font-black text-text-secondary uppercase">Total Submissions</span>
                  <span className="block text-sm font-black text-text-primary">Attempts Logged</span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  {passedAttempts}
                </div>
                <div>
                  <span className="block text-[10px] font-black text-text-secondary uppercase">Passed Rate</span>
                  <span className="block text-sm font-black text-text-primary">
                    {totalAttempts > 0 ? `${Math.round((passedAttempts / totalAttempts) * 100)}% Passed` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                  {averageScore}%
                </div>
                <div>
                  <span className="block text-[10px] font-black text-text-secondary uppercase">Class Average</span>
                  <span className="block text-sm font-black text-text-primary">Performance Metric</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Panel: Attempt Cards */}
              <div className="w-1/3 border-r border-border overflow-y-auto custom-scrollbar bg-surface/20">
                <div className="p-4 border-b border-border bg-surface/50">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Submissions ({attempts.length})</span>
                </div>

                {attempts.length === 0 ? (
                  <div className="p-8 text-center text-xs font-bold text-text-secondary">
                    No student attempts found.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {attempts.map((att) => {
                      const isSelected = selectedAttempt?.id === att.id;
                      return (
                        <button
                          key={att.id}
                          onClick={() => setSelectedAttempt(att)}
                          className={`w-full text-left p-4 hover:bg-black/5 transition-all flex items-center justify-between ${
                            isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-black text-text-primary truncate">{att.user.fullName}</span>
                            <span className="block text-[10px] text-text-secondary truncate mt-0.5">{att.user.email}</span>
                            <span className="block text-[9px] text-text-secondary font-bold mt-1">
                              {new Date(att.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1 ml-2">
                            <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                              att.isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {att.score}%
                            </span>
                            <span className="text-[8px] font-black uppercase text-text-secondary">
                              {att.isPassed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Panel: Detail Sheets */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {selectedAttempt ? (
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* Student Card Info */}
                    <div className="bg-surface p-4 rounded-2xl border border-border flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] font-black text-text-secondary uppercase">Student Profile</span>
                        <span className="block text-xs font-black text-text-primary mt-0.5">{selectedAttempt.user.fullName}</span>
                        <span className="block text-[10px] text-text-secondary">{selectedAttempt.user.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] font-black text-text-secondary uppercase">Earned Score</span>
                        <span className={`block text-lg font-black ${selectedAttempt.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
                          {selectedAttempt.score}%
                        </span>
                      </div>
                    </div>

                    {/* Question Breakdown */}
                    <div className="space-y-6">
                      <div className="border-b border-border pb-2">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Itemized Performance Breakdown</span>
                      </div>

                      {quizQuestions.map((q, idx) => {
                        const selectedIndex = selectedAttempt.answers[q.id];
                        const isCorrect = selectedIndex === q.correctOptionIndex;

                        return (
                          <div key={q.id} className={`border p-5 rounded-2xl shadow-sm space-y-3 transition-all ${
                            isCorrect ? 'border-emerald-100 bg-emerald-50/10' : 'border-red-100 bg-red-50/10'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 text-xs font-black rounded-full flex items-center justify-center ${
                                  isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                  isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {isCorrect ? 'Correct' : 'Incorrect'}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-text-secondary">Points: {q.points}</span>
                            </div>

                            <p className="text-xs font-bold text-text-primary">{q.questionText}</p>

                            {/* Options listing */}
                            <div className="grid grid-cols-1 gap-2 pt-1">
                              {q.options.map((opt, oIdx) => {
                                const isSelectedByStudent = selectedIndex === oIdx;
                                const isCorrectOpt = q.correctOptionIndex === oIdx;

                                let optionClass = 'border-border bg-white';
                                if (isSelectedByStudent && isCorrect) {
                                  optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-extrabold';
                                } else if (isSelectedByStudent && !isCorrect) {
                                  optionClass = 'border-red-500 bg-red-50 text-red-900 font-extrabold';
                                } else if (isCorrectOpt) {
                                  optionClass = 'border-emerald-500/60 bg-emerald-50/30 text-emerald-800';
                                }

                                return (
                                  <div key={oIdx} className={`border px-4 py-3 rounded-xl text-xs flex items-center justify-between ${optionClass}`}>
                                    <span>
                                      <span className="font-black mr-2">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                    </span>
                                    {isSelectedByStudent && (
                                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/5 rounded">
                                        Student Choice
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            {q.explanation && (
                              <div className="p-3 bg-surface rounded-xl border border-border/50 text-[11px] text-text-secondary leading-relaxed">
                                <span className="font-black text-text-primary block mb-0.5">Explanation:</span>
                                {q.explanation}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-text-secondary font-bold">
                    <Sparkles size={48} className="text-indigo-500 opacity-20 mb-3 animate-pulse" />
                    <p className="text-sm">Select a student attempt from the left list to inspect their itemized answers and scores.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
