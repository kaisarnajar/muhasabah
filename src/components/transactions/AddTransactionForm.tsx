'use client';

import { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { addTransaction } from '@/actions';

export default function AddTransactionForm() {
  const [openType, setOpenType] = useState<'INCOME' | 'EXPENSE' | null>(null);
  const now = new Date();

  if (!openType) {
    return (
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <button 
          onClick={() => setOpenType('EXPENSE')}
          className="primary-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', backgroundColor: 'var(--c-error)', color: 'var(--c-on-error)' }}
        >
          <PlusCircle size={20} /> Add Expense
        </button>
        <button 
          onClick={() => setOpenType('INCOME')}
          className="primary-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', backgroundColor: 'var(--c-secondary)', color: 'var(--c-on-secondary)' }}
        >
          <PlusCircle size={20} /> Add Income
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '32px', border: `1px solid ${openType === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)'}`, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="text-title-md" style={{ fontWeight: 600 }}>
          New {openType === 'INCOME' ? 'Income' : 'Expense'}
        </h3>
        <button onClick={() => setOpenType(null)} style={{ color: 'var(--c-on-surface-variant)' }}>
          <X size={24} />
        </button>
      </div>

      <form 
        action={async (formData) => {
          await addTransaction(formData);
          setOpenType(null);
        }} 
        style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
      >
        <input type="hidden" name="type" value={openType} />
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
          {openType === 'INCOME' ? (
            <>
              <option>Salary</option>
              <option>Freelance</option>
              <option>Business</option>
              <option>Gift</option>
              <option>General</option>
              <option>Other</option>
            </>
          ) : (
            <>
              <option>Food</option>
              <option>Transport</option>
              <option>Utilities</option>
              <option>Housing</option>
              <option>Charity/Sadaqah</option>
              <option>Health</option>
              <option>Shopping</option>
              <option>General</option>
              <option>Other</option>
            </>
          )}
        </select>
        <input 
          type="date" 
          name="date"
          className="search-input"
          defaultValue={now.toISOString().split('T')[0]}
          required 
          style={{ flex: 1, minWidth: '150px', borderRadius: '8px' }}
        />
        <button type="submit" className="primary-btn" style={{ width: '100%', borderRadius: '8px', backgroundColor: openType === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)', color: openType === 'INCOME' ? 'var(--c-on-secondary)' : 'var(--c-on-error)' }}>
          Save {openType === 'INCOME' ? 'Income' : 'Expense'}
        </button>
      </form>
    </div>
  );
}
