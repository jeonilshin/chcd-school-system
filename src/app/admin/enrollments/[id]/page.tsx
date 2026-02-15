'use client';

import { useParams, useRouter } from 'next/navigation';
import { EnrollmentDetail } from '@/components/enrollment-detail';
import { ProtectedRoute } from '@/components/protected-route';
import { AdminLayout } from '@/components/admin-layout';

export default function EnrollmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const enrollmentId = params.id as string;

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/enrollments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve enrollment');
      }

      // Optionally redirect back to dashboard
      // router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error approving enrollment:', error);
      throw error;
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/enrollments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject enrollment');
      }

      // Optionally redirect back to dashboard
      // router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
      throw error;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
      <AdminLayout>
        <EnrollmentDetail
          enrollmentId={enrollmentId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
