import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, PlayCircle, FileText, ShieldAlert, ZoomIn, ZoomOut, RotateCw, RefreshCw, Maximize2, Minimize2, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

function countPdfPages(buffer: ArrayBuffer): number {
  const bytes = new Uint8Array(buffer);
  let str = '';
  const startOffset = Math.max(0, bytes.length - 20480);
  for (let i = startOffset; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }

  const countMatches = [...str.matchAll(/\/Count\s+(\d+)/g)];
  if (countMatches.length > 0) {
    const counts = countMatches.map(m => parseInt(m[1], 10));
    return Math.max(...counts);
  }

  let fullStr = '';
  for (let i = 0; i < bytes.length; i++) {
    fullStr += String.fromCharCode(bytes[i]);
  }
  const pageMatches = fullStr.match(/\/Type\s*\/Page\b(?!s)/g);
  if (pageMatches) {
    return pageMatches.length;
  }

  return 0;
}
import { api } from '../../services/api';
import { VideoPlayer } from './VideoPlayer';
import { WatermarkOverlay } from './WatermarkOverlay';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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

  // Enhanced features state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // PDF page navigation states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [pageInput, setPageInput] = useState('1');
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const pdfBlobRef = useRef<string | null>(null);

  // Load PDF Blob: request a SECOND access token, fetch the blob, count pages, create Object URL
  useEffect(() => {
    if (!isOpen || !contentData || contentData.type !== 'PDF' || !contentId) {
      setLocalPdfUrl(null);
      setTotalPages(null);
      setCurrentPage(1);
      return;
    }

    let active = true;
    const fetchPdfBlob = async () => {
      try {
        const tokenRes = await api.post(`/content/${contentId}/access-token`);
        const { token } = tokenRes.data.data;
        const blobUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/content/serve/${token}`;

        const response = await fetch(blobUrl, {
          headers: { 'Accept': 'application/pdf' }
        });
        if (!response.ok) throw new Error('Failed to fetch PDF');
        const blob = await response.blob();

        if (!active) return;

        const buffer = await blob.arrayBuffer();
        const pages = countPdfPages(buffer);
        if (pages > 0) {
          setTotalPages(pages);
        }

        const objectUrl = URL.createObjectURL(blob);
        if (pdfBlobRef.current) URL.revokeObjectURL(pdfBlobRef.current);
        pdfBlobRef.current = objectUrl;
        setLocalPdfUrl(objectUrl);
      } catch (err) {
        console.error('PDF blob fetch error:', err);
        if (active && tokenUrl) {
          setLocalPdfUrl(tokenUrl);
        }
      }
    };

    fetchPdfBlob();

    return () => {
      active = false;
    };
  }, [isOpen, contentData, contentId]);

  // Clean up Object URL on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobRef.current) {
        URL.revokeObjectURL(pdfBlobRef.current);
        pdfBlobRef.current = null;
      }
    };
  }, []);

  // Keep input field synced to page changes
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => {
      if (totalPages && prev >= totalPages) return prev;
      return prev + 1;
    });
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1) {
      if (totalPages && pageNum > totalPages) {
        setCurrentPage(totalPages);
        setPageInput(totalPages.toString());
      } else {
        setCurrentPage(pageNum);
      }
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // Esc key closure
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Secure shortcuts block (Ctrl+P, Ctrl+S, Ctrl+C)
  useEffect(() => {
    if (!isOpen) return;

    const preventShortcuts = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl) {
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          toast.error('Printing is disabled in Secure Preview Mode.', { id: 'sec-print' });
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          toast.error('Saving local copies is disabled in Secure Preview Mode.', { id: 'sec-save' });
        }
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          toast.error('Copying is restricted in Secure Preview Mode.', { id: 'sec-copy' });
        }
      }
    };

    window.addEventListener('keydown', preventShortcuts);
    return () => window.removeEventListener('keydown', preventShortcuts);
  }, [isOpen]);

  // Fetch token and metadata
  useEffect(() => {
    if (!isOpen || !contentId) {
      setContentData(null);
      setTokenUrl(null);
      setError('');
      setZoom(1);
      setRotation(0);
      return;
    }

    const fetchToken = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await api.post(`/content/${contentId}/access-token`);
        const { token, type, title, mimeType } = response.data.data;
        
        setContentData({ type, title, mimeType });
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

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen().catch(() => {
        toast.error('Fullscreen not supported by browser.');
      });
    }
  };

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
          <div className="w-full h-full flex items-center justify-center p-4 overflow-hidden">
            <img 
              src={tokenUrl} 
              alt={contentData.title} 
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out',
                maxHeight: isFullscreen ? '80vh' : '55vh'
              }}
              className="max-w-full object-contain shadow-premium rounded-lg select-none pointer-events-none" 
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            />
          </div>
        );
      case 'PDF':
        if (!localPdfUrl) {
          return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-text-secondary font-bold mt-4 animate-pulse">Loading secure document...</p>
            </div>
          );
        }
        return (
          <iframe 
            key={`${currentPage}`}
            src={`${localPdfUrl}#toolbar=0&page=${currentPage}`} 
            className={`w-full border-none rounded-lg bg-white transition-all duration-300 ${
              isFullscreen ? 'h-[80vh]' : 'h-[60vh]'
            }`}
            title={contentData.title}
          />
        );
      case 'DOCUMENT': {
        const isPreviewableDoc = 
          contentData.mimeType === 'text/plain' || 
          contentData.mimeType === 'text/csv' || 
          contentData.mimeType === 'text/html' || 
          contentData.mimeType === 'application/xhtml+xml';
        if (isPreviewableDoc) {
          return (
            <iframe 
              src={tokenUrl} 
              className={`w-full border-none rounded-lg bg-white transition-all duration-300 ${
                isFullscreen ? 'h-[80vh]' : 'h-[60vh]'
              }`}
              title={contentData.title}
            />
          );
        }
        
        return (
          <div className="w-full min-h-[40vh] flex flex-col items-center justify-center p-8 bg-zinc-950 text-center text-white">
            <div className="p-6 bg-white/10 rounded-3xl border border-white/15 mb-4 shadow-premium backdrop-blur-md animate-bounce duration-[3000ms]">
              <FileText size={48} className="text-orange-400" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 truncate max-w-md">{contentData.title}</h4>
            <p className="text-xs text-white/60 mb-6 font-medium max-w-sm">
              This document type ({contentData.mimeType}) cannot be previewed natively. 
              Please download it to view it on your local machine.
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300 select-none">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-premium overflow-hidden animate-in zoom-in duration-300 border border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-primary/5 text-primary rounded-xl border border-primary/10">
              {contentData?.type === 'VIDEO' ? <PlayCircle size={20} className="text-blue-500" /> : <FileText size={20} className="text-orange-500" />}
            </span>
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight leading-none truncate max-w-[400px]">
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
          
          {/* File display container */}
          <div 
            ref={containerRef}
            className={`bg-zinc-950 rounded-3xl overflow-hidden flex flex-col items-center justify-center relative border border-border/10 select-none ${
              isFullscreen ? 'w-full h-full p-4' : 'min-h-[45vh]'
            }`}
          >
            {/* Watermark overlay embedded directly inside the fullscreen component */}
            {user && <WatermarkOverlay identifier={user.email} />}

            {/* Custom Toolbar */}
            {contentData && !isLoading && !error && contentData.type !== 'VIDEO' && (
              <div className={`w-full flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 text-white z-50 transition-all ${
                isFullscreen ? 'mb-4 mt-2' : 'absolute top-4 left-4 right-4 max-w-[calc(100%-2rem)]'
              }`}>
                
                {/* Security Lock indicator */}
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-1.5 rounded-xl border border-emerald-500/30">
                    <Lock size={10} className="text-emerald-400" />
                    Secure Preview
                  </span>
                </div>

                {/* Toolbar Controls */}
                <div className="flex items-center gap-2">
                  {contentData.type === 'PDF' && (
                    <div className="flex items-center gap-3 mr-2 border-r border-white/10 pr-3">
                      <span className="text-[10px] sm:text-xs font-bold text-white/95 select-none font-outfit">
                        Page: <span className="font-extrabold text-primary">{currentPage}</span> of {totalPages || '?'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max={totalPages || undefined}
                          value={pageInput}
                          onChange={(e) => setPageInput(e.target.value)}
                          placeholder="Page"
                          className="w-10 bg-white/15 text-white text-xs font-bold py-0.5 px-1 text-center rounded-xl border border-white/10 outline-none focus:ring-1 focus:ring-primary/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleGoToPage();
                          }}
                        />
                        
                        <button
                          onClick={handleGoToPage}
                          className="px-2 py-0.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                        >
                          Go
                        </button>
                      </div>

                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-0.5">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage <= 1}
                          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Previous Page"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={handleNextPage}
                          disabled={totalPages ? currentPage >= totalPages : false}
                          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Next Page"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {contentData.type === 'IMAGE' && (
                    <>
                      <button 
                        onClick={handleZoomOut} 
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                        title="Zoom Out"
                      >
                        <ZoomOut size={16} />
                      </button>
                      <span className="text-[10px] font-mono text-white/60 select-none px-1">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button 
                        onClick={handleZoomIn} 
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                        title="Zoom In"
                      >
                        <ZoomIn size={16} />
                      </button>
                      <div className="h-4 w-px bg-white/10 mx-1" />
                      <button 
                        onClick={handleRotate} 
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                        title="Rotate"
                      >
                        <RotateCw size={16} />
                      </button>
                      <button 
                        onClick={handleReset} 
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                        title="Reset Zoom & Rotation"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <div className="h-4 w-px bg-white/10 mx-1" />
                    </>
                  )}

                  <button 
                    onClick={toggleFullscreen} 
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Content output */}
            <div className={`w-full h-full flex items-center justify-center ${
              !isFullscreen && contentData?.type !== 'VIDEO' ? 'pt-16 pb-4 px-4' : 'flex-1'
            }`}>
              {renderContent()}
            </div>
          </div>
          
          {contentData && !isLoading && !error && (
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex gap-3 items-start animate-in slide-in-from-bottom duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold">Protected Preview Mode Enabled</p>
                <p className="mt-0.5 font-medium opacity-80">
                  This preview is served securely. Direct downloading is disabled, and an active watermark is overlaid. Keyboard copy, save, and print actions are intercepted to protect intellectual property.
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
