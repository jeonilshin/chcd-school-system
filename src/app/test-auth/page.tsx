import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Test page to verify authentication and session management
 * Displays current user information and role
 */
export default async function TestAuthPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth/signin?callbackUrl=/test-auth');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Authentication Test
          </h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Session Information</h2>
              <div className="mt-2 bg-gray-50 rounded p-4">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User ID:</dt>
                    <dd className="text-sm text-gray-900">{session.user.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name:</dt>
                    <dd className="text-sm text-gray-900">{session.user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email:</dt>
                    <dd className="text-sm text-gray-900">{session.user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role:</dt>
                    <dd className="text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        session.user.role === 'PRINCIPAL' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {session.user.role}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="pt-4">
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
