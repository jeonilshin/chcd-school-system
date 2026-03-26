'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TeacherAnnouncements } from '@/components/teacher-announcements';

export default function TeacherAnnouncementsPage() {
  return (
    <ProtectedRoute allowedRoles={['TEACHER']}>
      <TeacherAnnouncements />
    </ProtectedRoute>
  );
}
