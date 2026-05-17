import { useState, useEffect, useRef } from 'react';
import { Course } from '../../services/courseService';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface CourseFormProps {
  course?: Course | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CourseForm({ course, onSubmit, onCancel, isSubmitting }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true,
    isPublished: true,
    thumbnailUrl: ''
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        isActive: course.isActive,
        isPublished: course.isPublished,
        thumbnailUrl: course.thumbnailUrl || ''
      });
      setPreviewUrl(course.thumbnailUrl || null);
    }
  }, [course]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        setFormData({ ...formData, thumbnailUrl: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Course Title</label>
        <input
          required
          type="text"
          className="w-full px-5 py-4 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary"
          placeholder="e.g. Robotics for Beginners"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Description</label>
        <textarea
          required
          rows={4}
          className="w-full px-5 py-4 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-text-primary resize-none"
          placeholder="Detailed description of the course content..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Course Thumbnail</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full aspect-video rounded-3xl border-2 border-dashed border-border bg-surface hover:bg-white hover:border-primary/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-bold flex items-center gap-2"><Upload size={18} /> Change Image</p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-text-secondary group-hover:text-primary transition-colors">
              <div className="p-4 bg-white rounded-2xl shadow-sm border border-border">
                <ImageIcon size={32} />
              </div>
              <p className="font-bold text-sm">Click to upload or drag and drop</p>
              <p className="text-[10px] uppercase tracking-wider font-black opacity-50">PNG, JPG up to 2MB</p>
            </div>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Status</label>
        <select
          className="w-full px-5 py-4 bg-surface border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-text-primary"
          value={formData.isActive ? 'true' : 'false'}
          onChange={(e) => {
            const val = e.target.value === 'true';
            setFormData({ ...formData, isActive: val, isPublished: val } as any);
          }}
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-8 py-4 bg-white border border-border rounded-2xl font-bold text-text-secondary hover:bg-surface transition-all active:scale-95"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
        >
          {isSubmitting ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}
