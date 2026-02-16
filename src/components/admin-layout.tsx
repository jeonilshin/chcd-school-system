'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { useSchoolSettings } from '@/contexts/school-settings-context';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isPrincipal = session?.user?.role === 'PRINCIPAL';
  const { settings } = useSchoolSettings();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const isActive = (path: string) => pathname === path;

  // Helper function to apply dynamic color
  const getColorClasses = (type: 'bg' | 'text' | 'hover-bg' | 'border') => {
    const colorMap: Record<string, Record<string, string>> = {
      '#3B82F6': { bg: 'bg-blue-600', text: 'text-blue-600', 'hover-bg': 'hover:bg-blue-700', border: 'border-blue-600' },
      '#10B981': { bg: 'bg-green-600', text: 'text-green-600', 'hover-bg': 'hover:bg-green-700', border: 'border-green-600' },
      '#F59E0B': { bg: 'bg-amber-600', text: 'text-amber-600', 'hover-bg': 'hover:bg-amber-700', border: 'border-amber-600' },
      '#EF4444': { bg: 'bg-red-600', text: 'text-red-600', 'hover-bg': 'hover:bg-red-700', border: 'border-red-600' },
    };
    const color = settings?.primaryColor || '#3B82F6';
    return colorMap[color]?.[type] || colorMap['#3B82F6'][type];
  };

  const getActiveBgClass = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-50',
      '#10B981': 'bg-green-50',
      '#F59E0B': 'bg-amber-50',
      '#EF4444': 'bg-red-50',
    };
    const color = settings?.primaryColor || '#3B82F6';
    return colorMap[color] || 'bg-blue-50';
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
          {/* Home Section */}
          <div className="mb-4">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/dashboard')
                  ? `${getActiveBgClass()} ${getColorClasses('text')}`
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Home</span>
            </Link>
          </div>

          {/* Students Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-4 py-2 text-gray-700 text-sm font-medium cursor-pointer">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Students</span>
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="ml-4 mt-1 space-y-1">
              <Link
                href="/admin/students"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/admin/students')
                    ? `${getActiveBgClass()} ${getColorClasses('text')}`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Students
              </Link>
              <Link
                href="/admin/admissions"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive('/admin/admissions')
                    ? `${getActiveBgClass()} ${getColorClasses('text')}`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Admissions
              </Link>
            </div>
          </div>

          {/* Teachers Section - Only for Principal */}
          {isPrincipal && (
            <div className="mb-4">
              <div className={`flex items-center justify-between px-4 py-2 ${getColorClasses('text')} text-sm font-medium cursor-pointer`}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Teachers</span>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  href="/principal/teachers"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive('/principal/teachers')
                      ? `${getActiveBgClass()} ${getColorClasses('text')}`
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Teachers
                </Link>
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 cursor-not-allowed">
                  Teachers Details
                </div>
              </div>
            </div>
          )}

          {/* Other Menu Items */}
          <div className="space-y-1">
            <Link
              href="/admin/classes"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/classes')
                  ? `${getActiveBgClass()} ${getColorClasses('text')}`
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Classes</span>
            </Link>
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 cursor-not-allowed rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-medium">Library</span>
            </div>
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/settings')
                  ? `${getActiveBgClass()} ${getColorClasses('text')}`
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Settings</span>
            </Link>
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 cursor-not-allowed rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Account</span>
            </div>
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${getActiveBgClass()} rounded-full flex items-center justify-center`}>
              <span className={`${getColorClasses('text')} font-semibold`}>
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.role}
              </p>
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
