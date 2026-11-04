import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  LogOut, 
  Activity, 
  Settings, 
  GraduationCap,
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Database
} from 'lucide-react';
import { UserProfile, Material, MaterialPermission, AuditLogEntry } from '../types';
import { fetchAllUsers, fetchAuditLogs } from '../services/authService';
import { fetchAllMaterials, fetchAllPermissions, setStudentMaterialPermission } from '../services/materialService';
import { checkAndSeedInitialData } from '../services/seedService';
import { AdminOverview } from './admin/AdminOverview';
import { AdminStudents } from './admin/AdminStudents';
import { AdminMaterials } from './admin/AdminMaterials';
import { AdminPermissions } from './admin/AdminPermissions';
import { AdminAuditLogs } from './admin/AdminAuditLogs';

interface AdminDashboardProps {
  adminProfile: UserProfile;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminProfile,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'materials' | 'permissions' | 'audit'>('overview');
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [permissions, setPermissions] = useState<MaterialPermission[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [uList, mList, pList, aList] = await Promise.all([
        fetchAllUsers(),
        fetchAllMaterials(),
        fetchAllPermissions(),
        fetchAuditLogs()
      ]);
      setStudents(uList);
      setMaterials(mList);
      setPermissions(pList);
      setAuditLogs(aList);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (permissionId: string) => {
    const perm = permissions.find(p => p.permissionId === permissionId);
    if (!perm) return;
    try {
      await setStudentMaterialPermission({
        uid: perm.uid,
        username: perm.username,
        materialId: perm.materialId,
        materialTitle: perm.materialTitle,
        grade: perm.grade,
        subject: perm.subject,
        status: 'approved',
        adminProfile
      });
      loadAllData();
    } catch (err) {
      alert('Error approving permission: ' + err);
    }
  };

  const handleQuickReject = async (permissionId: string) => {
    const perm = permissions.find(p => p.permissionId === permissionId);
    if (!perm) return;
    try {
      await setStudentMaterialPermission({
        uid: perm.uid,
        username: perm.username,
        materialId: perm.materialId,
        materialTitle: perm.materialTitle,
        grade: perm.grade,
        subject: perm.subject,
        status: 'rejected',
        adminProfile
      });
      loadAllData();
    } catch (err) {
      alert('Error rejecting permission: ' + err);
    }
  };

  const handleRunBootstrapSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await checkAndSeedInitialData();
      setBannerNotice(res.message);
      await loadAllData();
      setTimeout(() => setBannerNotice(null), 5000);
    } catch (err) {
      alert('Bootstrap error: ' + err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0d0f17]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-900/30 font-mono text-base">
            s
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wide text-white">samosa.com</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Role-Based Curriculum Access Authority
            </p>
          </div>
        </div>

        {/* Action strip & Admin info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunBootstrapSeed}
            disabled={isSeeding}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 transition"
            title="Populate predefined accounts and standard syllabus"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>{isSeeding ? 'Syncing...' : 'Sync Standard Cohort'}</span>
          </button>

          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#141824] border border-white/10 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">Admin:</span>
            <span className="font-mono font-bold text-white">{adminProfile.username}</span>
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

      {/* Navigation Tabs Bar */}
      <nav className="border-b border-white/10 bg-[#0b0d14] px-4 sm:px-8 flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
            activeTab === 'overview'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
            activeTab === 'students'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Accounts ({students.filter(s => s.role === 'student').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
            activeTab === 'materials'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Study Materials ({materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
            activeTab === 'permissions'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>PDF Permissions Matrix</span>
          {permissions.filter(p => p.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 py-3 px-3.5 border-b-2 font-medium text-xs whitespace-nowrap transition ${
            activeTab === 'audit'
              ? 'border-purple-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security Audit Logs</span>
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {bannerNotice && (
          <div className="p-3 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{bannerNotice}</span>
            </div>
            <button onClick={() => setBannerNotice(null)} className="text-slate-400 hover:text-white text-xs">
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-mono text-slate-400">Loading secure administrator resources...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverview
                students={students}
                materials={materials}
                permissions={permissions}
                auditLogs={auditLogs}
                onNavigate={(tab) => setActiveTab(tab)}
                onQuickApprove={handleQuickApprove}
                onQuickReject={handleQuickReject}
              />
            )}

            {activeTab === 'students' && (
              <AdminStudents
                students={students}
                adminProfile={adminProfile}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'materials' && (
              <AdminMaterials
                materials={materials}
                adminProfile={adminProfile}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'permissions' && (
              <AdminPermissions
                students={students}
                materials={materials}
                permissions={permissions}
                adminProfile={adminProfile}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === 'audit' && (
              <AdminAuditLogs
                logs={auditLogs}
                onRefresh={loadAllData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
