import { useState, useEffect } from 'react';
import { Plus, Trash2, Video, FileText, GripVertical, Save, X, Upload, Layout } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Section {
  id: string;
  title: string;
  contentItems: ContentItem[];
}

interface ContentItem {
  id: string;
  title: string;
  type: 'VIDEO' | 'PDF' | 'IMAGE';
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

  const deleteSection = async (sectionId: string) => {
    if (!window.confirm('Delete this section and all its contents?')) return;
    const loadingToast = toast.loading('Deleting section...');
    try {
      await api.delete(`/courses/${courseId}/sections/${sectionId}`);
      setSections(sections.filter(s => s.id !== sectionId));
      toast.success('Section deleted', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to delete section', { id: loadingToast });
    }
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
                      {item.type === 'VIDEO' ? <Video size={16} className="text-blue-500" /> : <FileText size={16} className="text-orange-500" />}
                      <span className="text-sm font-bold text-text-primary">{item.title}</span>
                    </div>
                    <button className="opacity-0 group-item-hover:opacity-100 p-1 text-text-secondary hover:text-red-600 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="pt-2">
                  <label className="flex items-center justify-center gap-2 w-full p-3 bg-white border border-dashed border-border rounded-xl text-xs font-bold text-text-secondary hover:border-primary hover:text-primary transition-all cursor-pointer">
                    <Upload size={14} />
                    <span>Upload Video or PDF</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const title = prompt('Enter a title for this content:', file.name);
                          if (title) uploadFile(section.id, file, title);
                        }
                      }}
                    />
                  </label>
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
    </div>
  );
}
