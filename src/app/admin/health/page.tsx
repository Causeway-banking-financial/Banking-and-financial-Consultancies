'use client';

import AdminShell from '@/components/admin/AdminShell';
import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  LinkIcon,
  GlobeAltIcon,
  ServerIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

const fetcher = (url: string) =>
  fetch(url, { headers: { 'x-admin': 'true' } }).then((r) => r.json());

export default function HealthPage() {
  const { data, isLoading } = useSWR('/api/health', fetcher, { refreshInterval: 60000 });
  const [checking, setChecking] = useState(false);

  const health = data?.data;

  async function runLinkCheck() {
    setChecking(true);
    try {
      const res = await fetch('/api/health', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        toast.success(`Checked ${result.data.checked} links. ${result.data.broken} broken.`);
        mutate('/api/health');
      }
    } catch {
      toast.error('Link check failed');
    } finally {
      setChecking(false);
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
            <p className="text-gray-500 mt-1">Monitor platform status and content quality</p>
          </div>
          <button onClick={runLinkCheck} disabled={checking} className="btn-secondary">
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Run Link Check'}
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            title="Database"
            status={health?.database ? 'ok' : 'error'}
            icon={CircleStackIcon}
            detail={health?.database ? 'Connected' : 'Unavailable'}
            loading={isLoading}
          />
          <StatusCard
            title="Storage (S3)"
            status={health?.storage ? 'ok' : 'error'}
            icon={ServerIcon}
            detail={health?.storage ? 'Connected' : 'Unavailable'}
            loading={isLoading}
          />
          <StatusCard
            title="Broken Links"
            status={health?.brokenLinks > 0 ? 'warning' : 'ok'}
            icon={LinkIcon}
            detail={`${health?.brokenLinks || 0} broken`}
            loading={isLoading}
          />
          <StatusCard
            title="Translations"
            status={health?.missingTranslations > 0 ? 'warning' : 'ok'}
            icon={GlobeAltIcon}
            detail={`${health?.missingTranslations || 0} missing`}
            loading={isLoading}
          />
        </div>

        {/* Content Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Summary</h2>
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-200 rounded" />)}
              </div>
            ) : (
              <div className="space-y-3">
                <SummaryRow label="Total Resources" value={health?.resources?.total || 0} />
                <SummaryRow label="Published Resources" value={health?.resources?.published || 0} color="green" />
                <SummaryRow label="Draft Resources" value={health?.resources?.draft || 0} color="amber" />
                <SummaryRow label="Categories" value={health?.categories || 0} />
                <SummaryRow label="CMS Pages" value={health?.pages || 0} />
              </div>
            )}
          </div>

          <div className="admin-card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Checks</h2>
            <div className="space-y-3">
              <QualityCheck
                label="All resources have Arabic translations"
                pass={(health?.missingArResources || 0) === 0}
                detail={health?.missingArResources ? `${health.missingArResources} missing` : 'All translated'}
              />
              <QualityCheck
                label="All pages have Arabic translations"
                pass={(health?.missingArPages || 0) === 0}
                detail={health?.missingArPages ? `${health.missingArPages} missing` : 'All translated'}
              />
              <QualityCheck
                label="No broken external links"
                pass={(health?.brokenLinks || 0) === 0}
                detail={health?.brokenLinks ? `${health.brokenLinks} broken` : 'All links OK'}
              />
              <QualityCheck
                label="Database connectivity"
                pass={health?.database === true}
                detail={health?.database ? 'Healthy' : 'Check required'}
              />
            </div>
          </div>
        </div>

        {/* System info */}
        <div className="admin-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Last Health Check:</span>
              <span className="ml-2 text-gray-900">{health?.lastCheckAt ? new Date(health.lastCheckAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Environment:</span>
              <span className="ml-2 text-gray-900">{process.env.NODE_ENV || 'development'}</span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatusCard({ title, status, icon: Icon, detail, loading }: {
  title: string; status: 'ok' | 'warning' | 'error'; icon: any; detail: string; loading: boolean;
}) {
  const statusConfig = {
    ok: { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircleIcon },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', icon: ExclamationTriangleIcon },
    error: { bg: 'bg-red-50', text: 'text-red-600', icon: XCircleIcon },
  };
  const config = statusConfig[status] || statusConfig.ok;

  return (
    <div className={`admin-card ${config.bg}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${config.text}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {loading ? (
            <div className="animate-pulse h-4 w-16 bg-gray-200 rounded mt-1" />
          ) : (
            <p className={`text-xs ${config.text}`}>{detail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: number; color?: string }) {
  const colorClass = color === 'green' ? 'text-green-600' : color === 'amber' ? 'text-amber-600' : 'text-gray-900';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${colorClass}`}>{value}</span>
    </div>
  );
}

function QualityCheck({ label, pass, detail }: { label: string; pass: boolean; detail: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {pass ? (
        <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      )}
      <div>
        <p className="text-sm text-gray-900">{label}</p>
        <p className={`text-xs ${pass ? 'text-green-600' : 'text-amber-600'}`}>{detail}</p>
      </div>
    </div>
  );
}
