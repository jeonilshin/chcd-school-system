import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <Link
          href="/enroll"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg px-12 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Enroll Now
        </Link>
        <div>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm px-6 py-2 rounded-full border-2 border-indigo-600 hover:border-indigo-700 transition-all duration-300"
          >
            Go to Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
