'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async (email: string, password: string) => {
    setLoading(true);
    setResult(null);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      setResult(result);
      console.log('Login result:', result);
    } catch (error) {
      setResult({ error: error.message });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-center">Test Login</h2>
          <p className="text-center text-gray-600 mt-2">
            Test the authentication system
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => testLogin('admin@test.com', 'password123')}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Admin Login
          </button>

          <button
            onClick={() => testLogin('principal@test.com', 'password123')}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Principal Login
          </button>

          <button
            onClick={() => testLogin('wrong@email.com', 'wrongpassword')}
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Test Wrong Credentials
          </button>
        </div>

        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Testing login...</p>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold">Result:</h3>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold text-blue-800">Test Credentials:</h3>
          <div className="text-sm mt-2 space-y-1">
            <p><strong>Admin:</strong> admin@test.com / password123</p>
            <p><strong>Principal:</strong> principal@test.com / password123</p>
            <p><strong>Parent:</strong> parent@test.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}