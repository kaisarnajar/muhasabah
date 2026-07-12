'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircle, X } from 'lucide-react';
import { addTransaction } from '@/actions';

export default function AddTransactionForm({ type }: { type: 'INCOME' | 'EXPENSE' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const now = new Date();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <>
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

      {isOpen && mounted && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000, 
            padding: '16px', 
            backdropFilter: 'blur(4px)' 
          }}
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: '500px', 
              width: '100%', 
              position: 'relative', 
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: 'var(--c-surface)',
              border: `1px solid ${type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)'}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setIsOpen(false)} 
              style={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--c-on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-surface-container-high)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Close"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-headline-sm" style={{ fontWeight: 700, margin: 0, color: 'var(--c-on-surface)' }}>
                New {type === 'INCOME' ? 'Income' : 'Expense'}
              </h3>
              <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '6px' }}>
                Add a new {type.toLowerCase()} record to your financial log.
              </p>
            </div>

            <form 
              action={async (formData) => {
                await addTransaction(formData);
                setIsOpen(false);
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <input type="hidden" name="type" value={type} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Amount ($)</label>
                <input 
                  type="number" 
                  name="amount"
                  step="0.01" 
                  placeholder="0.00" 
                  className="search-input"
                  required 
                  style={{ borderRadius: '8px' }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Description</label>
                <input 
                  type="text" 
                  name="description"
                  placeholder="e.g. Salary, Rent, Groceries" 
                  className="search-input"
                  required 
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Category</label>
                <select 
                  name="category"
                  className="search-input"
                  style={{ borderRadius: '8px', WebkitAppearance: 'none' }}
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
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Date</label>
                <input 
                  type="date" 
                  name="date"
                  className="search-input"
                  defaultValue={now.toISOString().split('T')[0]}
                  required 
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="primary-btn" 
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px',
                    backgroundColor: 'var(--c-surface-container-high)', 
                    color: 'var(--c-on-surface)', 
                    boxShadow: 'none',
                    border: '1px solid var(--c-outline-variant)',
                    backgroundImage: 'none',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-btn" 
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    backgroundColor: type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)', 
                    color: type === 'INCOME' ? 'var(--c-on-secondary)' : 'var(--c-on-error)',
                    fontSize: '14px'
                  }}
                >
                  Save {type === 'INCOME' ? 'Income' : 'Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
