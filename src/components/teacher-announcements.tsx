'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThemeColor } from '@/hooks/use-theme-color';

export function TeacherAnnouncements() {
  const { buttonClasses } = useThemeColor();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    targetAudience: ['PARENT'],
    expiryDate: '',
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          title: '',
          content: '',
          category: 'GENERAL',
          priority: 'NORMAL',
          targetAudience: ['PARENT'],
          expiryDate: '',
        });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'NORMAL': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8">Loading announcements...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Announcements</h1>
          <Button onClick={() => setShowForm(!showForm)} className={buttonClasses}>
            {showForm ? 'Cancel' : 'Create Announcement'}
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-md p-2 min-h-[100px]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="EVENT">Event</option>
                    <option value="HEALTH">Health</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <Button type="submit" className={buttonClasses}>
                Post Announcement
              </Button>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No announcements yet
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{announcement.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{announcement.content}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Category: {announcement.category}</span>
                  <span>Posted: {new Date(announcement.publishDate).toLocaleDateString()}</span>
                  {announcement.expiryDate && (
                    <span>Expires: {new Date(announcement.expiryDate).toLocaleDateString()}</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
