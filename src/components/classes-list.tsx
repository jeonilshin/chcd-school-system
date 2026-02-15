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

interface Class {
  id: string;
  name: string;
  program: string;
  schoolYear: string;
  section: string | null;
  capacity: number;
  roomNumber: string | null;
  Teacher: {
    id: string;
    name: string;
  } | null;
  _count: {
    Students: number;
  };
}

interface Teacher {
  id: string;
  name: string;
  subject: string;
}

export function ClassesList() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    program: '',
    schoolYear: '2025-2026',
    section: '',
    capacity: '30',
    teacherId: '',
    roomNumber: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes] = await Promise.all([
        fetch('/api/classes'),
        fetch('/api/teachers'),
      ]);

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes || []);
      }

      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          teacherId: formData.teacherId || null,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({
          name: '',
          program: '',
          schoolYear: '2025-2026',
          section: '',
          capacity: '30',
          teacherId: '',
          roomNumber: '',
        });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;

    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
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
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Home</span>
              <span>/</span>
              <span className="text-gray-900">Classes</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">All Classes</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Classes Information</CardTitle>
                  <CardDescription>Manage all classes and sections</CardDescription>
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create New Class
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>School Year</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No classes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">
                            {cls.name} {cls.section && `- ${cls.section}`}
                          </TableCell>
                          <TableCell>{cls.program}</TableCell>
                          <TableCell>{cls.schoolYear}</TableCell>
                          <TableCell>
                            {cls.Teacher ? cls.Teacher.name : <span className="text-gray-400">Not assigned</span>}
                          </TableCell>
                          <TableCell>{cls.roomNumber || '-'}</TableCell>
                          <TableCell>
                            <span className={cls._count.Students >= cls.capacity ? 'text-red-600 font-medium' : ''}>
                              {cls._count.Students} / {cls.capacity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => (window.location.href = `/admin/classes/${cls.id}`)}
                              >
                                View Roster
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(cls.id)}
                              >
                                Delete
                              </Button>
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Class</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Playschool AM"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      placeholder="e.g., A, B, C"
                    />
                  </div>
                  <div>
                    <Label htmlFor="program">Program *</Label>
                    <Select
                      value={formData.program}
                      onValueChange={(value) => setFormData({ ...formData, program: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Playschool AM">Playschool AM</SelectItem>
                        <SelectItem value="Playschool PM">Playschool PM</SelectItem>
                        <SelectItem value="Nursery">Nursery</SelectItem>
                        <SelectItem value="Kinder">Kinder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="schoolYear">School Year *</Label>
                    <Select
                      value={formData.schoolYear}
                      onValueChange={(value) => setFormData({ ...formData, schoolYear: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                        <SelectItem value="2026-2027">2026-2027</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      placeholder="e.g., 101"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="teacherId">Class Teacher</Label>
                    <Select
                      value={formData.teacherId}
                      onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No teacher assigned</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} - {teacher.subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Create Class
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
