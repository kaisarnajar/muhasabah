import { getTransactions, addTransaction } from '@/actions';
import { PlusCircle, Receipt, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  // Calculate Summaries
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const calculateNet = (filterDate: Date) => {
    return transactions
      .filter(t => new Date(t.date) >= filterDate)
      .reduce((acc, t) => {
        const amt = Number(t.amount);
        return acc + (t.type === 'INCOME' ? amt : -amt);
      }, 0);
  };

  const netToday = calculateNet(today);
  const netWeek = calculateNet(startOfWeek);
  const netMonth = calculateNet(startOfMonth);
  const netYear = calculateNet(startOfYear);

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Receipt color="var(--c-primary)" />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Financial Tracker</h2>
      </div>

      {/* Summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Today', net: netToday },
          { label: 'This Week', net: netWeek },
          { label: 'This Month', net: netMonth },
          { label: 'This Year', net: netYear }
        ].map(summary => (
          <div key={summary.label} style={{ backgroundColor: 'var(--c-surface-container-high)', padding: '16px', borderRadius: '8px' }}>
            <p className="text-label-sm text-on-surface-variant" style={{ marginBottom: '8px' }}>{summary.label}</p>
            <p className="text-title-lg" style={{ color: summary.net >= 0 ? 'var(--c-primary)' : 'var(--c-error)', fontWeight: 'bold' }}>
              {summary.net >= 0 ? '+' : '-'}${Math.abs(summary.net).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <form action={addTransaction} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <select 
          name="type"
          className="search-input"
          style={{ flex: 1, minWidth: '120px', borderRadius: '8px', WebkitAppearance: 'none' }}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <input 
          type="number" 
          name="amount"
          step="0.01" 
          placeholder="Amount" 
          className="search-input"
          required 
          style={{ flex: 1, minWidth: '100px', borderRadius: '8px' }}
        />
        <input 
          type="text" 
          name="description"
          placeholder="Description" 
          className="search-input"
          required 
          style={{ flex: 2, minWidth: '200px', borderRadius: '8px' }}
        />
        <select 
          name="category"
          className="search-input"
          style={{ flex: 1, minWidth: '150px', borderRadius: '8px', WebkitAppearance: 'none' }}
        >
          <option>General</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Utilities</option>
          <option>Housing</option>
          <option>Salary</option>
          <option>Freelance</option>
          <option>Charity/Sadaqah</option>
        </select>
        <input 
          type="date" 
          name="date"
          className="search-input"
          defaultValue={now.toISOString().split('T')[0]}
          required 
          style={{ flex: 1, minWidth: '150px', borderRadius: '8px' }}
        />
        <button type="submit" className="primary-btn" style={{ width: '100%', borderRadius: '8px' }}>
          <PlusCircle size={20} /> Add Transaction
        </button>
      </form>

      <div>
        <h3 className="text-body-md text-on-surface-variant" style={{ marginBottom: '16px', fontWeight: 600 }}>Recent Transactions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {transactions.map(t => (
            <div key={t.id} className="habit-item" style={{ backgroundColor: 'var(--c-surface-container-low)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {t.type === 'INCOME' ? <ArrowUpCircle color="var(--c-primary)" size={32} /> : <ArrowDownCircle color="var(--c-error)" size={32} />}
                <div>
                  <p className="text-body-md" style={{ fontWeight: 600 }}>{t.description}</p>
                  <p className="text-label-sm text-on-surface-variant">{t.category} • {t.date.toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ fontWeight: 600, color: t.type === 'INCOME' ? 'var(--c-primary)' : 'var(--c-error)', fontSize: '1.2rem' }}>
                {t.type === 'INCOME' ? '+' : '-'}${Number(t.amount).toFixed(2)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-on-surface-variant">No transactions recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
