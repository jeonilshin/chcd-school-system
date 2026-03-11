'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminLayout } from '@/components/admin-layout';
import { EnrollmentsList } from '@/components/enrollments-list';

export default function EnrollmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <EnrollmentsList />
      </AdminLayout>
    </ProtectedRoute>
  );
}
