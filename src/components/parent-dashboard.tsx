'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSchoolSettings } from '@/contexts/school-settings-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Fake data for demonstration
const FAKE_STUDENT = {
  id: 'STU-2026-0001',
  name: 'Maria Santos',
  grade: 'Kinder',
  section: 'Section A',
  profilePicture: '/pfp.png',
  status: 'Active',
  age: 5,
  birthday: 'March 15, 2021',
  parentName: 'Juan & Rosa Santos',
  contactNumber: '+63 912 345 6789',
  address: '123 Main Street, Manila, Philippines',
};

const FAKE_BILLS = [
  {
    id: 'INV-2026-001',
    description: 'Tuition Fee - January 2026',
    amount: 5000,
    dueDate: '2026-01-31',
    status: 'Paid',
    paidDate: '2026-01-15',
  },
  {
    id: 'INV-2026-002',
    description: 'Tuition Fee - February 2026',
    amount: 5000,
    dueDate: '2026-02-28',
    status: 'Pending',
    paidDate: null,
  },
  {
    id: 'INV-2026-003',
    description: 'Books and Materials',
    amount: 1500,
    dueDate: '2026-02-15',
    status: 'Overdue',
    paidDate: null,
  },
];

const FAKE_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Parent-Teacher Conference',
    date: '2026-02-25',
    content: 'Parent-teacher conferences will be held on February 25-26. Please schedule your appointment through the school office or call us at (02) 1234-5678. This is a great opportunity to discuss your child\'s progress and development.',
    priority: 'high',
    category: 'Academic',
  },
  {
    id: '2',
    title: 'School Foundation Day',
    date: '2026-03-15',
    content: 'Join us in celebrating our school foundation day with various activities and performances. Students are encouraged to wear their best traditional Filipino attire. Program starts at 8:00 AM.',
    priority: 'normal',
    category: 'Event',
  },
  {
    id: '3',
    title: 'Vaccination Drive',
    date: '2026-02-20',
    content: 'Free vaccination for all students. Please bring vaccination cards. The health team will be available from 9:00 AM to 3:00 PM at the school clinic.',
    priority: 'high',
    category: 'Health',
  },
  {
    id: '4',
    title: 'Midterm Examination Schedule',
    date: '2026-03-01',
    content: 'Midterm examinations will be conducted from March 1-5. Please ensure your child gets adequate rest and arrives on time. Review materials are available in the student portal.',
    priority: 'high',
    category: 'Academic',
  },
  {
    id: '5',
    title: 'Library Book Return Reminder',
    date: '2026-02-28',
    content: 'All borrowed library books must be returned by February 28. Late returns will incur a fine of ₱5 per day.',
    priority: 'normal',
    category: 'Library',
  },
];

