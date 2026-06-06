'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/matches/new', label: '+ Add Match' },
  { href: '/stats', label: 'Stats' },
  { href: '/players', label: 'Players' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-1">
          <span className="text-xl mr-4">⚽</span>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-green-900 text-white'
                  : 'hover:bg-green-600 text-green-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          onClick={logout}
          className="text-xs text-green-300 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
