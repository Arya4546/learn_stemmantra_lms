import { useState, useEffect } from 'react';
import { Plus, Trash2, Video, FileText, GripVertical, Upload, Layout, Eye, HelpCircle, Award, Settings, CheckSquare } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { ContentPreviewModal } from '../../components/security/ContentPreviewModal';
import { QuizEditorModal } from '../../components/admin/QuizEditorModal';
import { AssessmentEditorModal } from '../../components/admin/AssessmentEditorModal';
import { AssessmentGradingModal } from '../../components/admin/AssessmentGradingModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { QuizAttemptsModal } from '../../components/admin/QuizAttemptsModal';

interface Section {
  id: string;
  title: string;
  contentItems: ContentItem[];
}

interface ContentItem {
  id: string;
  title: string;
  type: 'VIDEO' | 'PDF' | 'IMAGE' | 'DOCUMENT' | 'QUIZ' | 'ASSESSMENT';
}

interface CourseContentEditorProps {
  courseId: string;
  onClose: () => void;
}

export function CourseContentEditor({ courseId, onClose }: CourseContentEditorProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [previewContentId, setPreviewContentId] = useState<string | null>(null);

  // Custom Prompt Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogPlaceholder, setDialogPlaceholder] = useState('');
  const [dialogValue, setDialogValue] = useState('');
  const [dialogAction, setDialogAction] = useState<((val: string) => void) | null>(null);

  const openCustomPrompt = (title: string, placeholder: string, defaultValue: string, action: (val: string) => void) => {
    setDialogTitle(title);
    setDialogPlaceholder(placeholder);
    setDialogValue(defaultValue);
    setDialogAction(() => action);
    setDialogOpen(true);
  };

  // Modals for editing Quizzes/Assessments
  const [activeQuizItemId, setActiveQuizItemId] = useState<string | null>(null);
  const [activeQuizItemTitle, setActiveQuizItemTitle] = useState<string>('');
  const [activeAssessmentItemId, setActiveAssessmentItemId] = useState<string | null>(null);
  const [activeAssessmentItemTitle, setActiveAssessmentItemTitle] = useState<string>('');
  const [activeGradingItemId, setActiveGradingItemId] = useState<string | null>(null);
  const [activeGradingItemTitle, setActiveGradingItemTitle] = useState<string>('');

  // Modals for viewing Quiz attempts
  const [activeQuizAttemptsId, setActiveQuizAttemptsId] = useState<string | null>(null);
  const [activeQuizAttemptsTitle, setActiveQuizAttemptsTitle] = useState<string>('');

  // Confirm Dialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  } | null>(null);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}`);
      setSections(res.data.data.sections || []);
    } catch (err) {
      toast.error('Failed to load course content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    const loadingToast = toast.loading('Adding section...');
    try {
      const res = await api.post(`/courses/${courseId}/sections`, { title: newSectionTitle });
      setSections([...sections, { ...res.data.data, contentItems: [] }]);
      setNewSectionTitle('');
      setIsAddingSection(false);
      toast.success('Section added', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to add section', { id: loadingToast });
    }
  };

  const deleteSection = (sectionId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Section',
      message: 'Are you sure you want to delete this section and all its contents? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting section...');
        try {
          await api.delete(`/courses/${courseId}/sections/${sectionId}`);
          setSections(sections.filter(s => s.id !== sectionId));
          toast.success('Section deleted', { id: loadingToast });
        } catch (err) {
          toast.error('Failed to delete section', { id: loadingToast });
        }
      }
    });
  };

  const deleteContentItem = (contentItemId: string, sectionId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Content Item',
      message: 'Are you sure you want to delete this content item? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting content...');
        try {
          await api.delete(`/content/${contentItemId}`);
          setSections(sections.map(s => 
            s.id === sectionId 
              ? { ...s, contentItems: s.contentItems.filter(item => item.id !== contentItemId) }
              : s
          ));
          toast.success('Content deleted', { id: loadingToast });
        } catch (err) {
          toast.error('Failed to delete content', { id: loadingToast });
        }
      }
    });
  };

  const uploadFile = async (sectionId: string, file: File, title: string) => {
    const loadingToast = toast.loading(`Uploading ${file.name}...`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    try {
      const res = await api.post(`/sections/${sectionId}/content`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSections(sections.map(s => 
        s.id === sectionId 
          ? { ...s, contentItems: [...s.contentItems, res.data.data] }
          : s
      ));
      toast.success('File uploaded successfully', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: loadingToast });
    }
  };

  const addQuizItem = (sectionId: string) => {
    openCustomPrompt(
      'Create New Quiz',
      'Enter a title for the new Quiz...',
      '',
      async (title) => {
        const loadingToast = toast.loading('Creating quiz...');
        try {
          const res = await api.post(`/sections/${sectionId}/content-item`, { title, type: 'QUIZ' });
          setSections(sections.map(s => 
            s.id === sectionId 
              ? { ...s, contentItems: [...s.contentItems, res.data.data] }
              : s
          ));
          toast.success('Quiz content item created', { id: loadingToast });
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to create quiz', { id: loadingToast });
        }
      }
    );
  };

  const addAssessmentItem = (sectionId: string) => {
    openCustomPrompt(
      'Create New Exam',
      'Enter a title for the new Assessment Exam...',
      '',
      async (title) => {
        const loadingToast = toast.loading('Creating exam...');
        try {
          const res = await api.post(`/sections/${sectionId}/content-item`, { title, type: 'ASSESSMENT' });
          setSections(sections.map(s => 
            s.id === sectionId 
              ? { ...s, contentItems: [...s.contentItems, res.data.data] }
              : s
          ));
          toast.success('Exam content item created', { id: loadingToast });
        } catch (err: any) {
          toast.error(err.response?.data?.message || 'Failed to create exam', { id: loadingToast });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse font-bold text-text-secondary">Loading content editor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-text-primary tracking-tight">Curriculum Manager</h3>
        <button 
          onClick={() => setIsAddingSection(true)}
          className="flex items-center gap-2 text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all font-bold text-sm"
        >
          <Plus size={18} /> Add Section
        </button>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {isAddingSection && (
          <div className="p-4 bg-surface rounded-2xl border-2 border-dashed border-primary/30 animate-in slide-in-from-top duration-300">
            <input 
              autoFocus
              className="w-full bg-white border border-border px-4 py-3 rounded-xl outline-none focus:border-primary font-bold mb-3"
              placeholder="Section Title (e.g. Introduction)"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSection()}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsAddingSection(false)} className="px-4 py-2 text-text-secondary font-bold text-sm">Cancel</button>
              <button onClick={addSection} className="px-6 py-2 bg-primary text-white rounded-xl font-black text-sm">Create</button>
            </div>
          </div>
        )}

        {sections.length === 0 && !isAddingSection ? (
          <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl">
            <Layout className="mx-auto text-text-secondary opacity-20 mb-3" size={48} />
            <p className="text-text-secondary font-bold">No sections created yet.</p>
            <button onClick={() => setIsAddingSection(true)} className="text-primary text-sm font-black mt-2">Create your first section</button>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm group">
              <div className="bg-surface px-4 py-3 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2">
                  <GripVertical size={16} className="text-text-secondary opacity-0 group-hover:opacity-40" />
                  <span className="font-black text-text-primary tracking-tight">{section.title}</span>
                </div>
                <button onClick={() => deleteSection(section.id)} className="p-2 text-text-secondary hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="p-4 space-y-2">
                {section.contentItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-surface/50 rounded-xl border border-border/50 group/item">
                    <div className="flex items-center gap-3">
                      {item.type === 'VIDEO' && <Video size={16} className="text-blue-500" />}
                      {item.type === 'PDF' && <FileText size={16} className="text-orange-500" />}
                      {item.type === 'IMAGE' && <FileText size={16} className="text-emerald-500" />}
                      {item.type === 'DOCUMENT' && <FileText size={16} className="text-purple-500" />}
                      {item.type === 'QUIZ' && <HelpCircle size={16} className="text-indigo-500" />}
                      {item.type === 'ASSESSMENT' && <Award size={16} className="text-rose-500" />}
                      
                      <span className="text-sm font-bold text-text-primary">
                        {item.title}
                        {item.type === 'QUIZ' && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black ml-2">QUIZ</span>}
                        {item.type === 'ASSESSMENT' && <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-black ml-2">EXAM</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                      {item.type === 'ASSESSMENT' && (
                        <button 
                          onClick={() => {
                            setActiveGradingItemId(item.id);
                            setActiveGradingItemTitle(item.title);
                          }}
                          className="p-1 text-text-secondary hover:text-primary transition-all"
                          title="Grade Student Submissions"
                        >
                          <CheckSquare size={14} />
                        </button>
                      )}

                      {item.type === 'QUIZ' && (
                        <button 
                          onClick={() => {
                            setActiveQuizAttemptsId(item.id);
                            setActiveQuizAttemptsTitle(item.title);
                          }}
                          className="p-1 text-text-secondary hover:text-primary transition-all"
                          title="View Quiz Submissions & Scores"
                        >
                          <CheckSquare size={14} />
                        </button>
                      )}

                      {item.type === 'QUIZ' || item.type === 'ASSESSMENT' ? (
                        <button 
                          onClick={() => {
                            if (item.type === 'QUIZ') {
                              setActiveQuizItemId(item.id);
                              setActiveQuizItemTitle(item.title);
                            } else {
                              setActiveAssessmentItemId(item.id);
                              setActiveAssessmentItemTitle(item.title);
                            }
                          }}
                          className="p-1 text-text-secondary hover:text-primary transition-all"
                          title="Configure Questions"
                        >
                          <Settings size={14} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => setPreviewContentId(item.id)}
                          className="p-1 text-text-secondary hover:text-primary transition-all"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteContentItem(item.id, section.id)}
                        className="p-1 text-text-secondary hover:text-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Actions container with Quiz, Exam, and File upload side by side */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-border rounded-xl text-xs font-bold text-text-secondary hover:border-primary hover:text-primary transition-all cursor-pointer">
                    <Upload size={14} />
                    <span>Upload Document / File</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          openCustomPrompt(
                            'Upload Title',
                            'Enter a title for this content...',
                            file.name,
                            (title) => uploadFile(section.id, file, title)
                          );
                        }
                      }}
                    />
                  </label>
                  
                  <button 
                    onClick={() => addQuizItem(section.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-border rounded-xl text-xs font-bold text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Quiz</span>
                  </button>
                  
                  <button 
                    onClick={() => addAssessmentItem(section.id)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-border rounded-xl text-xs font-bold text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Exam</span>
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={onClose}
        className="w-full py-4 bg-surface text-text-primary rounded-2xl font-black hover:bg-white border border-border transition-all mt-4"
      >
        Close Editor
      </button>

      {/* Media Content Preview Modal */}
      {previewContentId && (
        <ContentPreviewModal 
          isOpen={!!previewContentId}
          onClose={() => setPreviewContentId(null)}
          contentId={previewContentId}
        />
      )}

      {/* Quiz Editor Modal */}
      {activeQuizItemId && (
        <QuizEditorModal
          isOpen={!!activeQuizItemId}
          onClose={() => {
            setActiveQuizItemId(null);
            fetchContent();
          }}
          contentItemId={activeQuizItemId}
          contentTitle={activeQuizItemTitle}
        />
      )}

      {/* Assessment/Exam Editor Modal */}
      {activeAssessmentItemId && (
        <AssessmentEditorModal
          isOpen={!!activeAssessmentItemId}
          onClose={() => {
            setActiveAssessmentItemId(null);
            fetchContent();
          }}
          contentItemId={activeAssessmentItemId}
          contentTitle={activeAssessmentItemTitle}
        />
      )}

      {/* Assessment/Exam Grading Modal */}
      {activeGradingItemId && (
        <AssessmentGradingModal
          isOpen={!!activeGradingItemId}
          onClose={() => {
            setActiveGradingItemId(null);
            fetchContent();
          }}
          contentItemId={activeGradingItemId}
          contentTitle={activeGradingItemTitle}
        />
      )}

      {/* Quiz Attempts/Scores Modal */}
      {activeQuizAttemptsId && (
        <QuizAttemptsModal
          isOpen={!!activeQuizAttemptsId}
          onClose={() => {
            setActiveQuizAttemptsId(null);
            fetchContent();
          }}
          contentItemId={activeQuizAttemptsId}
          contentTitle={activeQuizAttemptsTitle}
        />
      )}
      {/* Custom Title Input Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-border shadow-premium flex flex-col animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-text-primary tracking-tight mb-2">{dialogTitle}</h3>
            <p className="text-xs font-bold text-text-secondary mb-4">Please specify a title below to proceed.</p>
            <input 
              autoFocus
              type="text"
              className="w-full bg-surface border border-border px-4 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-sm text-text-primary mb-6"
              placeholder={dialogPlaceholder}
              value={dialogValue}
              onChange={(e) => setDialogValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (dialogValue.trim()) {
                    dialogAction?.(dialogValue.trim());
                    setDialogOpen(false);
                  }
                }
              }}
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDialogOpen(false)} 
                className="px-5 py-3 bg-surface text-text-secondary rounded-xl font-bold text-xs hover:bg-border transition-all border border-border/40"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (dialogValue.trim()) {
                    dialogAction?.(dialogValue.trim());
                    setDialogOpen(false);
                  }
                }} 
                className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs hover:opacity-90 transition-all shadow-premium shadow-primary/20"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
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
