'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { ParentAnnouncements } from '@/components/parent-announcements';

export default function ParentAnnouncementsPage() {
  return (
    <ProtectedRoute allowedRoles={['PARENT']}>
      <ParentAnnouncements />
    </ProtectedRoute>
  );
}
