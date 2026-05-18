import { createPortal } from 'react-dom';
import { AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 border border-border shadow-premium flex flex-col animate-in zoom-in duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isDestructive ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
          }`}>
            {isDestructive ? <AlertTriangle size={24} /> : <HelpCircle size={24} />}
          </div>
          <div>
            <h3 className="text-lg font-black text-text-primary tracking-tight">{title}</h3>
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Confirmation Required</span>
          </div>
        </div>

        <p className="text-xs font-bold text-text-secondary leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex gap-3 justify-end mt-auto">
          <button
            onClick={onClose}
            className="px-5 py-3 bg-surface hover:bg-border text-text-secondary border border-border/40 rounded-xl font-bold text-xs transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 text-white rounded-xl font-black text-xs transition-all shadow-md ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
