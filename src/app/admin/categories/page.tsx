'use client';

import AdminShell from '@/components/admin/AdminShell';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function CategoriesPage() {
  const { data, isLoading } = useSWR('/api/categories?includeDisabled=true', fetcher);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', icon: '', color: '' });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', icon: '', color: '#1e3a5f' });

  const categories = data?.data || [];

  async function handleCreate() {
    if (!newForm.nameEn.trim()) {
      toast.error('English name is required');
      return;
    }

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    });

    if (res.ok) {
      toast.success('Category created');
      setShowNew(false);
      setNewForm({ nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', icon: '', color: '#1e3a5f' });
      mutate('/api/categories?includeDisabled=true');
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to create');
    }
  }

  async function handleUpdate(id: string) {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      toast.success('Category updated');
      setEditingId(null);
      mutate('/api/categories?includeDisabled=true');
    } else {
      toast.error('Failed to update');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;

    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      toast.success('Category deleted');
      mutate('/api/categories?includeDisabled=true');
    } else {
      toast.error(data.error || 'Failed to delete');
    }
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    });

    if (res.ok) {
      toast.success(enabled ? 'Category disabled' : 'Category enabled');
      mutate('/api/categories?includeDisabled=true');
    }
  }

  async function reorder(id: string, direction: 'up' | 'down') {
    const idx = categories.findIndex((c: any) => c.id === id);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const current = categories[idx];
    const swap = categories[swapIdx];

    await Promise.all([
      fetch(`/api/categories/${current.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: swap.sortOrder }),
      }),
      fetch(`/api/categories/${swap.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: current.sortOrder }),
      }),
    ]);

    mutate('/api/categories?includeDisabled=true');
  }

  function startEdit(cat: any) {
    setEditingId(cat.id);
    setEditForm({
      nameEn: cat.nameEn,
      nameAr: cat.nameAr || '',
      descriptionEn: cat.descriptionEn || '',
      descriptionAr: cat.descriptionAr || '',
      icon: cat.icon || '',
      color: cat.color || '#1e3a5f',
    });
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 mt-1">Organize resources into categories</p>
          </div>
          <button onClick={() => setShowNew(!showNew)} className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Category
          </button>
        </div>

        {/* New category form */}
        {showNew && (
          <div className="admin-card border-primary-200 bg-primary-50/30">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">New Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name (EN) *</label>
                <input type="text" value={newForm.nameEn} onChange={(e) => setNewForm({ ...newForm, nameEn: e.target.value })} className="input-field text-sm" placeholder="Category name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">الاسم (AR)</label>
                <input type="text" value={newForm.nameAr} onChange={(e) => setNewForm({ ...newForm, nameAr: e.target.value })} className="input-field text-sm font-arabic" dir="rtl" placeholder="اسم الفئة" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description (EN)</label>
                <input type="text" value={newForm.descriptionEn} onChange={(e) => setNewForm({ ...newForm, descriptionEn: e.target.value })} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">الوصف (AR)</label>
                <input type="text" value={newForm.descriptionAr} onChange={(e) => setNewForm({ ...newForm, descriptionAr: e.target.value })} className="input-field text-sm font-arabic" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                <input type="color" value={newForm.color} onChange={(e) => setNewForm({ ...newForm, color: e.target.value })} className="h-10 w-full rounded cursor-pointer" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreate} className="btn-primary text-sm">Create</button>
              <button onClick={() => setShowNew(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* Categories list */}
        <div className="space-y-2">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="admin-card animate-pulse h-16" />
            ))
          ) : categories.length === 0 ? (
            <div className="admin-card text-center py-12 text-gray-500">
              No categories yet. Create your first category.
            </div>
          ) : (
            categories.map((cat: any, idx: number) => (
              <div key={cat.id} className={`admin-card ${!cat.enabled ? 'opacity-60' : ''}`}>
                {editingId === cat.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" value={editForm.nameEn} onChange={(e) => setEditForm({ ...editForm, nameEn: e.target.value })} className="input-field text-sm" placeholder="Name (EN)" />
                      <input type="text" value={editForm.nameAr} onChange={(e) => setEditForm({ ...editForm, nameAr: e.target.value })} className="input-field text-sm font-arabic" dir="rtl" placeholder="الاسم (AR)" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(cat.id)} className="btn-primary text-xs"><CheckIcon className="w-3 h-3 mr-1" />Save</button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary text-xs"><XMarkIcon className="w-3 h-3 mr-1" />Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => reorder(cat.id, 'up')}
                          disabled={idx === 0}
                          className="p-0.5 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUpIcon className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => reorder(cat.id, 'down')}
                          disabled={idx === categories.length - 1}
                          className="p-0.5 rounded text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDownIcon className="w-3 h-3" />
                        </button>
                      </div>
                      {cat.color && (
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {cat.nameEn}
                          {cat.nameAr && <span className="text-gray-400 mx-2">|</span>}
                          {cat.nameAr && <span className="font-arabic">{cat.nameAr}</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                          {cat._count?.resources || 0} resources · slug: {cat.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleEnabled(cat.id, cat.enabled)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        title={cat.enabled ? 'Disable' : 'Enable'}
                      >
                        {cat.enabled ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-primary-500 hover:bg-primary-50"
                        title="Edit"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.nameEn)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AdminShell>
  );
}
