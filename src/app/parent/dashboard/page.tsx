'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { ParentDashboard } from '@/components/parent-dashboard';

export default function ParentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['PARENT']}>
      <ParentDashboard />
    </ProtectedRoute>
  );
}
