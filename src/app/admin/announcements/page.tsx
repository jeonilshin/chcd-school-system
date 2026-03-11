'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminLayout } from '@/components/admin-layout';
import { AnnouncementsManagement } from '@/components/announcements-management';

export default function AnnouncementsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <AnnouncementsManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
