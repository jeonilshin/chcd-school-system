'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password123');
  const [loginResult, setLoginResult] = useState<any>(null);

  const handleTestLogin = async () => {
    console.log('Testing login...');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    console.log('Login result:', result);
    setLoginResult(result);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Authentication Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session:</strong></p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <button
              onClick={handleTestLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Login
            </button>
            {loginResult && (
              <div>
                <p><strong>Login Result:</strong></p>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(loginResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            {session ? (
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => signIn()}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Admin:</strong> admin@test.com / password123</p>
            <p><strong>Principal:</strong> principal@test.com / password123</p>
            <p><strong>Parent:</strong> parent@test.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}