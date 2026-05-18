import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  points: number;
}

interface Attempt {
  id: string;
  score: number;
  isPassed: boolean;
  createdAt: string;
}

interface QuizViewerProps {
  contentItemId: string;
}

export function QuizViewer({ contentItemId }: QuizViewerProps) {
  const [quiz, setQuiz] = useState<{
    passingScore: number;
    allowedAttempts: number;
    questions: Question[];
  } | null>(null);
  
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for active attempt
  const [isAttempting, setIsAttempting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for result display
  const [result, setResult] = useState<{
    score: number;
    isPassed: boolean;
    earnedPoints: number;
    totalPoints: number;
    results: {
      questionId: string;
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      selectedOptionIndex: number | null;
      isCorrect: boolean;
      explanation?: string;
      points: number;
    }[];
  } | null>(null);

  // Confirm Dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const quizRes = await api.get(`/quizzes/${contentItemId}`);
      setQuiz(quizRes.data.data);
      
      const attemptsRes = await api.get(`/quizzes/${contentItemId}/attempts`);
      setAttempts(attemptsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load quiz details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contentItemId]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  };

  const startQuiz = () => {
    if (quiz && quiz.allowedAttempts > 0 && attempts.length >= quiz.allowedAttempts) {
      toast.error('You have already reached the maximum number of attempts for this quiz.');
      return;
    }
    setAnswers({});
    setResult(null);
    setIsAttempting(true);
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    // Check if all questions are answered
    const unanswered = quiz.questions.filter(q => answers[q.id] === undefined);
    
    const submitAction = async () => {
      setIsSubmitting(true);
      const loadingToast = toast.loading('Submitting quiz...');
      try {
        const res = await api.post(`/quizzes/${contentItemId}/submit`, { answers });
        setResult(res.data.data);
        setIsAttempting(false);
        
        // Refresh attempts history
        const attemptsRes = await api.get(`/quizzes/${contentItemId}/attempts`);
        setAttempts(attemptsRes.data.data || []);
        
        toast.success(res.data.data.isPassed ? 'Congratulations! You passed!' : 'Quiz completed.', { id: loadingToast });
      } catch (err) {
        toast.error('Submission failed', { id: loadingToast });
      } finally {
        setIsSubmitting(false);
      }
    };

    if (unanswered.length > 0) {
      setConfirmConfig({
        isOpen: true,
        title: 'Unanswered Questions',
        message: `You have left ${unanswered.length} question(s) unanswered. Are you sure you want to submit the quiz checkpoint?`,
        isDestructive: false,
        onConfirm: submitAction
      });
    } else {
      submitAction();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-text-secondary font-bold">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3" />
        <span>Loading quiz questions...</span>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center p-8 border border-border bg-white rounded-2xl">
        <HelpCircle size={40} className="mx-auto text-indigo-500 opacity-20 mb-3" />
        <p className="font-bold text-text-secondary">Quiz is not configured yet by the instructor.</p>
      </div>
    );
  }

  // Render active attempt screen
  if (isAttempting) {
    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="block text-xs font-black text-indigo-600 uppercase tracking-wider">Active Checkpoint</span>
            <span className="block text-[11px] text-text-secondary font-bold">Answer all questions to test your knowledge. Passing required: {quiz.passingScore}%</span>
          </div>
          <button
            onClick={() => {
              setConfirmConfig({
                isOpen: true,
                title: 'Cancel Attempt',
                message: 'Cancel this attempt? Your progress will not be saved.',
                isDestructive: true,
                onConfirm: () => setIsAttempting(false)
              });
            }}
            className="text-xs font-bold text-text-secondary hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100/50 transition-all"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-border p-5 rounded-2xl shadow-sm animate-in fade-in duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-[10px] font-black text-text-secondary uppercase">({q.points} pt)</span>
              </div>
              <h4 className="text-sm font-bold text-text-primary mb-4 leading-relaxed">{q.questionText}</h4>
              
              <div className="grid grid-cols-1 gap-2.5">
                {q.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(q.id, oIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-3 ${
                      answers[q.id] === oIdx
                        ? 'border-indigo-500 bg-indigo-50/10 text-indigo-700 font-extrabold'
                        : 'border-border hover:border-indigo-200 text-text-secondary bg-white'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                      answers[q.id] === oIdx
                        ? 'border-indigo-500 bg-indigo-500 text-white font-black'
                        : 'border-border text-text-secondary bg-white'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz Checkpoint'}
        </button>
      </div>
    );
  }

  // Render results screen
  if (result) {
    return (
      <div className="space-y-6">
        {/* Scorecard */}
        <div className={`p-6 border rounded-2xl flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 ${
          result.isPassed
            ? 'border-emerald-200 bg-emerald-50/20 text-emerald-800'
            : 'border-red-200 bg-red-50/10 text-red-800'
        }`}>
          <div>
            <h4 className="text-lg font-black tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              {result.isPassed ? (
                <>
                  <CheckCircle className="text-emerald-500" size={24} /> Pass Checkpoint
                </>
              ) : (
                <>
                  <XCircle className="text-red-500" size={24} /> Review Needed
                </>
              )}
            </h4>
            <p className="text-xs font-bold mt-1 opacity-80">
              You scored {result.score.toFixed(1)}% ({result.earnedPoints} / {result.totalPoints} points). Passing required: {quiz.passingScore}%
            </p>
          </div>
          <button
            onClick={() => setResult(null)}
            className="flex items-center gap-1 text-xs font-black px-4 py-2 rounded-xl bg-white border border-current shadow-sm hover:bg-black/5 transition-all"
          >
            <RefreshCw size={12} /> View History
          </button>
        </div>

        {/* Itemized Questions review */}
        <div className="space-y-6">
          {result.results.map((r, idx) => (
            <div key={r.questionId} className={`bg-white border p-5 rounded-2xl shadow-sm ${
              r.isCorrect ? 'border-emerald-200' : 'border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                  r.isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {idx + 1}
                </span>
                <span className="text-[10px] font-black text-text-secondary uppercase">
                  ({r.isCorrect ? `${r.points}/${r.points}` : `0/${r.points}`} pt)
                </span>
              </div>
              
              <h4 className="text-sm font-bold text-text-primary mb-4 leading-relaxed">{r.questionText}</h4>
              
              <div className="grid grid-cols-1 gap-2.5 mb-4">
                {r.options.map((opt, oIdx) => {
                  const isSelected = r.selectedOptionIndex === oIdx;
                  const isCorrect = r.correctOptionIndex === oIdx;
                  
                  let btnStyle = 'border-border text-text-secondary bg-white';
                  if (isSelected && isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50/10 text-emerald-700 font-extrabold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-red-500 bg-red-50/10 text-red-700 font-extrabold';
                  } else if (isCorrect) {
                    btnStyle = 'border-emerald-200 bg-emerald-50/5 text-emerald-700';
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`w-full p-3.5 rounded-xl border-2 text-xs font-bold flex items-center gap-3 ${btnStyle}`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected
                          ? r.isCorrect ? 'bg-emerald-500 border-emerald-500 text-white font-black' : 'bg-red-500 border-red-500 text-white font-black'
                          : isCorrect ? 'bg-emerald-200 border-emerald-300 text-emerald-700 font-black' : 'border-border text-text-secondary bg-white'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Solution Note */}
              {r.explanation && (
                <div className="bg-indigo-50/40 border border-indigo-100/50 p-3 rounded-xl text-xs font-bold text-indigo-900 flex gap-2">
                  <AlertCircle size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black text-indigo-700 mb-0.5">Solution Note:</span>
                    <span>{r.explanation}</span>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render attempts overview screen
  return (
    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-6">
      <div className="text-center py-6 border-b border-border/60">
        <HelpCircle size={48} className="mx-auto text-indigo-500 opacity-20 mb-3" />
        <h4 className="text-lg font-black text-text-primary tracking-tight">Interactive Quiz Checkpoint</h4>
        <p className="text-xs text-text-secondary font-bold mt-1">
          Passing requirement: {quiz.passingScore}% | Attempts taken: {attempts.length}
          {quiz.allowedAttempts > 0 && ` / ${quiz.allowedAttempts}`}
        </p>
      </div>

      {attempts.length > 0 && (
        <div className="space-y-3">
          <span className="block text-xs font-black text-text-secondary uppercase tracking-wider">Attempt History</span>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {attempts.map((att, idx) => (
              <div key={att.id} className="p-3 bg-surface/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-text-primary">Attempt #{attempts.length - idx}</span>
                  <span className="text-[10px] text-text-secondary font-bold ml-2">
                    {new Date(att.createdAt).toLocaleDateString()} at {new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-text-primary">{att.score.toFixed(1)}%</span>
                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                    att.isPassed
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {att.isPassed ? 'PASSED' : 'RETRY'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start Action */}
      {quiz.allowedAttempts > 0 && attempts.length >= quiz.allowedAttempts ? (
        <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-center text-xs font-bold text-red-800">
          <AlertCircle size={18} className="mx-auto text-red-500 mb-1.5" />
          <span>You have reached the maximum allowed attempts ({quiz.allowedAttempts}) for this quiz checkpoint.</span>
        </div>
      ) : (
        <button
          onClick={startQuiz}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all"
        >
          {attempts.length > 0 ? 'Retry Checkpoint' : 'Start Quiz Checkpoint'}
        </button>
      )}

      {/* Custom Confirm Dialog */}
      {confirmConfig && (
        <ConfirmDialog
          isOpen={confirmConfig.isOpen}
          onClose={() => setConfirmConfig(null)}
          onConfirm={() => {
            confirmConfig.onConfirm();
            setConfirmConfig(null);
          }}
          title={confirmConfig.title}
          message={confirmConfig.message}
          isDestructive={confirmConfig.isDestructive}
        />
      )}
    </div>
  );
}
