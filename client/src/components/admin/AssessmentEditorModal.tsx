import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, CheckCircle, AlertCircle, Save, Settings } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILE_UPLOAD';

interface AssessmentQuestion {
  id?: string;
  questionText: string;
  type: QuestionType;
  options: string[];
  correctOptionIndex?: number | null;
  explanation: string;
  points: number;
}

interface AssessmentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItemId: string;
  contentTitle: string;
}

export function AssessmentEditorModal({ isOpen, onClose, contentItemId, contentTitle }: AssessmentEditorModalProps) {
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [passingScore, setPassingScore] = useState<number>(30);
  const [allowedAttempts, setAllowedAttempts] = useState<number>(1);
  const [isProctored, setIsProctored] = useState<boolean>(true);
  const [showResultImmediately, setShowResultImmediately] = useState<boolean>(false);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAssessment = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/assessments/${contentItemId}`);
        if (res.data.data) {
          setDurationMinutes(res.data.data.durationMinutes);
          setPassingScore(res.data.data.passingScore);
          setAllowedAttempts(res.data.data.allowedAttempts);
          setIsProctored(res.data.data.isProctored);
          setShowResultImmediately(res.data.data.showResultImmediately);
          setQuestions(res.data.data.questions || []);
        } else {
          // Initialize with one blank question
          setQuestions([
            {
              questionText: '',
              type: 'MCQ',
              options: ['', '', '', ''],
              correctOptionIndex: 0,
              explanation: '',
              points: 5,
            },
          ]);
        }
      } catch (err) {
        toast.error('Failed to load assessment details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [isOpen, contentItemId]);

  const addQuestion = (type: QuestionType) => {
    let options: string[] = [];
    let correctOptionIndex: number | null = null;

    if (type === 'MCQ') {
      options = ['', '', '', ''];
      correctOptionIndex = 0;
    } else if (type === 'TRUE_FALSE') {
      options = ['True', 'False'];
      correctOptionIndex = 0;
    }

    setQuestions([
      ...questions,
      {
        questionText: '',
        type,
        options,
        correctOptionIndex,
        explanation: '',
        points: type === 'MCQ' || type === 'TRUE_FALSE' ? 5 : 10,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error('Assessment must have at least one question');
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

  const handleQuestionTypeChange = (qIndex: number, type: QuestionType) => {
    const updated = [...questions];
    updated[qIndex].type = type;
    
    if (type === 'MCQ') {
      updated[qIndex].options = ['', '', '', ''];
      updated[qIndex].correctOptionIndex = 0;
    } else if (type === 'TRUE_FALSE') {
      updated[qIndex].options = ['True', 'False'];
      updated[qIndex].correctOptionIndex = 0;
    } else {
      updated[qIndex].options = [];
      updated[qIndex].correctOptionIndex = null;
    }
    
    setQuestions(updated);
  };

  const handleSave = async () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is empty`);
        return;
      }
      if ((q.type === 'MCQ' || q.type === 'TRUE_FALSE') && q.options.some(opt => !opt.trim())) {
        toast.error(`Question ${i + 1} has empty options`);
        return;
      }
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Saving exam details...');
    try {
      await api.post(`/assessments/${contentItemId}`, {
        durationMinutes,
        passingScore,
        allowedAttempts,
        isProctored,
        showResultImmediately,
        questions,
      });
      toast.success('Exam saved successfully!', { id: loadingToast });
      onClose();
    } catch (err) {
      toast.error('Failed to save assessment details', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalPointsMax = questions.reduce((sum, q) => sum + q.points, 0);

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col border border-border animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-text-primary tracking-tight">Configure Assessment Exam</h3>
            <p className="text-xs text-text-secondary font-bold truncate max-w-md">{contentTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <X size={18} className="text-text-primary" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-text-secondary font-bold">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
            <span>Loading exam configuration...</span>
          </div>
        ) : (
          <>
            {/* Scrollable container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Settings Configuration */}
              <div className="bg-surface/50 border border-border p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Settings size={16} className="text-primary" />
                  <span className="text-xs font-black text-text-primary uppercase tracking-wider">Exam Configuration & Integrity Settings</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black text-text-secondary mb-1">Time Limit (Minutes)</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-white border border-border px-4 py-2 rounded-xl font-bold outline-none focus:border-primary text-sm"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary mb-1">Passing Points (Max {totalPointsMax})</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-white border border-border px-4 py-2 rounded-xl font-bold outline-none focus:border-primary text-sm"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-text-secondary mb-1">Allowed Attempts</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full bg-white border border-border px-4 py-2 rounded-xl font-bold outline-none focus:border-primary text-sm"
                      value={allowedAttempts}
                      onChange={(e) => setAllowedAttempts(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 pt-2 border-t border-border/50">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      checked={isProctored}
                      onChange={(e) => setIsProctored(e.target.checked)}
                    />
                    <div className="text-left">
                      <span className="block text-xs font-black text-text-primary">Enable Tab-Focus Monitoring</span>
                      <span className="block text-[10px] text-text-secondary font-bold">Tracks browser focus changes / copy-paste actions.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                      checked={showResultImmediately}
                      onChange={(e) => setShowResultImmediately(e.target.checked)}
                    />
                    <div className="text-left">
                      <span className="block text-xs font-black text-text-primary">Show Instant Autograded Results</span>
                      <span className="block text-[10px] text-text-secondary font-bold">Instantly publishes scores for MCQ/TF questions to students.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Add Question Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-black text-text-primary tracking-tight uppercase">Questions list ({questions.length})</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black text-text-secondary uppercase mr-1">Add question type:</span>
                  <button
                    onClick={() => addQuestion('MCQ')}
                    className="text-[11px] text-indigo-600 bg-indigo-50 font-black px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-all"
                  >
                    + MCQ
                  </button>
                  <button
                    onClick={() => addQuestion('TRUE_FALSE')}
                    className="text-[11px] text-emerald-600 bg-emerald-50 font-black px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-all"
                  >
                    + True/False
                  </button>
                  <button
                    onClick={() => addQuestion('SHORT_ANSWER')}
                    className="text-[11px] text-purple-600 bg-purple-50 font-black px-2.5 py-1.5 rounded-lg hover:bg-purple-100 transition-all"
                  >
                    + Short Answer
                  </button>
                  <button
                    onClick={() => addQuestion('FILE_UPLOAD')}
                    className="text-[11px] text-rose-600 bg-rose-50 font-black px-2.5 py-1.5 rounded-lg hover:bg-rose-100 transition-all"
                  >
                    + Worksheet Upload
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-white border border-border p-5 rounded-2xl shadow-sm relative group animate-in slide-in-from-bottom duration-300">
                    
                    {/* Delete Icon */}
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="absolute top-4 right-4 p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Question"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Question Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                      <span className="w-6 h-6 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center text-xs font-black">
                        {qIndex + 1}
                      </span>
                      <div className="flex items-center gap-4">
                        <select
                          className="bg-surface border border-border rounded-lg px-2 py-1 font-bold text-xs outline-none"
                          value={q.type}
                          onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value as QuestionType)}
                        >
                          <option value="MCQ">Multiple Choice (MCQ)</option>
                          <option value="TRUE_FALSE">True / False</option>
                          <option value="SHORT_ANSWER">Short Text Response (Manual Grading)</option>
                          <option value="FILE_UPLOAD">Written Sheet / Upload (Manual Grading)</option>
                        </select>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-text-primary uppercase">Points:</span>
                          <input
                            type="number"
                            min="1"
                            className="w-16 bg-surface border border-border px-2 py-1 rounded-lg text-center font-bold text-xs"
                            value={q.points}
                            onChange={(e) => handlePointsChange(qIndex, Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-text-secondary mb-1">Question Prompt</label>
                      <textarea
                        rows={2}
                        className="w-full bg-surface border border-border px-4 py-3 rounded-xl font-bold text-sm outline-none focus:border-rose-500 transition-all resize-none"
                        placeholder="Enter the question prompt or instructions..."
                        value={q.questionText}
                        onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                      />
                    </div>

                    {/* Conditional rendering based on Type */}
                    {q.type === 'MCQ' && (
                      <div className="mb-4 space-y-2">
                        <label className="block text-xs font-bold text-text-secondary mb-1">MCQ Options (Check correct option)</label>
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
                                className="p-1"
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
                    )}

                    {q.type === 'TRUE_FALSE' && (
                      <div className="mb-4 space-y-2">
                        <label className="block text-xs font-bold text-text-secondary mb-1">Select Correct Statement</label>
                        <div className="flex gap-4">
                          {q.options.map((opt, oIndex) => (
                            <button
                              key={oIndex}
                              type="button"
                              onClick={() => handleCorrectOptionChange(qIndex, oIndex)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                                q.correctOptionIndex === oIndex
                                  ? 'border-emerald-500 bg-emerald-50/20 text-emerald-700'
                                  : 'border-border text-text-secondary'
                              }`}
                            >
                              <CheckCircle
                                size={14}
                                className={q.correctOptionIndex === oIndex ? 'text-emerald-500' : 'opacity-20'}
                              />
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.type === 'SHORT_ANSWER' && (
                      <div className="mb-4 p-3 bg-surface rounded-xl border border-dashed border-border/80">
                        <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">Short Text Format</span>
                        <p className="text-[11px] text-text-secondary font-bold mt-1">This question presents a text editor to the student, and requires manual grading & points awarding by the teacher.</p>
                      </div>
                    )}

                    {q.type === 'FILE_UPLOAD' && (
                      <div className="mb-4 p-3 bg-surface rounded-xl border border-dashed border-border/80">
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Worksheet File Upload</span>
                        <p className="text-[11px] text-text-secondary font-bold mt-1">The student will be prompted to download the worksheet instructions, solve on paper or device, and upload their completed sheet as a PDF or image. Manual grading by teacher is required.</p>
                      </div>
                    )}

                    {/* Optional Solution Note */}
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1 flex items-center gap-1">
                        <AlertCircle size={12} className="text-rose-500" /> Explanation / Answer Keys Solutions
                      </label>
                      <input
                        type="text"
                        className="w-full bg-surface border border-border px-4 py-2 rounded-xl font-bold text-xs outline-none focus:border-rose-500 transition-all"
                        placeholder="Add hints, templates, or expected answers for reference during manual grading..."
                        value={q.explanation}
                        onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                      />
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Footer */}
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
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Exam Setting'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>,
    document.body
  );
}
