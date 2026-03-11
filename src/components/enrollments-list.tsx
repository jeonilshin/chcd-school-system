'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatProgram } from '@/lib/format-program';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Enrollment {
  id: string;
  studentName: string;
  program: string;
  schoolYear: string;
  studentStatus: string;
  status: string;
  submittedAt: Date;
  hasParentAccount: boolean;
  parentEmail: string;
}

export function EnrollmentsList() {
  const { buttonClasses } = useThemeColor();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  useEffect(() => {
    filterEnrollments();
  }, [enrollments, searchQuery, filterStatus]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments');
      if (response.ok) {
        const data = await response.json();
        const enrollmentsData = data.enrollments || [];
        
        // Add hasParentAccount and parentEmail fields
        const enrichedEnrollments = enrollmentsData.map((e: any) => ({
          ...e,
          hasParentAccount: e.userId && e.userId !== 'pending',
          parentEmail: e.responsiblePersonEmail || e.motherEmail || e.fatherEmail || 'No email',
        }));
        
        setEnrollments(enrichedEnrollments);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEnrollments = () => {
    let filtered = [...enrollments];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.studentName.toLowerCase().includes(query) ||
          e.id.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((e) => e.status === filterStatus);
    }

    setFilteredEnrollments(filtered);
  };

  const createParentAccount = async (enrollmentId: string, email: string) => {
    if (!confirm(`Create parent account for ${email}?\n\nDefault password will be: password123\nParent will be required to change password on first login.`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/create-parent-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, email }),
      });

      if (response.ok) {
        alert(`Parent account created successfully!\n\nEmail: ${email}\nPassword: password123\n\nParent must change password on first login.`);
        fetchEnrollments();
      } else {
        const error = await response.json();
        alert(`Failed to create account: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating parent account:', error);
      alert('Failed to create parent account');
    }
  };

  const deleteEnrollment = async (enrollmentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete the enrollment for ${studentName}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Enrollment deleted successfully');
        fetchEnrollments();
      } else {
        const error = await response.json();
        alert(`Failed to delete enrollment: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('Failed to delete enrollment');
    }
  };

  const getStatusBadge = (status: string) => {
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

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const pendingCount = enrollments.filter(e => e.status === 'PENDING').length;
  const approvedCount = enrollments.filter(e => e.status === 'APPROVED').length;
  const rejectedCount = enrollments.filter(e => e.status === 'REJECTED').length;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Home</span>
              <span>/</span>
              <span>Students</span>
              <span>/</span>
              <span className="text-gray-900">Enrollments</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Enrollment Applications</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all enrollment applications
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Approved</p>
                    <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollments Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Enrollments</CardTitle>
                  <CardDescription>
                    {filteredEnrollments.length} enrollment(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="w-64">
                  <Input
                    placeholder="Search by name or ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Parent Account</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No enrollments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.studentName}</TableCell>
                          <TableCell>{enrollment.schoolYear}</TableCell>
                          <TableCell>{formatProgram(enrollment.program)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {enrollment.studentStatus === 'NEW_STUDENT' ? 'New' : 'Old'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                          <TableCell>{formatDate(enrollment.submittedAt)}</TableCell>
                          <TableCell>
                            {enrollment.status === 'APPROVED' ? (
                              enrollment.hasParentAccount ? (
                                <Badge variant="success">✓ Created</Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => createParentAccount(enrollment.id, enrollment.parentEmail)}
                                >
                                  Create Account
                                </Button>
                              )
                            ) : enrollment.status === 'REJECTED' ? (
                              <span className="text-sm text-gray-500">N/A</span>
                            ) : (
                              <span className="text-sm text-gray-500">Pending approval</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => (window.location.href = `/admin/enrollments/${enrollment.id}`)}
                              >
                                View Details
                              </Button>
                              {enrollment.status === 'REJECTED' && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteEnrollment(enrollment.id, enrollment.studentName)}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
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
      </div>
    </div>
  );
}
