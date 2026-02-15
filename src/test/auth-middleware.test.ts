import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '@prisma/client';
import {
  requireAuth,
  requireRole,
  isAuthorized,
  isOwner,
  isAuthorizedOrOwner,
  requireRoleOrOwner,
  UnauthorizedError,
  ForbiddenError,
  withAuth,
  withRole,
} from '@/lib/auth-middleware';
import { getServerSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getServerSession: vi.fn(),
}));

describe('Authentication Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return user when session exists', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const user = await requireAuth();
      expect(user).toEqual(mockUser);
    });

    it('should throw UnauthorizedError when session is null', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow(UnauthorizedError);
      await expect(requireAuth()).rejects.toThrow('Authentication required');
    });

    it('should throw UnauthorizedError when session has no user', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: null as any,
        expires: '2024-12-31',
      });

      await expect(requireAuth()).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('requireRole', () => {
    it('should return user when user has required role', async () => {
      const mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: Role.ADMIN,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const user = await requireRole([Role.ADMIN, Role.PRINCIPAL]);
      expect(user).toEqual(mockUser);
    });

    it('should throw ForbiddenError when user does not have required role', async () => {
      const mockUser = {
        id: 'parent-1',
        email: 'parent@example.com',
        name: 'Parent User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      await expect(requireRole([Role.ADMIN, Role.PRINCIPAL])).rejects.toThrow(
        ForbiddenError
      );
      await expect(requireRole([Role.ADMIN, Role.PRINCIPAL])).rejects.toThrow(
        'Insufficient permissions'
      );
    });

    it('should throw UnauthorizedError when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(requireRole([Role.ADMIN])).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should accept single role in array', async () => {
      const mockUser = {
        id: 'principal-1',
        email: 'principal@example.com',
        name: 'Principal User',
        role: Role.PRINCIPAL,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const user = await requireRole([Role.PRINCIPAL]);
      expect(user).toEqual(mockUser);
    });
  });

  describe('isAuthorized', () => {
    it('should return true when user has required role', async () => {
      const mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: Role.ADMIN,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const result = await isAuthorized([Role.ADMIN, Role.PRINCIPAL]);
      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', async () => {
      const mockUser = {
        id: 'parent-1',
        email: 'parent@example.com',
        name: 'Parent User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const result = await isAuthorized([Role.ADMIN, Role.PRINCIPAL]);
      expect(result).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await isAuthorized([Role.ADMIN]);
      expect(result).toBe(false);
    });

    it('should return false when session has no user', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: null as any,
        expires: '2024-12-31',
      });

      const result = await isAuthorized([Role.ADMIN]);
      expect(result).toBe(false);
    });

    it('should handle errors gracefully and return false', async () => {
      vi.mocked(getServerSession).mockRejectedValue(new Error('Database error'));

      const result = await isAuthorized([Role.ADMIN]);
      expect(result).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('should return true when user id matches owner id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const result = await isOwner('user-1');
      expect(result).toBe(true);
    });

    it('should return false when user id does not match owner id', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const result = await isOwner('user-2');
      expect(result).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await isOwner('user-1');
      expect(result).toBe(false);
    });

    it('should handle errors gracefully and return false', async () => {
      vi.mocked(getServerSession).mockRejectedValue(new Error('Database error'));

      const result = await isOwner('user-1');
      expect(result).toBe(false);
    });
  });

  describe('isAuthorizedOrOwner', () => {
    it('should return true when user has required role', async () => {
      const mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: Role.ADMIN,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const result = await isAuthorizedOrOwner([Role.ADMIN], 'user-1');
      expect(result).toBe(true);
    });

    it('should return true when user is the owner', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const result = await isAuthorizedOrOwner([Role.ADMIN], 'user-1');
      expect(result).toBe(true);
    });

    it('should return false when user has neither role nor ownership', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const result = await isAuthorizedOrOwner([Role.ADMIN], 'user-2');
      expect(result).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const result = await isAuthorizedOrOwner([Role.ADMIN], 'user-1');
      expect(result).toBe(false);
    });

    it('should handle errors gracefully and return false', async () => {
      vi.mocked(getServerSession).mockRejectedValue(new Error('Database error'));

      const result = await isAuthorizedOrOwner([Role.ADMIN], 'user-1');
      expect(result).toBe(false);
    });
  });

  describe('requireRoleOrOwner', () => {
    it('should return user when user has required role', async () => {
      const mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: Role.ADMIN,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const user = await requireRoleOrOwner([Role.ADMIN], 'user-1');
      expect(user).toEqual(mockUser);
    });

    it('should return user when user is the owner', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const user = await requireRoleOrOwner([Role.ADMIN], 'user-1');
      expect(user).toEqual(mockUser);
    });

    it('should throw ForbiddenError when user has neither role nor ownership', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      await expect(requireRoleOrOwner([Role.ADMIN], 'user-2')).rejects.toThrow(
        ForbiddenError
      );
    });

    it('should throw UnauthorizedError when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      await expect(requireRoleOrOwner([Role.ADMIN], 'user-1')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('withAuth', () => {
    it('should call handler when no errors occur', async () => {
      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const wrappedHandler = withAuth(mockHandler);
      const mockRequest = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
      expect(response.status).toBe(200);
    });

    it('should return 401 when UnauthorizedError is thrown', async () => {
      const mockHandler = vi.fn().mockRejectedValue(
        new UnauthorizedError('Authentication required')
      );
      const wrappedHandler = withAuth(mockHandler);
      const mockRequest = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(mockRequest);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: 'Authentication required' });
    });

    it('should return 403 when ForbiddenError is thrown', async () => {
      const mockHandler = vi.fn().mockRejectedValue(
        new ForbiddenError('Insufficient permissions')
      );
      const wrappedHandler = withAuth(mockHandler);
      const mockRequest = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(mockRequest);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toEqual({ error: 'Insufficient permissions' });
    });

    it('should rethrow other errors', async () => {
      const mockError = new Error('Database error');
      const mockHandler = vi.fn().mockRejectedValue(mockError);
      const wrappedHandler = withAuth(mockHandler);
      const mockRequest = new NextRequest('http://localhost:3000/api/test');

      await expect(wrappedHandler(mockRequest)).rejects.toThrow('Database error');
    });
  });

  describe('withRole', () => {
    it('should call handler when user has required role', async () => {
      const mockUser = {
        id: 'admin-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: Role.ADMIN,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );
      const wrappedHandler = withRole([Role.ADMIN], mockHandler);
      const mockRequest = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockRequest);
      expect(response.status).toBe(200);
    });

    it('should return 403 when user does not have required role', async () => {
      const mockUser = {
        id: 'parent-1',
        email: 'parent@example.com',
        name: 'Parent User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const mockHandler = vi.fn();
      const wrappedHandler = withRole([Role.ADMIN], mockHandler);
      const mockRequest = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const mockHandler = vi.fn();
      const wrappedHandler = withRole([Role.ADMIN], mockHandler);
      const mockRequest = new NextRequest('http://localhost:3000/api/test');

      const response = await wrappedHandler(mockRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple roles correctly', async () => {
      const mockUser = {
        id: 'principal-1',
        email: 'principal@example.com',
        name: 'Principal User',
        role: Role.PRINCIPAL,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      const user = await requireRole([Role.ADMIN, Role.PRINCIPAL]);
      expect(user).toEqual(mockUser);
    });

    it('should handle empty role array', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.PARENT,
      };

      vi.mocked(getServerSession).mockResolvedValue({
        user: mockUser,
        expires: '2024-12-31',
      });

      await expect(requireRole([])).rejects.toThrow(ForbiddenError);
    });

    it('should handle all three roles', async () => {
      for (const role of [Role.PARENT, Role.ADMIN, Role.PRINCIPAL]) {
        const mockUser = {
          id: 'user-1',
          email: 'user@example.com',
          name: 'User',
          role,
        };

        vi.mocked(getServerSession).mockResolvedValue({
          user: mockUser,
          expires: '2024-12-31',
        });

        const result = await isAuthorized([role]);
        expect(result).toBe(true);
      }
    });
  });
});
