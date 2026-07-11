'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/actions';

export default function Navigation() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--primary-color)' }}>My Muhasabah</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <LogOut size={18} /> Logout
        </button>
      </header>
      
      <nav>
        <Link href="/" className={pathname === '/' ? 'active' : ''}>Dashboard</Link>
        <Link href="/expenses" className={pathname === '/expenses' ? 'active' : ''}>Expenses</Link>
        <Link href="/goals" className={pathname === '/goals' ? 'active' : ''}>Goals</Link>
        <Link href="/religious" className={pathname === '/religious' ? 'active' : ''}>Religious</Link>
      </nav>
    </>
  );
}
