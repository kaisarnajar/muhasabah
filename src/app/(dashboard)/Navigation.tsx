'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/actions';
import { useState, useRef, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logoutAction();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ marginBottom: '40px', padding: '0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-headline-md text-on-surface">My Muhasabah</h1>
          {/* Close button for mobile inside sidebar (optional but good practice) */}
          <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-body-md">Dashboard</span>
          </Link>
          <Link href="/tomorrow" className={`nav-item ${pathname === '/tomorrow' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">event_upcoming</span>
            <span className="text-body-md">Tomorrow</span>
          </Link>
          <Link href="/transactions" className={`nav-item ${pathname === '/transactions' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">payments</span>
            <span className="text-body-md">Finances</span>
          </Link>
          <Link href="/debts" className={`nav-item ${pathname === '/debts' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">account_balance</span>
            <span className="text-body-md">Credit & Debit</span>
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
      </aside>

      <header className="topbar">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)', fontSize: '20px' }}>search</span>
            <input className="search-input" placeholder="Search entries, goals..." type="text"/>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }} ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--c-outline-variant)', backgroundColor: 'var(--c-surface-container-high)', cursor: 'pointer', padding: 0 }}
          >
            <span className="material-symbols-outlined" style={{ display: 'block', marginTop: '3px', color: 'var(--c-on-surface)' }}>person</span>
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '0',
              backgroundColor: 'var(--c-surface-container-lowest)',
              border: '1px solid var(--c-outline-variant)',
              borderRadius: '12px',
              padding: '8px 0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              minWidth: '200px',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--c-outline-variant)', marginBottom: '8px' }}>
                <p className="text-body-md" style={{ fontWeight: 600 }}>Kaisar Najar</p>
                <p className="text-label-sm text-on-surface-variant">User Profile</p>
              </div>
              <button className="nav-item" style={{ width: '100%', textAlign: 'left', padding: '8px 16px', borderRadius: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_circle</span>
                <span className="text-body-md">Update Photo</span>
              </button>
              <button onClick={handleLogout} className="nav-item" style={{ width: '100%', textAlign: 'left', padding: '8px 16px', borderRadius: 0, color: 'var(--c-error)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                <span className="text-body-md">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
