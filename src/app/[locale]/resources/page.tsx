'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLocalizedField, formatDate, formatFileSize } from '@/lib/utils';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export default function ResourcesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('resources');
  const tc = useTranslations('common');

  const [resources, setResources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [search, category, type, sort, page]);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch {}
  }

  async function fetchResources() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        sort,
        ...(search && { search }),
        ...(category && { category }),
        ...(type && { type }),
      });
      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      if (data.success) {
        setResources(data.data);
        setTotalPages(data.totalPages);
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  const featured = resources.filter((r: any) => r.featured);
  const regular = resources.filter((r: any) => !r.featured);

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-800 to-primary-700 text-white">
        <div className="container-page py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-primary-200 max-w-2xl">{t('subtitle')}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-8">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-10"
              />
            </div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="input-field w-auto"
            >
              <option value="">{tc('allCategories')}</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {getLocalizedField(cat, 'name', locale)}
                </option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="input-field w-auto"
            >
              <option value="">{t('filterByType')}</option>
              <option value="REPORT">Report</option>
              <option value="WHITEPAPER">Whitepaper</option>
              <option value="ARTICLE">Article</option>
              <option value="PRESENTATION">Presentation</option>
              <option value="GUIDE">Guide</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field w-auto"
            >
              <option value="latest">{t('sortLatest')}</option>
              <option value="oldest">{t('sortOldest')}</option>
              <option value="title">{t('sortTitle')}</option>
            </select>
          </div>

          {/* Featured Resources */}
          {featured.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-amber-500" />
                {tc('featured')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.map((resource: any) => (
                  <ResourceCard key={resource.id} resource={resource} locale={locale} featured />
                ))}
              </div>
            </div>
          )}

          {/* Resources Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : regular.length === 0 && featured.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">{t('noResources')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((resource: any) => (
                <ResourceCard key={resource.id} resource={resource} locale={locale} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm"
              >
                {tc('previous')}
              </button>
              <span className="text-sm text-gray-500 px-4">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm"
              >
                {tc('next')}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ResourceCard({ resource, locale, featured = false }: { resource: any; locale: string; featured?: boolean }) {
  const title = getLocalizedField(resource, 'title', locale);
  const description = getLocalizedField(resource, 'description', locale);

  return (
    <div className={`card p-6 hover:shadow-lg transition-shadow ${featured ? 'ring-2 ring-amber-200 bg-amber-50/30' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="badge bg-primary-50 text-primary-600">{resource.type}</span>
        {resource.category && (
          <span className="badge bg-gray-100 text-gray-600">
            {getLocalizedField(resource.category, 'name', locale)}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 line-clamp-3 mb-4">{description}</p>
      )}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {resource.publishDate ? formatDate(resource.publishDate, locale) : resource.year}
        </span>
        <div className="flex gap-2">
          {resource.fileUrl && (
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-primary-500 hover:bg-primary-50 transition-colors"
              title="Download"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
            </a>
          )}
          {resource.externalUrl && (
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-primary-500 hover:bg-primary-50 transition-colors"
              title="View"
            >
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
