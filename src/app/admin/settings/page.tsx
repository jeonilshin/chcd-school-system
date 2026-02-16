'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminLayout } from '@/components/admin-layout';
import { SchoolSettings } from '@/components/school-settings';

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <SchoolSettings />
      </AdminLayout>
    </ProtectedRoute>
  );
}
