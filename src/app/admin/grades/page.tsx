'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminLayout } from '@/components/admin-layout';
import { ComingSoonPage } from '@/components/coming-soon-page';

export default function GradesPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <ComingSoonPage
          title="Grades Management"
          description="Manage student grades and academic performance"
          icon={
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
