'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ParentAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
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
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return <div className="p-8">Loading assignments...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Assignments</h1>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No assignments yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{assignment.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {assignment.Class.name} • {assignment.Teacher.name}
                      </p>
                    </div>
                    {assignment.dueDate && (
                      <Badge
                        variant={isOverdue(assignment.dueDate) ? 'destructive' : 'default'}
                      >
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </Badge>
                    )}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
