'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThemeColor } from '@/hooks/use-theme-color';

export function GradesManagement() {
  const { buttonClasses } = useThemeColor();
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const [filters, setFilters] = useState({
    studentId: '',
    schoolYear: new Date().getFullYear().toString(),
    quarter: '',
  });
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    quarter: 'First Quarter',
    grade: '',
    remarks: '',
    teacher: '',
    schoolYear: new Date().getFullYear().toString(),
  });

  // Standard subject list
  const subjects = [
    'Mathematics',
    'English',
    'Science',
    'Filipino',
    'Araling Panlipunan (Social Studies)',
    'MAPEH (Music, Arts, PE, Health)',
    'Edukasyon sa Pagpapakatao (Values Education)',
    'Technology and Livelihood Education (TLE)',
    'Computer',
    'Reading',
    'Writing',
  ];

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchGrades();
  }, [filters]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students?status=ACTIVE');
      if (response.ok) {
        const data = await response.json();
        setStudents(Array.isArray(data.students) ? data.students : []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const fetchGrades = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.studentId) params.append('studentId', filters.studentId);
      if (filters.schoolYear) params.append('schoolYear', filters.schoolYear);
      if (filters.quarter) params.append('quarter', filters.quarter);

      const response = await fetch(`/api/grades?${params}`);
      if (response.ok) {
        const data = await response.json();
        setGrades(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingGrade ? `/api/grades/${editingGrade.id}` : '/api/grades';
      const method = editingGrade ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingGrade(null);
        setFormData({
          studentId: '',
          subject: '',
          quarter: 'First Quarter',
          grade: '',
          remarks: '',
          teacher: '',
          schoolYear: new Date().getFullYear().toString(),
        });
        fetchGrades();
      }
    } catch (error) {
      console.error('Error saving grade:', error);
    }
  };

  const handleEdit = (grade: any) => {
    setEditingGrade(grade);
    setFormData({
      studentId: grade.studentId,
      subject: grade.subject,
      quarter: grade.quarter,
      grade: grade.grade.toString(),
      remarks: grade.remarks || '',
      teacher: grade.teacher || '',
      schoolYear: grade.schoolYear,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this grade?')) return;

    try {
      const response = await fetch(`/api/grades/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchGrades();
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600 font-bold';
    if (grade >= 80) return 'text-blue-600 font-semibold';
    if (grade >= 75) return 'text-yellow-600';
    return 'text-red-600 font-semibold';
  };

  if (loading) {
    return <div className="p-8">Loading grades...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Grades Management</h1>
          <Button onClick={() => { setShowForm(!showForm); setEditingGrade(null); }} className={buttonClasses}>
            {showForm ? 'Cancel' : 'Add Grade'}
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Student</label>
              <select
                value={filters.studentId}
                onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.lastName}, {student.firstName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">School Year</label>
              <Input
                type="text"
                value={filters.schoolYear}
                onChange={(e) => setFilters({ ...filters, schoolYear: e.target.value })}
                placeholder="2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quarter</label>
              <select
                value={filters.quarter}
                onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
                className="w-full border rounded-md p-2"
              >
                <option value="">All Quarters</option>
                <option value="First Quarter">First Quarter</option>
                <option value="Second Quarter">Second Quarter</option>
                <option value="Third Quarter">Third Quarter</option>
                <option value="Fourth Quarter">Fourth Quarter</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchGrades} className={buttonClasses}>
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{editingGrade ? 'Edit Grade' : 'Add New Grade'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Student *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full border rounded-md p-2"
                    required
                    disabled={!!editingGrade}
                  >
                    <option value="">Select Student</option>
                    {Array.isArray(students) && students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.lastName}, {student.firstName} ({student.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border rounded-md p-2"
                    required
                    disabled={!!editingGrade}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quarter *</label>
                  <select
                    value={formData.quarter}
                    onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                    className="w-full border rounded-md p-2"
                    required
                    disabled={!!editingGrade}
                  >
                    <option value="First Quarter">First Quarter</option>
                    <option value="Second Quarter">Second Quarter</option>
                    <option value="Third Quarter">Third Quarter</option>
                    <option value="Fourth Quarter">Fourth Quarter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Grade *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="0-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teacher</label>
                  <select
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Select Teacher (Optional)</option>
                    {Array.isArray(teachers) && teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.name}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">School Year *</label>
                  <Input
                    value={formData.schoolYear}
                    onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                    placeholder="2024"
                    required
                    disabled={!!editingGrade}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border rounded-md p-2"
                  rows={2}
                  placeholder="Optional remarks"
                />
              </div>
              <Button type="submit" className={buttonClasses}>
                {editingGrade ? 'Update Grade' : 'Add Grade'}
              </Button>
            </form>
          </Card>
        )}

        {/* Grades List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quarter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No grades found. Add grades using the form above.
                    </td>
                  </tr>
                ) : (
                  grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.Student.lastName}, {grade.Student.firstName}
                        </div>
                        <div className="text-sm text-gray-500">{grade.Student.studentId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.quarter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.teacher || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {grade.remarks || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(grade)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(grade.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
