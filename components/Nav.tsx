'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/matches/new', label: '+ Wedstrijd' },
  { href: '/stats', label: 'Statistieken' },
  { href: '/players', label: 'Spelers' },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      Promise.resolve().then(() => setDark(true));
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  if (pathname === '/login') return null;

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return (
    <nav style={{ background: 'var(--panel)', borderBottom: '1px solid var(--line)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
          gap: 4,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {/* Links — no football emoji, nowrap so "+ Wedstrijd" stays on one line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                color: pathname === l.href ? 'var(--text)' : 'var(--muted)',
                background: pathname === l.href ? 'var(--panel-2)' : 'transparent',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 13,
                fontWeight: 500,
                transition: 'background 120ms, color 120ms',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={toggleTheme}
            title={dark ? 'Lichte modus' : 'Donkere modus'}
            style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: '5px 9px',
              cursor: 'pointer',
              fontSize: 15,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {dark ? '☀️' : '🌙'}
          </button>

          <button
            onClick={logout}
            style={{ fontSize: 12, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Uitloggen
          </button>
        </div>
      </div>
    </nav>
  );
}
