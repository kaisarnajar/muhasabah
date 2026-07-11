'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions';

export default function Navigation() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <>
      <aside className="sidebar">
        <div style={{ marginBottom: '40px', padding: '0 8px' }}>
          <h1 className="text-headline-md text-on-surface">My Muhasabah</h1>
          <p className="text-label-sm text-on-surface-variant" style={{ opacity: 0.7 }}>Focus & Clarity</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-body-md">Dashboard</span>
          </Link>
          <Link href="/transactions" className={`nav-item ${pathname === '/transactions' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">payments</span>
            <span className="text-body-md">Finances</span>
          </Link>
          <Link href="/goals" className={`nav-item ${pathname === '/goals' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">target</span>
            <span className="text-body-md">Goals</span>
          </Link>
          <Link href="/religious" className={`nav-item ${pathname === '/religious' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="text-body-md">Spiritual</span>
          </Link>
          <Link href="/journal" className={`nav-item ${pathname === '/journal' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">menu_book</span>
            <span className="text-body-md">Journal</span>
          </Link>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--c-outline-variant)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button className="primary-btn" style={{ width: '100%', marginBottom: '16px', padding: '12px' }}>
            Quick Add
          </button>
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', textAlign: 'left' }}>
            <span className="material-symbols-outlined">logout</span>
            <span className="text-body-md">Logout</span>
          </button>
        </div>
      </aside>

      <header className="topbar">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)', fontSize: '20px' }}>search</span>
            <input className="search-input" placeholder="Search entries, goals..." type="text"/>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="primary-btn">
            New Entry
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ color: 'var(--c-on-surface-variant)' }}>
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--c-outline-variant)', backgroundColor: 'var(--c-surface-container-high)' }}>
              {/* Fallback avatar if no image */}
              <span className="material-symbols-outlined" style={{ display: 'block', margin: '4px auto', color: 'var(--c-on-surface)' }}>person</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
