'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { JournalEntry, JournalCategory } from '@prisma/client';
import CustomDateRangeDialog from '@/components/ui/CustomDateRangeDialog';
import SearchInput from '@/components/ui/SearchInput';

import JournalFilterTabs from './JournalFilterTabs';
import JournalEntryCard from './JournalEntryCard';
import JournalPagination from './JournalPagination';
import AddEntryModal from './AddEntryModal';
import EditEntryModal from './EditEntryModal';
import EntryDetailsModal from './EntryDetailsModal';

interface Props {
  category: JournalCategory;
  initialEntries: JournalEntry[];
}

export default function JournalDashboard({ category, initialEntries }: Props) {
  const [filterPeriod, setFilterPeriod] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [search, setSearch] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleFilterChange = (newPeriod: string) => {
    if (newPeriod === 'CUSTOM') {
      setIsCustomRangeOpen(true);
      return;
    }
    setFilterPeriod(newPeriod);
    setCurrentPage(1);
  };

  // Filter entries by time period
  const filteredEntries = initialEntries.filter(entry => {
    const d = new Date(entry.date);
    const now = new Date();

    if (filterPeriod === 'ALL') return true;
    if (filterPeriod === 'TODAY') {
      return d.toISOString().split('T')[0] === now.toISOString().split('T')[0];
    }
    if (filterPeriod === 'WEEK') {
      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return d >= weekStart;
    }
    if (filterPeriod === 'MONTH') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filterPeriod === 'YEAR') {
      return d.getFullYear() === now.getFullYear();
    }
    if (filterPeriod === 'CUSTOM') {
      if (!customStart || !customEnd) return true;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    }
    return true;
  }).filter(entry => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      entry.content.toLowerCase().includes(term) ||
      (entry.subject && entry.subject.toLowerCase().includes(term)) ||
      (entry.project && entry.project.toLowerCase().includes(term)) ||
      (entry.ticketId && entry.ticketId.toLowerCase().includes(term)) ||
      (entry.activity && entry.activity.toLowerCase().includes(term)) ||
      (entry.tag && entry.tag.toLowerCase().includes(term))
    );
  });

  // Pagination
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(filteredEntries.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedEntries = filteredEntries.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  return (
    <div>
      {/* ADD BUTTON & SEARCH INPUT ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="primary-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700 }}
        >
          <Plus size={18} /> Add New Entry
        </button>
        <SearchInput 
          placeholder="Search journal entries..." 
          value={search} 
          onChange={(val) => { setSearch(val); setCurrentPage(1); }} 
          isClientSide 
        />
      </div>

      {/* FILTER TABS */}
      <JournalFilterTabs filterPeriod={filterPeriod} onFilterChange={handleFilterChange} />

      {isCustomRangeOpen && (
        <CustomDateRangeDialog
          initialStartDate={customStart}
          initialEndDate={customEnd}
          onClose={() => setIsCustomRangeOpen(false)}
          onApply={(startDate, endDate) => {
            setCustomStart(startDate);
            setCustomEnd(endDate);
            setFilterPeriod('CUSTOM');
            setCurrentPage(1);
            setIsCustomRangeOpen(false);
          }}
        />
      )}

      {/* ENTRIES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: '20px' }}>
        {paginatedEntries.length === 0 ? (
          <p className="text-on-surface-variant text-body-md" style={{ textAlign: 'center', padding: '60px 40px', gridColumn: '1 / -1', fontStyle: 'italic' }}>No entries found for this time period.</p>
        ) : (
          paginatedEntries.map(entry => (
            <JournalEntryCard 
              key={entry.id} 
              entry={entry} 
              category={category} 
              onClick={(e) => setSelectedEntry(e)}
            />
          ))
        )}
      </div>

      {/* Pagination Controls */}
      <JournalPagination 
        activePage={activePage} 
        totalPages={totalPages} 
        setCurrentPage={setCurrentPage} 
      />

      {/* MODALS */}
      {mounted && (
        <>
          <AddEntryModal 
            isOpen={isAddOpen} 
            onClose={() => setIsAddOpen(false)} 
            category={category}
            onSuccess={() => {
              setIsAddOpen(false);
              setCurrentPage(1);
            }}
          />

          <EntryDetailsModal
            isOpen={!!selectedEntry && !isEditOpen}
            onClose={() => setSelectedEntry(null)}
            selectedEntry={selectedEntry}
            category={category}
            onEditClick={() => setIsEditOpen(true)}
            onDeleteSuccess={() => setSelectedEntry(null)}
          />

          <EditEntryModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            category={category}
            selectedEntry={selectedEntry}
            onSuccess={() => {
              setIsEditOpen(false);
              setSelectedEntry(null);
            }}
          />
        </>
      )}
    </div>
  );
}
