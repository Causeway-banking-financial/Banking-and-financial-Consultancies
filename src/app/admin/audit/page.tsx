'use client';

import AdminShell from '@/components/admin/AdminShell';
import useSWR from 'swr';
import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import {
  ClipboardDocumentListIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  PUBLISH: 'bg-emerald-100 text-emerald-700',
  UNPUBLISH: 'bg-amber-100 text-amber-700',
  UPLOAD: 'bg-purple-100 text-purple-700',
  LOGIN: 'bg-gray-100 text-gray-700',
  REORDER: 'bg-indigo-100 text-indigo-700',
  ARCHIVE: 'bg-gray-100 text-gray-600',
};

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: '50',
    ...(entityFilter && { entityType: entityFilter }),
  });

  const { data, isLoading } = useSWR(`/api/audit?${queryParams}`, fetcher);
  const logs = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 mt-1">Track all changes made to the platform</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="input-field w-auto"
          >
            <option value="">All Types</option>
            <option value="Resource">Resources</option>
            <option value="Category">Categories</option>
            <option value="Page">Pages</option>
            <option value="File">Files</option>
          </select>
        </div>

        {/* Log table */}
        <div className="admin-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Timestamp</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Action</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Entity</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4"><div className="animate-pulse h-5 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <ClipboardDocumentListIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      {log.user?.name || 'System'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`badge ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {log.entityType}
                      {log.entityId && (
                        <span className="text-gray-400 text-xs ml-1">({log.entityId.slice(0, 8)})</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {log.details && typeof log.details === 'object'
                        ? (log.details as any).title || JSON.stringify(log.details).slice(0, 60)
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">Previous</button>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary text-xs py-1.5 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