const FAKE_SCHEDULE = [
  { day: 'Monday', time: '8:00 AM - 9:00 AM', subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'Room 101' },
  { day: 'Monday', time: '9:00 AM - 10:00 AM', subject: 'English', teacher: 'Mr. Smith', room: 'Room 102' },
  { day: 'Monday', time: '10:00 AM - 10:30 AM', subject: 'Recess', teacher: '-', room: 'Playground' },
  { day: 'Monday', time: '10:30 AM - 11:30 AM', subject: 'Science', teacher: 'Ms. Davis', room: 'Lab 1' },
  { day: 'Monday', time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
  { day: 'Monday', time: '12:30 PM - 1:30 PM', subject: 'Arts & Crafts', teacher: 'Ms. Garcia', room: 'Art Room' },
  
  { day: 'Tuesday', time: '8:00 AM - 9:00 AM', subject: 'Filipino', teacher: 'Ms. Cruz', room: 'Room 101' },
  { day: 'Tuesday', time: '9:00 AM - 10:00 AM', subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'Room 101' },
  { day: 'Tuesday', time: '10:00 AM - 10:30 AM', subject: 'Recess', teacher: '-', room: 'Playground' },
  { day: 'Tuesday', time: '10:30 AM - 11:30 AM', subject: 'Music', teacher: 'Ms. Taylor', room: 'Music Room' },
  { day: 'Tuesday', time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
  { day: 'Tuesday', time: '12:30 PM - 1:30 PM', subject: 'Physical Education', teacher: 'Coach Lee', room: 'Gym' },
  
  { day: 'Wednesday', time: '8:00 AM - 9:00 AM', subject: 'English', teacher: 'Mr. Smith', room: 'Room 102' },
  { day: 'Wednesday', time: '9:00 AM - 10:00 AM', subject: 'Science', teacher: 'Ms. Davis', room: 'Lab 1' },
  { day: 'Wednesday', time: '10:00 AM - 10:30 AM', subject: 'Recess', teacher: '-', room: 'Playground' },
  { day: 'Wednesday', time: '10:30 AM - 11:30 AM', subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'Room 101' },
  { day: 'Wednesday', time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
  { day: 'Wednesday', time: '12:30 PM - 1:30 PM', subject: 'Computer Lab', teacher: 'Mr. Brown', room: 'Computer Lab' },
  
  { day: 'Thursday', time: '8:00 AM - 9:00 AM', subject: 'Filipino', teacher: 'Ms. Cruz', room: 'Room 101' },
  { day: 'Thursday', time: '9:00 AM - 10:00 AM', subject: 'English', teacher: 'Mr. Smith', room: 'Room 102' },
  { day: 'Thursday', time: '10:00 AM - 10:30 AM', subject: 'Recess', teacher: '-', room: 'Playground' },
  { day: 'Thursday', time: '10:30 AM - 11:30 AM', subject: 'Physical Education', teacher: 'Coach Lee', room: 'Gym' },
  { day: 'Thursday', time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
  { day: 'Thursday', time: '12:30 PM - 1:30 PM', subject: 'Values Education', teacher: 'Ms. Santos', room: 'Room 103' },
  
  { day: 'Friday', time: '8:00 AM - 9:00 AM', subject: 'Mathematics', teacher: 'Ms. Johnson', room: 'Room 101' },
  { day: 'Friday', time: '9:00 AM - 10:00 AM', subject: 'Music', teacher: 'Ms. Taylor', room: 'Music Room' },
  { day: 'Friday', time: '10:00 AM - 10:30 AM', subject: 'Recess', teacher: '-', room: 'Playground' },
  { day: 'Friday', time: '10:30 AM - 11:30 AM', subject: 'Arts & Crafts', teacher: 'Ms. Garcia', room: 'Art Room' },
  { day: 'Friday', time: '11:30 AM - 12:30 PM', subject: 'Lunch Break', teacher: '-', room: 'Cafeteria' },
  { day: 'Friday', time: '12:30 PM - 1:30 PM', subject: 'Library Time', teacher: 'Ms. White', room: 'Library' },
];

const FAKE_ATTENDANCE = {
  thisMonth: {
    present: 19,
    absent: 1,
    late: 2,
    excused: 0,
    percentage: 95,
  },
  thisYear: {
    present: 145,
    absent: 5,
    late: 8,
    excused: 2,
    percentage: 96,
  },
  recentRecords: [
    { date: '2026-02-19', status: 'Present', timeIn: '7:45 AM', timeOut: '1:35 PM' },
    { date: '2026-02-18', status: 'Present', timeIn: '7:50 AM', timeOut: '1:30 PM' },
    { date: '2026-02-17', status: 'Late', timeIn: '8:15 AM', timeOut: '1:30 PM' },
    { date: '2026-02-14', status: 'Present', timeIn: '7:40 AM', timeOut: '1:35 PM' },
    { date: '2026-02-13', status: 'Absent', timeIn: '-', timeOut: '-' },
  ],
};

const FAKE_GRADES = {
  currentQuarter: 'Third Quarter',
  subjects: [
    { name: 'Mathematics', grade: 92, remarks: 'Excellent', teacher: 'Ms. Johnson', trend: 'up' },
    { name: 'English', grade: 88, remarks: 'Very Good', teacher: 'Mr. Smith', trend: 'stable' },
    { name: 'Science', grade: 90, remarks: 'Excellent', teacher: 'Ms. Davis', trend: 'up' },
    { name: 'Filipino', grade: 85, remarks: 'Very Good', teacher: 'Ms. Cruz', trend: 'down' },
    { name: 'Arts & Crafts', grade: 94, remarks: 'Outstanding', teacher: 'Ms. Garcia', trend: 'up' },
    { name: 'Music', grade: 91, remarks: 'Excellent', teacher: 'Ms. Taylor', trend: 'stable' },
    { name: 'Physical Education', grade: 89, remarks: 'Very Good', teacher: 'Coach Lee', trend: 'up' },
    { name: 'Values Education', grade: 93, remarks: 'Excellent', teacher: 'Ms. Santos', trend: 'stable' },
  ],
  generalAverage: 90.25,
  classRank: 5,
  totalStudents: 30,
};

export function ParentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { buttonClasses } = useThemeColor();
  const { settings } = useSchoolSettings();
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'announcements' | 'schedule' | 'grades' | 'attendance'>('overview');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  
  // State for real data
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

  // Fetch real announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/parent/announcements');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data.announcements || []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setIsLoadingAnnouncements(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const totalBills = FAKE_BILLS.reduce((sum, bill) => sum + bill.amount, 0);
  const paidBills = FAKE_BILLS.filter(b => b.status === 'Paid').reduce((sum, bill) => sum + bill.amount, 0);
  const pendingBills = totalBills - paidBills;

  // Helper function to get color classes based on primary color
  const getColorClasses = (type: 'bg' | 'text' | 'hover' | 'border') => {
    const colorMap: Record<string, Record<string, string>> = {
      '#3B82F6': { 
        bg: 'bg-blue-600', 
        text: 'text-blue-600', 
        hover: 'hover:bg-blue-700', 
        border: 'border-blue-600' 
      },
      '#10B981': { 
        bg: 'bg-green-600', 
        text: 'text-green-600', 
        hover: 'hover:bg-green-700', 
        border: 'border-green-600' 
      },
      '#F59E0B': { 
        bg: 'bg-amber-600', 
        text: 'text-amber-600', 
        hover: 'hover:bg-amber-700', 
        border: 'border-amber-600' 
      },
      '#EF4444': { 
        bg: 'bg-red-600', 
        text: 'text-red-600', 
        hover: 'hover:bg-red-700', 
        border: 'border-red-600' 
      },
    };
    const color = settings?.primaryColor || '#3B82F6';
    return colorMap[color]?.[type] || colorMap['#3B82F6'][type];
  };

  const getActiveBgClass = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-50',
      '#10B981': 'bg-green-50',
      '#F59E0B': 'bg-amber-50',
      '#EF4444': 'bg-red-50',
    };
    const color = settings?.primaryColor || '#3B82F6';
    return colorMap[color] || 'bg-blue-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${getColorClasses('bg')} rounded-xl flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-xl">
                    {settings.schoolName?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-xl text-gray-800 block">{settings.schoolName || 'CHCD'} Parent Portal</span>
                  <span className="text-xs text-gray-500">Student Management System</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <Card className={`mb-6 border-0 shadow-lg ${getColorClasses('bg')} text-white overflow-hidden`}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <img
                  src={FAKE_STUDENT.profilePicture}
                  alt={FAKE_STUDENT.name}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">{FAKE_STUDENT.name}</h2>
                <p className="text-white/80 mb-4">Student ID: {FAKE_STUDENT.id}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-white/70">Grade Level</p>
                    <p className="font-bold text-lg">{FAKE_STUDENT.grade}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-white/70">Section</p>
                    <p className="font-bold text-lg">{FAKE_STUDENT.section}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-white/70">Age</p>
                    <p className="font-bold text-lg">{FAKE_STUDENT.age} years</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-white/70">Status</p>
                    <Badge className="bg-green-500 hover:bg-green-600 border-0">{FAKE_STUDENT.status}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-2">
          <nav className="flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
              { id: 'grades', label: 'Grades', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              { id: 'attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
              { id: 'schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
              { id: 'bills', label: 'Bills & Payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
              { id: 'announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${getColorClasses('bg')} text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats Row */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`w-10 h-10 ${getColorClasses('bg')} rounded-lg flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Coming Soon</p>
                  <p className="text-sm text-gray-400">Attendance tracking will be available soon</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`w-10 h-10 ${getColorClasses('bg')} rounded-lg flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Academic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Coming Soon</p>
                  <p className="text-sm text-gray-400">Grades and performance tracking will be available soon</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className={`w-10 h-10 ${getColorClasses('bg')} rounded-lg flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Bills</p>
                    <p className="text-2xl font-bold text-gray-900">₱{totalBills.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="text-xl font-semibold text-green-600">₱{paidBills.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Pending</p>
                    <p className="text-xl font-semibold text-orange-600">₱{pendingBills.toLocaleString()}</p>
                  </div>
                  <Button className={`w-full ${buttonClasses}`}>
                    Pay Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Announcements */}
            <Card className="lg:col-span-2 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className={`w-5 h-5 ${getColorClasses('text')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Recent Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoadingAnnouncements ? (
                    <div className="text-center py-4 text-gray-500">Loading announcements...</div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No announcements at this time</div>
                  ) : (
                    announcements.slice(0, 3).map((announcement) => (
                      <div key={announcement.id} className={`border-l-4 ${getColorClasses('border')} ${getActiveBgClass()} pl-4 pr-4 py-3 rounded-r-lg hover:shadow-sm transition-all`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                              <Badge variant="outline" className="text-xs">{announcement.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(announcement.publishDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                          {announcement.priority === 'HIGH' && (
                            <Badge variant="destructive" className="shrink-0">Important</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('announcements')}>
                    View All Announcements
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Subjects */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Top Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {FAKE_GRADES.subjects
                    .sort((a, b) => b.grade - a.grade)
                    .slice(0, 5)
                    .map((subject, index) => (
                      <div key={subject.name} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{subject.name}</p>
                          <p className="text-xs text-gray-500">{subject.teacher}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{subject.grade}</p>
                          <p className="text-xs text-gray-500">{subject.remarks}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'grades' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-20 text-center">
              <div className="max-w-md mx-auto">
                <div className={`w-20 h-20 ${getColorClasses('bg')} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Grades Coming Soon</h3>
                <p className="text-gray-600">
                  We're working on bringing you detailed grade reports and academic performance tracking. Check back soon!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'attendance' && (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-20 text-center">
              <div className="max-w-md mx-auto">
                <div className={`w-20 h-20 ${getColorClasses('bg')} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Attendance Coming Soon</h3>
                <p className="text-gray-600">
                  We're working on bringing you detailed attendance records and reports. Check back soon!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'bills' && (
          <Card>
            <CardHeader>
              <CardTitle>Bills & Payments</CardTitle>
              <CardDescription>View and manage your payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FAKE_BILLS.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.id}</TableCell>
                      <TableCell>{bill.description}</TableCell>
                      <TableCell>₱{bill.amount.toLocaleString()}</TableCell>
                      <TableCell>{bill.dueDate}</TableCell>
                      <TableCell>
                        {bill.status === 'Paid' && <Badge variant="success">Paid</Badge>}
                        {bill.status === 'Pending' && <Badge variant="warning">Pending</Badge>}
                        {bill.status === 'Overdue' && <Badge variant="destructive">Overdue</Badge>}
                      </TableCell>
                      <TableCell>
                        {bill.status !== 'Paid' && (
                          <Button size="sm" variant="outline">Pay Now</Button>
                        )}
                        {bill.status === 'Paid' && (
                          <Button size="sm" variant="ghost">View Receipt</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-4">
            {isLoadingAnnouncements ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center text-gray-500">
                  Loading announcements...
                </CardContent>
              </Card>
            ) : announcements.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center text-gray-500">
                  No announcements at this time
                </CardContent>
              </Card>
            ) : (
              announcements.map((announcement) => (
                <Card key={announcement.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{announcement.title}</CardTitle>
                          <Badge variant="outline">{announcement.category}</Badge>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(announcement.publishDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </CardDescription>
                      </div>
                      {announcement.priority === 'HIGH' && (
                        <Badge variant="destructive" className="shrink-0">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Important
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Weekly Class Schedule</CardTitle>
                <CardDescription>Schedule for {FAKE_STUDENT.name} - {FAKE_STUDENT.grade} {FAKE_STUDENT.section}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                        selectedDay === day
                          ? `${getColorClasses('bg')} text-white shadow-md`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {FAKE_SCHEDULE.filter(s => s.day === selectedDay).map((schedule, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
                        schedule.subject === 'Recess' || schedule.subject === 'Lunch Break'
                          ? 'bg-gray-50 border-gray-300'
                          : `bg-white ${getColorClasses('border')} hover:shadow-md transition-shadow`
                      }`}
                    >
                      <div className="flex-shrink-0 w-32">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {schedule.time}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{schedule.subject}</h4>
                        {schedule.teacher !== '-' && (
                          <p className="text-sm text-gray-500">{schedule.teacher}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {schedule.room}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg ${getActiveBgClass()}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Schedule Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className={`w-5 h-5 ${getColorClasses('text')} mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">School Hours</p>
                      <p className="text-gray-600">8:00 AM - 1:30 PM (Monday to Friday)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Recess Time</p>
                      <p className="text-gray-600">10:00 AM - 10:30 AM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Lunch Break</p>
                      <p className="text-gray-600">11:30 AM - 12:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Late Policy</p>
                      <p className="text-gray-600">Students arriving after 8:15 AM are marked late</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
