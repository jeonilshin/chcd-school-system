'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminLayout } from '@/components/admin-layout';
import { ComingSoonPage } from '@/components/coming-soon-page';

export default function AttendancePage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <ComingSoonPage
          title="Attendance Management"
          description="Track and manage student attendance"
          icon={
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
