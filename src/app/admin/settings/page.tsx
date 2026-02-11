'use client';

import AdminShell from '@/components/admin/AdminShell';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <AdminShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Platform configuration and user management</p>
        </div>

        <div className="admin-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Name</span>
              <span className="text-sm font-medium text-gray-900">{session?.user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-medium text-gray-900">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Role</span>
              <span className="text-sm font-medium text-gray-900">{(session?.user as any)?.role}</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h2>
          <div className="space-y-3 text-sm text-gray-500">
            <p>Site: <span className="text-gray-900">finance.causewaygrp.com</span></p>
            <p>Default Language: <span className="text-gray-900">English</span></p>
            <p>Max Upload Size: <span className="text-gray-900">{process.env.MAX_UPLOAD_SIZE_MB || 15}MB</span></p>
            <p>Supported Formats: <span className="text-gray-900">PDF, DOCX, XLSX, PPTX, Images</span></p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
