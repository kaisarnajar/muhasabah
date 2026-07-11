import { getTransactions } from '@/actions';
import TasksOfTheDay from '@/components/dashboard/TasksOfTheDay';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { href: '/transactions', icon: 'add_card', label: 'Add Transaction', bg: 'var(--c-error-container)', color: 'var(--c-error)' },
  { href: '/journal', icon: 'edit_note', label: 'Log Journal', bg: 'var(--c-primary-container)', color: 'var(--c-primary)' },
  { href: '/goals', icon: 'flag', label: 'Update Goal', bg: 'var(--c-secondary-container)', color: 'var(--c-secondary)' },
  { href: '/tomorrow', icon: 'event_upcoming', label: 'Plan Tomorrow', bg: 'var(--c-tertiary-container)', color: 'var(--c-on-tertiary-container)' },
  { href: '/religious', icon: 'auto_awesome', label: 'Spiritual', bg: 'var(--c-surface-variant)', color: 'var(--c-on-surface)' },
];

export default async function Dashboard() {
  const transactions = await getTransactions();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(todayStart.getDate() - todayStart.getDay());
  
  const dailySpending = transactions
    .filter(t => new Date(t.date) >= todayStart && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const weeklySpending = transactions
    .filter(t => new Date(t.date) >= weekStart && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const monthlySpending = transactions
    .filter(t => new Date(t.date) >= startOfMonth && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const yearlySpending = transactions
    .filter(t => new Date(t.date) >= startOfYear && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <>
      {/* SPENDING SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'TODAY', amount: dailySpending },
          { label: 'THIS WEEK', amount: weeklySpending },
          { label: 'THIS MONTH', amount: monthlySpending },
          { label: 'THIS YEAR', amount: yearlySpending }
        ].map((item, i) => (
          <div key={i} className="card flex-col justify-center p-16" style={{ backgroundColor: 'var(--c-surface-container-high)' }}>
            <span className="text-label-sm text-on-surface-variant mb-8">{item.label}</span>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-error)' }}>${item.amount.toFixed(2)}</h3>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {QUICK_ACTIONS.map((action, i) => (
          <Link key={i} href={action.href} className="card flex-row p-16" style={{ gap: '16px', textDecoration: 'none', color: 'inherit' }}>
            <span style={{ backgroundColor: action.bg, color: action.color, padding: '12px', borderRadius: '50%', display: 'flex' }} className="material-symbols-outlined">{action.icon}</span>
            <span className="text-title-md" style={{ fontWeight: 600 }}>{action.label}</span>
            <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: 'var(--c-on-surface-variant)' }}>chevron_right</span>
          </Link>
        ))}
      </div>

      <div className="grid-container">
        <div className="col-span-12 flex-col gap-24" style={{ alignContent: 'start' }}>
          <TasksOfTheDay dateStr={todayStr} />
        </div>
      </div>
    </>
  );
}
