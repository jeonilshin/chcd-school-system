'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TeacherDashboard } from '@/components/teacher-dashboard';

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['TEACHER']}>
      <TeacherDashboard />
    </ProtectedRoute>
  );
}
