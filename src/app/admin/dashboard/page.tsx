'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { EnhancedAdminDashboard } from '@/components/enhanced-admin-dashboard';
import { AdminLayout } from '@/components/admin-layout';

/**
 * Admin dashboard page - protected route for ADMIN and PRINCIPAL roles
 */
export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <EnhancedAdminDashboard />
      </AdminLayout>
    </ProtectedRoute>
  );
}
