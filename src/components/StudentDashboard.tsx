import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Lock, 
  LogOut, 
  GraduationCap, 
  Sparkles,
  Info,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { UserProfile, Material, MaterialPermission, Grade } from '../types';
import { fetchApprovedMaterialsForStudent, fetchPermissionsForStudent } from '../services/materialService';
import { SecurePdfViewer } from './SecurePdfViewer';

interface StudentDashboardProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onLogout
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [permissions, setPermissions] = useState<MaterialPermission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | Grade>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [activeViewerMaterial, setActiveViewerMaterial] = useState<Material | null>(null);

  useEffect(() => {
    loadData();
  }, [currentUser.uid]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [approvedMats, studentPerms] = await Promise.all([
        fetchApprovedMaterialsForStudent(currentUser.uid),
        fetchPermissionsForStudent(currentUser.uid)
      ]);
      setMaterials(approvedMats);
      setPermissions(studentPerms);
    } catch (err) {
      console.error('Failed to load student data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive subjects available in approved materials
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    materials.forEach(m => subs.add(m.subject));
    return Array.from(subs);
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGrade = selectedGrade === 'ALL' || m.grade === selectedGrade;
      const matchesSubject = selectedSubject === 'ALL' || m.subject === selectedSubject;

      return matchesSearch && matchesGrade && matchesSubject;
    });
  }, [materials, searchQuery, selectedGrade, selectedSubject]);

  // Grade counts
  const grade10Count = materials.filter(m => m.grade === 'GRADE_10').length;
  const grade12Count = materials.filter(m => m.grade === 'GRADE_12').length;

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-[#0d0f17]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-900/30 font-mono text-base">
            s
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wide text-white">samosa.com</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                STUDENT PORTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Grade 10 & 12 Study Management
            </p>
          </div>
        </div>

        {/* User Badge & Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#141824] border border-white/10 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Authenticated:</span>
            <span className="font-mono font-semibold text-purple-300">{currentUser.username}</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#121622] to-indigo-950/30 border border-purple-500/20 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>CONFIDENTIAL ACADEMIC REPOSITORY</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 font-mono">{currentUser.username}</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                Access your personalized curriculum modules. All view sessions are dynamically watermarked and authorized strictly for your study account.
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-xl bg-[#141824]/90 border border-white/10 text-center min-w-[110px]">
                <div className="text-xl font-bold text-purple-400 font-mono">{grade10Count}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Grade 10 Active</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-[#141824]/90 border border-white/10 text-center min-w-[110px]">
                <div className="text-xl font-bold text-blue-400 font-mono">{grade12Count}</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Grade 12 Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Category Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedGrade(selectedGrade === 'GRADE_10' ? 'ALL' : 'GRADE_10')}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
              selectedGrade === 'GRADE_10'
                ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-950/50'
                : 'bg-[#10131d] border-white/10 hover:border-purple-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Grade 10 Library</h3>
                  <p className="text-xs text-slate-400">Secondary School Curriculum & Board Prep</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {grade10Count} Approved
              </span>
            </div>
          </button>

          <button
            onClick={() => setSelectedGrade(selectedGrade === 'GRADE_12' ? 'ALL' : 'GRADE_12')}
            className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
              selectedGrade === 'GRADE_12'
                ? 'bg-blue-950/30 border-blue-500/50 shadow-lg shadow-blue-950/50'
                : 'bg-[#10131d] border-white/10 hover:border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Grade 12 Library</h3>
                  <p className="text-xs text-slate-400">Higher Secondary Specialized Modules</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {grade12Count} Approved
              </span>
            </div>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search approved titles, subjects, chapters..."
              className="w-full bg-[#11141e] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 px-2">
              <Filter className="w-3.5 h-3.5" />
              <span>Subject:</span>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-[#11141e] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            {selectedGrade !== 'ALL' && (
              <button
                onClick={() => setSelectedGrade('ALL')}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
              >
                Clear Grade Filter
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Verifying secure permissions...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          /* Empty State Requirement: "No study materials have been approved for your account yet." */
          <div className="py-20 px-4 text-center rounded-2xl bg-[#0f121a] border border-dashed border-white/15 max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">
                No study materials have been approved for your account yet.
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Each PDF requires individual authorization from the administrator. Please contact your instructor or wait for your cohort schedule.
              </p>
            </div>
            <div className="pt-2">
              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                USER ID: {currentUser.username}
              </span>
            </div>
          </div>
        ) : (
          /* Material Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMaterials.map((mat) => {
              const perm = permissions.find(p => p.materialId === mat.materialId);

              return (
                <div
                  key={mat.materialId}
                  className="flex flex-col justify-between bg-[#11141e] hover:bg-[#141826] border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 transition-all duration-200 group relative shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        mat.grade === 'GRADE_10'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      }`}>
                        {mat.grade === 'GRADE_10' ? 'GRADE 10' : 'GRADE 12'}
                      </span>

                      <span className="flex items-center space-x-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approved</span>
                      </span>
                    </div>

                    {/* Title & Subject */}
                    <div>
                      <h4 className="font-semibold text-base text-white group-hover:text-purple-300 transition line-clamp-2">
                        {mat.title}
                      </h4>
                      <p className="text-xs font-medium text-slate-400 mt-1">
                        {mat.subject} • {mat.chapter}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {mat.description}
                    </p>
                  </div>

                  {/* Card Footer / Action */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="text-[11px] font-mono text-slate-500 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{mat.fileSize || 'Standard Note'}</span>
                    </div>

                    <button
                      onClick={() => setActiveViewerMaterial(mat)}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-900/30 transition group-hover:translate-x-0.5"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Open Secure Reader</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Embedded Secure PDF Viewer Modal */}
      {activeViewerMaterial && (
        <SecurePdfViewer
          material={activeViewerMaterial}
          currentUser={currentUser}
          permissionId={`${currentUser.uid}_${activeViewerMaterial.materialId}`}
          onClose={() => setActiveViewerMaterial(null)}
        />
      )}
    </div>
  );
};
