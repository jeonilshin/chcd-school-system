'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminLayout } from '@/components/admin-layout';
import { GradesManagement } from '@/components/grades-management';

export default function GradesPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <GradesManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
