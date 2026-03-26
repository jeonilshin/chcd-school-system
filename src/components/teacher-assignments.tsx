'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useThemeColor } from '@/hooks/use-theme-color';

export function TeacherAssignments() {
  const { buttonClasses } = useThemeColor();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classId: '',
    title: '',
    description: '',
    dueDate: '',
    attachmentUrl: '',
  });

  useEffect(() => {
    fetchAssignments();
    fetchClasses();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({ classId: '', title: '', description: '', dueDate: '', attachmentUrl: '' });
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Assignments</h1>
          <Button onClick={() => setShowForm(!showForm)} className={buttonClasses}>
            {showForm ? 'Cancel' : 'Create Assignment'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Class</Label>
                  <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label>Due Date (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Attachment URL (Optional)</Label>
                  <Input
                    type="url"
                    value={formData.attachmentUrl}
                    onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <Button type="submit" className={buttonClasses}>
                  Create Assignment
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No assignments yet. Create your first assignment!
              </CardContent>
            </Card>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{assignment.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{assignment.Class.name}</p>
                    </div>
                    <div className="flex gap-2">
                      {assignment.dueDate && (
                        <Badge>Due: {new Date(assignment.dueDate).toLocaleDateString()}</Badge>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(assignment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
                  {assignment.attachmentUrl && (
                    <a
                      href={assignment.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mt-2 inline-block"
                    >
                      View Attachment
                    </a>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
