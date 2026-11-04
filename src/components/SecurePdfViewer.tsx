import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  ShieldAlert, 
  Lock, 
  FileText, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { Material, UserProfile } from '../types';
import { recordStudentAccess } from '../services/materialService';

interface SecurePdfViewerProps {
  material: Material;
  currentUser: UserProfile;
  permissionId?: string;
  onClose: () => void;
}

export const SecurePdfViewer: React.FC<SecurePdfViewerProps> = ({
  material,
  currentUser,
  permissionId,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pdf' | 'notes'>(material.fileDataUrl ? 'pdf' : 'notes');
  const containerRef = useRef<HTMLDivElement>(null);

  const pages = material.pdfPages && material.pdfPages.length > 0 
    ? material.pdfPages 
    : [
        `samosa.com ENCRYPTED DOCUMENT: ${material.title}\nGRADE: ${material.grade} | SUBJECT: ${material.subject}\nCHAPTER: ${material.chapter}\n\n${material.description || 'Confidential curriculum notes.'}\n\n[Confidential Educational Content - Strictly Protected by samosa.com Access Gateway]`
      ];

  const totalPages = pages.length;
  const watermarkText = `samosa.com | Username: ${currentUser.username} | CONFIDENTIAL`;

  // Log access timestamp
  useEffect(() => {
    if (permissionId) {
      recordStudentAccess(permissionId);
    }
  }, [permissionId]);

  // Deterrent: Intercept shortcuts (Print Ctrl+P, Save Ctrl+S, Copy Ctrl+C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityWarning('Printing is strictly prohibited on samosa.com.');
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        triggerSecurityWarning('Direct file saving is restricted.');
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        triggerSecurityWarning('Text copying is disabled for confidential materials.');
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isFullscreen, onClose]);

  const triggerSecurityWarning = (msg: string) => {
    setSecurityWarning(msg);
    setTimeout(() => {
      setSecurityWarning(null);
    }, 3500);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, 60), 200));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      onContextMenu={(e) => {
        e.preventDefault();
        triggerSecurityWarning('Right-click context menu is disabled for confidential files.');
      }}
      className={`fixed inset-0 z-50 flex flex-col bg-[#07080c] select-none text-slate-100 ${
        isFullscreen ? 'w-screen h-screen' : 'w-full h-full'
      }`}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Top Bar with Security Badges */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0e1017] border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3 truncate mr-4">
          <div className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-400">
            <Lock className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-white truncate max-w-md">
                {material.title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {material.grade === 'GRADE_10' ? 'Grade 10' : 'Grade 12'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {material.subject}
              </span>
              {material.fileDataUrl && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  PDF
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">
              {material.chapter} • Authorized Student Session: {currentUser.username}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Toggle between PDF Document & Curriculum Notes if both exist */}
          {material.fileDataUrl && (
            <div className="flex items-center bg-[#151922] border border-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded-md transition font-mono text-[11px] ${
                  viewMode === 'pdf' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                PDF View
              </button>
              <button
                onClick={() => setViewMode('notes')}
                className={`px-2.5 py-1 rounded-md transition font-mono text-[11px] ${
                  viewMode === 'notes' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Notes View
              </button>
            </div>
          )}

          {/* Zoom controls (active in notes mode) */}
          {viewMode === 'notes' && (
            <div className="hidden sm:flex items-center space-x-1 bg-[#151922] border border-white/10 rounded-lg p-1 text-slate-300 text-xs">
              <button 
                onClick={() => handleZoom(-15)}
                className="p-1 hover:text-white hover:bg-white/5 rounded transition"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] min-w-[42px] text-center">
                {zoomLevel}%
              </span>
              <button 
                onClick={() => handleZoom(15)}
                className="p-1 hover:text-white hover:bg-white/5 rounded transition"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:text-white hover:bg-white/5 rounded transition"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Page navigation (for notes mode) */}
          {viewMode === 'notes' && (
            <div className="flex items-center space-x-1 bg-[#151922] border border-white/10 rounded-lg p-1 text-slate-300 text-xs">
              <button 
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                className="p-1 hover:text-white hover:bg-white/5 disabled:opacity-30 rounded transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px]">
                {currentPage} / {totalPages}
              </span>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                className="p-1 hover:text-white hover:bg-white/5 disabled:opacity-30 rounded transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close viewer */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/10 transition"
            title="Close Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Banner Alert */}
      {securityWarning && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-200 px-4 py-2 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{securityWarning}</span>
          </div>
          <span className="text-[10px] font-mono text-amber-300/80">SECURITY GUARD ACTIVE</span>
        </div>
      )}

      {/* Main Document Viewport with Visible Continuous Watermark */}
      <div className="relative flex-1 overflow-auto bg-[#0a0c12] p-4 sm:p-8 flex justify-center items-start">
        
        {/* Continuous Dynamic Diagonal Watermark Layer (repeating diagonally across the viewing area) */}
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden flex flex-col justify-around opacity-[0.11] select-none">
          {Array.from({ length: 14 }).map((_, rIdx) => (
            <div 
              key={rIdx} 
              className="whitespace-nowrap font-mono text-xs tracking-widest text-white -rotate-12 transform py-3 flex space-x-12 select-none"
            >
              {Array.from({ length: 8 }).map((_, cIdx) => (
                <span key={cIdx}>
                  {watermarkText} • {new Date().toLocaleDateString()}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* View Mode 1: Direct PDF File Render */}
        {viewMode === 'pdf' && material.fileDataUrl ? (
          <div className="relative w-full max-w-5xl h-[calc(100vh-140px)] rounded-2xl border border-white/15 overflow-hidden shadow-2xl bg-[#121520]">
            <iframe 
              src={`${material.fileDataUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-full border-0"
              title={material.title}
            />
          </div>
        ) : (
          /* View Mode 2: Structured Document Page Sheet */
          <div 
            className="relative bg-[#12151f] border border-white/15 rounded-xl shadow-2xl p-6 sm:p-12 transition-all duration-150 text-slate-100 max-w-4xl w-full"
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              minHeight: '750px'
            }}
          >
            {/* Header watermark stamp right on the paper */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-wider text-purple-400 font-mono">samosa.com</span>
                <span className="text-slate-600">|</span>
                <span className="font-mono text-slate-400">RESTRICTED STUDY MODULE</span>
              </div>
              <div className="text-right font-mono text-[11px] text-slate-500">
                AUTHORIZED TO: <span className="text-purple-300 font-semibold">{currentUser.username}</span>
              </div>
            </div>

            {/* Page Content */}
            <div className="relative z-10 font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
              {pages[currentPage - 1]}
            </div>

            {/* Document Footer stamp */}
            <div className="mt-16 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>Strictly confidential. Reproduction or unauthorized redistribution is monitored.</span>
              </div>
              <span>Page {currentPage} of {totalPages}</span>
            </div>

            {/* Diagonal overlay stamp directly on paper */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-5 select-none">
              <span className="text-5xl font-black uppercase tracking-widest text-white -rotate-45 font-mono">
                {currentUser.username}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Status Bar */}
      <div className="px-4 py-2 bg-[#0b0d13] border-t border-white/10 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Verified Student Access • {currentUser.username}</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-500">
          <span>Short-lived Encrypted Session</span>
          <span>Print / Download Inactive</span>
        </div>
      </div>
    </div>
  );
};
