'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { StudentsList } from '@/components/students-list';
import { AdminLayout } from '@/components/admin-layout';

export default function StudentsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <StudentsList />
      </AdminLayout>
    </ProtectedRoute>
  );
}
