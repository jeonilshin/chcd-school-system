'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TeacherDashboard() {
  const [stats, setStats] = useState({
    assignments: 0,
    messages: 0,
    students: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [assignmentsRes, conversationsRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/conversations'),
      ]);

      const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
      const conversations = conversationsRes.ok ? await conversationsRes.json() : [];

      setStats({
        assignments: assignments.length,
        messages: conversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0),
        students: 0, // TODO: Fetch student count
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.assignments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.messages}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.students}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Use the navigation menu to manage your assignments, respond to messages, and post announcements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
