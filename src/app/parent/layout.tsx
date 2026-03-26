'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useSchoolSettings } from '@/contexts/school-settings-context';
import Image from 'next/image';

interface ParentLayoutProps {
  children: ReactNode;
}

export default function ParentLayout({ children }: ParentLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useSchoolSettings();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread message count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/conversations');
        if (response.ok) {
          const conversations = await response.json();
          const total = conversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
          setUnreadCount(total);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const isActive = (path: string) => pathname === path;

  const getColorClasses = (type: 'bg' | 'text' | 'hover-bg') => {
    const colorMap: Record<string, Record<string, string>> = {
      '#3B82F6': { bg: 'bg-blue-600', text: 'text-blue-600', 'hover-bg': 'hover:bg-blue-700' },
      '#10B981': { bg: 'bg-green-600', text: 'text-green-600', 'hover-bg': 'hover:bg-green-700' },
      '#F59E0B': { bg: 'bg-amber-600', text: 'text-amber-600', 'hover-bg': 'hover:bg-amber-700' },
      '#EF4444': { bg: 'bg-red-600', text: 'text-red-600', 'hover-bg': 'hover:bg-red-700' },
    };
    return colorMap[settings?.primaryColor || '#3B82F6']?.[type] || colorMap['#3B82F6'][type];
  };

  const getActiveBgClass = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-50',
      '#10B981': 'bg-green-50',
      '#F59E0B': 'bg-amber-50',
      '#EF4444': 'bg-red-50',
    };
    return colorMap[settings?.primaryColor || '#3B82F6'] || 'bg-blue-50';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {settings.schoolLogoUrl ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src={settings.schoolLogoUrl}
                  alt={settings.schoolName || 'School'}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className={`w-8 h-8 ${getColorClasses('bg')} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">
                  {settings.schoolName?.charAt(0) || 'S'}
                </span>
              </div>
            )}
            <span className="font-bold text-xl text-gray-800">{settings.schoolName || 'School'}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/parent/submissions"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/parent/submissions')
                ? `${getActiveBgClass()} ${getColorClasses('text')}`
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">My Submissions</span>
          </Link>

          <Link
            href="/parent/messages"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/parent/messages')
                ? `${getActiveBgClass()} ${getColorClasses('text')}`
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="font-medium">Messages</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/parent/assignments"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/parent/assignments')
                ? `${getActiveBgClass()} ${getColorClasses('text')}`
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-medium">Assignments</span>
          </Link>

          <Link
            href="/parent/announcements"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/parent/announcements')
                ? `${getActiveBgClass()} ${getColorClasses('text')}`
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="font-medium">Announcements</span>
          </Link>

          <Link
            href="/parent/enroll"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/parent/enroll')
                ? `${getActiveBgClass()} ${getColorClasses('text')}`
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">New Enrollment</span>
          </Link>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${getActiveBgClass()} rounded-full flex items-center justify-center`}>
              <span className={`${getColorClasses('text')} font-semibold`}>
                {session?.user?.name?.charAt(0) || 'P'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">Parent</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
