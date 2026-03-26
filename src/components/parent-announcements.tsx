'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ParentAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'NORMAL': return 'bg-blue-500 text-white';
      case 'LOW': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === 'all') return true;
    return a.priority === filter;
  });

  if (loading) {
    return <div className="p-8">Loading announcements...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Announcements</h1>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Announcements</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High Priority</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="LOW">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No announcements to display
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{announcement.title}</CardTitle>
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(announcement.publishDate).toLocaleDateString()} • {announcement.category}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
