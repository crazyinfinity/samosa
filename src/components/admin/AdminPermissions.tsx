import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Ban, 
  AlertTriangle, 
  User, 
  BookOpen, 
  Calendar,
  CheckSquare,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { UserProfile, Material, MaterialPermission, ApprovalStatus, Grade } from '../../types';
import { setStudentMaterialPermission } from '../../services/materialService';

interface AdminPermissionsProps {
  students: UserProfile[];
  materials: Material[];
  permissions: MaterialPermission[];
  adminProfile: UserProfile;
  onRefresh: () => void;
}

export const AdminPermissions: React.FC<AdminPermissionsProps> = ({
  students,
  materials,
  permissions,
  adminProfile,
  onRefresh
}) => {
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('ALL');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | Grade>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | ApprovalStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingPermId, setLoadingPermId] = useState<string | null>(null);

  const studentList = useMemo(() => students.filter(s => s.role === 'student'), [students]);

  // Build complete grid representation of (student x material) pairs so admin can see and toggle status for ANY combination!
  const allCombinations = useMemo(() => {
    const list: Array<{
      key: string;
      student: UserProfile;
      material: Material;
      permission?: MaterialPermission;
      currentStatus: ApprovalStatus | 'not_requested';
      approvedAt?: string;
      lastAccessDate?: string;
    }> = [];

    studentList.forEach(st => {
      materials.forEach(mat => {
        const perm = permissions.find(p => p.uid === st.uid && p.materialId === mat.materialId);
        list.push({
          key: `${st.uid}_${mat.materialId}`,
          student: st,
          material: mat,
          permission: perm,
          currentStatus: perm ? perm.status : 'not_requested',
          approvedAt: perm?.approvedAt,
          lastAccessDate: perm?.lastAccessDate
        });
      });
    });

    return list;
  }, [studentList, materials, permissions]);

  // Filtered combinations
  const filteredCombinations = useMemo(() => {
    return allCombinations.filter(item => {
      if (selectedStudentUid !== 'ALL' && item.student.uid !== selectedStudentUid) return false;
      if (selectedMaterialId !== 'ALL' && item.material.materialId !== selectedMaterialId) return false;
      if (selectedGrade !== 'ALL' && item.material.grade !== selectedGrade) return false;
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'pending' && item.currentStatus !== 'pending' && item.currentStatus !== 'not_requested') return false;
        if (selectedStatus !== 'pending' && item.currentStatus !== selectedStatus) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUser = item.student.username.toLowerCase().includes(q);
        const matchTitle = item.material.title.toLowerCase().includes(q);
        const matchSubject = item.material.subject.toLowerCase().includes(q);
        if (!matchUser && !matchTitle && !matchSubject) return false;
      }
      return true;
    });
  }, [allCombinations, selectedStudentUid, selectedMaterialId, selectedGrade, selectedStatus, searchQuery]);

  const handleUpdateStatus = async (
    student: UserProfile, 
    material: Material, 
    newStatus: ApprovalStatus
  ) => {
    const permKey = `${student.uid}_${material.materialId}`;
    setLoadingPermId(permKey);

    try {
      await setStudentMaterialPermission({
        uid: student.uid,
        username: student.username,
        materialId: material.materialId,
        materialTitle: material.title,
        grade: material.grade,
        subject: material.subject,
        status: newStatus,
        adminProfile
      });
      onRefresh();
    } catch (err) {
      alert('Error updating permission: ' + err);
    } finally {
      setLoadingPermId(null);
    }
  };

  const handleBatchGrantForStudent = async (student: UserProfile, gradeTarget?: Grade) => {
    const matsToGrant = materials.filter(m => !gradeTarget || m.grade === gradeTarget);
    if (!confirm(`Grant APPROVAL for ${matsToGrant.length} material(s) to student ${student.username}?`)) {
      return;
    }

    setLoadingPermId('batch');
    try {
      for (const m of matsToGrant) {
        await setStudentMaterialPermission({
          uid: student.uid,
          username: student.username,
          materialId: m.materialId,
          materialTitle: m.title,
          grade: m.grade,
          subject: m.subject,
          status: 'approved',
          adminProfile
        });
      }
      onRefresh();
    } catch (err) {
      alert('Batch grant error: ' + err);
    } finally {
      setLoadingPermId(null);
    }
  };

  const handleBatchRevokeForStudent = async (student: UserProfile) => {
    if (!confirm(`REVOKE access to all materials for student ${student.username}?`)) {
      return;
    }

    setLoadingPermId('batch');
    try {
      for (const m of materials) {
        await setStudentMaterialPermission({
          uid: student.uid,
          username: student.username,
          materialId: m.materialId,
          materialTitle: m.title,
          grade: m.grade,
          subject: m.subject,
          status: 'revoked',
          adminProfile
        });
      }
      onRefresh();
    } catch (err) {
      alert('Batch revoke error: ' + err);
    } finally {
      setLoadingPermId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Individual PDF Approval Matrix</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              Zero-Trust ABAC
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Every PDF requires explicit, independent access permission per student. Access to one material never implies access to others.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Matrix</span>
        </button>
      </div>

      {/* Filter and Selection Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#11141e] border border-white/10 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or material..."
            className="w-full bg-[#161a26] border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter by Student */}
        <div className="space-y-1">
          <select
            value={selectedStudentUid}
            onChange={(e) => setSelectedStudentUid(e.target.value)}
            className="w-full bg-[#161a26] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Students ({studentList.length})</option>
            {studentList.map(s => (
              <option key={s.uid} value={s.uid}>{s.username}</option>
            ))}
          </select>
        </div>

        {/* Filter by Material */}
        <div className="space-y-1">
          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="w-full bg-[#161a26] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Materials ({materials.length})</option>
            {materials.map(m => (
              <option key={m.materialId} value={m.materialId}>
                [{m.grade === 'GRADE_10' ? 'G10' : 'G12'}] {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Grade */}
        <div className="space-y-1">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value as any)}
            className="w-full bg-[#161a26] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Grades</option>
            <option value="GRADE_10">Grade 10 Only</option>
            <option value="GRADE_12">Grade 12 Only</option>
          </select>
        </div>

        {/* Filter by Status */}
        <div className="space-y-1">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full bg-[#161a26] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending / Unassigned</option>
            <option value="rejected">Rejected Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
        </div>
      </div>

      {/* Quick Student Batch Actions Toolbar if single student selected */}
      {selectedStudentUid !== 'ALL' && (
        <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300">
              Bulk actions for <span className="font-mono font-bold text-white">
                {studentList.find(s => s.uid === selectedStudentUid)?.username}
              </span>:
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const st = studentList.find(s => s.uid === selectedStudentUid);
                if (st) handleBatchGrantForStudent(st, 'GRADE_10');
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white transition border border-purple-500/30"
            >
              Approve All Grade 10
            </button>
            <button
              onClick={() => {
                const st = studentList.find(s => s.uid === selectedStudentUid);
                if (st) handleBatchGrantForStudent(st, 'GRADE_12');
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white transition border border-blue-500/30"
            >
              Approve All Grade 12
            </button>
            <button
              onClick={() => {
                const st = studentList.find(s => s.uid === selectedStudentUid);
                if (st) handleBatchRevokeForStudent(st);
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition border border-rose-500/30"
            >
              Revoke All
            </button>
          </div>
        </div>
      )}

      {/* Main Permissions Matrix Table */}
      <div className="overflow-x-auto bg-[#11141e] border border-white/10 rounded-2xl shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-[#161a26] text-slate-400 font-mono">
              <th className="py-3 px-4">Student Username</th>
              <th className="py-3 px-4">Material Title & Subject</th>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4">Approval Status</th>
              <th className="py-3 px-4">Approval Date</th>
              <th className="py-3 px-4">Last Access Date</th>
              <th className="py-3 px-4 text-right">Individual Access Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredCombinations.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  No permission records matching selection criteria.
                </td>
              </tr>
            ) : (
              filteredCombinations.map((item) => {
                const isApproved = item.currentStatus === 'approved';
                const isRejected = item.currentStatus === 'rejected';
                const isRevoked = item.currentStatus === 'revoked';
                const isPending = item.currentStatus === 'pending' || item.currentStatus === 'not_requested';
                const isLoading = loadingPermId === item.key;

                return (
                  <tr key={item.key} className="hover:bg-white/[0.02] transition">
                    {/* Student Username */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {item.student.username}
                    </td>

                    {/* Material Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-white truncate" title={item.material.title}>
                        {item.material.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.material.subject} • {item.material.chapter}
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] border ${
                        item.material.grade === 'GRADE_10'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      }`}>
                        {item.material.grade === 'GRADE_10' ? 'Grade 10' : 'Grade 12'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 font-mono">
                      {isApproved && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                      {isRevoked && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] bg-slate-500/10 text-slate-400 border border-slate-500/20 font-semibold">
                          <Ban className="w-3 h-3" />
                          <span>Revoked</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{item.currentStatus === 'pending' ? 'Pending' : 'Not Approved'}</span>
                        </span>
                      )}
                    </td>

                    {/* Approval Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.approvedAt ? new Date(item.approvedAt).toLocaleDateString() : '—'}
                    </td>

                    {/* Last Access Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {item.lastAccessDate ? (
                        <span className="text-purple-300">
                          {new Date(item.lastAccessDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      ) : (
                        <span className="text-slate-600">Never accessed</span>
                      )}
                    </td>

                    {/* Individual Action Controls */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Approve Button */}
                        <button
                          disabled={isLoading || isApproved}
                          onClick={() => handleUpdateStatus(item.student, item.material, 'approved')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                            isApproved
                              ? 'opacity-30 bg-emerald-900/20 text-emerald-500 cursor-default'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          }`}
                          title="Grant Approved Access"
                        >
                          Approve
                        </button>

                        {/* Reject Button */}
                        <button
                          disabled={isLoading || isRejected}
                          onClick={() => handleUpdateStatus(item.student, item.material, 'rejected')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                            isRejected
                              ? 'opacity-30 bg-rose-900/20 text-rose-500 cursor-default'
                              : 'bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30'
                          }`}
                          title="Reject Access"
                        >
                          Reject
                        </button>

                        {/* Revoke Button */}
                        <button
                          disabled={isLoading || isRevoked}
                          onClick={() => handleUpdateStatus(item.student, item.material, 'revoked')}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                            isRevoked
                              ? 'opacity-30 bg-slate-800 text-slate-500 cursor-default'
                              : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/30'
                          }`}
                          title="Revoke Prior Access"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
