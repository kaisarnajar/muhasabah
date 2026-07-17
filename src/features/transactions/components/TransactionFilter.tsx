'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import CustomDateRangeDialog from '@/components/ui/CustomDateRangeDialog';

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
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);

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
    if (newType === 'custom') {
      setIsCustomRangeOpen(true);
      return;
    }
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

      {/* Year Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-on-surface-variant)', letterSpacing: '0.05em' }}>YEAR WISE</span>
        <select
          value={filterType === 'year' ? dateValue : 'all'}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'all') {
              setFilterType('all');
              setDateValue('');
              applyFilter('all', '', startDate, endDate);
            } else {
              setFilterType('year');
              setDateValue(val);
              applyFilter('year', val, startDate, endDate);
            }
          }}
          className="search-input"
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            border: '1px solid var(--c-outline-variant)',
            backgroundColor: 'var(--c-surface)',
            color: 'var(--c-on-surface)',
            outline: 'none',
            minWidth: '120px',
            width: 'fit-content'
          }}
        >
          <option value="all">All Years</option>
          {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map(yr => (
            <option key={yr} value={yr.toString()}>{yr}</option>
          ))}
        </select>
      </div>

      {isCustomRangeOpen && (
        <CustomDateRangeDialog
          initialStartDate={startDate}
          initialEndDate={endDate}
          onClose={() => setIsCustomRangeOpen(false)}
          onApply={(newStartDate, newEndDate) => {
            setStartDate(newStartDate);
            setEndDate(newEndDate);
            setFilterType('custom');
            applyFilter('custom', dateValue, newStartDate, newEndDate);
            setIsCustomRangeOpen(false);
          }}
        />
      )}
    </div>
  );
}
