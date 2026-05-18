import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Check, Award, ChevronRight, Eye } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Student {
  fullName: string;
  email: string;
}

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
  question: Question;
}

interface Submission {
  id: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  score?: number | null;
  isPassed?: boolean | null;
  startedAt: string;
  completedAt?: string | null;
  blurCount: number;
  feedback?: string | null;
  user: Student;
  answers: AttemptAnswer[];
}

interface AssessmentGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItemId: string;
  contentTitle: string;
}

export function AssessmentGradingModal({ isOpen, onClose, contentItemId, contentTitle }: AssessmentGradingModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Grading states for selected submission
  const [grades, setGrades] = useState<Record<string, { pointsAwarded: number; isCorrect: boolean }>>({});
  const [feedback, setFeedback] = useState<string>('');

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/assessments/${contentItemId}/attempts`);
      setSubmissions(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load student submissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
      setSelectedSubmission(null);
    }
  }, [isOpen, contentItemId]);

  const selectSubmissionForGrading = (sub: Submission) => {
    setSelectedSubmission(sub);
    setFeedback(sub.feedback || '');
    
    // Map existing answers' grades
    const mapped: Record<string, { pointsAwarded: number; isCorrect: boolean }> = {};
    sub.answers.forEach((ans) => {
      mapped[ans.questionId] = {
        pointsAwarded: ans.pointsAwarded !== null ? ans.pointsAwarded! : 0,
        isCorrect: ans.isCorrect !== null ? ans.isCorrect! : false,
      };
    });
    setGrades(mapped);
  };

  const handleGradeChange = (questionId: string, pointsAwarded: number, isCorrect: boolean) => {
    setGrades({
      ...grades,
      [questionId]: {
        pointsAwarded,
        isCorrect,
      },
    });
  };

  const saveGrades = async () => {
    if (!selectedSubmission) return;

    setIsSaving(true);
    const gradingToast = toast.loading('Saving and publishing grades...');
    try {
      await api.post(`/assessments/attempts/${selectedSubmission.id}/grade`, {
        grades,
        feedback,
      });
      toast.success('Grades saved and student notified!', { id: gradingToast });
      
      // Reload and return to list
      await fetchSubmissions();
      setSelectedSubmission(null);
    } catch (err) {
      toast.error('Failed to save grades', { id: gradingToast });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-border animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-text-primary tracking-tight">Grade Exam Submissions</h3>
            <p className="text-xs text-text-secondary font-bold truncate max-w-md">{contentTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <X size={18} className="text-text-primary" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-text-secondary font-bold">
            <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mb-3" />
            <span>Loading submissions list...</span>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left sidebar: Submissions List */}
            <div className="w-1/3 border-r border-border overflow-y-auto custom-scrollbar bg-surface/20">
              <div className="p-4 border-b border-border bg-surface/50">
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Submissions ({submissions.length})</span>
              </div>

              {submissions.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-text-secondary">
                  No student submissions found.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {submissions.map((sub) => {
                    const isSelected = selectedSubmission?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => selectSubmissionForGrading(sub)}
                        className={`w-full text-left p-4 hover:bg-black/5 transition-all flex items-center justify-between ${
                          isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs font-black text-text-primary truncate">{sub.user.fullName}</span>
                          <span className="block text-[10px] text-text-secondary truncate mt-0.5">{sub.user.email}</span>
                          <span className="block text-[9px] text-text-secondary font-bold mt-1">
                            {new Date(sub.completedAt || sub.startedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 ml-2">
                          <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                            sub.status === 'GRADED'
                              ? sub.isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                              : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {sub.status}
                          </span>
                          <ChevronRight size={14} className="text-text-secondary opacity-45" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right content: Grading Panel */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {selectedSubmission ? (
                <>
                  {/* Grading panel body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    {/* Student scorecard details */}
                    <div className="bg-surface p-4 rounded-2xl border border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="block text-[9px] font-black text-text-secondary uppercase">Student</span>
                        <span className="block text-xs font-black text-text-primary mt-0.5">{selectedSubmission.user.fullName}</span>
                        <span className="block text-[10px] text-text-secondary truncate">{selectedSubmission.user.email}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-text-secondary uppercase">Tab violations</span>
                        <span className={`block text-xs font-black mt-0.5 ${
                          selectedSubmission.blurCount > 3 ? 'text-red-600' : 'text-text-primary'
                        }`}>
                          {selectedSubmission.blurCount} focus lost events
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black text-text-secondary uppercase">Grading Status</span>
                        <span className="block text-xs font-black text-text-primary mt-0.5">{selectedSubmission.status}</span>
                      </div>
                    </div>

                    {/* Question items */}
                    <div className="space-y-6">
                      {selectedSubmission.answers.map((ans, idx) => {
                        const q = ans.question;
                        const isMCQ = q.type === 'MCQ' || q.type === 'TRUE_FALSE';
                        const pointsAwarded = grades[q.id]?.pointsAwarded || 0;
                        const isCorrect = grades[q.id]?.isCorrect || false;

                        return (
                          <div key={q.id} className="border border-border p-5 rounded-2xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-rose-50 text-rose-600 text-xs font-black rounded-full flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">{q.type}</span>
                              </div>
                              <span className="text-xs font-black text-text-secondary">Max Question Points: {q.points}</span>
                            </div>

                            <p className="text-xs font-bold text-text-primary">{q.questionText}</p>

                            {/* Display student's response */}
                            <div className="p-3.5 bg-surface rounded-xl border border-border/50 text-xs space-y-2">
                              <span className="block text-[10px] font-black text-text-secondary uppercase">Student's Answer:</span>
                              
                              {isMCQ && (
                                <p className="font-extrabold text-text-primary">
                                  Selected Option Index: {ans.selectedOptionIndex !== null ? String.fromCharCode(65 + ans.selectedOptionIndex!) : 'None'} 
                                  {ans.selectedOptionIndex !== null && ` (${q.options[ans.selectedOptionIndex!]})`}
                                </p>
                              )}

                              {q.type === 'SHORT_ANSWER' && (
                                <p className="font-extrabold text-text-primary whitespace-pre-wrap leading-relaxed">
                                  {ans.textResponse || 'No text answer submitted.'}
                                </p>
                              )}

                              {q.type === 'FILE_UPLOAD' && (
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <p className="font-extrabold text-text-primary flex items-center gap-1.5">
                                    <FileText size={16} className="text-rose-500" /> Solved worksheet sheet
                                  </p>
                                  {ans.fileUrl ? (
                                    <a
                                      href={ans.fileUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-1 text-[10px] bg-white border border-border hover:bg-black/5 text-indigo-600 px-3 py-1.5 rounded-lg font-black transition-all shadow-sm"
                                    >
                                      <Eye size={12} /> View uploaded sheet
                                    </a>
                                  ) : (
                                    <span className="text-red-500 font-extrabold">No sheet uploaded!</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Teacher Grading Inputs */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-border/50">
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                                    checked={isCorrect}
                                    onChange={(e) => handleGradeChange(q.id, e.target.checked ? q.points : 0, e.target.checked)}
                                  />
                                  <span className="text-xs font-black text-text-primary">Mark as Correct</span>
                                </label>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-text-secondary">Points Awarded:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={q.points}
                                  className="w-20 bg-surface border border-border px-3 py-1 rounded-lg text-center font-bold text-xs"
                                  value={pointsAwarded}
                                  onChange={(e) => handleGradeChange(q.id, Math.min(q.points, Math.max(0, Number(e.target.value))), isCorrect)}
                                />
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                    {/* Teacher general comments */}
                    <div className="pt-2 border-t border-border">
                      <label className="block text-xs font-black text-text-primary mb-2 uppercase tracking-wider">Teacher Feedback & Comments</label>
                      <textarea
                        rows={3}
                        className="w-full bg-surface border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-primary transition-all"
                        placeholder="Provide summary comments or next steps for the student..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </div>

                  </div>

                  {/* Grading panel footer */}
                  <div className="px-6 py-4 bg-surface border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="px-6 py-3 bg-white text-text-primary rounded-xl border border-border font-bold text-xs hover:bg-black/5 transition-all"
                    >
                      Back to Submissions List
                    </button>
                    
                    <button
                      onClick={saveGrades}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-xs hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      <Check size={14} /> {isSaving ? 'Publishing...' : 'Save & Publish Grades'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-text-secondary font-bold">
                  <Award size={48} className="text-rose-500 opacity-20 mb-3" />
                  <p className="text-sm">Select a student submission from the left panel to begin manual grading.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
