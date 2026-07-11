'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { addDebtRecord } from '@/actions/debts';

export default function AddDebtRecordForm({ personId }: { personId: number }) {
  const [showForm, setShowForm] = useState(false);

  if (!showForm) {
    return (
      <div style={{ marginBottom: '40px' }}>
        <button 
          onClick={() => setShowForm(true)} 
          className="primary-btn" 
          style={{ padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} /> Add Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '40px', position: 'relative' }}>
      <button 
        onClick={() => setShowForm(false)} 
        style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
      >
        <X size={24} />
      </button>
      
      <h3 className="text-title-lg" style={{ marginBottom: '16px' }}>Add Transaction</h3>
      
      <form action={async (formData) => {
        await addDebtRecord(formData);
        setShowForm(false);
      }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input type="hidden" name="personId" value={personId} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <input 
            type="number" 
            step="0.01"
            name="amount" 
            placeholder="Amount ($)" 
            className="search-input" 
            required 
          />
          <select name="type" className="search-input" required>
            <option value="CREDIT">I gave them money (Credit)</option>
            <option value="DEBIT">I borrowed money (Debit)</option>
          </select>
          <input 
            type="date" 
            name="date" 
            className="search-input" 
            defaultValue={new Date().toISOString().split('T')[0]} 
            required 
          />
        </div>
        <input 
          type="text" 
          name="notes" 
          placeholder="Notes (optional)" 
          className="search-input" 
        />
        <button type="submit" className="primary-btn" style={{ alignSelf: 'flex-start' }}>
          <Plus size={20} /> Add Record
        </button>
      </form>
    </div>
  );
}
