'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface EnrollmentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  newStudents: number;
  oldStudents: number;
}

interface Enrollment {
  id: string;
  studentName: string;
  schoolYear: string;
  program: string;
  studentStatus: string;
  status: string;
  submittedAt: Date;
  hasParentAccount: boolean;
  parentEmail: string;
}

export function EnhancedAdminDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<EnrollmentStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    newStudents: 0,
    oldStudents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

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
        calculateStats(enrichedEnrollments);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (enrollments: Enrollment[]) => {
    const stats = {
      total: enrollments.length,
      pending: enrollments.filter(e => e.status === 'PENDING').length,
      approved: enrollments.filter(e => e.status === 'APPROVED').length,
      rejected: enrollments.filter(e => e.status === 'REJECTED').length,
      newStudents: enrollments.filter(e => e.studentStatus === 'NEW_STUDENT').length,
      oldStudents: enrollments.filter(e => e.studentStatus === 'OLD_STUDENT').length,
    };
    setStats(stats);
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

  const filteredEnrollments = enrollments.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (filterYear !== 'all' && e.schoolYear !== filterYear) return false;
    return true;
  });

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
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

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage student enrollments and parent accounts</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="What do you want to find?"
                className="w-80 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-gray-500">Total Enrollments</CardDescription>
                <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-gray-500">Pending</CardDescription>
                <CardTitle className="text-3xl font-bold text-yellow-600">{stats.pending}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-gray-500">Approved</CardDescription>
                <CardTitle className="text-3xl font-bold text-green-600">{stats.approved}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-gray-500">Rejected</CardDescription>
                <CardTitle className="text-3xl font-bold text-red-600">{stats.rejected}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-gray-500">New Students</CardDescription>
                <CardTitle className="text-3xl font-bold text-blue-600">{stats.newStudents}</CardTitle>
              </CardHeader>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-gray-500">Old Students</CardDescription>
                <CardTitle className="text-3xl font-bold text-purple-600">{stats.oldStudents}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters and Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Enrollment Applications</CardTitle>
              <CardDescription>Review and manage student enrollments</CardDescription>
            </CardHeader>
            <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
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
            
            <div className="w-48">
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                  <SelectItem value="2026-2027">2026-2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                      <TableCell>{enrollment.program}</TableCell>
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
                            onClick={() => window.location.href = `/admin/enrollments/${enrollment.id}`}
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
