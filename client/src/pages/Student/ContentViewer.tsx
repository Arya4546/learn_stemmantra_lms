import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { VideoPlayer } from '../../components/security/VideoPlayer';
import { useAuth } from '../../context/AuthContext';
import { WatermarkOverlay } from '../../components/security/WatermarkOverlay';
import { QuizViewer } from '../../components/student/QuizViewer';
import { AssessmentViewer } from '../../components/student/AssessmentViewer';
import { FileText } from 'lucide-react';

export function ContentViewer() {
  const { contentId } = useParams<{ contentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [contentData, setContentData] = useState<{ type: string; title: string; mimeType: string } | null>(null);
  const [tokenUrl, setTokenUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true);
        // Request one-time access token
        const response = await api.post(`/content/${contentId}/access-token`);
        const { token, type, title, mimeType } = response.data.data;
        
        setContentData({ type, title, mimeType });
        
        // Construct the serving URL
        const serveUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/content/serve/${token}`;
        setTokenUrl(serveUrl);
        
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load content. You may not have access.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (contentId) fetchToken();
  }, [contentId]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="w-full bg-gray-200 rounded-lg h-[50vh]"></div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg h-16"></div>
        </div>
      </div>
    );
  }

  if (error || !contentData) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-xl border border-border text-center shadow-sm">
        <h3 className="text-xl font-bold text-red-600 mb-4">Access Denied</h3>
        <p className="text-text-secondary mb-6 font-medium">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-primary text-white rounded-md font-bold hover:bg-primary-hover transition-colors shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Handle Quiz check points directly without file serv token requirement
  if (contentData.type === 'QUIZ') {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-text-primary tracking-tight">{contentData.title}</h1>
          <button 
            onClick={() => navigate(-1)}
            className="text-sm font-bold text-text-secondary hover:text-primary transition-colors"
          >
            Close Checkpoint
          </button>
        </div>
        <QuizViewer contentItemId={contentId!} />
      </div>
    );
  }

  // Handle Assessment Exams directly
  if (contentData.type === 'ASSESSMENT') {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-text-primary tracking-tight">{contentData.title}</h1>
          <button 
            onClick={() => navigate(-1)}
            className="text-sm font-bold text-text-secondary hover:text-primary transition-colors"
          >
            Close Exam
          </button>
        </div>
        <AssessmentViewer contentItemId={contentId!} />
      </div>
    );
  }

  if (!tokenUrl) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-xl border border-border text-center shadow-sm">
        <h3 className="text-xl font-bold text-red-600 mb-4">Access Denied</h3>
        <p className="text-text-secondary mb-6 font-medium">Serve token missing</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-primary text-white rounded-md font-bold hover:bg-primary-hover transition-colors shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (contentData.type) {
      case 'VIDEO':
        return <VideoPlayer src={tokenUrl} />;
      case 'IMAGE':
        return (
          <div className="w-full h-full flex items-center justify-center p-4">
            <img src={tokenUrl} alt={contentData.title} className="max-w-full max-h-[70vh] object-contain shadow-premium rounded-lg" />
          </div>
        );
      case 'PDF':
        return (
          <iframe 
            src={`${tokenUrl}#toolbar=0`} 
            className="w-full h-[70vh] border-none"
            title={contentData.title}
          />
        );
      case 'DOCUMENT': {
        const isText = contentData.mimeType === 'text/plain' || contentData.mimeType === 'text/csv';
        if (isText) {
          return (
            <iframe 
              src={tokenUrl} 
              className="w-full h-[70vh] border-none bg-white rounded-lg"
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
        return <div className="text-white p-12">Unsupported content type: {contentData.type}</div>;
    }
  };

  return (
    <div className="relative max-w-5xl mx-auto flex flex-col gap-6">
      {user && <WatermarkOverlay identifier={user.email} />}
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">{contentData.title}</h1>
        <button 
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
        >
          Close Viewer
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <div className="w-full bg-black rounded-lg overflow-hidden flex items-center justify-center min-h-[50vh]">
            {renderContent()}
        </div>
        
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800 flex gap-3 items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="font-medium">
            This {contentData.type.toLowerCase() === 'document' ? 'file' : contentData.type.toLowerCase()} is protected by a single-use access token and is bound to your account ({user?.email}). 
            Screen recording, unauthorized downloading of media, or unauthorized sharing is strictly prohibited and tracked.
          </p>
        </div>
      </div>
    </div>
  );
}
