import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import SignInPage from '@/app/auth/signin/page';
import { ProtectedRoute } from '@/components/protected-route';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('Authentication UI', () => {
  let mockRouter: any;
  let mockSearchParams: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRouter = {
      push: vi.fn(),
      refresh: vi.fn(),
    };
    
    mockSearchParams = {
      get: vi.fn(),
    };
    
    (useRouter as any).mockReturnValue(mockRouter);
    (useSearchParams as any).mockReturnValue(mockSearchParams);
    (useSession as any).mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  describe('Login Form', () => {
    it('should render login form with email and password fields', () => {
      render(<SignInPage />);
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should handle form submission with valid credentials', async () => {
      (signIn as any).mockResolvedValue({ ok: true, error: null });
      
      render(<SignInPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
      
      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should display error message for invalid credentials', async () => {
      (signIn as any).mockResolvedValue({ ok: false, error: 'CredentialsSignin' });
      
      render(<SignInPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during sign in', async () => {
      (signIn as any).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));
      
      render(<SignInPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle authentication errors gracefully', async () => {
      (signIn as any).mockRejectedValue(new Error('Network error'));
      
      render(<SignInPage />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/an error occurred during sign in/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Redirect', () => {
    it('should redirect admin to admin dashboard after successful login', async () => {
      (signIn as any).mockResolvedValue({ ok: true, error: null });
      (useSession as any).mockReturnValue({
        data: { user: { id: '1', email: 'admin@example.com', role: 'ADMIN' } },
        status: 'authenticated',
      });
      
      render(<SignInPage />);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/dashboard');
      });
    });

    it('should redirect principal to admin dashboard after successful login', async () => {
      (signIn as any).mockResolvedValue({ ok: true, error: null });
      (useSession as any).mockReturnValue({
        data: { user: { id: '2', email: 'principal@example.com', role: 'PRINCIPAL' } },
        status: 'authenticated',
      });
      
      render(<SignInPage />);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin/dashboard');
      });
    });

    it('should redirect parent to parent submissions after successful login', async () => {
      (signIn as any).mockResolvedValue({ ok: true, error: null });
      (useSession as any).mockReturnValue({
        data: { user: { id: '3', email: 'parent@example.com', role: 'PARENT' } },
        status: 'authenticated',
      });
      
      render(<SignInPage />);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/parent/submissions');
      });
    });

    it('should use callback URL if provided', async () => {
      mockSearchParams.get.mockReturnValue('/custom/path');
      (signIn as any).mockResolvedValue({ ok: true, error: null });
      (useSession as any).mockReturnValue({
        data: { user: { id: '1', email: 'admin@example.com', role: 'ADMIN' } },
        status: 'authenticated',
      });
      
      render(<SignInPage />);
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/custom/path');
      });
    });
  });

  describe('Protected Route', () => {
    it('should redirect unauthenticated users to login', async () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
      
      // Mock window.location.pathname
      Object.defineProperty(window, 'location', {
        value: { pathname: '/admin/dashboard' },
        writable: true,
      });
      
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          '/auth/signin?callbackUrl=%2Fadmin%2Fdashboard'
        );
      });
    });

    it('should show loading state during authentication check', () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'loading',
      });
      
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
    });

    it('should render protected content for authenticated users', async () => {
      (useSession as any).mockReturnValue({
        data: { user: { id: '1', email: 'user@example.com', role: 'PARENT' } },
        status: 'authenticated',
      });
      
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/protected content/i)).toBeInTheDocument();
      });
    });

    it('should enforce role-based access control', async () => {
      (useSession as any).mockReturnValue({
        data: { user: { id: '1', email: 'parent@example.com', role: 'PARENT' } },
        status: 'authenticated',
      });
      
      render(
        <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      );
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/unauthorized');
      });
    });

    it('should allow access for users with correct role', async () => {
      (useSession as any).mockReturnValue({
        data: { user: { id: '1', email: 'admin@example.com', role: 'ADMIN' } },
        status: 'authenticated',
      });
      
      render(
        <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/admin only content/i)).toBeInTheDocument();
      });
    });

    it('should use custom redirect URL when provided', async () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
      
      Object.defineProperty(window, 'location', {
        value: { pathname: '/protected' },
        writable: true,
      });
      
      render(
        <ProtectedRoute redirectTo="/custom-login">
          <div>Protected Content</div>
        </ProtectedRoute>
      );
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(
          '/custom-login?callbackUrl=%2Fprotected'
        );
      });
    });
  });
});
