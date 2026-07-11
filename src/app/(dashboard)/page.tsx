import { getExpenses, getGoals } from '@/actions';
import { CreditCard, Target } from 'lucide-react';

export default async function Dashboard() {
  const expenses = await getExpenses();
  const goals = await getGoals();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyExpenses = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const activeGoals = goals.filter(g => !g.isCompleted).length;

  return (
    <div className="grid grid-cols-2">
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
          <CreditCard size={32} color="var(--danger-color)" />
        </div>
        <h3 className="text-secondary">Monthly Expenses</h3>
        <h1 style={{ color: 'var(--danger-color)', margin: 0 }}>${monthlyExpenses.toFixed(2)}</h1>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
          <Target size={32} color="var(--success-color)" />
        </div>
        <h3 className="text-secondary">Active Goals</h3>
        <h1 style={{ color: 'var(--success-color)', margin: 0 }}>{activeGoals}</h1>
      </div>
    </div>
  );
}
