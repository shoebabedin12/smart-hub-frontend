'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, BookOpen } from 'lucide-react';
import { getUser } from 'app/lib/auth';

export default function AdminPage() {
  const router = useRouter();
  const user = getUser();

  useEffect(() => {
    if (user?.role === 'student') router.replace('/notices');
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-500 text-sm mb-8">Welcome, {user?.full_name}. Manage notices and resources below.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/notices"
            className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3 hover:border-blue-300 transition-colors">
            <Bell size={24} className="text-blue-600" />
            <div>
              <h2 className="font-semibold text-gray-900">Post Notices</h2>
              <p className="text-sm text-gray-500 mt-1">Create and manage department notices. AI will auto-summarize.</p>
            </div>
          </Link>

          <Link href="/resources"
            className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3 hover:border-blue-300 transition-colors">
            <BookOpen size={24} className="text-blue-600" />
            <div>
              <h2 className="font-semibold text-gray-900">Upload Resources</h2>
              <p className="text-sm text-gray-500 mt-1">Upload PDFs and documents. They get AI-indexed automatically.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}