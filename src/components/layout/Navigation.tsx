'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/features/auth/actions';
import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';

interface NotificationItem {
  title: string;
  days: number;
  lastDone: Date | null;
}

interface NavigationProps {
  notifications?: NotificationItem[];
}

export default function Navigation({ notifications = [] }: NavigationProps) {
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logoutAction();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
        setShowNotificationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Close mobile menu when navigating
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
              <path 
                d="M 50 10 A 40 40 0 1 0 90 50 A 32 32 0 1 1 50 10 Z" 
                fill="url(#navGoldGradient)"
              />
              <path 
                d="M 62 28 Q 62 38 72 38 Q 62 38 62 48 Q 62 38 52 38 Q 62 38 62 28 Z" 
                fill="url(#navGoldGradientLight)"
              />
              <defs>
                <linearGradient id="navGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--c-primary)" />
                  <stop offset="100%" stopColor="#d4af37" />
                </linearGradient>
                <linearGradient id="navGoldGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#f3e5ab" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-headline-md text-primary" style={{ fontWeight: 800, margin: 0, lineHeight: 1 }}>Muhasabah</h1>
          </div>
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
          <Link href="/religious" className={`nav-item ${pathname === '/religious' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="text-body-md">Spiritual</span>
          </Link>
          <Link href="/dua" className={`nav-item ${pathname === '/dua' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">favorite</span>
            <span className="text-body-md">Dua List</span>
          </Link>
          <Link href="/timetable" className={`nav-item ${pathname === '/timetable' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="text-body-md">Time Table</span>
          </Link>
          <Link href="/goals" className={`nav-item ${pathname === '/goals' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">target</span>
            <span className="text-body-md">Goals</span>
          </Link>
          <Link href="/tasks" className={`nav-item ${pathname.startsWith('/tasks') ? 'active' : ''}`}>
            <span className="material-symbols-outlined">checklist</span>
            <span className="text-body-md">Tasks</span>
          </Link>
          <Link href="/journal/learning" className={`nav-item ${pathname.startsWith('/journal/learning') ? 'active' : ''}`}>
            <span className="material-symbols-outlined">school</span>
            <span className="text-body-md">Career Learnings</span>
          </Link>
          <Link href="/journal/office" className={`nav-item ${pathname.startsWith('/journal/office') ? 'active' : ''}`}>
            <span className="material-symbols-outlined">work</span>
            <span className="text-body-md">Office Work</span>
          </Link>
          <Link href="/relapse" className={`nav-item ${pathname === '/relapse' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">health_and_safety</span>
            <span className="text-body-md">Habit Tracker</span>
          </Link>
          <Link href="/fitness" className={`nav-item ${pathname === '/fitness' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">fitness_center</span>
            <span className="text-body-md">Fitness</span>
          </Link>
          <Link href="/transactions" className={`nav-item ${pathname === '/transactions' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">payments</span>
            <span className="text-body-md">Finances</span>
          </Link>
          <Link href="/debts" className={`nav-item ${pathname === '/debts' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">account_balance</span>
            <span className="text-body-md">Ledger</span>
          </Link>
          <Link href="/books" className={`nav-item ${pathname === '/books' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">menu_book</span>
            <span className="text-body-md">Books</span>
          </Link>
          <Link href="/documents" className={`nav-item ${pathname === '/documents' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">description</span>
            <span className="text-body-md">Documents</span>
          </Link>
          <Link href="/notes" className={`nav-item ${pathname === '/notes' ? 'active' : ''}`}>
            <span className="material-symbols-outlined">sticky_note_2</span>
            <span className="text-body-md">Notes</span>
          </Link>
          <Link href="/journal/misc" className={`nav-item ${pathname.startsWith('/journal/misc') ? 'active' : ''}`}>
            <span className="material-symbols-outlined">folder_open</span>
            <span className="text-body-md">Miscellaneous</span>
          </Link>
        </nav>
      </aside>
 
       <header className="topbar">
         <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
           <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
             <span className="material-symbols-outlined">menu</span>
           </button>
         </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }} ref={menuRef}>
             {/* Notification Bell */}
             <div style={{ position: 'relative' }}>
               <button
                 type="button"
                 onClick={() => {
                   setShowNotificationMenu(!showNotificationMenu);
                   setShowProfileMenu(false);
                 }}
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   width: '36px',
                   height: '36px',
                   borderRadius: '50%',
                   backgroundColor: 'var(--c-surface-container-high)',
                   border: '1px solid var(--c-outline-variant)',
                   color: 'var(--c-on-surface)',
                   cursor: 'pointer',
                   position: 'relative',
                   transition: 'background-color 0.2s',
                   padding: 0
                 }}
                 title="Notifications"
               >
                 <Bell size={18} />
                 {notifications.length > 0 && (
                   <span
                     style={{
                       position: 'absolute',
                       top: '2px',
                       right: '2px',
                       width: '8px',
                       height: '8px',
                       borderRadius: '50%',
                       backgroundColor: 'var(--c-error)',
                       border: '1.5px solid var(--c-surface)',
                       animation: 'pulse 2s infinite'
                     }}
                   />
                 )}
               </button>

               {showNotificationMenu && (
                 <div style={{
                   position: 'absolute',
                   top: '48px',
                   right: '0',
                   backgroundColor: 'var(--c-surface-container-lowest)',
                   border: '1px solid var(--c-outline-variant)',
                   borderRadius: '12px',
                   padding: '12px 0',
                   boxShadow: 'var(--shadow-lg)',
                   minWidth: '300px',
                   zIndex: 100
                 }}>
                   <div style={{ padding: '0 16px 8px 16px', borderBottom: '1px solid var(--c-outline-variant)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <p className="text-body-md" style={{ fontWeight: 700, margin: 0 }}>Notifications</p>
                     <span style={{
                       fontSize: '11px',
                       fontWeight: 700,
                       backgroundColor: notifications.length > 0 ? 'var(--c-error-container)' : 'var(--c-surface-container-high)',
                       color: notifications.length > 0 ? 'var(--c-on-error-container)' : 'var(--c-on-surface-variant)',
                       padding: '2px 8px',
                       borderRadius: '20px'
                     }}>
                       {notifications.length} Overdue
                     </span>
                   </div>

                   <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '0 8px' }}>
                     {notifications.map((item, index) => (
                       <Link 
                         key={index} 
                         href="/tasks" 
                         style={{ textDecoration: 'none' }}
                         onClick={() => setShowNotificationMenu(false)}
                       >
                         <div style={{
                           padding: '10px 12px',
                           borderRadius: '8px',
                           backgroundColor: 'var(--c-surface-container-low)',
                           border: '1.5px solid var(--c-outline-variant)',
                           marginBottom: index !== notifications.length - 1 ? '8px' : '0',
                           display: 'flex',
                           alignItems: 'start',
                           gap: '10px',
                           transition: 'all 0.2s',
                           cursor: 'pointer'
                         }}
                         onMouseEnter={(e) => {
                           e.currentTarget.style.backgroundColor = 'var(--c-surface-container-high)';
                           e.currentTarget.style.borderColor = 'var(--c-primary)';
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.backgroundColor = 'var(--c-surface-container-low)';
                           e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
                         }}
                         >
                           <AlertTriangle size={16} color="var(--c-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                             <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--c-on-surface)' }}>
                               {item.title} Overdue
                             </span>
                             <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 550 }}>
                               Crossed 35 days ({item.days} days since last done).
                             </span>
                           </div>
                         </div>
                       </Link>
                     ))}

                     {notifications.length === 0 && (
                       <p style={{ textAlign: 'center', color: 'var(--c-on-surface-variant)', fontSize: '13px', padding: '16px 0', margin: 0, fontWeight: 500 }}>
                         🎉 All trackers are up to date!
                       </p>
                     )}
                   </div>
                 </div>
               )}
             </div>

             <button 
               type="button"
               onClick={() => {
                 setShowProfileMenu(!showProfileMenu);
                 setShowNotificationMenu(false);
               }}
               style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--c-outline-variant)', backgroundColor: 'var(--c-surface-container-high)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             >
               <span className="text-label-sm text-primary" style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0px' }}>KN</span>
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
                <p className="text-body-md" style={{ fontWeight: 600 }}>Your Account</p>
                <p className="text-label-sm text-on-surface-variant">User Profile</p>
              </div>
              <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                <button className="nav-item" style={{ width: '100%', textAlign: 'left', padding: '8px 16px', borderRadius: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_circle</span>
                  <span className="text-body-md">Profile Settings</span>
                </button>
              </Link>
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
