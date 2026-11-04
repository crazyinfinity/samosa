import React from 'react';
import { 
  Users, 
  BookOpen, 
  FileCheck, 
  Clock, 
  XCircle, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { UserProfile, Material, MaterialPermission, AuditLogEntry } from '../../types';

interface AdminOverviewProps {
  students: UserProfile[];
  materials: Material[];
  permissions: MaterialPermission[];
  auditLogs: AuditLogEntry[];
  onNavigate: (tab: 'students' | 'materials' | 'permissions' | 'audit') => void;
  onQuickApprove: (permissionId: string) => void;
  onQuickReject: (permissionId: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  students,
  materials,
  permissions,
  auditLogs,
  onNavigate,
  onQuickApprove,
  onQuickReject
}) => {
  const totalStudents = students.filter(s => s.role === 'student').length;
  const grade10Materials = materials.filter(m => m.grade === 'GRADE_10').length;
  const grade12Materials = materials.filter(m => m.grade === 'GRADE_12').length;
  const totalMaterials = materials.length;

  const approvedCount = permissions.filter(p => p.status === 'approved').length;
  const pendingCount = permissions.filter(p => p.status === 'pending').length;
  const rejectedCount = permissions.filter(p => p.status === 'rejected' || p.status === 'revoked').length;

  const pendingPermissions = permissions.filter(p => p.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Students */}
        <div 
          onClick={() => onNavigate('students')}
          className="cursor-pointer bg-[#11141e] hover:bg-[#151926] border border-white/10 hover:border-purple-500/40 rounded-xl p-4 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalStudents}</div>
          <div className="text-[10px] text-slate-500 mt-1">Predefined Cohort</div>
        </div>

        {/* Grade 10 Materials */}
        <div 
          onClick={() => onNavigate('materials')}
          className="cursor-pointer bg-[#11141e] hover:bg-[#151926] border border-white/10 hover:border-purple-500/40 rounded-xl p-4 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Grade 10</span>
            <BookOpen className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">{grade10Materials}</div>
          <div className="text-[10px] text-slate-500 mt-1">Secondary Modules</div>
        </div>

        {/* Grade 12 Materials */}
        <div 
          onClick={() => onNavigate('materials')}
          className="cursor-pointer bg-[#11141e] hover:bg-[#151926] border border-white/10 hover:border-blue-500/40 rounded-xl p-4 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Grade 12</span>
            <BookOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">{grade12Materials}</div>
          <div className="text-[10px] text-slate-500 mt-1">Higher Secondary</div>
        </div>

        {/* Total Uploaded PDFs */}
        <div 
          onClick={() => onNavigate('materials')}
          className="cursor-pointer bg-[#11141e] hover:bg-[#151926] border border-white/10 hover:border-indigo-500/40 rounded-xl p-4 transition group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total PDFs</span>
            <FileCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalMaterials}</div>
          <div className="text-[10px] text-slate-500 mt-1">Repository Size</div>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={() => onNavigate('permissions')}
          className="cursor-pointer bg-[#11141e] hover:bg-[#151926] border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-4 transition group bg-gradient-to-b from-amber-500/5 to-transparent"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400">Pending</span>
            <Clock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{pendingCount}</div>
          <div className="text-[10px] text-amber-400/80 mt-1">Requires Approval</div>
        </div>

        {/* Approved Permissions */}
        <div 
          onClick={() => onNavigate('permissions')}
          className="cursor-pointer bg-[#11141e] hover:bg-[#151926] border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-4 transition group bg-gradient-to-b from-emerald-500/5 to-transparent"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{approvedCount}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">Active Grants</div>
        </div>

        {/* Rejected/Revoked */}
        <div 
          onClick={() => onNavigate('permissions')}
          className="cursor-pointer bg-[#11141e] hover:bg-[#151926] border border-rose-500/30 hover:border-rose-500/60 rounded-xl p-4 transition group bg-gradient-to-b from-rose-500/5 to-transparent"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-rose-400">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{rejectedCount}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">Restricted/Revoked</div>
        </div>
      </div>

      {/* Two Column Layout: Pending Approvals & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Approval Requests */}
        <div className="bg-[#11141e] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Pending Student Permissions</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {pendingCount} Awaiting Review
            </span>
          </div>

          {pendingPermissions.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
              All permission queues are clear. No pending approvals.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPermissions.slice(0, 5).map(perm => (
                <div 
                  key={perm.permissionId}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#161a27] border border-white/5 hover:border-white/10 text-xs"
                >
                  <div className="space-y-0.5 max-w-[65%] truncate">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-purple-300">{perm.username}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10 font-mono">
                        {perm.grade === 'GRADE_10' ? 'G10' : 'G12'}
                      </span>
                    </div>
                    <p className="text-white font-medium truncate">{perm.materialTitle}</p>
                    <p className="text-[11px] text-slate-400">{perm.subject}</p>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => onQuickApprove(perm.permissionId)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition text-[11px]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onQuickReject(perm.permissionId)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white font-medium transition text-[11px] border border-rose-500/30"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              
              {pendingPermissions.length > 5 && (
                <button
                  onClick={() => onNavigate('permissions')}
                  className="w-full py-2 text-center text-xs text-purple-400 hover:text-purple-300 font-medium"
                >
                  View all {pendingPermissions.length} pending requests →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent Admin Audit Logs */}
        <div className="bg-[#11141e] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-white text-sm">Security Audit Trail</h3>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              Full Log →
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No recorded administrative events yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.slice(0, 5).map(log => (
                <div 
                  key={log.logId}
                  className="p-3 rounded-xl bg-[#161a27] border border-white/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-purple-300 text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">{log.details}</p>
                  <div className="text-[10px] font-mono text-slate-500 flex items-center space-x-2 pt-0.5">
                    <span>By: {log.adminUsername}</span>
                    {log.targetUsername && <span>• Target: {log.targetUsername}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
