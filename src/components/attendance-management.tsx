'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThemeColor } from '@/hooks/use-theme-color';

export function AttendanceManagement() {
  const { buttonClasses } = useThemeColor();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendance();
    }
  }, [selectedDate, selectedClass]);

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

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedClass) params.append('classId', selectedClass);

      const response = await fetch(`/api/attendance?${params}`);
      if (response.ok) {
        const data = await response.json();
        const attendanceData = Array.isArray(data) ? data : [];
        setAttendance(attendanceData);
        
        // Initialize bulk status
        const statusMap: Record<string, string> = {};
        attendanceData.forEach((att: any) => {
          statusMap[att.studentId] = att.status;
        });
        setBulkStatus(statusMap);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: string) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          date: selectedDate,
          status,
          timeIn: status === 'PRESENT' || status === 'LATE' ? new Date().toLocaleTimeString() : null,
        }),
      });

      if (response.ok) {
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const handleBulkSave = async () => {
    try {
      const promises = Object.entries(bulkStatus).map(([studentId, status]) =>
        fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            date: selectedDate,
            status,
            timeIn: status === 'PRESENT' || status === 'LATE' ? new Date().toLocaleTimeString() : null,
          }),
        })
      );

      await Promise.all(promises);
      setBulkMode(false);
      fetchAttendance();
    } catch (error) {
      console.error('Error saving bulk attendance:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  const filteredStudents = selectedClass
    ? students.filter(s => s.classId === selectedClass)
    : students;

  const getAttendanceForStudent = (studentId: string) => {
    return attendance.find(att => att.studentId === studentId);
  };

  if (loading) {
    return <div className="p-8">Loading attendance...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setBulkMode(!bulkMode)}
              variant="outline"
            >
              {bulkMode ? 'Cancel Bulk' : 'Bulk Mark'}
            </Button>
            {bulkMode && (
              <Button onClick={handleBulkSave} className={buttonClasses}>
                Save All
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="">All Classes</option>
                {Array.isArray(classes) && classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchAttendance} className={buttonClasses}>
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-500">Total Students</div>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Present</div>
            <div className="text-2xl font-bold text-green-600">
              {attendance.filter(a => a.status === 'PRESENT').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Absent</div>
            <div className="text-2xl font-bold text-red-600">
              {attendance.filter(a => a.status === 'ABSENT').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-500">Late</div>
            <div className="text-2xl font-bold text-yellow-600">
              {attendance.filter(a => a.status === 'LATE').length}
            </div>
          </Card>
        </div>

        {/* Attendance List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const att = getAttendanceForStudent(student.id);
                    const currentStatus = bulkMode ? bulkStatus[student.id] : att?.status;

                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studentId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.lastName}, {student.firstName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.Class?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {bulkMode ? (
                            <select
                              value={bulkStatus[student.id] || 'PRESENT'}
                              onChange={(e) => setBulkStatus({ ...bulkStatus, [student.id]: e.target.value })}
                              className="border rounded-md p-1 text-sm"
                            >
                              <option value="PRESENT">Present</option>
                              <option value="ABSENT">Absent</option>
                              <option value="LATE">Late</option>
                              <option value="EXCUSED">Excused</option>
                            </select>
                          ) : currentStatus ? (
                            getStatusBadge(currentStatus)
                          ) : (
                            <span className="text-gray-400 text-sm">Not marked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {att?.timeIn || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {!bulkMode && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMarkAttendance(student.id, 'PRESENT')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(student.id, 'ABSENT')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => handleMarkAttendance(student.id, 'LATE')}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Late
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
