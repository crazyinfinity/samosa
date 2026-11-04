import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  UserX, 
  Trash2, 
  Key, 
  GraduationCap, 
  Check, 
  X, 
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import { UserProfile, Grade, AccountStatus, PREDEFINED_USERNAMES } from '../../types';
import { 
  createStudentAccount, 
  toggleAccountStatus, 
  updateStudentGrades, 
  deleteStudentAccount 
} from '../../services/authService';

interface AdminStudentsProps {
  students: UserProfile[];
  adminProfile: UserProfile;
  onRefresh: () => void;
}

export const AdminStudents: React.FC<AdminStudentsProps> = ({
  students,
  adminProfile,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | Grade>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | AccountStatus>('ALL');

  // Modal State for adding student
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('inf/thilak');
  const [newPassword, setNewPassword] = useState('darkDVM@2025');
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>(['GRADE_10']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Grade Modal
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [editGrades, setEditGrades] = useState<Grade[]>([]);

  // Action feedback
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'ALL' || student.gradeAccess.includes(gradeFilter);
    const matchesStatus = statusFilter === 'ALL' || student.accountStatus === statusFilter;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setErrorMessage('Username is required');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (selectedGrades.length === 0) {
      setErrorMessage('Select at least one grade category');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createStudentAccount({
        username: newUsername.trim(),
        password: newPassword,
        gradeAccess: selectedGrades,
        role: newUsername.trim() === 'inf/admin' ? 'admin' : 'student',
        adminProfile
      });

      setSuccessMessage(`Account for ${newUsername} created successfully with temporary password.`);
      setShowAddModal(false);
      onRefresh();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create student account';
      setErrorMessage(msg.includes('email-already-in-use') ? 'This username/account already exists in Auth.' : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (student: UserProfile) => {
    setActionLoadingId(student.uid);
    try {
      await toggleAccountStatus(student.uid, student.accountStatus, adminProfile);
      onRefresh();
    } catch (err) {
      alert('Error updating status: ' + err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (student: UserProfile) => {
    if (student.username === 'inf/admin') {
      alert('Cannot delete the root administrator account.');
      return;
    }
    if (!confirm(`Are you sure you want to delete account ${student.username}? This cannot be undone.`)) {
      return;
    }

    setActionLoadingId(student.uid);
    try {
      await deleteStudentAccount(student.uid, student.username, adminProfile);
      onRefresh();
    } catch (err) {
      alert('Error deleting user: ' + err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveGrades = async () => {
    if (!editingStudent) return;
    setActionLoadingId(editingStudent.uid);
    try {
      await updateStudentGrades(editingStudent.uid, editGrades, adminProfile);
      setEditingStudent(null);
      onRefresh();
    } catch (err) {
      alert('Failed to update grade access: ' + err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Student Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {students.length} Accounts
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Administrators manage student registrations, access credentials, and account statuses.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setErrorMessage(null);
          }}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#11141e] border border-white/10 p-3 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or ID..."
            className="w-full bg-[#161a26] border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Grade:</span>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value as any)}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full bg-[#161a26] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto bg-[#11141e] border border-white/10 rounded-2xl shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-[#161a26] text-slate-400 font-mono">
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Grade Access</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Created Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No accounts found matching search filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isAdmin = student.role === 'admin';
                const isActive = student.accountStatus === 'active';

                return (
                  <tr key={student.uid} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white">{student.username}</span>
                        {isAdmin && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">{student.email}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        isAdmin 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                      }`}>
                        {student.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {student.gradeAccess?.map(g => (
                          <span 
                            key={g} 
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              g === 'GRADE_10' 
                                ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
                                : 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                            }`}
                          >
                            {g === 'GRADE_10' ? 'Grade 10' : 'Grade 12'}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] border ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        <span>{isActive ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Initial Setup'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit Grade Access */}
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setEditGrades(student.gradeAccess || []);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
                          title="Edit Grade Access"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Active / Disabled */}
                        {!isAdmin && (
                          <button
                            disabled={actionLoadingId === student.uid}
                            onClick={() => handleToggleStatus(student)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                              isActive
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
                            }`}
                          >
                            {isActive ? 'Disable' : 'Activate'}
                          </button>
                        )}

                        {/* Delete Account */}
                        {!isAdmin && (
                          <button
                            disabled={actionLoadingId === student.uid}
                            onClick={() => handleDelete(student)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121520] border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-sm">Provision New Student Account</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              {/* Select or type Username */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. inf/thilak"
                  className="w-full bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
                
                {/* Predefined Quick Chips */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 block mb-1">Predefined Presets:</span>
                  <div className="flex flex-wrap gap-1">
                    {PREDEFINED_USERNAMES.map(uname => (
                      <button
                        key={uname}
                        type="button"
                        onClick={() => setNewUsername(uname)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${
                          newUsername === uname
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {uname}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Password field with generator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium">Temporary Password</label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#181c2b] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Grade Access Selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Authorized Grade Categories</label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-[#181c2b] border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGrades.includes('GRADE_10')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGrades([...selectedGrades, 'GRADE_10']);
                        } else {
                          setSelectedGrades(selectedGrades.filter(g => g !== 'GRADE_10'));
                        }
                      }}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-mono text-slate-200">GRADE 10</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-[#181c2b] border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGrades.includes('GRADE_12')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedGrades([...selectedGrades, 'GRADE_12']);
                        } else {
                          setSelectedGrades(selectedGrades.filter(g => g !== 'GRADE_12'));
                        }
                      }}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="font-mono text-slate-200">GRADE 12</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-900/30 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Grade Access Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121520] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-sm">
              Update Grades for <span className="font-mono text-purple-300">{editingStudent.username}</span>
            </h3>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 p-3 rounded-xl bg-[#181c2b] border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editGrades.includes('GRADE_10')}
                  onChange={(e) => {
                    if (e.target.checked) setEditGrades([...editGrades, 'GRADE_10']);
                    else setEditGrades(editGrades.filter(g => g !== 'GRADE_10'));
                  }}
                  className="rounded text-purple-600"
                />
                <span className="font-mono text-slate-200">Grade 10 Access</span>
              </label>

              <label className="flex items-center space-x-2 p-3 rounded-xl bg-[#181c2b] border border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editGrades.includes('GRADE_12')}
                  onChange={(e) => {
                    if (e.target.checked) setEditGrades([...editGrades, 'GRADE_12']);
                    else setEditGrades(editGrades.filter(g => g !== 'GRADE_12'));
                  }}
                  className="rounded text-purple-600"
                />
                <span className="font-mono text-slate-200">Grade 12 Access</span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGrades}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
