import { Badge } from '@/components/ui/badge';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
}

export function EnrollmentStatusBadge({ status }: EnrollmentStatusBadgeProps) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
          Pending
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-700"></span>
          Approved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-700"></span>
          Rejected
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}
