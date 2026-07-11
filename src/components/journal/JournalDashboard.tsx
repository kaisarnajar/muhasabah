'use client';

import { useState } from 'react';
import { Plus, Trash2, Filter } from 'lucide-react';
import { addJournalEntry, deleteJournalEntry } from '@/actions';
import { JournalEntry } from '@prisma/client';

export default function JournalDashboard({ initialEntries }: { initialEntries: JournalEntry[] }) {
  const [tab, setTab] = useState<'OFFICE' | 'LEARNING' | 'MISC'>('OFFICE');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('ALL'); // ALL, TODAY, WEEK, MONTH

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('category', tab);
      
      await addJournalEntry(formData);
      setContent('');
    } catch (error) {
      console.error(error);
      alert('Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteJournalEntry(id);
    }
  };

  // Filter entries
  const filteredEntries = initialEntries.filter(entry => {
    if (entry.category !== tab) return false;
    
    if (filterPeriod !== 'ALL') {
      const d = new Date(entry.date);
      const now = new Date();
      if (filterPeriod === 'TODAY' && d.toISOString().split('T')[0] !== now.toISOString().split('T')[0]) return false;
      
      if (filterPeriod === 'WEEK') {
        const weekStart = new Date(now);
        weekStart.setHours(0,0,0,0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        if (d < weekStart) return false;
      }
      if (filterPeriod === 'MONTH' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
    }
    return true;
  });

  return (
    <div>
      {/* TABS & FILTERS */}
      <div className="flex-row justify-between mb-24 gap-16" style={{ flexWrap: 'wrap' }}>
        
        <div className="flex-row gap-8 p-12 rounded-12" style={{ backgroundColor: 'var(--c-surface-container-high)' }}>
          <button 
            onClick={() => setTab('OFFICE')}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: tab === 'OFFICE' ? 'var(--c-primary)' : 'transparent', color: tab === 'OFFICE' ? 'var(--c-on-primary)' : 'var(--c-on-surface)' }}
          >Office Work</button>
          <button 
            onClick={() => setTab('LEARNING')}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: tab === 'LEARNING' ? 'var(--c-primary)' : 'transparent', color: tab === 'LEARNING' ? 'var(--c-on-primary)' : 'var(--c-on-surface)' }}
          >Learning</button>
          <button 
            onClick={() => setTab('MISC')}
            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: tab === 'MISC' ? 'var(--c-primary)' : 'transparent', color: tab === 'MISC' ? 'var(--c-on-primary)' : 'var(--c-on-surface)' }}
          >Miscellaneous</button>
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
            <option value="TODAY">Today</option>
            <option value="WEEK">This Week</option>
            <option value="MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* ADD ENTRY FORM */}
      <form onSubmit={handleAdd} className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <textarea 
          placeholder={`Add a new ${tab.toLowerCase()} entry for today...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="search-input"
          style={{ flex: 1, borderRadius: '8px', resize: 'vertical', minHeight: '60px' }}
          required
        />
        <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '12px 24px', alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add
        </button>
      </form>

      {/* ENTRIES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredEntries.length === 0 ? (
          <p className="text-on-surface-variant text-body-md" style={{ textAlign: 'center', padding: '40px' }}>No entries found for this category and time period.</p>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ paddingRight: '24px' }}>
                <p className="text-body-md" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{entry.content}</p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
                  <span className="text-label-sm text-on-surface-variant">
                    {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(entry.id)} style={{ color: 'var(--c-error)', opacity: 0.7, flexShrink: 0, padding: '4px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
