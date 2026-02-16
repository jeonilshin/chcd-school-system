'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EnrollmentStatusBadge } from '@/components/enrollment-status-badge';
import { formatProgram } from '@/lib/format-program';

type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type StudentStatus = 'OLD_STUDENT' | 'NEW_STUDENT';

interface EnrollmentListItem {
  id: string;
  studentName: string;
  schoolYear: string;
  program: string;
  studentStatus: StudentStatus;
  status: EnrollmentStatus;
  submittedAt: Date;
}

export function ParentSubmissions() {
  const [enrollments, setEnrollments] = useState<EnrollmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch enrollments - API will automatically filter by current user (parent)
      const response = await fetch('/api/enrollments');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You must be logged in to view your submissions');
        }
        if (response.status === 403) {
          throw new Error('You do not have permission to view enrollments');
        }
        throw new Error('Failed to fetch enrollments');
      }

      const data = await response.json();
      const enrollmentList = data.enrollments.map((e: any) => ({
        id: e.id,
        studentName: e.studentName,
        schoolYear: e.schoolYear,
        program: e.program,
        studentStatus: e.studentStatus,
        status: e.status,
        submittedAt: new Date(e.submittedAt),
      }));
      
      setEnrollments(enrollmentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatStudentStatus = (status: StudentStatus) => {
    return status === 'OLD_STUDENT' ? 'Old Student' : 'New Student';
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading your submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchEnrollments} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Enrollment Submissions</CardTitle>
          <CardDescription>
            View the status of your enrollment applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {enrollments.length} {enrollments.length === 1 ? 'submission' : 'submissions'}
            </p>
            <Button onClick={fetchEnrollments} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Enrollments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>School Year</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Student Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No enrollment submissions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.studentName}
                      </TableCell>
                      <TableCell>{enrollment.schoolYear}</TableCell>
                      <TableCell>{formatProgram(enrollment.program)}</TableCell>
                      <TableCell>{formatStudentStatus(enrollment.studentStatus)}</TableCell>
                      <TableCell>
                        <EnrollmentStatusBadge status={enrollment.status} />
                      </TableCell>
                      <TableCell>{formatDate(enrollment.submittedAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/parent/enrollments/${enrollment.id}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
