'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminMessaging } from '@/components/admin-messaging';
import { AdminLayout } from '@/components/admin-layout';

export default function AdminMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <AdminMessaging />
      </AdminLayout>
    </ProtectedRoute>
  );
}
