'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { StudentDetail } from '@/components/student-detail';
import { useParams } from 'next/navigation';

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <StudentDetail studentId={studentId} />
    </ProtectedRoute>
  );
}
