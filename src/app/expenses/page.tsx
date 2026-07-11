import { getExpenses, addExpense } from '@/actions';
import { PlusCircle, Receipt } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Receipt color="var(--primary-color)" />
        <h2 style={{ margin: 0 }}>Expense Tracker</h2>
      </div>

      <form action={addExpense} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input 
          type="number" 
          name="amount"
          step="0.01" 
          placeholder="Amount" 
          required 
          style={{ flex: 1, minWidth: '100px' }}
        />
        <input 
          type="text" 
          name="description"
          placeholder="Description" 
          required 
          style={{ flex: 2, minWidth: '200px' }}
        />
        <select 
          name="category"
          style={{ flex: 1, minWidth: '150px' }}
        >
          <option>General</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Utilities</option>
          <option>Charity/Sadaqah</option>
        </select>
        <input 
          type="date" 
          name="date"
          required 
          style={{ flex: 1, minWidth: '150px' }}
        />
        <button type="submit" className="primary" style={{ width: '100%' }}>
          <PlusCircle size={20} /> Add Expense
        </button>
      </form>

      <div>
        <h3 className="text-secondary" style={{ marginBottom: '1rem' }}>Recent Expenses</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {expenses.map(exp => (
            <div key={exp.id} className="list-item" style={{ backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
              <div>
                <p style={{ fontWeight: 500 }}>{exp.description}</p>
                <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{exp.category} • {exp.date.toLocaleDateString()}</p>
              </div>
              <div style={{ fontWeight: 600, color: 'var(--danger-color)' }}>
                -${Number(exp.amount).toFixed(2)}
              </div>
            </div>
          ))}
          {expenses.length === 0 && <p className="text-secondary">No expenses recorded yet.</p>}
        </div>
      </div>
    </div>
  );
}
