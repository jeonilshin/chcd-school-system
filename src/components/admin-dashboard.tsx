'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

interface EnrollmentFilters {
  schoolYear?: string;
  program?: string;
  studentStatus?: StudentStatus;
  status?: EnrollmentStatus;
}

interface AdminDashboardProps {
  userRole: 'ADMIN' | 'PRINCIPAL';
}

export function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentListItem[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<EnrollmentListItem[]>([]);
  const [filters, setFilters] = useState<EnrollmentFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [enrollments, filters]);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/enrollments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const data = await response.json();
      const enrollmentList = data.enrollments.map((e: any) => ({
        id: e.id,
        studentName: `${e.firstName} ${e.lastName}`,
        schoolYear: e.schoolYear,
        program: e.program,
        studentStatus: e.studentStatus,
        status: e.status,
        submittedAt: new Date(e.createdAt),
      }));
      
      setEnrollments(enrollmentList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...enrollments];

    if (filters.schoolYear) {
      filtered = filtered.filter(e => e.schoolYear === filters.schoolYear);
    }

    if (filters.program) {
      filtered = filtered.filter(e => e.program === filters.program);
    }

    if (filters.studentStatus) {
      filtered = filtered.filter(e => e.studentStatus === filters.studentStatus);
    }

    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    setFilteredEnrollments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const updateFilter = (key: keyof EnrollmentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  // Pagination
  const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading enrollments...</p>
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
          <CardTitle>Enrollment Applications</CardTitle>
          <CardDescription>
            View and manage all student enrollment applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">School Year</label>
              <Select
                value={filters.schoolYear || 'all'}
                onValueChange={(value) => updateFilter('schoolYear', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Program</label>
              <Select
                value={filters.program || 'all'}
                onValueChange={(value) => updateFilter('program', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programs</SelectItem>
                  <SelectItem value="Playschool AM">Playschool AM</SelectItem>
                  <SelectItem value="Playschool PM">Playschool PM</SelectItem>
                  <SelectItem value="Nursery">Nursery</SelectItem>
                  <SelectItem value="Kinder">Kinder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Student Status</label>
              <Select
                value={filters.studentStatus || 'all'}
                onValueChange={(value) => updateFilter('studentStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="OLD_STUDENT">Old Student</SelectItem>
                  <SelectItem value="NEW_STUDENT">New Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enrollment Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {currentEnrollments.length} of {filteredEnrollments.length} enrollments
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
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
                {currentEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.studentName}
                      </TableCell>
                      <TableCell>{enrollment.schoolYear}</TableCell>
                      <TableCell>{enrollment.program}</TableCell>
                      <TableCell>{formatStudentStatus(enrollment.studentStatus)}</TableCell>
                      <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                      <TableCell>{formatDate(enrollment.submittedAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/admin/enrollments/${enrollment.id}`}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
