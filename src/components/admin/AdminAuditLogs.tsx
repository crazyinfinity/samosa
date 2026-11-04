import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  User, 
  FileText, 
  Key, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  RefreshCw
} from 'lucide-react';
import { AuditLogEntry } from '../../types';

interface AdminAuditLogsProps {
  logs: AuditLogEntry[];
  onRefresh: () => void;
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ logs, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetUsername && log.targetUsername.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action.startsWith(actionFilter);
    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('APPROVED')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (action.includes('REJECTED') || action.includes('DISABLE')) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (action.includes('CREATE') || action.includes('UPLOAD')) return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
    if (action.includes('REVOKE')) return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Security & Compliance Audit Trail</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {logs.length} Total Events
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable log of all administrative interventions, permission grants, and security modifications.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs border border-white/10 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#11141e] border border-white/10 p-3 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, administrator, target or details..."
            className="w-full bg-[#161a26] border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Action Type:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full bg-[#161a26] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="PERMISSION_APPROVED">Permission Approved</option>
            <option value="PERMISSION_REJECTED">Permission Rejected</option>
            <option value="PERMISSION_REVOKED">Permission Revoked</option>
            <option value="CREATE_USER">Create User</option>
            <option value="UPLOAD_MATERIAL">Upload Material</option>
            <option value="DISABLE_ACCOUNT">Disable Account</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto bg-[#11141e] border border-white/10 rounded-2xl shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-[#161a26] text-slate-400 font-mono">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Admin Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  No audit log entries matching filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.logId} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-white">
                    {log.adminUsername}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] border font-semibold ${getActionBadgeColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {log.targetUsername || log.materialTitle || log.targetUid || '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
