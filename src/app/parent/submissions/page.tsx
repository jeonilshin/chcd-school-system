'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { ParentSubmissions } from '@/components/parent-submissions';

/**
 * Parent submissions page - protected route for PARENT role
 */
export default function ParentSubmissionsPage() {
  return (
    <ProtectedRoute allowedRoles={['PARENT']}>
      <ParentSubmissions />
    </ProtectedRoute>
  );
}
