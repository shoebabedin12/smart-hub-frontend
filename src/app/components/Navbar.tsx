/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, BookOpen, MessageSquare, LogOut, Shield, ClipboardList, User, Calendar } from 'lucide-react';
import { getUser, logout } from 'app/lib/auth';
import api from 'app/lib/api';

export default function Navbar() {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    setUser(u);
    if (u) {
      api.get('/profile').then(({ data }) => {
        setUser((prev: any) => ({ ...prev, profile_photo: data.profile_photo }));
      }).catch(() => { });
    }
  }, []);

  const links = [
    { href: '/notices', label: 'Notices', icon: Bell },
    { href: '/resources', label: 'Resources', icon: BookOpen },
    { href: '/results', label: 'Results', icon: ClipboardList },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    ...(user?.role !== 'student' ? [
      { href: '/routine/manage', label: 'Routine', icon: Calendar },
      { href: '/assignments/manage', label: 'Assignments', icon: ClipboardList },
      { href: '/admin', label: 'Admin', icon: Shield },
    ] : [
      { href: '/routine', label: 'Routine', icon: Calendar },
      { href: '/assignments', label: 'Assignments', icon: ClipboardList },]),
  ];

  // component mount na hoya porjonto server ar browser-er modhe mil rakhar jonno null ba minimal HTML return kora hoy
  if (!mounted) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="font-bold text-blue-600 text-base">Smart Hub</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/notices" className="font-bold text-blue-600 text-base">
          Smart Hub
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href} href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${path === href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user && <Link href="/profile" className='flex items-center gap-x-1'>
            <span className='border m-2 size-7.5 rounded-full overflow-hidden flex items-center justify-center'>
              {user.profile_photo ? (
                <img
                  src={`http://localhost:5000/${user.profile_photo}`}
                  alt="profile"
                  className="object-cover size-full"
                />
              ) : (
                <User size={16} className="text-gray-400" />
              )}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {user.full_name}
            </span></Link>}
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
            <LogOut size={16} />
          </button>

        </div>
      </div>
    </nav>
  );
}