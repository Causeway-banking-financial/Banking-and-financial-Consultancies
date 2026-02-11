'use client';

import AdminShell from '@/components/admin/AdminShell';
import useSWR from 'swr';
import Link from 'next/link';
import {
  DocumentTextIcon,
  FolderIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const fetcher = (url: string) =>
  fetch(url, { headers: { 'x-admin': 'true' } }).then((r) => r.json());

export default function DashboardPage() {
  const { data: health, isLoading } = useSWR('/api/health', fetcher, {
    refreshInterval: 30000,
  });

  const stats = health?.data;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your CauseWay platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Resources"
            value={stats?.resources?.total || 0}
            subtitle={`${stats?.resources?.published || 0} published, ${stats?.resources?.draft || 0} drafts`}
            icon={DocumentTextIcon}
            href="/admin/resources"
            color="blue"
            loading={isLoading}
          />
          <StatCard
            title="Categories"
            value={stats?.categories || 0}
            subtitle="Active categories"
            icon={FolderIcon}
            href="/admin/categories"
            color="green"
            loading={isLoading}
          />
          <StatCard
            title="Pages"
            value={stats?.pages || 0}
            subtitle="CMS pages"
            icon={DocumentDuplicateIcon}
            href="/admin/pages"
            color="purple"
            loading={isLoading}
          />
          <StatCard
            title="System Health"
            value={stats?.database ? 'Healthy' : 'Check'}
            subtitle={`${stats?.brokenLinks || 0} broken links`}
            icon={stats?.database ? CheckCircleIcon : ExclamationTriangleIcon}
            href="/admin/health"
            color={stats?.database ? 'emerald' : 'red'}
            loading={isLoading}
          />
        </div>

        {/* Quality Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Translation Coverage */}
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-primary-500" />
              Bilingual Coverage
            </h2>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ) : (
              <div className="space-y-3">
                <QualityBar
                  label="Resources with Arabic"
                  current={(stats?.resources?.total || 0) - (stats?.missingArResources || 0)}
                  total={stats?.resources?.total || 0}
                />
                <QualityBar
                  label="Pages with Arabic"
                  current={(stats?.pages || 0) - (stats?.missingArPages || 0)}
                  total={stats?.pages || 0}
                />
                {(stats?.missingTranslations || 0) > 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    ⚠ {stats.missingTranslations} published items missing Arabic translations
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-primary-500" />
              Recent Activity
            </h2>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.recentActivity?.length > 0 ? (
                  stats.recentActivity.slice(0, 5).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {log.user?.name || 'System'}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {log.action.toLowerCase()} {log.entityType.toLowerCase()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
                <Link
                  href="/admin/audit"
                  className="text-sm text-primary-500 hover:text-primary-600 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/resources?action=new" className="btn-primary text-sm">
              + New Resource
            </Link>
            <Link href="/admin/pages?action=new" className="btn-secondary text-sm">
              + New Page
            </Link>
            <Link href="/admin/categories" className="btn-secondary text-sm">
              Manage Categories
            </Link>
            <Link href="/admin/health" className="btn-secondary text-sm">
              Run Health Check
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({
  title, value, subtitle, icon: Icon, href, color, loading,
}: {
  title: string; value: string | number; subtitle: string;
  icon: any; href: string; color: string; loading: boolean;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Link href={href} className="admin-card hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="animate-pulse h-8 w-16 bg-gray-200 rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Link>
  );
}

function QualityBar({ label, current, total }: { label: string; current: number; total: number }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{current}/{total} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage === 100 ? 'bg-green-500' : percentage >= 70 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
