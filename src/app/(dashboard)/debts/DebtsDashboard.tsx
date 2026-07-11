'use client';

import { useState } from 'react';
import { Plus, Download, Search, Filter } from 'lucide-react';
import DebtItem from './DebtItem';
import AddDebtForm from './AddDebtForm';

export default function DebtsDashboard({ initialRecords }: { initialRecords: any[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [tab, setTab] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // ALL, MONTH, YEAR

  // Filtering Logic
  const filteredRecords = records.filter(record => {
    if (tab !== 'ALL' && record.type !== tab) return false;
    
    if (search) {
      const q = search.toLowerCase();
      if (!record.personName.toLowerCase().includes(q) && 
          !(record.notes && record.notes.toLowerCase().includes(q))) {
        return false;
      }
    }

    if (filterPeriod !== 'ALL') {
      const d = new Date(record.date);
      const now = new Date();
      if (filterPeriod === 'MONTH' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
      if (filterPeriod === 'YEAR' && d.getFullYear() !== now.getFullYear()) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Person', 'Type', 'Amount', 'Paid', 'Remaining', 'Status', 'Date', 'Due Date', 'Category', 'Notes'];
    
    const rows = filteredRecords.map(r => {
      const totalAmount = Number(r.amount);
      const totalPaid = r.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const remaining = totalAmount - totalPaid;
      
      return [
        r.id,
        `"${r.personName}"`,
        r.type,
        totalAmount.toFixed(2),
        totalPaid.toFixed(2),
        remaining.toFixed(2),
        r.status,
        new Date(r.date).toLocaleDateString(),
        r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '',
        `"${r.category || ''}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `debts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--c-surface-container-high)', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setTab('ALL')}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: tab === 'ALL' ? 'var(--c-primary)' : 'transparent', color: tab === 'ALL' ? 'var(--c-on-primary)' : 'var(--c-on-surface)' }}
          >All</button>
          <button 
            onClick={() => setTab('CREDIT')}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: tab === 'CREDIT' ? 'var(--c-primary)' : 'transparent', color: tab === 'CREDIT' ? 'var(--c-on-primary)' : 'var(--c-on-surface)' }}
          >Credit</button>
          <button 
            onClick={() => setTab('DEBIT')}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: tab === 'DEBIT' ? 'var(--c-primary)' : 'transparent', color: tab === 'DEBIT' ? 'var(--c-on-primary)' : 'var(--c-on-surface)' }}
          >Debit</button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleExportCSV} className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Export CSV
          </button>
          <button onClick={() => setShowAddForm(true)} className="primary-btn" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)' }} />
          <input 
            type="text" 
            placeholder="Search by name or notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={18} style={{ position: 'absolute', left: '12px', color: 'var(--c-on-surface-variant)' }} />
          <select 
            className="search-input" 
            style={{ paddingLeft: '40px' }}
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="MONTH">This Month</option>
            <option value="YEAR">This Year</option>
          </select>
        </div>
      </div>

      {/* RECORDS LIST */}
      <div>
        {filteredRecords.length === 0 ? (
          <p className="text-on-surface-variant text-body-md" style={{ textAlign: 'center', padding: '40px' }}>No records found.</p>
        ) : (
          filteredRecords.map(record => (
            <DebtItem key={record.id} record={record} />
          ))
        )}
      </div>

      {showAddForm && <AddDebtForm onClose={() => setShowAddForm(false)} />}
    </div>
  );
}
