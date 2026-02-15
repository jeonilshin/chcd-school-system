'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ParentComingSoonPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl">Parent Portal Coming Soon</CardTitle>
          <CardDescription className="text-lg mt-2">
            We're working on building an amazing experience for parents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Welcome, {session?.user?.name || 'Parent'}!</strong>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              The parent portal is currently under development. Soon you'll be able to:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Submit enrollment applications for your children</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>View and track your enrollment submissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Upload required documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>Receive updates on application status</span>
              </li>
            </ul>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              In the meantime, you can use the public enrollment form
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/enroll')}
              >
                Go to Enrollment Form
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
