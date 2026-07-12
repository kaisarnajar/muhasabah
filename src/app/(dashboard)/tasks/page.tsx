import Link from 'next/link';

const TASK_SECTIONS = [
  { href: '/tasks/today', icon: 'today', label: 'Today\'s Task List', bg: 'var(--c-primary-container)', color: 'var(--c-primary)' },
  { href: '/tasks/tomorrow', icon: 'event_upcoming', label: 'Plan Tomorrow', bg: 'var(--c-secondary-container)', color: 'var(--c-secondary)' },
  { href: '/tasks/weekend', icon: 'calendar_clock', label: 'Weekend Tasks', bg: 'var(--c-tertiary-container)', color: 'var(--c-on-tertiary-container)' },
  { href: '/tasks/history', icon: 'history', label: 'Task History', bg: 'var(--c-surface-variant)', color: 'var(--c-on-surface-variant)' },
];

export default function TasksPage() {
  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h2 className="text-headline-md" style={{ margin: 0 }}>Tasks</h2>
        <p className="text-body-md text-on-surface-variant">Manage your daily, upcoming, and past tasks.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {TASK_SECTIONS.map((action, i) => (
          <Link key={i} href={action.href} className="card flex-row p-16" style={{ gap: '16px', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ backgroundColor: action.bg, color: action.color, padding: '12px', borderRadius: '50%', display: 'flex' }} className="material-symbols-outlined">{action.icon}</span>
            <span className="text-title-md" style={{ fontWeight: 600 }}>{action.label}</span>
            <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: 'var(--c-on-surface-variant)' }}>chevron_right</span>
          </Link>
        ))}
      </div>
    </>
  );
}
