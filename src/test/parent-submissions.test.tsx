import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ParentSubmissions } from '@/components/parent-submissions';

// Mock fetch globally
global.fetch = vi.fn();

describe('ParentSubmissions Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockParentEnrollments = [
    {
      id: 'enr_1',
      studentName: 'Alice Johnson',
      schoolYear: '2024',
      program: 'Playschool AM',
      studentStatus: 'OLD_STUDENT',
      status: 'PENDING',
      submittedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'enr_2',
      studentName: 'Bob Johnson',
      schoolYear: '2025',
      program: 'Nursery',
      studentStatus: 'NEW_STUDENT',
      status: 'APPROVED',
      submittedAt: '2024-02-20T14:30:00Z',
    },
    {
      id: 'enr_3',
      studentName: 'Charlie Johnson',
      schoolYear: '2024',
      program: 'Kinder',
      studentStatus: 'OLD_STUDENT',
      status: 'REJECTED',
      submittedAt: '2024-03-10T09:15:00Z',
    },
  ];

  it('should display parent\'s own enrollments', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByText('Charlie Johnson')).toBeInTheDocument();
    });

    // Verify all enrollments are displayed
    expect(screen.getAllByText('2024')).toHaveLength(2); // Two enrollments with 2024
    expect(screen.getByText('Playschool AM')).toBeInTheDocument();
    expect(screen.getAllByText('Old Student')).toHaveLength(2); // Two old students
  });

  it('should display status correctly for each enrollment', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });
  });

  it('should display submission count', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('3 submissions')).toBeInTheDocument();
    });
  });

  it('should display singular "submission" for one enrollment', async () => {
    const singleEnrollment = [mockParentEnrollments[0]];
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: singleEnrollment }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('1 submission')).toBeInTheDocument();
    });
  });

  it('should display empty state when parent has no enrollments', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: [] }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('No enrollment submissions yet')).toBeInTheDocument();
    });

    expect(screen.getByText('0 submissions')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    (global.fetch as any).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ParentSubmissions />);

    expect(screen.getByText(/loading your submissions/i)).toBeInTheDocument();
  });

  it('should handle authentication errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText(/you must be logged in/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should handle authorization errors', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText(/you do not have permission/i)).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('should allow refreshing the enrollment list', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    // Mock second fetch for refresh
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should display view details button for each enrollment', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
    expect(viewDetailsButtons).toHaveLength(3);
  });

  it('should format dates correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText(/jan 15, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/feb 20, 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/mar 10, 2024/i)).toBeInTheDocument();
    });
  });

  it('should format student status correctly', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getAllByText('Old Student')).toHaveLength(2);
      expect(screen.getByText('New Student')).toBeInTheDocument();
    });
  });

  it('should display all table columns', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('Student Name')).toBeInTheDocument();
      expect(screen.getByText('School Year')).toBeInTheDocument();
      expect(screen.getByText('Program')).toBeInTheDocument();
      expect(screen.getByText('Student Status')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Submitted')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('should retry fetching on error', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // Mock successful retry
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('should display component title and description', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ enrollments: mockParentEnrollments }),
    });

    render(<ParentSubmissions />);

    await waitFor(() => {
      expect(screen.getByText('My Enrollment Submissions')).toBeInTheDocument();
      expect(screen.getByText('View the status of your enrollment applications')).toBeInTheDocument();
    });
  });
});
