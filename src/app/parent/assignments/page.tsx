'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { ParentAssignments } from '@/components/parent-assignments';

export default function ParentAssignmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['PARENT']}>
      <div className="min-h-screen bg-gray-50">
        <ParentAssignments />
      </div>
    </ProtectedRoute>
  );
}
