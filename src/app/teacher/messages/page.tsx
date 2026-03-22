'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { TeacherMessaging } from '@/components/teacher-messaging';

export default function TeacherMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={['TEACHER']}>
      <TeacherMessaging />
    </ProtectedRoute>
  );
}
