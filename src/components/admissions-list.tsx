'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  firstName: string;
  lastName: string;
  middleName: string;
  program: string;
  schoolYear: string;
  studentStatus: string;
  motherEmail: string;
  fatherEmail: string;
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

export function AdmissionsList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isAdmitting, setIsAdmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, classesRes] = await Promise.all([
        fetch('/api/admissions/pending'),
        fetch('/api/classes'),
      ]);

      if (enrollmentsRes.ok) {
        const data = await enrollmentsRes.json();
        setEnrollments(data.enrollments || []);
      }

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdmitClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setSelectedClassId('');
    setShowAdmitModal(true);
  };

  const handleAdmit = async () => {
    if (!selectedEnrollment) return;

    setIsAdmitting(true);
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment.id,
          classId: selectedClassId || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Student admitted successfully!\nStudent ID: ${data.student.studentId}`);
        setShowAdmitModal(false);
        fetchData(); // Refresh list
      } else {
        const error = await response.json();
        alert(`Failed to admit student: ${error.error}`);
      }
    } catch (error) {
      console.error('Error admitting student:', error);
      alert('Failed to admit student');
    } finally {
      setIsAdmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAvailableClasses = () => {
    if (!selectedEnrollment) return [];
    return classes.filter(
      (c) =>
        c.program === selectedEnrollment.program &&
        c._count.Students < c.capacity
    );
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
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Home</span>
              <span>/</span>
              <span>Students</span>
              <span>/</span>
              <span className="text-gray-900">Admissions</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Student Admissions</h1>
            <p className="text-sm text-gray-500 mt-1">
              Admit approved enrollments as active students
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Pending Admissions</CardTitle>
              <CardDescription>
                {enrollments.length} approved enrollment(s) ready for admission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Parent Email</TableHead>
                      <TableHead>Approved On</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No pending admissions
                        </TableCell>
                      </TableRow>
                    ) : (
                      enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.firstName} {enrollment.middleName.charAt(0)}. {enrollment.lastName}
                          </TableCell>
                          <TableCell>{enrollment.program}</TableCell>
                          <TableCell>{enrollment.schoolYear}</TableCell>
                          <TableCell>
                            {enrollment.studentStatus === 'NEW_STUDENT' ? 'New' : 'Old'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {enrollment.motherEmail || enrollment.fatherEmail}
                          </TableCell>
                          <TableCell>{formatDate(enrollment.updatedAt)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleAdmitClick(enrollment)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Admit Student
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
      </div>

      {/* Admit Modal */}
      {showAdmitModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Admit Student</CardTitle>
              <CardDescription>
                Admit {selectedEnrollment.firstName} {selectedEnrollment.lastName} as an active student
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Program</Label>
                <Input value={selectedEnrollment.program} disabled />
              </div>
              <div>
                <Label>School Year</Label>
                <Input value={selectedEnrollment.schoolYear} disabled />
              </div>
              <div>
                <Label htmlFor="class">Assign to Class (Optional)</Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No class (assign later)</SelectItem>
                    {getAvailableClasses().map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.section && `- ${cls.section}`} ({cls._count.Students}/{cls.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getAvailableClasses().length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No available classes for this program. Student will be admitted without a class.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAdmitModal(false)}
                  disabled={isAdmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAdmit}
                  disabled={isAdmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isAdmitting ? 'Admitting...' : 'Admit Student'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
