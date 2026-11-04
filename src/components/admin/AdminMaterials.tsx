import React, { useState, useRef } from 'react';
import { 
  FilePlus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  FileText, 
  GraduationCap, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileCheck,
  Archive,
  BookOpen,
  Paperclip
} from 'lucide-react';
import { Material, Grade, MaterialStatus, UserProfile, DEFAULT_SUBJECTS } from '../../types';
import { createMaterial, updateMaterial, deleteMaterial } from '../../services/materialService';
import { SecurePdfViewer } from '../SecurePdfViewer';

interface AdminMaterialsProps {
  materials: Material[];
  adminProfile: UserProfile;
  onRefresh: () => void;
}

export const AdminMaterials: React.FC<AdminMaterialsProps> = ({
  materials,
  adminProfile,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | Grade>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | MaterialStatus>('ALL');

  // Upload / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [grade, setGrade] = useState<Grade>('GRADE_10');
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('');
  const [status, setStatus] = useState<MaterialStatus>('published');
  const [contentNotes, setContentNotes] = useState('');
  const [fileSize, setFileSize] = useState('3.5 MB');
  const [fileDataUrl, setFileDataUrl] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Viewer Modal
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'ALL' || m.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingMaterial(null);
    setTitle('');
    setDescription('');
    setGrade('GRADE_10');
    setSubject(DEFAULT_SUBJECTS.GRADE_10[0]);
    setChapter('');
    setStatus('published');
    setContentNotes(`samosa.com CURRICULUM SYLLABUS\n\n1. Overview & Key Concepts:\n- Standard formulations and foundational theorems.\n- Methodologies for examination problems.\n\n2. Formulas:\n- Essential working identities.\n\n3. Worked Examples & Solutions:\n- Step-by-step verified derivations.`);
    setFileSize('3.5 MB');
    setFileDataUrl(undefined);
    setFileName('');
    setErrorMessage(null);
    setShowModal(true);
  };

  const openEditModal = (mat: Material) => {
    setEditingMaterial(mat);
    setTitle(mat.title);
    setDescription(mat.description);
    setGrade(mat.grade);
    setSubject(mat.subject);
    setChapter(mat.chapter);
    setStatus(mat.status);
    setContentNotes(mat.pdfPages?.join('\n\n---\n\n') || '');
    setFileSize(mat.fileSize || '3.5 MB');
    setFileDataUrl(mat.fileDataUrl);
    setFileName(mat.fileName || '');
    setErrorMessage(null);
    setShowModal(true);
  };

  const processPdfFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('Please select a valid PDF document (.pdf).');
      return;
    }

    setFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setFileSize(sizeInMB);

    // Auto-populate title if empty
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Read file as Base64 Data URL for secure client-side storage & rendering
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
      setErrorMessage(null);
    };
    reader.onerror = () => {
      setErrorMessage('Error reading PDF file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPdfFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Material title is required');
      return;
    }
    if (!chapter.trim()) {
      setErrorMessage('Chapter/unit name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const pages = contentNotes.split('\n\n---\n\n').filter(p => p.trim().length > 0);
    const finalPages = pages.length > 0 ? pages : [contentNotes];

    try {
      if (editingMaterial) {
        await updateMaterial(
          editingMaterial.materialId,
          {
            title: title.trim(),
            description: description.trim(),
            grade,
            subject,
            chapter: chapter.trim(),
            status,
            fileSize,
            fileName: fileName || editingMaterial.fileName,
            fileDataUrl: fileDataUrl || editingMaterial.fileDataUrl,
            pageCount: finalPages.length,
            pdfPages: finalPages
          },
          adminProfile
        );
      } else {
        await createMaterial(
          {
            title: title.trim(),
            description: description.trim(),
            grade,
            subject,
            chapter: chapter.trim(),
            status,
            fileSize,
            fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
            fileDataUrl: fileDataUrl,
            pageCount: finalPages.length,
            uploadedBy: adminProfile.username,
            pdfPages: finalPages
          },
          adminProfile
        );
      }

      setShowModal(false);
      onRefresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (mat: Material) => {
    if (!confirm(`Are you sure you want to delete "${mat.title}"? Any student permissions tied to this document will also be purged.`)) {
      return;
    }

    try {
      await deleteMaterial(mat.materialId, mat.title, adminProfile);
      onRefresh();
    } catch (err) {
      alert('Delete failed: ' + err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Material Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {materials.length} Documents
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Upload direct PDF files, classify by grade/subject, and configure individual access permissions.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload PDF Document</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#11141e] border border-white/10 p-3 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, subjects, chapters..."
            className="w-full bg-[#161a26] border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Grade:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as any)}
            className="w-full bg-[#161a26] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Grades</option>
            <option value="GRADE_10">Grade 10</option>
            <option value="GRADE_12">Grade 12</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full bg-[#161a26] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No materials found. Click "Upload PDF Document" to add one.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div 
              key={mat.materialId}
              className="bg-[#11141e] border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      mat.grade === 'GRADE_10'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                    }`}>
                      {mat.grade === 'GRADE_10' ? 'GRADE 10' : 'GRADE 12'}
                    </span>

                    {mat.fileDataUrl && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                        DIRECT PDF
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    mat.status === 'published'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : mat.status === 'draft'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {mat.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-white line-clamp-2">{mat.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    {mat.subject} • {mat.chapter}
                  </p>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {mat.description || 'Confidential curriculum notes module.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">
                  {mat.fileSize || 'Standard PDF'}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Preview Secure Viewer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(mat)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                    title="Edit Material Information"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(mat)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                    title="Delete Material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload / Edit Material Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#121520] border border-white/15 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">
                  {editingMaterial ? 'Edit Study Material' : 'Upload Direct PDF File'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Direct PDF File Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span>Select or Drag PDF File</span>
                  {fileDataUrl && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready ({fileSize})</span>
                    </span>
                  )}
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="application/pdf,.pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
                    isDragging
                      ? 'border-purple-500 bg-purple-950/20'
                      : fileDataUrl
                      ? 'border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-500/60'
                      : 'border-white/15 bg-[#161a27] hover:border-purple-500/40'
                  }`}
                >
                  <div className={`p-3 rounded-full ${fileDataUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    {fileDataUrl ? <FileCheck className="w-6 h-6" /> : <Paperclip className="w-6 h-6" />}
                  </div>

                  <div>
                    {fileName ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white font-mono text-xs">{fileName}</p>
                        <p className="text-[11px] text-slate-400">{fileSize} • Click to replace file</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-white">Click to browse or drop PDF file here</p>
                        <p className="text-[11px] text-slate-500">Supports standard Adobe PDF format (.pdf)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Material Title */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Material Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grade 10 Mathematics PDF 1 - Quadratic Equations"
                  className="w-full bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Target Grade and Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Target Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => {
                      const g = e.target.value as Grade;
                      setGrade(g);
                      setSubject(DEFAULT_SUBJECTS[g][0]);
                    }}
                    className="w-full bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="GRADE_10">Grade 10</option>
                    <option value="GRADE_12">Grade 12</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {DEFAULT_SUBJECTS[grade].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chapter and Publication Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Chapter / Unit</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="e.g. Chapter 1: Real Numbers"
                    className="w-full bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Publication Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="published">Published (Visible to approved students)</option>
                    <option value="draft">Draft (Admin only)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key concepts, syllabus coverage and learning objectives..."
                  rows={2}
                  className="w-full bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Notes content fallback if no direct PDF */}
              {!fileDataUrl && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-medium">Curriculum Notes Content (Optional)</label>
                    <span className="text-[10px] text-slate-500 font-mono">Use "---" to separate pages</span>
                  </div>
                  <textarea
                    value={contentNotes}
                    onChange={(e) => setContentNotes(e.target.value)}
                    rows={4}
                    className="w-full bg-[#181c2b] border border-white/10 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingMaterial ? 'Update Material' : 'Save & Publish PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Secure Viewer */}
      {previewMaterial && (
        <SecurePdfViewer
          material={previewMaterial}
          currentUser={adminProfile}
          onClose={() => setPreviewMaterial(null)}
        />
      )}
    </div>
  );
};
