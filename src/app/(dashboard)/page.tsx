import { getTransactions, getGoals } from '@/actions';
import TasksOfTheDay from './TasksOfTheDay';
import Link from 'next/link';

export default async function Dashboard() {
  const transactions = await getTransactions();
  const goals = await getGoals();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

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

  const monthlyIncome = transactions
    .filter(t => new Date(t.date) >= startOfMonth && t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <>
      {/* SPENDING SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>TODAY</span>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-error)' }}>${dailySpending.toFixed(2)}</h3>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>THIS WEEK</span>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-error)' }}>${weeklySpending.toFixed(2)}</h3>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>THIS MONTH</span>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-error)' }}>${monthlySpending.toFixed(2)}</h3>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>THIS YEAR</span>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-error)' }}>${yearlySpending.toFixed(2)}</h3>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <Link href="/transactions" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '16px' }}>
          <span style={{ backgroundColor: 'var(--c-error-container)', color: 'var(--c-error)', padding: '12px', borderRadius: '50%', display: 'flex' }} className="material-symbols-outlined">add_card</span>
          <span className="text-title-md" style={{ fontWeight: 600 }}>Add Transaction</span>
          <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: 'var(--c-on-surface-variant)' }}>chevron_right</span>
        </Link>
        <Link href="/journal" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '16px' }}>
          <span style={{ backgroundColor: 'var(--c-primary-container)', color: 'var(--c-primary)', padding: '12px', borderRadius: '50%', display: 'flex' }} className="material-symbols-outlined">edit_note</span>
          <span className="text-title-md" style={{ fontWeight: 600 }}>Log Journal</span>
          <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: 'var(--c-on-surface-variant)' }}>chevron_right</span>
        </Link>
        <Link href="/goals" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '16px' }}>
          <span style={{ backgroundColor: 'var(--c-secondary-container)', color: 'var(--c-secondary)', padding: '12px', borderRadius: '50%', display: 'flex' }} className="material-symbols-outlined">flag</span>
          <span className="text-title-md" style={{ fontWeight: 600 }}>Update Goal</span>
          <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: 'var(--c-on-surface-variant)' }}>chevron_right</span>
        </Link>
        <Link href="/tomorrow" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '16px' }}>
          <span style={{ backgroundColor: 'var(--c-tertiary-container)', color: 'var(--c-on-tertiary-container)', padding: '12px', borderRadius: '50%', display: 'flex' }} className="material-symbols-outlined">event_upcoming</span>
          <span className="text-title-md" style={{ fontWeight: 600 }}>Plan Tomorrow</span>
          <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: 'var(--c-on-surface-variant)' }}>chevron_right</span>
        </Link>
        <Link href="/religious" className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'inherit', padding: '16px' }}>
          <span style={{ backgroundColor: 'var(--c-surface-variant)', color: 'var(--c-on-surface)', padding: '12px', borderRadius: '50%', display: 'flex' }} className="material-symbols-outlined">auto_awesome</span>
          <span className="text-title-md" style={{ fontWeight: 600 }}>Spiritual</span>
          <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: 'var(--c-on-surface-variant)' }}>chevron_right</span>
        </Link>
      </div>

      <div className="grid-container">
        <div className="col-span-12" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignContent: 'start' }}>
          <TasksOfTheDay dateStr={todayStr} />
        </div>
      </div>
    </>
  );
}
