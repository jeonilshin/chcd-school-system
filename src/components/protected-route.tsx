'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Role } from '@prisma/client';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Role[];
  redirectTo?: string;
}

/**
 * Protected route wrapper component
 * Redirects unauthenticated users to login page
 * Optionally restricts access to specific roles
 * Shows loading state during authentication check
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/auth/signin',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check role-based authorization if roles are specified
    if (allowedRoles && session?.user) {
      const userRole = session.user.role;
      if (!allowedRoles.includes(userRole)) {
        // Redirect to unauthorized page or home
        router.push('/unauthorized');
        return;
      }
    }

    setIsAuthorized(true);
  }, [session, status, allowedRoles, router, redirectTo]);

  // Show loading state during authentication check
  if (status === 'loading' || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
