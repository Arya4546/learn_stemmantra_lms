import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PlayCircle, FileText, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { VideoPlayer } from './VideoPlayer';
import { WatermarkOverlay } from './WatermarkOverlay';
import { useAuth } from '../../context/AuthContext';

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
}

export function ContentPreviewModal({ isOpen, onClose, contentId }: ContentPreviewModalProps) {
  const { user } = useAuth();
  const [contentData, setContentData] = useState<{ type: string; title: string; mimeType: string } | null>(null);
  const [tokenUrl, setTokenUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !contentId) {
      setContentData(null);
      setTokenUrl(null);
      setError('');
      return;
    }

    const fetchToken = async () => {
      try {
        setIsLoading(true);
        setError('');
        // Request one-time access token
        const response = await api.post(`/content/${contentId}/access-token`);
        const { token, type, title, mimeType } = response.data.data;
        
        setContentData({ type, title, mimeType });
        
        // Construct the serving URL
        const serveUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/content/serve/${token}`;
        setTokenUrl(serveUrl);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load preview.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchToken();
  }, [isOpen, contentId]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-secondary font-bold animate-pulse">Loading preview...</p>
        </div>
      );
    }

    if (error || !tokenUrl || !contentData) {
      return (
        <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-200 text-red-800">
          <ShieldAlert className="mx-auto text-red-600 mb-2" size={32} />
          <p className="font-bold">Access Denied / Failed to Load Preview</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      );
    }

    switch (contentData.type) {
      case 'VIDEO':
        return <VideoPlayer src={tokenUrl} />;
      case 'IMAGE':
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img 
              src={tokenUrl} 
              alt={contentData.title} 
              className="max-w-full max-h-[60vh] object-contain shadow-premium rounded-lg" 
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        );
      case 'PDF':
        return (
          <iframe 
            src={`${tokenUrl}#toolbar=0`} 
            className="w-full h-[60vh] border-none rounded-lg bg-white"
            title={contentData.title}
          />
        );
      case 'DOCUMENT': {
        const isText = contentData.mimeType === 'text/plain' || contentData.mimeType === 'text/csv';
        if (isText) {
          return (
            <iframe 
              src={tokenUrl} 
              className="w-full h-[60vh] border-none rounded-lg bg-white"
              title={contentData.title}
            />
          );
        }
        
        return (
          <div className="w-full min-h-[40vh] flex flex-col items-center justify-center p-8 bg-zinc-900 text-center text-white">
            <div className="p-6 bg-white/10 rounded-3xl border border-white/15 mb-4 shadow-premium backdrop-blur-md animate-bounce duration-[3000ms]">
              <FileText size={48} className="text-orange-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 truncate max-w-md">{contentData.title}</h4>
            <p className="text-xs text-white/60 mb-6 font-medium max-w-sm">
              This document type ({contentData.mimeType}) cannot be previewed natively in the browser. 
              Please download it to view it on your local application.
            </p>
            <a 
              href={tokenUrl} 
              download={contentData.title}
              className="px-6 py-3 bg-primary text-white font-black text-xs rounded-xl hover:bg-primary-hover hover:-translate-y-0.5 transition-all shadow-premium tracking-wider uppercase active:translate-y-0"
            >
              Securely Download File
            </a>
          </div>
        );
      }
      default:
        return <div className="text-red-600 p-12">Unsupported content type: {contentData.type}</div>;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {user && <WatermarkOverlay identifier={user.email} />}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-premium overflow-hidden animate-in zoom-in duration-300 border border-border">
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-primary/5 text-primary rounded-xl border border-primary/10">
              {contentData?.type === 'VIDEO' ? <PlayCircle size={20} className="text-blue-500" /> : <FileText size={20} className="text-orange-500" />}
            </span>
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight leading-none">
                {contentData ? `${contentData.title} (Preview)` : 'File Preview'}
              </h3>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">
                Admin Secure Preview Mode
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-white rounded-xl transition-all border border-transparent hover:border-border"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="bg-black rounded-3xl overflow-hidden flex items-center justify-center min-h-[40vh] relative border border-border">
            {renderContent()}
          </div>
          
          {contentData && !isLoading && !error && (
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex gap-3 items-start animate-in slide-in-from-bottom duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold">Protected Preview Mode Enabled</p>
                <p className="mt-0.5 font-medium opacity-80">
                  This {contentData.type.toLowerCase() === 'document' ? 'file' : contentData.type.toLowerCase()} preview is served securely. Direct downloading is restricted where possible, and a dynamic admin watermark is active.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
