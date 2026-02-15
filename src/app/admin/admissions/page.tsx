'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdmissionsList } from '@/components/admissions-list';
import { AdminLayout } from '@/components/admin-layout';

export default function AdmissionsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <AdmissionsList />
      </AdminLayout>
    </ProtectedRoute>
  );
}
