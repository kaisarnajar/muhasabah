'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

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
    } else {
      params.set('date', date);
    }

    router.push(`?${params.toString()}`);
  }, [router]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setFilterType(newType);
    
    // Set some sensible defaults when switching types
    const now = new Date();
    let newDate = dateValue;
    if (newType === 'day') newDate = now.toISOString().split('T')[0];
    if (newType === 'month') newDate = now.toISOString().substring(0, 7);
    if (newType === 'year') newDate = now.getFullYear().toString();
    if (newType === 'quarter') newDate = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
    if (newType === 'week') {
      // Basic week string format (YYYY-Www) not fully supported by standard date inputs universally, but we can use week input
      // Get current week number
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
    <div className="card" style={{ marginBottom: '24px', padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
        <span className="text-label-sm text-on-surface-variant">FILTER BY</span>
      </div>
      
      <select 
        value={filterType} 
        onChange={handleFilterChange}
        className="search-input"
        style={{ width: '150px', borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
      >
        <option value="day">Day</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
        <option value="quarter">Quarter</option>
        <option value="year">Year</option>
        <option value="custom">Custom Range</option>
      </select>

      {filterType === 'day' && (
        <input 
          type="date" 
          value={dateValue}
          onChange={handleDateChange}
          className="search-input"
          style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
        />
      )}

      {filterType === 'week' && (
        <input 
          type="week" 
          value={dateValue}
          onChange={handleDateChange}
          className="search-input"
          style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
        />
      )}

      {filterType === 'month' && (
        <input 
          type="month" 
          value={dateValue}
          onChange={handleDateChange}
          className="search-input"
          style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
        />
      )}

      {filterType === 'quarter' && (
        <div className="flex-row gap-8">
          <select
            value={dateValue.split('-')[0] || new Date().getFullYear().toString()}
            onChange={(e) => {
              const newDate = `${e.target.value}-${dateValue.split('-')[1] || 'Q1'}`;
              setDateValue(newDate);
              applyFilter(filterType, newDate, startDate, endDate);
            }}
            className="search-input"
            style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
          >
            {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={dateValue.split('-')[1] || 'Q1'}
            onChange={(e) => {
              const newDate = `${dateValue.split('-')[0] || new Date().getFullYear()}-${e.target.value}`;
              setDateValue(newDate);
              applyFilter(filterType, newDate, startDate, endDate);
            }}
            className="search-input"
            style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
          >
            <option value="Q1">Q1 (Jan - Mar)</option>
            <option value="Q2">Q2 (Apr - Jun)</option>
            <option value="Q3">Q3 (Jul - Sep)</option>
            <option value="Q4">Q4 (Oct - Dec)</option>
          </select>
        </div>
      )}

      {filterType === 'year' && (
        <select
          value={dateValue}
          onChange={handleDateChange}
          className="search-input"
          style={{ borderRadius: '8px', padding: '8px 16px', backgroundColor: 'var(--c-surface)' }}
        >
          {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}

      {filterType === 'custom' && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
      )}
    </div>
  );
}
