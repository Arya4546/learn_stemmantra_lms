import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border-2 border-dashed border-border text-center animate-in zoom-in duration-500">
      <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 shadow-inner">
        <Icon size={40} className="text-text-secondary opacity-40" />
      </div>
      <h3 className="text-2xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-sm mb-8 font-medium">{description}</p>
      {actionText && (
        <button 
          onClick={onAction}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-lg shadow-primary/20 active:translate-y-0"
        >
          <Plus size={20} />
          {actionText}
        </button>
      )}
    </div>
  );
}
