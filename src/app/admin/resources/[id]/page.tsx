'use client';

import AdminShell from '@/components/admin/AdminShell';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { getCompletionScore } from '@/lib/utils';
import {
  ArrowLeftIcon,
  CloudArrowUpIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const BILINGUAL_FIELDS = ['titleEn', 'titleAr', 'descriptionEn', 'descriptionAr', 'metaTitleEn', 'metaTitleAr', 'metaDescEn', 'metaDescAr'];

const defaultForm = {
  titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '',
  contentEn: '', contentAr: '', type: 'REPORT', status: 'DRAFT',
  featured: false, priority: 0, publisher: '', publishDate: '',
  year: new Date().getFullYear(), externalUrl: '', tags: [] as string[],
  categoryId: '', metaTitleEn: '', metaDescEn: '', metaTitleAr: '', metaDescAr: '',
  fileUrl: '', fileName: '', fileSize: 0, fileMimeType: '', thumbnailUrl: '',
};

export default function ResourceEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'en' | 'ar'>('en');
  const [uploading, setUploading] = useState(false);

  const { data: resourceData } = useSWR(
    !isNew ? `/api/resources/${params.id}` : null,
    fetcher
  );
  const { data: categoriesData } = useSWR('/api/categories?includeDisabled=true', fetcher);

  useEffect(() => {
    if (resourceData?.data) {
      const r = resourceData.data;
      setForm({
        ...defaultForm,
        ...r,
        publishDate: r.publishDate ? new Date(r.publishDate).toISOString().split('T')[0] : '',
        categoryId: r.categoryId || '',
        tags: r.tags || [],
      });
    }
  }, [resourceData]);

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    updateField('tags', form.tags.filter((t) => t !== tag));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'resources');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        updateField('fileUrl', data.data.url);
        updateField('fileName', data.data.name);
        updateField('fileSize', data.data.size);
        updateField('fileMimeType', data.data.mimeType);
        toast.success('File uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(status?: string) {
    setSaving(true);
    try {
      const payload = { ...form };
      if (status) payload.status = status;
      if (!payload.categoryId) delete (payload as any).categoryId;

      const url = isNew ? '/api/resources' : `/api/resources/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(isNew ? 'Resource created' : 'Resource saved');
        if (isNew) {
          router.push(`/admin/resources/${data.data.id}`);
        }
      } else {
        toast.error(data.error || 'Save failed');
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  }

  const completionScore = getCompletionScore(form, BILINGUAL_FIELDS);
  const categories = categoriesData?.data || [];

  return (
    <AdminShell>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/resources')} className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? 'New Resource' : 'Edit Resource'}
              </h1>
              {!isNew && <p className="text-sm text-gray-500">ID: {params.id}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Completion indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${completionScore === 100 ? 'bg-green-500' : 'bg-amber-500'}`}
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <span className="text-gray-500">{completionScore}% complete</span>
            </div>
            <button onClick={() => handleSave()} disabled={saving} className="btn-secondary">
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => handleSave('PUBLISHED')} disabled={saving} className="btn-primary">
              <CheckCircleIcon className="w-4 h-4 mr-1" />
              Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Language tabs */}
            <div className="admin-card">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setActiveTab('en')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'en' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setActiveTab('ar')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'ar' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'
                  }`}
                >
                  العربية (Arabic)
                </button>
              </div>

              {activeTab === 'en' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (EN) *</label>
                    <input type="text" value={form.titleEn} onChange={(e) => updateField('titleEn', e.target.value)} className="input-field" placeholder="Resource title in English" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                    <textarea value={form.descriptionEn} onChange={(e) => updateField('descriptionEn', e.target.value)} className="input-field" rows={3} placeholder="Brief description..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content (EN)</label>
                    <textarea value={form.contentEn} onChange={(e) => updateField('contentEn', e.target.value)} className="input-field" rows={8} placeholder="Full content or summary..." />
                  </div>
                </div>
              ) : (
                <div className="space-y-4" dir="rtl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان (AR)</label>
                    <input type="text" value={form.titleAr} onChange={(e) => updateField('titleAr', e.target.value)} className="input-field font-arabic" placeholder="عنوان المورد بالعربية" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (AR)</label>
                    <textarea value={form.descriptionAr} onChange={(e) => updateField('descriptionAr', e.target.value)} className="input-field font-arabic" rows={3} placeholder="وصف مختصر..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى (AR)</label>
                    <textarea value={form.contentAr} onChange={(e) => updateField('contentAr', e.target.value)} className="input-field font-arabic" rows={8} placeholder="المحتوى الكامل أو الملخص..." />
                  </div>
                </div>
              )}
            </div>

            {/* SEO */}
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SEO Settings</h3>
              {activeTab === 'en' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Meta Title (EN)</label>
                    <input type="text" value={form.metaTitleEn} onChange={(e) => updateField('metaTitleEn', e.target.value)} className="input-field text-sm" maxLength={60} />
                    <p className="text-xs text-gray-400 mt-1">{form.metaTitleEn.length}/60</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Meta Description (EN)</label>
                    <textarea value={form.metaDescEn} onChange={(e) => updateField('metaDescEn', e.target.value)} className="input-field text-sm" rows={2} maxLength={160} />
                    <p className="text-xs text-gray-400 mt-1">{form.metaDescEn.length}/160</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3" dir="rtl">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">عنوان الميتا (AR)</label>
                    <input type="text" value={form.metaTitleAr} onChange={(e) => updateField('metaTitleAr', e.target.value)} className="input-field text-sm font-arabic" maxLength={60} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">وصف الميتا (AR)</label>
                    <textarea value={form.metaDescAr} onChange={(e) => updateField('metaDescAr', e.target.value)} className="input-field text-sm font-arabic" rows={2} maxLength={160} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish settings */}
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="input-field text-sm">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => updateField('type', e.target.value)} className="input-field text-sm">
                    <option value="REPORT">Report</option>
                    <option value="WHITEPAPER">Whitepaper</option>
                    <option value="ARTICLE">Article</option>
                    <option value="PRESENTATION">Presentation</option>
                    <option value="DATA">Data</option>
                    <option value="GUIDE">Guide</option>
                    <option value="VIDEO">Video</option>
                    <option value="PODCAST">Podcast</option>
                    <option value="INFOGRAPHIC">Infographic</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select value={form.categoryId} onChange={(e) => updateField('categoryId', e.target.value)} className="input-field text-sm">
                    <option value="">None</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Publisher</label>
                  <input type="text" value={form.publisher} onChange={(e) => updateField('publisher', e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Publish Date</label>
                  <input type="date" value={form.publishDate} onChange={(e) => updateField('publishDate', e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                  <input type="number" value={form.year} onChange={(e) => updateField('year', parseInt(e.target.value))} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Priority (higher = first)</label>
                  <input type="number" value={form.priority} onChange={(e) => updateField('priority', parseInt(e.target.value))} className="input-field text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => updateField('featured', e.target.checked)} className="rounded border-gray-300" />
                  <label htmlFor="featured" className="text-sm text-gray-700">Featured resource</label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="input-field text-sm flex-1"
                  placeholder="Add tag..."
                />
                <button onClick={addTag} className="btn-secondary text-xs px-3">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <span key={tag} className="badge bg-primary-50 text-primary-700 gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-primary-400 hover:text-primary-600">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="admin-card">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">File / Link</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">External URL</label>
                  <input type="url" value={form.externalUrl} onChange={(e) => updateField('externalUrl', e.target.value)} className="input-field text-sm" placeholder="https://..." />
                </div>
                <div className="text-center text-xs text-gray-400">— or upload a file —</div>
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                    <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload'}</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, PPTX, Images (max 15MB)</p>
                  </div>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png,.webp,.svg" />
                </label>
                {form.fileName && (
                  <p className="text-xs text-green-600">Uploaded: {form.fileName}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
