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
  
  const monthlySpending = transactions
    .filter(t => new Date(t.date) >= startOfMonth && t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const monthlyIncome = transactions
    .filter(t => new Date(t.date) >= startOfMonth && t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <>
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
      </div>

      <div className="grid-container">
        <div className="col-span-12 md:col-span-8" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', alignContent: 'start' }}>
          <TasksOfTheDay dateStr={todayStr} />
        </div>

        <div className="col-span-12 md:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ backgroundColor: '#0a0a0a', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <span className="text-label-sm" style={{ letterSpacing: '0.05em', opacity: 0.8 }}>MONTHLY SPENDING</span>
              <span className="material-symbols-outlined">trending_down</span>
            </div>
            <div>
              <h3 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>${monthlySpending.toFixed(2)}</h3>
              <p className="text-label-sm" style={{ opacity: 0.7 }}>Expenses tracked this month</p>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="text-headline-md">Top Goals</h3>
              <Link href="/goals" className="text-label-sm text-primary">View All</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {goals.slice(0, 3).map((goal, i) => {
                const colors = ['var(--c-secondary)', 'var(--c-tertiary-container)', 'var(--c-on-tertiary-container)'];
                return (
                  <div key={goal.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                      <span className="text-body-md" style={{ fontWeight: 500 }}>{goal.title}</span>
                      <span className="text-label-sm">{goal.isCompleted ? '100%' : '50%'}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: goal.isCompleted ? '100%' : '50%', backgroundColor: colors[i % colors.length] }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>


      </div>
    </>
  );
}
