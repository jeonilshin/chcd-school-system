'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TeachersManagement } from '@/components/teachers-management';
import { AdminLayout } from '@/components/admin-layout';

export default function TeachersPage() {
  return (
    <ProtectedRoute allowedRoles={['PRINCIPAL']}>
      <AdminLayout>
        <TeachersManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
