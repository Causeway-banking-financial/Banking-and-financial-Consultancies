'use client';

import AdminShell from '@/components/admin/AdminShell';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Block = {
  id: string;
  type: 'hero' | 'text' | 'cards' | 'cta' | 'stats' | 'image' | 'faq';
  data: Record<string, any>;
};

const BLOCK_TYPES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'text', label: 'Text Block' },
  { value: 'cards', label: 'Cards Grid' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'stats', label: 'Statistics' },
  { value: 'image', label: 'Image' },
  { value: 'faq', label: 'FAQ Accordion' },
];

export default function PageEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [form, setForm] = useState({
    titleEn: '', titleAr: '', slug: '', status: 'DRAFT', template: 'default',
    showInNav: false, sortOrder: 0, contentEn: '', contentAr: '',
    blocksEn: [] as Block[], blocksAr: [] as Block[],
    metaTitleEn: '', metaDescEn: '', metaTitleAr: '', metaDescAr: '',
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en');

  const { data } = useSWR(!isNew ? `/api/pages/${params.id}` : null, fetcher);

  useEffect(() => {
    if (data?.data) {
      setForm({
        ...form,
        ...data.data,
        blocksEn: data.data.blocksEn || [],
        blocksAr: data.data.blocksAr || [],
      });
    }
  }, [data]);

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addBlock(lang: 'en' | 'ar', type: string) {
    const newBlock: Block = {
      id: Date.now().toString(36),
      type: type as any,
      data: { title: '', content: '', items: [] },
    };
    const key = lang === 'en' ? 'blocksEn' : 'blocksAr';
    updateField(key, [...(form[key] || []), newBlock]);
  }

  function updateBlock(lang: 'en' | 'ar', blockId: string, data: any) {
    const key = lang === 'en' ? 'blocksEn' : 'blocksAr';
    updateField(
      key,
      (form[key] || []).map((b: Block) => (b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b))
    );
  }

  function removeBlock(lang: 'en' | 'ar', blockId: string) {
    const key = lang === 'en' ? 'blocksEn' : 'blocksAr';
    updateField(key, (form[key] || []).filter((b: Block) => b.id !== blockId));
  }

  async function handleSave(status?: string) {
    setSaving(true);
    try {
      const payload = { ...form };
      if (status) payload.status = status;

      const url = isNew ? '/api/pages' : `/api/pages/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isNew ? 'Page created' : 'Page saved');
        if (isNew) router.push(`/admin/pages/${result.data.id}`);
      } else {
        toast.error(result.error || 'Save failed');
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  const blocks = activeTab === 'en' ? (form.blocksEn || []) : (form.blocksAr || []);

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/pages')} className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'New Page' : 'Edit Page'}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleSave()} disabled={saving} className="btn-secondary">{saving ? 'Saving...' : 'Save Draft'}</button>
            <button onClick={() => handleSave('PUBLISHED')} disabled={saving} className="btn-primary">
              <CheckCircleIcon className="w-4 h-4 mr-1" />Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Language tabs */}
            <div className="admin-card">
              <div className="flex border-b border-gray-200 mb-4">
                <button onClick={() => setActiveTab('en')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'en' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>English</button>
                <button onClick={() => setActiveTab('ar')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'ar' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>العربية</button>
              </div>

              <div className={activeTab === 'ar' ? 'space-y-4' : 'space-y-4'} dir={activeTab === 'ar' ? 'rtl' : 'ltr'}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {activeTab === 'en' ? 'Title (EN) *' : 'العنوان (AR)'}
                  </label>
                  <input
                    type="text"
                    value={activeTab === 'en' ? form.titleEn : form.titleAr}
                    onChange={(e) => updateField(activeTab === 'en' ? 'titleEn' : 'titleAr', e.target.value)}
                    className={`input-field ${activeTab === 'ar' ? 'font-arabic' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {activeTab === 'en' ? 'Content (EN)' : 'المحتوى (AR)'}
                  </label>
                  <textarea
                    value={activeTab === 'en' ? form.contentEn : form.contentAr}
                    onChange={(e) => updateField(activeTab === 'en' ? 'contentEn' : 'contentAr', e.target.value)}
                    className={`input-field ${activeTab === 'ar' ? 'font-arabic' : ''}`}
                    rows={6}
                  />
                </div>
              </div>
            </div>

            {/* Structured Blocks */}
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Page Blocks ({activeTab === 'en' ? 'English' : 'Arabic'})
              </h3>

              <div className="space-y-3">
                {blocks.map((block: Block) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="badge bg-primary-50 text-primary-700">{block.type}</span>
                      <button onClick={() => removeBlock(activeTab, block.id)} className="p-1 rounded text-gray-400 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2" dir={activeTab === 'ar' ? 'rtl' : 'ltr'}>
                      <input
                        type="text"
                        value={block.data.title || ''}
                        onChange={(e) => updateBlock(activeTab, block.id, { title: e.target.value })}
                        className={`input-field text-sm ${activeTab === 'ar' ? 'font-arabic' : ''}`}
                        placeholder="Block title"
                      />
                      <textarea
                        value={block.data.content || ''}
                        onChange={(e) => updateBlock(activeTab, block.id, { content: e.target.value })}
                        className={`input-field text-sm ${activeTab === 'ar' ? 'font-arabic' : ''}`}
                        rows={3}
                        placeholder="Block content"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap gap-2">
                  {BLOCK_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => addBlock(activeTab, bt.value)}
                      className="btn-secondary text-xs"
                    >
                      <PlusIcon className="w-3 h-3 mr-1" />
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SEO</h3>
              <div className="space-y-3" dir={activeTab === 'ar' ? 'rtl' : 'ltr'}>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={activeTab === 'en' ? form.metaTitleEn : form.metaTitleAr}
                    onChange={(e) => updateField(activeTab === 'en' ? 'metaTitleEn' : 'metaTitleAr', e.target.value)}
                    className={`input-field text-sm ${activeTab === 'ar' ? 'font-arabic' : ''}`}
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description</label>
                  <textarea
                    value={activeTab === 'en' ? form.metaDescEn : form.metaDescAr}
                    onChange={(e) => updateField(activeTab === 'en' ? 'metaDescEn' : 'metaDescAr', e.target.value)}
                    className={`input-field text-sm ${activeTab === 'ar' ? 'font-arabic' : ''}`}
                    rows={2}
                    maxLength={160}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">URL Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} className="input-field text-sm font-mono" placeholder="page-slug" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="input-field text-sm">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Template</label>
                  <select value={form.template} onChange={(e) => updateField('template', e.target.value)} className="input-field text-sm">
                    <option value="default">Default</option>
                    <option value="full-width">Full Width</option>
                    <option value="sidebar">With Sidebar</option>
                    <option value="landing">Landing Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => updateField('sortOrder', parseInt(e.target.value))} className="input-field text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="showInNav" checked={form.showInNav} onChange={(e) => updateField('showInNav', e.target.checked)} className="rounded border-gray-300" />
                  <label htmlFor="showInNav" className="text-sm text-gray-700">Show in navigation</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
