'use client';

import AdminShell from '@/components/admin/AdminShell';
import useSWR, { mutate } from 'swr';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { formatDate, getStatusColor } from '@/lib/utils';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  GlobeAltIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PagesPage() {
  const { data, isLoading } = useSWR('/api/pages?admin=true', fetcher);
  const pages = data?.data || [];

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete page "${title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Page deleted');
      mutate('/api/pages?admin=true');
    } else {
      toast.error('Failed to delete page');
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const res = await fetch(`/api/pages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(newStatus === 'PUBLISHED' ? 'Published' : 'Unpublished');
      mutate('/api/pages?admin=true');
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
            <p className="text-gray-500 mt-1">Create and manage website pages without code</p>
          </div>
          <Link href="/admin/pages/new" className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Page
          </Link>
        </div>

        <div className="admin-card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Page</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Slug</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Nav</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">AR</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Updated</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4"><div className="animate-pulse h-6 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No pages yet. Create your first page.
                  </td>
                </tr>
              ) : (
                pages.map((page: any) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{page.titleEn}</p>
                      <p className="text-xs text-gray-400">{page.template} template</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">/{page.slug}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(page.id, page.status)}
                        className={getStatusColor(page.status)}
                      >
                        {page.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {page.showInNav ? (
                        <span className="text-green-600 text-xs">In nav</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Hidden</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {page.titleAr ? (
                        <span className="text-green-600 text-xs">✓</span>
                      ) : (
                        <span className="text-amber-500 text-xs">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(page.updatedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-md text-gray-400 hover:text-green-500 hover:bg-green-50"
                          title="Preview"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="p-1.5 rounded-md text-gray-400 hover:text-primary-500 hover:bg-primary-50"
                          title="Edit"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(page.id, page.titleEn)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
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
      </div>
    </AdminShell>
  );
}
