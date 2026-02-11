'use client';

import AdminShell from '@/components/admin/AdminShell';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate, formatFileSize, getStatusColor } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const fetcher = (url: string) =>
  fetch(url, { headers: { 'x-admin': 'true' } }).then((r) => r.json());

export default function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showNewForm, setShowNewForm] = useState(false);

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: '20',
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(typeFilter && { type: typeFilter }),
  });

  const { data, isLoading } = useSWR(
    `/api/resources?${queryParams}`,
    fetcher,
    { keepPreviousData: true }
  );

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Resource deleted');
      mutate(`/api/resources?${queryParams}`);
    } else {
      toast.error('Failed to delete resource');
    }
  }

  async function toggleFeatured(id: string, featured: boolean) {
    const res = await fetch(`/api/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !featured }),
    });
    if (res.ok) {
      toast.success(featured ? 'Unfeatured' : 'Featured');
      mutate(`/api/resources?${queryParams}`);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const res = await fetch(`/api/resources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(newStatus === 'PUBLISHED' ? 'Published' : 'Unpublished');
      mutate(`/api/resources?${queryParams}`);
    }
  }

  const resources = data?.data || [];
  const totalPages = data?.totalPages || 1;

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
            <p className="text-gray-500 mt-1">{data?.total || 0} total resources</p>
          </div>
          <Link href="/admin/resources/new" className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Resource
          </Link>
        </div>

        {/* Filters */}
        <div className="admin-card">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field w-auto"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="input-field w-auto"
            >
              <option value="">All Types</option>
              <option value="REPORT">Report</option>
              <option value="WHITEPAPER">Whitepaper</option>
              <option value="ARTICLE">Article</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="GUIDE">Guide</option>
              <option value="VIDEO">Video</option>
              <option value="DATA">Data</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="admin-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Resource</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">AR</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Updated</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="animate-pulse h-6 bg-gray-200 rounded" />
                      </td>
                    </tr>
                  ))
                ) : resources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No resources found. Create your first resource.
                    </td>
                  </tr>
                ) : (
                  resources.map((resource: any) => (
                    <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleFeatured(resource.id, resource.featured)}
                            className="shrink-0"
                            title={resource.featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            {resource.featured ? (
                              <StarSolidIcon className="w-4 h-4 text-amber-500" />
                            ) : (
                              <StarIcon className="w-4 h-4 text-gray-300 hover:text-amber-400" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {resource.titleEn}
                            </p>
                            {resource.category && (
                              <p className="text-xs text-gray-400">{resource.category.nameEn}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge bg-gray-100 text-gray-600">{resource.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(resource.id, resource.status)}
                          className={getStatusColor(resource.status)}
                        >
                          {resource.status}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        {resource.titleAr ? (
                          <span className="text-green-600 text-xs">✓</span>
                        ) : (
                          <span className="text-amber-500 text-xs">✗</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(resource.updatedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/resources/${resource.id}`}
                            className="p-1.5 rounded-md text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                            title="Edit"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(resource.id, resource.titleEn)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
