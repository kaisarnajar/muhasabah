'use client';

import { useState } from 'react';
import { Trash2, Plus, Paperclip, ChevronDown, ChevronUp } from 'lucide-react';
import { deleteDebtRecord } from '@/actions/debts';
import AddPaymentForm from './AddPaymentForm';

export default function DebtItem({ record }: { record: any }) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const totalAmount = Number(record.amount);
  const totalPaid = record.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const progressPercent = Math.min(100, Math.round((totalPaid / totalAmount) * 100));
  
  const isOverdue = record.dueDate && new Date(record.dueDate) < new Date() && record.status !== 'PAID';

  let statusColor = 'var(--c-on-surface-variant)';
  if (record.status === 'PAID') statusColor = 'var(--c-secondary)';
  if (isOverdue) statusColor = 'var(--c-error)';

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this record?')) {
      await deleteDebtRecord(record.id);
    }
  };

  return (
    <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h4 className="text-title-md" style={{ fontWeight: 600 }}>{record.personName}</h4>
            <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '16px', backgroundColor: record.type === 'CREDIT' ? 'var(--c-secondary-container)' : 'var(--c-error-container)', color: record.type === 'CREDIT' ? 'var(--c-on-secondary-container)' : 'var(--c-on-error-container)' }}>
              {record.type}
            </span>
            {isOverdue && (
              <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '16px', backgroundColor: 'var(--c-error)', color: 'white' }}>OVERDUE</span>
            )}
          </div>
          <p className="text-label-sm text-on-surface-variant">
            {new Date(record.date).toLocaleDateString()}
            {record.dueDate && ` • Due: ${new Date(record.dueDate).toLocaleDateString()}`}
            {record.category && ` • ${record.category}`}
          </p>
          {record.notes && <p className="text-body-sm" style={{ marginTop: '8px', opacity: 0.8 }}>{record.notes}</p>}
          
          {record.attachment && (
            <a href={record.attachment} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '14px', color: 'var(--c-primary)', textDecoration: 'underline' }}>
              <Paperclip size={16} /> View Attachment
            </a>
          )}
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <h3 className="text-headline-md" style={{ fontWeight: 'bold' }}>${totalAmount.toFixed(2)}</h3>
          <p className="text-label-sm" style={{ color: statusColor, fontWeight: 'bold' }}>{record.status}</p>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span className="text-label-sm">Paid: ${totalPaid.toFixed(2)}</span>
          <span className="text-label-sm">Left: ${(totalAmount - totalPaid).toFixed(2)}</span>
        </div>
        <div className="progress-track" style={{ height: '8px' }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: record.status === 'PAID' ? 'var(--c-secondary)' : 'var(--c-primary)' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--c-outline-variant)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {record.status !== 'PAID' && (
            <button onClick={() => setShowPaymentForm(true)} className="primary-btn" style={{ padding: '4px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={16} /> Add Payment
            </button>
          )}
          {record.payments.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--c-on-surface-variant)' }}>
              {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />} History
            </button>
          )}
        </div>
        <button onClick={handleDelete} style={{ color: 'var(--c-error)', opacity: 0.7, padding: '8px' }}>
          <Trash2 size={18} />
        </button>
      </div>

      {showHistory && record.payments.length > 0 && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--c-surface-container-low)', borderRadius: '8px' }}>
          <h5 className="text-label-sm" style={{ marginBottom: '8px' }}>Payment History</h5>
          {record.payments.map((p: any) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--c-outline-variant)' }}>
              <div>
                <span className="text-body-sm" style={{ fontWeight: 500 }}>${Number(p.amount).toFixed(2)}</span>
                {p.notes && <span className="text-label-sm text-on-surface-variant" style={{ marginLeft: '8px' }}>- {p.notes}</span>}
              </div>
              <span className="text-label-sm text-on-surface-variant">{new Date(p.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {showPaymentForm && <AddPaymentForm debtId={record.id} onClose={() => setShowPaymentForm(false)} />}
    </div>
  );
}
