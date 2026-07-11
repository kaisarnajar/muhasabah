'use client';

import { useState } from 'react';
import { GoalItem } from './GoalItem';
import { AddGoalForm } from './AddGoalForm';
import { Search, Archive } from 'lucide-react';

export function GoalsDashboard({ goals }: { goals: any[] }) {
  const [activeTab, setActiveTab] = useState('MONTHLY');
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState('priority');

  const tabs = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME'];

  const filteredGoals = goals.filter(goal => {
    if (goal.period !== activeTab && !showArchived) return false; // In archived view, we can show all periods or keep filtering by tab. Let's filter by tab.
    if (goal.period !== activeTab) return false;
    if (goal.isArchived !== showArchived) return false;
    if (search && !goal.title.toLowerCase().includes(search.toLowerCase()) && !goal.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  filteredGoals.sort((a, b) => {
    if (sortBy === 'priority') {
      const p = { HIGH: 3, MEDIUM: 2, LOW: 1 } as any;
      if (p[b.priority] !== p[a.priority]) return p[b.priority] - p[a.priority];
    }
    if (sortBy === 'progress') {
      if (b.progress !== a.progress) return b.progress - a.progress;
    }
    if (sortBy === 'date') {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div>
      <AddGoalForm />

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)' }} />
          <input 
            type="text" 
            placeholder="Search goals..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ width: '100%', paddingLeft: '40px', borderRadius: '8px' }}
          />
        </div>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="search-input"
          style={{ borderRadius: '8px', padding: '8px 16px', width: 'auto' }}
        >
          <option value="priority">Sort by Priority</option>
          <option value="progress">Sort by Progress</option>
          <option value="date">Sort by Target Date</option>
        </select>

        <button 
          onClick={() => setShowArchived(!showArchived)}
          className="primary-btn"
          style={{ backgroundColor: showArchived ? 'var(--c-primary)' : 'var(--c-surface-container-high)', color: showArchived ? 'var(--c-on-primary)' : 'var(--c-on-surface)', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px' }}
        >
          <Archive size={18} /> {showArchived ? 'Hide Archived' : 'Show Archived'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid var(--c-outline-variant)' }}>
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              fontWeight: 600,
              backgroundColor: activeTab === tab ? 'var(--c-primary)' : 'transparent',
              color: activeTab === tab ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredGoals.map(goal => (
          <GoalItem key={goal.id} goal={goal} />
        ))}
        {filteredGoals.length === 0 && (
          <p className="text-on-surface-variant" style={{ textAlign: 'center', padding: '40px 0' }}>
            {showArchived ? "No archived goals for this period." : "No goals found. Create one above!"}
          </p>
        )}
      </div>
    </div>
  );
}
