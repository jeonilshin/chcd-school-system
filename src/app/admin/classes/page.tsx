'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { ClassesList } from '@/components/classes-list';
import { AdminLayout } from '@/components/admin-layout';

export default function ClassesPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <ClassesList />
      </AdminLayout>
    </ProtectedRoute>
  );
}
