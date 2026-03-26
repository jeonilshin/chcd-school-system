'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { ParentMessagingEnhanced } from '@/components/parent-messaging-enhanced';

export default function ParentMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={['PARENT']}>
      <div className="min-h-screen bg-gray-50">
        <ParentMessagingEnhanced />
      </div>
    </ProtectedRoute>
  );
}
