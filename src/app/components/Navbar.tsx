/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, BookOpen, MessageSquare, LogOut, Shield, ClipboardList } from 'lucide-react';
import { getUser, logout } from 'app/lib/auth';

export default function Navbar() {
  const path = usePathname();
  // hydration fix korar jonno state use kora hoyeche
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // browser-e component mount hobar por user data load hobe
    setMounted(true);
    setUser(getUser());
  }, []);

  const links = [
    { href: '/notices', label: 'Notices', icon: Bell },
    { href: '/resources', label: 'Resources', icon: BookOpen },
    { href: '/results', label: 'Results', icon: ClipboardList },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
    ...(user?.role !== 'student' ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
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
          {user && <span className="text-sm text-gray-500">{user.full_name}</span>}
          <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}