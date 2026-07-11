'use client';

import { useState } from 'react';
import { addDebtRecord } from '@/actions/debts';
import { Plus, X, Upload } from 'lucide-react';

export default function AddDebtForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await addDebtRecord(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 className="text-headline-md">Add New Record</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className="text-label-sm">TYPE</label>
              <select name="type" className="search-input" style={{ width: '100%', marginTop: '8px' }} required>
                <option value="CREDIT">Credit (Money I lent)</option>
                <option value="DEBIT">Debit (Money I borrowed)</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-label-sm">AMOUNT</label>
              <input type="number" step="0.01" name="amount" className="search-input" style={{ width: '100%', marginTop: '8px' }} required />
            </div>
          </div>

          <div>
            <label className="text-label-sm">PERSON'S NAME</label>
            <input type="text" name="personName" className="search-input" style={{ width: '100%', marginTop: '8px' }} required />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label className="text-label-sm">DATE</label>
              <input type="date" name="date" className="search-input" style={{ width: '100%', marginTop: '8px' }} required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-label-sm">DUE DATE (Optional)</label>
              <input type="date" name="dueDate" className="search-input" style={{ width: '100%', marginTop: '8px' }} />
            </div>
          </div>

          <div>
            <label className="text-label-sm">CATEGORY (Optional)</label>
            <input type="text" name="category" placeholder="e.g. Personal, Business, Family" className="search-input" style={{ width: '100%', marginTop: '8px' }} />
          </div>

          <div>
            <label className="text-label-sm">NOTES (Optional)</label>
            <textarea name="notes" className="search-input" rows={3} style={{ width: '100%', marginTop: '8px', borderRadius: '16px', resize: 'vertical' }}></textarea>
          </div>

          <div>
            <label className="text-label-sm">ATTACHMENT (Optional Receipt/Image)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <input type="file" name="attachment" id="attachment" style={{ display: 'none' }} />
              <label htmlFor="attachment" className="search-input" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: 'var(--c-surface-container-high)' }}>
                <Upload size={18} /> Choose File...
              </label>
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '16px', padding: '12px' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </div>
    </div>
  );
}
