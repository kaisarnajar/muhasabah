'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

const FILTER_TABS = [
  { id: 'day', label: 'Current Day' },
  { id: 'week', label: 'Current Week' },
  { id: 'month', label: 'Current Month' },
  { id: 'quarter', label: 'Current Quarter' },
  { id: 'year', label: 'Current Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom Range' },
];

export default function TransactionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get('filter') || 'month';
  const currentDate = searchParams.get('date') || new Date().toISOString().substring(0, 7); // Default to current YYYY-MM
  const currentStart = searchParams.get('start') || '';
  const currentEnd = searchParams.get('end') || '';

  const [filterType, setFilterType] = useState(currentFilter);
  const [dateValue, setDateValue] = useState(currentDate);
  const [startDate, setStartDate] = useState(currentStart);
  const [endDate, setEndDate] = useState(currentEnd);

  // Sync state when URL changes externally
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilterType(searchParams.get('filter') || 'month');
    setDateValue(searchParams.get('date') || new Date().toISOString().substring(0, 7));
    setStartDate(searchParams.get('start') || '');
    setEndDate(searchParams.get('end') || '');
  }, [searchParams]);

  const applyFilter = useCallback((type: string, date: string, start: string, end: string) => {
    const params = new URLSearchParams();
    params.set('filter', type);
    
    if (type === 'custom') {
      if (start) params.set('start', start);
      if (end) params.set('end', end);
    } else if (type === 'all') {
      // no date required
    } else {
      params.set('date', date);
    }

    router.push(`?${params.toString()}`);
  }, [router]);

  const handleFilterChange = (newType: string) => {
    setFilterType(newType);
    
    // Set some sensible defaults when switching types (reset to current)
    const now = new Date();
    let newDate = dateValue;
    if (newType === 'day') newDate = now.toISOString().split('T')[0];
    if (newType === 'month') newDate = now.toISOString().substring(0, 7);
    if (newType === 'year') newDate = now.getFullYear().toString();
    if (newType === 'quarter') newDate = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
    if (newType === 'all') newDate = '';
    if (newType === 'week') {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      newDate = `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
    }
    
    setDateValue(newDate);
    applyFilter(newType, newDate, startDate, endDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newDate = e.target.value;
    setDateValue(newDate);
    applyFilter(filterType, newDate, startDate, endDate);
  };

  const handleCustomChange = (field: 'start' | 'end', val: string) => {
    if (field === 'start') {
      setStartDate(val);
      applyFilter('custom', dateValue, val, endDate);
    } else {
      setEndDate(val);
      applyFilter('custom', dateValue, startDate, val);
    }
  };

  return (
    <div className="card flex-col gap-16 mb-24" style={{ padding: '24px' }}>
      <div className="flex-row gap-8 mb-8">
        <Calendar size={20} className="text-primary" style={{ color: 'var(--c-primary)' }} />
        <h3 className="text-title-md" style={{ margin: 0, fontWeight: 600 }}>Filter Transactions</h3>
      </div>
      
      {/* FILTER TABS */}
      <div className="flex-row gap-8" style={{ flexWrap: 'wrap' }}>
        {FILTER_TABS.map(tab => (
          <button 
            key={tab.id}
            onClick={() => handleFilterChange(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: '0.875rem',
              backgroundColor: filterType === tab.id ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
              color: filterType === tab.id ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* DATE PICKERS (Only for custom range) */}
      {filterType === 'custom' && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
          <div className="flex-row gap-8">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => handleCustomChange('start', e.target.value)}
              className="search-input"
              style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
            />
            <span className="text-on-surface-variant">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => handleCustomChange('end', e.target.value)}
              className="search-input"
              style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
