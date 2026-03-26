'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TeacherAssignments } from '@/components/teacher-assignments';

export default function TeacherAssignmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['TEACHER']}>
      <TeacherAssignments />
    </ProtectedRoute>
  );
}
