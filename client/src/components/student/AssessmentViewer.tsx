import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { Award, Clock, Eye, AlertTriangle, Upload, CheckCircle, Save, FileText, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILE_UPLOAD';
  options: string[];
  points: number;
}

interface AttemptAnswer {
  questionId: string;
  selectedOptionIndex?: number | null;
  textResponse?: string | null;
  fileUrl?: string | null;
  pointsAwarded?: number | null;
  isCorrect?: boolean | null;
}

interface Attempt {
  id: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  score?: number | null;
  isPassed?: boolean | null;
  startedAt: string;
  completedAt?: string | null;
  blurCount: number;
  feedback?: string | null;
  answers: AttemptAnswer[];
}

interface AssessmentViewerProps {
  contentItemId: string;
}

export function AssessmentViewer({ contentItemId }: AssessmentViewerProps) {
  const [assessment, setAssessment] = useState<{
    id: string;
    durationMinutes: number;
    totalPoints: number;
    passingScore: number;
    allowedAttempts: number;
    isProctored: boolean;
    showResultImmediately: boolean;
    questions: Question[];
  } | null>(null);

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active attempt session state
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null);
  const [localAnswers, setLocalAnswers] = useState<Record<string, { selectedOptionIndex?: number; textResponse?: string; fileUrl?: string }>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [uploadingQuestionId, setUploadingQuestionId] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');

  // Confirm Dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const examRes = await api.get(`/assessments/${contentItemId}`);
      setAssessment(examRes.data.data);

      const attemptsRes = await api.get(`/assessments/${contentItemId}/attempts`);
      const list = attemptsRes.data.data || [];
      setAttempts(list);

      // Check if there is an in-progress attempt to resume
      const inProgress = list.find((att: Attempt) => att.status === 'IN_PROGRESS');
      if (inProgress) {
        resumeAttempt(inProgress, examRes.data.data.durationMinutes);
      }
    } catch (err) {
      toast.error('Failed to load exam details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      stopTimer();
    };
  }, [contentItemId]);

  // Proctor monitoring effect
  useEffect(() => {
    if (!activeAttempt || !assessment || !assessment.isProctored) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation();
      }
    };

    const handleWindowBlur = () => {
      logViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeAttempt, assessment]);

  const logViolation = async () => {
    if (!activeAttempt) return;
    toast.error('PROCTOR WARNING: Focus lost! Please stay inside the exam screen. This event has been logged.', {
      duration: 5000,
      icon: '⚠️',
    });
    try {
      await api.post(`/assessments/attempts/${activeAttempt.id}/proctor-blur`);
    } catch (err) {
      // Fail silently
    }
  };

  const startTimer = (startedAt: string, durationMinutes: number) => {
    stopTimer();
    const startMs = new Date(startedAt).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    
    const tick = () => {
      const elapsedMs = Date.now() - startMs;
      const remainingSecs = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
      
      setTimeLeft(remainingSecs);

      if (remainingSecs <= 0) {
        stopTimer();
        toast.error('Time limit expired! Auto-submitting your exam...', { duration: 6000 });
        submitExam(true);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startExam = async () => {
    if (!assessment) return;
    if (attempts.length >= assessment.allowedAttempts) {
      toast.error('Attempt limit reached.');
      return;
    }

    const loadingToast = toast.loading('Starting secure exam session...');
    try {
      const res = await api.post(`/assessments/${contentItemId}/start`);
      resumeAttempt(res.data.data, assessment.durationMinutes);
      toast.success('Exam started! Best of luck.', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start exam', { id: loadingToast });
    }
  };

  const resumeAttempt = (attempt: Attempt, durationMinutes: number) => {
    setActiveAttempt(attempt);
    
    // Map existing answers to localAnswers state
    const mapped: Record<string, { selectedOptionIndex?: number; textResponse?: string; fileUrl?: string }> = {};
    attempt.answers.forEach((ans) => {
      mapped[ans.questionId] = {
        selectedOptionIndex: ans.selectedOptionIndex !== null ? ans.selectedOptionIndex : undefined,
        textResponse: ans.textResponse !== null ? ans.textResponse : undefined,
        fileUrl: ans.fileUrl !== null ? ans.fileUrl : undefined,
      };
    });
    setLocalAnswers(mapped);

    startTimer(attempt.startedAt, durationMinutes);
  };

  // Autosave question answer
  const saveAnswer = async (
    questionId: string,
    data: { selectedOptionIndex?: number; textResponse?: string; fileUrl?: string }
  ) => {
    if (!activeAttempt) return;
    
    // Update local state first
    setLocalAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...data,
      },
    }));

    setAutosaveStatus('saving');
    try {
      await api.post(`/assessments/attempts/${activeAttempt.id}/answer`, {
        questionId,
        ...data,
      });
      setAutosaveStatus('saved');
    } catch (err) {
      setAutosaveStatus('error');
    }
  };

  // Worksheet / Sheet file upload
  const handleFileUpload = async (questionId: string, file: File) => {
    if (!activeAttempt) return;
    
    setUploadingQuestionId(questionId);
    const formData = new FormData();
    formData.append('file', file);

    const uploadToast = toast.loading('Uploading solved worksheet sheet...');
    try {
      const res = await api.post(`/assessments/attempts/${activeAttempt.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const fileUrl = res.data.data.fileUrl;
      await saveAnswer(questionId, { fileUrl });
      toast.success('Sheet uploaded and linked to answer!', { id: uploadToast });
    } catch (err) {
      toast.error('File upload failed. Please try again.', { id: uploadToast });
    } finally {
      setUploadingQuestionId(null);
    }
  };

  const submitExam = async (isAuto = false) => {
    if (!activeAttempt) return;

    const performSubmission = async () => {
      stopTimer();
      setIsSubmitting(true);
      const submitToast = toast.loading('Finalizing and grading exam...');
      try {
        await api.post(`/assessments/attempts/${activeAttempt.id}/submit`);
        setActiveAttempt(null);
        
        // Refresh list
        const attemptsRes = await api.get(`/assessments/${contentItemId}/attempts`);
        setAttempts(attemptsRes.data.data || []);
        
        toast.success('Exam submitted successfully!', { id: submitToast });
      } catch (err) {
        toast.error('Failed to submit exam', { id: submitToast });
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!isAuto) {
      setConfirmConfig({
        isOpen: true,
        title: 'Submit Exam',
        message: 'Are you sure you want to finalize and submit your assessment exam? This cannot be undone and your timer will stop.',
        isDestructive: false,
        onConfirm: performSubmission
      });
    } else {
      await performSubmission();
    }
  };

  // Format timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-text-secondary font-bold">
        <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mb-3" />
        <span>Initializing exam console...</span>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center p-8 border border-border bg-white rounded-2xl">
        <Award size={40} className="mx-auto text-rose-500 opacity-20 mb-3" />
        <p className="font-bold text-text-secondary">Assessment Exam is not configured yet.</p>
      </div>
    );
  }

  // Active secure attempt view
  if (activeAttempt) {
    return (
      <div className="space-y-6 select-none">
        
        {/* Sticky proctor & timer bar */}
        <div className="sticky top-0 bg-white/85 backdrop-blur-md border border-rose-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm z-30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            <div>
              <span className="block text-xs font-black text-rose-600 uppercase tracking-wider">Formal Examination Session</span>
              {assessment.isProctored && (
                <span className="block text-[10px] text-amber-600 font-extrabold flex items-center gap-0.5">
                  <AlertTriangle size={10} /> Tab-monitoring and focus protection active.
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Autosave badge */}
            <span className="text-[10px] font-black text-text-secondary flex items-center gap-1">
              <Save size={10} />
              {autosaveStatus === 'saved' && <span className="text-emerald-600">Saved</span>}
              {autosaveStatus === 'saving' && <span className="text-indigo-600 animate-pulse">Saving...</span>}
              {autosaveStatus === 'error' && <span className="text-red-600">Autosave Error</span>}
            </span>

            <div className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-black text-sm">
              <Clock size={16} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {assessment.questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-border p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 bg-rose-50 text-rose-600 text-xs font-black rounded-full flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-[10px] font-black text-text-secondary uppercase">({q.points} pt)</span>
              </div>
              
              <h4 className="text-sm font-bold text-text-primary mb-4 leading-relaxed whitespace-pre-wrap">{q.questionText}</h4>

              {/* MCQ format */}
              {q.type === 'MCQ' && (
                <div className="grid grid-cols-1 gap-2.5">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => saveAnswer(q.id, { selectedOptionIndex: oIdx })}
                      className={`w-full text-left p-3.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-3 ${
                        localAnswers[q.id]?.selectedOptionIndex === oIdx
                          ? 'border-rose-500 bg-rose-50/10 text-rose-700 font-extrabold'
                          : 'border-border hover:border-rose-200 text-text-secondary bg-white'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        localAnswers[q.id]?.selectedOptionIndex === oIdx
                          ? 'border-rose-500 bg-rose-500 text-white font-black'
                          : 'border-border text-text-secondary bg-white'
                      }`}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* TRUE / FALSE format */}
              {q.type === 'TRUE_FALSE' && (
                <div className="flex gap-4">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => saveAnswer(q.id, { selectedOptionIndex: oIdx })}
                      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                        localAnswers[q.id]?.selectedOptionIndex === oIdx
                          ? 'border-rose-500 bg-rose-50/10 text-rose-700 font-extrabold'
                          : 'border-border hover:border-rose-200 text-text-secondary bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Short Answer text editor format */}
              {q.type === 'SHORT_ANSWER' && (
                <textarea
                  rows={4}
                  className="w-full bg-surface border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-rose-500 transition-all"
                  placeholder="Enter your written solution or response here..."
                  value={localAnswers[q.id]?.textResponse || ''}
                  onChange={(e) => saveAnswer(q.id, { textResponse: e.target.value })}
                />
              )}

              {/* Sheet File upload format */}
              {q.type === 'FILE_UPLOAD' && (
                <div className="space-y-4">
                  {localAnswers[q.id]?.fileUrl ? (
                    <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <CheckCircle size={16} className="text-emerald-500" />
                        <span>Sheet uploaded successfully</span>
                      </div>
                      <a
                        href={localAnswers[q.id]?.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Eye size={12} /> View uploaded sheet
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-border rounded-xl text-center bg-surface/30">
                      <FileText size={24} className="mx-auto text-text-secondary opacity-35 mb-2" />
                      <p className="text-xs text-text-secondary font-bold mb-3">Download the worksheet, complete it on paper or digitally, and upload the file (PDF or Image).</p>
                    </div>
                  )}

                  <label className="flex items-center justify-center gap-2 p-3 bg-white border border-border rounded-xl text-xs font-bold hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer">
                    <Upload size={14} />
                    <span>{uploadingQuestionId === q.id ? 'Uploading worksheet...' : 'Choose solved worksheet to Upload'}</span>
                    <input
                      type="file"
                      className="hidden"
                      disabled={uploadingQuestionId === q.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(q.id, file);
                      }}
                    />
                  </label>
                </div>
              )}

            </div>
          ))}
        </div>

        <button
          onClick={() => submitExam(false)}
          disabled={isSubmitting}
          className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Completing exam...' : 'Finalize & Submit Examination'}
        </button>

      </div>
    );
  }

  // Render attempts and launch screen
  return (
    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="text-center py-6 border-b border-border/60">
        <Award size={48} className="mx-auto text-rose-500 opacity-20 mb-3" />
        <h4 className="text-lg font-black text-text-primary tracking-tight">Assessment Examination Console</h4>
        <p className="text-xs text-text-secondary font-bold mt-1">
          Time Limit: {assessment.durationMinutes} minutes | Passing Score: {assessment.passingScore} points (Total Max: {assessment.totalPoints})
        </p>
      </div>

      {attempts.length > 0 && (
        <div className="space-y-3">
          <span className="block text-xs font-black text-text-secondary uppercase tracking-wider">Attempt History</span>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {attempts.map((att, idx) => (
              <div key={att.id} className="p-4 bg-surface/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div>
                    <span className="font-black text-text-primary">Attempt #{attempts.length - idx}</span>
                    <span className="text-[10px] text-text-secondary font-medium ml-2">
                      {new Date(att.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                    att.status === 'GRADED'
                      ? att.isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      : 'bg-indigo-50 text-indigo-600 animate-pulse'
                  }`}>
                    {att.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">Browser Violations logged: {att.blurCount}</span>
                  {att.status === 'GRADED' ? (
                    <span className="font-extrabold text-text-primary">Score: {att.score} / {assessment.totalPoints} points ({att.isPassed ? 'Passed' : 'Retry'})</span>
                  ) : (
                    <span className="text-text-secondary italic">Awaiting grading...</span>
                  )}
                </div>

                {att.feedback && (
                  <div className="p-2.5 bg-indigo-50/40 border border-indigo-100/50 rounded-lg text-xs font-bold text-indigo-900 mt-2">
                    <span className="block font-black text-indigo-700 text-[10px] uppercase">Teacher Review Comments:</span>
                    <span>{att.feedback}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Launch Exam CTA */}
      {attempts.length >= assessment.allowedAttempts ? (
        <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl text-center text-xs font-bold text-red-800">
          <AlertTriangle size={18} className="mx-auto text-red-500 mb-1.5" />
          <span>You have already taken the allowed limits ofattempts ({assessment.allowedAttempts}) for this formal exam.</span>
        </div>
      ) : (
        <button
          onClick={startExam}
          className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-sm tracking-wide shadow-md active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <span>Start Formal Assessment Exam</span>
          <ChevronRight size={16} />
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
