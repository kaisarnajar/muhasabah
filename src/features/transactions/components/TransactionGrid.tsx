'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpCircle, ArrowDownCircle, X, Edit, Trash2, Calendar, DollarSign, Tag, Info } from 'lucide-react';
import { updateTransaction, deleteTransaction } from '@/actions/index';
import { useToast } from '@/context/ToastContext';

interface Transaction {
  id: number;
  userId: number;
  amount: any; // Decimal type
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  date: any; // Date or string
  createdAt: any;
}

interface TransactionGridProps {
  transactions: Transaction[];
}

export default function TransactionGrid({ transactions }: TransactionGridProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [date, setDate] = useState('');

  // Initialise form states when editing starts
  useEffect(() => {
    if (selectedTx) {
      const txDate = selectedTx.date instanceof Date ? selectedTx.date : new Date(selectedTx.date);
      setAmount(Math.abs(Number(selectedTx.amount)).toString());
      setDescription(selectedTx.description);
      setCategory(selectedTx.category);
      setType(selectedTx.type);
      setDate(txDate.toISOString().split('T')[0]);
    }
  }, [selectedTx]);

  const handleCardClick = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsEditing(false);
    setIsDeleting(false);
  };

  const handleClose = () => {
    if (loading) return;
    setSelectedTx(null);
    setIsEditing(false);
    setIsDeleting(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTx || loading) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('type', type);
      formData.append('date', date);

      await updateTransaction(selectedTx.id, formData);
      showToast('Transaction updated successfully!', 'success');
      handleClose();
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to update transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTx || loading) return;

    setLoading(true);
    try {
      await deleteTransaction(selectedTx.id);
      showToast('Transaction deleted successfully!', 'success');
      handleClose();
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Failed to delete transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Categories lists
  const incomeCategories = ['Salary', 'Freelance', 'Business', 'Gift', 'Tax Refund', 'ITR', 'General', 'Other'];
  const expenseCategories = [
    'Rent',
    'Home Transfer',
    'Donation',
    'Education',
    'Electronics & Repair',
    'Travel',
    'Family & Gifts',
    'Shopping',
    'Food & Dining',
    'Bills & Utilities',
    'Home Appliances',
    'Health & Fitness',
    'General',
    'Other'
  ];

  const activeCategories = type === 'INCOME' ? incomeCategories : expenseCategories;

  return (
    <>
      <div className="task-history-grid">
        {transactions.map(t => {
          const txDate = t.date instanceof Date ? t.date : new Date(t.date);
          return (
            <div
              key={t.id}
              className="card"
              onClick={() => handleCardClick(t)}
              style={{
                backgroundColor: 'var(--c-surface-container-low)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--c-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                height: '100%',
                margin: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.borderColor = t.type === 'INCOME' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {t.type === 'INCOME' ? (
                  <ArrowUpCircle color="var(--c-secondary)" size={28} />
                ) : (
                  <ArrowDownCircle color="var(--c-error)" size={28} />
                )}
                <span
                  style={{
                    fontWeight: 600,
                    color: t.type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)',
                    fontSize: '1.15rem'
                  }}
                >
                  {t.type === 'INCOME' ? '+' : '-'}₹{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <p className="text-body-md" style={{ fontWeight: 600, margin: 0, color: 'var(--c-on-surface)' }}>
                  {t.description}
                </p>
                <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '4px', margin: 0 }}>
                  {t.category} • {txDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '32px',
              textAlign: 'center',
              backgroundColor: 'var(--c-surface-container-low)',
              borderRadius: '12px',
              border: '1px dashed var(--c-outline)'
            }}
          >
            <p className="text-on-surface-variant" style={{ margin: 0 }}>No records found.</p>
          </div>
        )}
      </div>

      {/* Transaction Detail & Edit Modal */}
      {selectedTx && mounted && createPortal(
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
          onClick={handleClose}
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
              border: `1.5px solid ${selectedTx.type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)'}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
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

            {/* Title / Modes Header */}
            <div>
              <h3 className="text-headline-sm" style={{ fontWeight: 700, margin: 0, color: 'var(--c-on-surface)' }}>
                {isEditing ? 'Edit Transaction' : isDeleting ? 'Delete Transaction' : 'Transaction Details'}
              </h3>
              <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '6px' }}>
                {isEditing 
                  ? 'Update transaction record values below.' 
                  : isDeleting 
                  ? 'Are you sure you want to permanently delete this transaction?' 
                  : 'View details of this logged transaction.'
                }
              </p>
            </div>

            {/* DELETE MODE VIEW */}
            {isDeleting && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--c-error)' }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>
                    <strong>Warning:</strong> Deleting this will permanently remove it from your records. This action cannot be undone.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsDeleting(false)}
                    disabled={loading}
                    className="primary-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--c-surface-container-high)',
                      color: 'var(--c-on-surface)',
                      boxShadow: 'none',
                      border: '1px solid var(--c-outline-variant)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="primary-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--c-error)',
                      color: 'var(--c-on-error)'
                    }}
                  >
                    {loading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}

            {/* EDIT MODE FORM */}
            {isEditing && (
              <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Type toggle */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setType('EXPENSE');
                      // Reset category to a default valid category
                      setCategory('Rent');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: type === 'EXPENSE' ? '1.5px solid var(--c-error)' : '1px solid var(--c-outline-variant)',
                      backgroundColor: type === 'EXPENSE' ? 'rgba(239,68,68,0.1)' : 'transparent',
                      color: type === 'EXPENSE' ? 'var(--c-error)' : 'var(--c-on-surface)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('INCOME');
                      // Reset category to a default valid category
                      setCategory('Salary');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: type === 'INCOME' ? '1.5px solid var(--c-secondary)' : '1px solid var(--c-outline-variant)',
                      backgroundColor: type === 'INCOME' ? 'rgba(34,197,94,0.1)' : 'transparent',
                      color: type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-on-surface)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Income
                  </button>
                </div>

                {/* Amount */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    placeholder="0.00"
                    className="search-input"
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                {/* Description */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Transaction description"
                    className="search-input"
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                {/* Category */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="search-input"
                    style={{ borderRadius: '8px' }}
                  >
                    {activeCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="search-input"
                    required
                    style={{ borderRadius: '8px' }}
                  />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="primary-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--c-surface-container-high)',
                      color: 'var(--c-on-surface)',
                      boxShadow: 'none',
                      border: '1px solid var(--c-outline-variant)'
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)',
                      color: type === 'INCOME' ? 'var(--c-on-secondary)' : 'var(--c-on-error)'
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* DEFAULT VIEW MODE */}
            {!isEditing && !isDeleting && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Details list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Amount Display */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--c-surface-container-low)', borderRadius: '12px', border: '1px solid var(--c-outline-variant)' }}>
                    {selectedTx.type === 'INCOME' ? (
                      <ArrowUpCircle color="var(--c-secondary)" size={36} />
                    ) : (
                      <ArrowDownCircle color="var(--c-error)" size={36} />
                    )}
                    <div>
                      <p className="text-label-sm" style={{ margin: '0 0 2px 0', color: 'var(--c-on-surface-variant)' }}>Amount</p>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '1.5rem', color: selectedTx.type === 'INCOME' ? 'var(--c-secondary)' : 'var(--c-error)' }}>
                        {selectedTx.type === 'INCOME' ? '+' : '-'}₹{Number(selectedTx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Info size={18} style={{ color: 'var(--c-primary)', marginTop: '3px' }} />
                    <div>
                      <p className="text-label-sm" style={{ margin: '0 0 2px 0', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>Description</p>
                      <p className="text-body-md" style={{ margin: 0, color: 'var(--c-on-surface)', fontWeight: 500 }}>{selectedTx.description}</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Tag size={18} style={{ color: 'var(--c-primary)', marginTop: '3px' }} />
                    <div>
                      <p className="text-label-sm" style={{ margin: '0 0 2px 0', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>Category</p>
                      <p className="text-body-md" style={{ margin: 0, color: 'var(--c-on-surface)', fontWeight: 500 }}>{selectedTx.category}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <Calendar size={18} style={{ color: 'var(--c-primary)', marginTop: '3px' }} />
                    <div>
                      <p className="text-label-sm" style={{ margin: '0 0 2px 0', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>Date</p>
                      <p className="text-body-md" style={{ margin: 0, color: 'var(--c-on-surface)', fontWeight: 500 }}>
                        {(selectedTx.date instanceof Date ? selectedTx.date : new Date(selectedTx.date)).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit & Delete Action Row */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '20px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="primary-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: 'var(--c-error)',
                      boxShadow: 'none',
                      border: '1px solid var(--c-error)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="primary-btn"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--c-primary)',
                      color: 'var(--c-on-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Edit size={16} /> Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
