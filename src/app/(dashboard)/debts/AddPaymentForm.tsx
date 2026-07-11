'use client';

import { useState } from 'react';
import { addDebtPayment } from '@/actions/debts';
import { Plus, X } from 'lucide-react';

export default function AddPaymentForm({ debtId, onClose }: { debtId: number, onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      await addDebtPayment(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 className="text-headline-md">Record Payment</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="hidden" name="debtId" value={debtId} />
          
          <div>
            <label className="text-label-sm">AMOUNT PAID</label>
            <input type="number" step="0.01" name="amount" className="search-input" style={{ width: '100%', marginTop: '8px' }} required />
          </div>

          <div>
            <label className="text-label-sm">DATE</label>
            <input type="date" name="date" className="search-input" style={{ width: '100%', marginTop: '8px' }} required defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div>
            <label className="text-label-sm">NOTES (Optional)</label>
            <textarea name="notes" className="search-input" rows={2} style={{ width: '100%', marginTop: '8px', borderRadius: '16px', resize: 'vertical' }}></textarea>
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%', marginTop: '16px', padding: '12px' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
