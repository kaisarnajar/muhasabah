'use client';

import { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { addTransaction } from '@/actions';

export default function AddTransactionForm({ type }: { type: 'INCOME' | 'EXPENSE' }) {
  const [isOpen, setIsOpen] = useState(false);
  const now = new Date();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="primary-btn" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '12px 24px', 
          borderRadius: '8px', 
          backgroundColor: type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)', 
          color: type === 'INCOME' ? 'var(--c-on-secondary)' : 'var(--c-on-error)' 
        }}
      >
        <PlusCircle size={20} /> Add {type === 'INCOME' ? 'Income' : 'Expense'}
      </button>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '24px', border: `1px solid ${type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)'}`, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="text-title-md" style={{ fontWeight: 600 }}>
          New {type === 'INCOME' ? 'Income' : 'Expense'}
        </h3>
        <button onClick={() => setIsOpen(false)} style={{ color: 'var(--c-on-surface-variant)' }}>
          <X size={24} />
        </button>
      </div>

      <form 
        action={async (formData) => {
          await addTransaction(formData);
          setIsOpen(false);
        }} 
        style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
      >
        <input type="hidden" name="type" value={type} />
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
          {type === 'INCOME' ? (
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
        <button type="submit" className="primary-btn" style={{ width: '100%', borderRadius: '8px', backgroundColor: type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)', color: type === 'INCOME' ? 'var(--c-on-secondary)' : 'var(--c-on-error)' }}>
          Save {type === 'INCOME' ? 'Income' : 'Expense'}
        </button>
      </form>
    </div>
  );
}
