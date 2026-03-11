'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatProgram } from '@/lib/format-program';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  program: string;
  schoolYear: string;
  status: string;
  profilePictureUrl: string | null;
  motherContactNumber: string;
  fatherContactNumber: string;
  motherEmail: string;
  fatherEmail: string;
  presentAddress: string;
  Class: {
    id: string;
    name: string;
    section: string | null;
    program: string;
  } | null;
  Enrollment: {
    id: string;
    personalInfo: any;
    parentInfo: any;
    studentHistory: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface Class {
  id: string;
  name: string;
  section: string | null;
  program: string;
  _count: {
    Students: number;
  };
  capacity: number;
}

interface StudentDetailProps {
  studentId: string;
}

export function StudentDetail({ studentId }: StudentDetailProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('none');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');

  useEffect(() => {
    fetchStudentDetail();
    fetchClasses();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/students/${studentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student details');
      }

      const data = await response.json();
      setStudent(data.student);
      setSelectedClassId(data.student.Class?.id || 'none');
      setSelectedStatus(data.student.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleUpdateClass = async () => {
    if (!student) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClassId === 'none' ? null : selectedClassId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update class assignment');
      }

      await fetchStudentDetail();
      alert('Class assignment updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!student) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update student status');
      }

      await fetchStudentDetail();
      alert('Student status updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
      GRADUATED: 'success',
      TRANSFERRED: 'warning',
      WITHDRAWN: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAvailableClasses = () => {
    if (!student) return [];
    return classes.filter(
      (c) =>
        c.program === student.program &&
        (c._count.Students < c.capacity || c.id === student.Class?.id)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading student details...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Student not found'}</p>
            <Button onClick={fetchStudentDetail} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Home</span>
                <span>/</span>
                <span>Students</span>
                <span>/</span>
                <span className="text-gray-900">Details</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.firstName} {student.middleName} {student.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Student ID: {student.studentId}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge(student.status)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Student Profile Card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                {student.profilePictureUrl ? (
                  <img
                    src={student.profilePictureUrl}
                    alt={`${student.firstName} ${student.lastName}`}
                    className="w-32 h-32 rounded-lg object-cover border-4 border-purple-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-4xl font-bold text-purple-600">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Program</p>
                    <p className="text-base font-semibold">{formatProgram(student.program)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">School Year</p>
                    <p className="text-base font-semibold">{student.schoolYear}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Class</p>
                    <p className="text-base font-semibold">
                      {student.Class ? (
                        <>
                          {student.Class.name}
                          {student.Class.section && ` - ${student.Class.section}`}
                        </>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enrolled On</p>
                    <p className="text-base">{formatDate(student.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-base">{formatDate(student.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Class Assignment</CardTitle>
                <CardDescription>Assign or change student's class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Class</label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No class (unassign)</SelectItem>
                      {getAvailableClasses().map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.section && `- ${cls.section}`} ({cls._count.Students}/{cls.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getAvailableClasses().length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      No available classes for this program.
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleUpdateClass}
                  disabled={isUpdating || selectedClassId === (student.Class?.id || 'none')}
                  className="w-full"
                >
                  {isUpdating ? 'Updating...' : 'Update Class'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Student Status</CardTitle>
                <CardDescription>Update student enrollment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="GRADUATED">Graduated</SelectItem>
                      <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                      <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || selectedStatus === student.status}
                  className="w-full"
                  variant={selectedStatus === 'WITHDRAWN' ? 'destructive' : 'default'}
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mother's Contact</p>
                <p className="text-base">{student.motherContactNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Father's Contact</p>
                <p className="text-base">{student.fatherContactNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mother's Email</p>
                <p className="text-base">{student.motherEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Father's Email</p>
                <p className="text-base">{student.fatherEmail || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Present Address</p>
                <p className="text-base">{student.presentAddress}</p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information from Enrollment */}
          {student.Enrollment?.personalInfo && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="text-base">
                    {student.Enrollment.personalInfo.firstName} {student.Enrollment.personalInfo.middleName} {student.Enrollment.personalInfo.lastName}
                    {student.Enrollment.personalInfo.nameExtension && ` ${student.Enrollment.personalInfo.nameExtension}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nickname</p>
                  <p className="text-base">{student.Enrollment.personalInfo.nickname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sex</p>
                  <p className="text-base">{student.Enrollment.personalInfo.sex === 'FEMALE' ? 'Female' : 'Male'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-base">{student.Enrollment.personalInfo.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Birthday</p>
                  <p className="text-base">{formatDate(student.Enrollment.personalInfo.birthday)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Place of Birth</p>
                  <p className="text-base">{student.Enrollment.personalInfo.placeOfBirth}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Religion</p>
                  <p className="text-base">{student.Enrollment.personalInfo.religion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                  <p className="text-base">{student.Enrollment.personalInfo.contactNumber}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Parent Information from Enrollment */}
          {student.Enrollment?.parentInfo && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Parent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Father's Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-base">{student.Enrollment.parentInfo.fatherFullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                      <p className="text-base">{student.Enrollment.parentInfo.fatherOccupation || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Mother's Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-base">{student.Enrollment.parentInfo.motherFullName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Occupation</p>
                      <p className="text-base">{student.Enrollment.parentInfo.motherOccupation || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
