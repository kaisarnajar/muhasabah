'use client';

import { useState } from 'react';
import { ScrollText, Calendar, Plus } from 'lucide-react';
import CustomDateRangeDialog from '@/components/ui/CustomDateRangeDialog';
import IbadahDetailModal from './IbadahDetailModal';
import { QURAN_SURAHS } from '@/lib/quranData';

interface HistoryRecord {
  date: Date;
  completedCount: number;
  totalCount: number;
  quranMemorization: string | null;
  otherActivities: string | null;
  habits: Array<{ name: string; isCompleted: boolean; prayedWithJamaat: boolean }>;
}

interface IbadahRegisterProps {
  initialHistory: HistoryRecord[];
}

export default function IbadahRegister({ initialHistory }: IbadahRegisterProps) {
  const [registerFilter, setRegisterFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all' | 'custom'>('all');
  const [registerCustomStart, setRegisterCustomStart] = useState<string>('');
  const [registerCustomEnd, setRegisterCustomEnd] = useState<string>('');
  const [isRegisterCustomRangeOpen, setIsRegisterCustomRangeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const formatQuranMemorization = (val: string | null): string => {
    if (!val) return '';
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === 'object' && 'surahNumber' in parsed) {
        const surah = QURAN_SURAHS.find(s => s.number === parsed.surahNumber);
        if (surah) {
          return `Surah ${surah.englishName} (${parsed.surahNumber}), Verses ${parsed.fromVerse} - ${parsed.toVerse}`;
        }
      }
    } catch (e) {}
    return val;
  };

  const availableYears = Array.from(
    new Set([
      new Date().getFullYear(),
      ...initialHistory
        .map(r => r.date ? new Date(r.date).getFullYear() : null)
        .filter((y): y is number => y !== null)
    ])
  ).sort((a, b) => b - a);

  const filteredHistory = initialHistory.filter(record => {
    const recDate = new Date(record.date);
    const today = new Date();
    
    // Apply Year Dropdown if selected
    if (selectedYear !== 'all') {
      if (recDate.getFullYear().toString() !== selectedYear) {
        return false;
      }
    }

    let startLimit: Date | null = null;
    let endLimit: Date | null = null;

    if (registerFilter === 'day') {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (registerFilter === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      startLimit = monday;
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      endLimit = sunday;
    } else if (registerFilter === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (registerFilter === 'year') {
      const start = new Date(today.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (registerFilter === 'custom') {
      if (registerCustomStart) {
        const start = new Date(registerCustomStart);
        start.setHours(0, 0, 0, 0);
        startLimit = start;
      }
      if (registerCustomEnd) {
        const end = new Date(registerCustomEnd);
        end.setHours(23, 59, 59, 999);
        endLimit = end;
      }
    }

    if (startLimit && recDate < startLimit) return false;
    if (endLimit && recDate > endLimit) return false;
    return true;
  });

  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filteredHistory.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedHistory = filteredHistory.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const selectedRecord = selectedHistoryIndex !== null ? filteredHistory[selectedHistoryIndex] : null;

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ScrollText color="var(--c-secondary)" size={24} />
          <h2 className="text-headline-md" style={{ margin: 0, fontWeight: 700 }}>Ibadah Register</h2>
        </div>

        {initialHistory.length === 0 ? (
          <p className="text-on-surface-variant" style={{ margin: 0 }}>No ibadah records saved yet. Start tracking today&apos;s worship to build your register.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              {[
                { id: 'day', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'year', label: 'This Year' },
                { id: 'all', label: 'All Time' },
                { id: 'custom', label: 'Custom Range' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'custom') {
                      setIsRegisterCustomRangeOpen(true);
                      return;
                    }
                    setRegisterFilter(tab.id as typeof registerFilter);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontWeight: 600,
                    fontSize: '13px',
                    backgroundColor: registerFilter === tab.id ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
                    color: registerFilter === tab.id ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Year Selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-on-surface-variant)', letterSpacing: '0.05em' }}>YEAR WISE</span>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
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
                    minWidth: '120px'
                  }}
                >
                  <option value="all">All Years</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {isRegisterCustomRangeOpen && (
              <CustomDateRangeDialog
                initialStartDate={registerCustomStart}
                initialEndDate={registerCustomEnd}
                onClose={() => setIsRegisterCustomRangeOpen(false)}
                onApply={(startDate, endDate) => {
                  setRegisterCustomStart(startDate);
                  setRegisterCustomEnd(endDate);
                  setRegisterFilter('custom');
                  setCurrentPage(1);
                  setIsRegisterCustomRangeOpen(false);
                }}
              />
            )}

            {filteredHistory.length === 0 ? (
              <p className="text-on-surface-variant" style={{ margin: '20px 0', textAlign: 'center' }}>No records found for this filter.</p>
            ) : (
              <div className="spiritual-history-grid">
                {paginatedHistory.map((record, index) => {
                  const globalIndex = (activePage - 1) * PAGE_SIZE + index;
                  const recordDate = new Date(record.date);
                  const dateStrLocal = recordDate.toISOString().split('T')[0];
                  const todayStrLocal = new Date().toISOString().split('T')[0];
                  const isToday = dateStrLocal === todayStrLocal;
                  const shortDate = recordDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                  const completionRate = record.totalCount > 0 ? (record.completedCount / record.totalCount) * 100 : 0;

                  return (
                    <div
                      key={globalIndex}
                      className="card"
                      style={{
                        padding: 0,
                        overflow: 'hidden',
                        border: isToday ? '1px solid var(--c-primary)' : '1px solid var(--c-outline-variant)',
                        boxShadow: isToday ? 'var(--shadow-glow-primary)' : 'var(--shadow-sm)',
                      }}
                    >
                      <div
                        onClick={() => setSelectedHistoryIndex(globalIndex)}
                        style={{
                          padding: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          backgroundColor: isToday ? 'var(--c-surface-container-high)' : 'var(--c-surface)',
                          userSelect: 'none',
                          transition: 'background-color 0.2s ease',
                          height: '100%',
                          justifyContent: 'space-between',
                        }}
                        className="accordion-header"
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} color={isToday ? 'var(--c-primary)' : 'var(--c-on-surface-variant)'} />
                            <span className="text-label-sm" style={{ fontWeight: 700, color: 'var(--c-on-surface)', whiteSpace: 'nowrap' }}>
                              {isToday ? `Today (${shortDate})` : shortDate}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>
                              {record.completedCount} / {record.totalCount}
                            </span>
                            <span
                              className="text-label-sm"
                              style={{
                                backgroundColor: completionRate === 100 ? 'var(--c-secondary-container)' : 'var(--c-primary-container)',
                                color: completionRate === 100 ? 'var(--c-on-secondary-container)' : 'var(--c-primary)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                              }}
                            >
                              {Math.round(completionRate)}%
                            </span>
                          </div>
                          {record.quranMemorization && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: 'var(--c-primary)', 
                              fontWeight: 600, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              marginTop: '2px',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                              <ScrollText size={12} />
                              <span>{formatQuranMemorization(record.quranMemorization)}</span>
                            </div>
                          )}
                          {record.otherActivities && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: 'var(--c-on-surface-variant)', 
                              fontWeight: 600, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              marginTop: '2px',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}>
                              <Plus size={12} color="var(--c-primary)" />
                              <span>{record.otherActivities}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--c-surface-container-highest)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${completionRate}%`,
                              height: '100%',
                              backgroundColor: completionRate === 100 ? 'var(--c-secondary)' : 'var(--c-primary)',
                              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                <button
                  disabled={activePage <= 1}
                  onClick={() => setCurrentPage(activePage - 1)}
                  className="primary-btn"
                  style={{ padding: '8px 16px', backgroundColor: activePage <= 1 ? 'var(--c-surface-container-lowest)' : 'var(--c-surface-container-high)', color: activePage <= 1 ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)', opacity: activePage <= 1 ? 0.5 : 1, cursor: activePage <= 1 ? 'not-allowed' : 'pointer', boxShadow: 'none' }}
                >
                  Previous
                </button>

                <span className="text-body-md text-on-surface-variant" style={{ fontWeight: 600 }}>
                  Page {activePage} of {totalPages}
                </span>

                <button
                  disabled={activePage >= totalPages}
                  onClick={() => setCurrentPage(activePage + 1)}
                  className="primary-btn"
                  style={{ padding: '8px 16px', backgroundColor: activePage >= totalPages ? 'var(--c-surface-container-lowest)' : 'var(--c-surface-container-high)', color: activePage >= totalPages ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)', opacity: activePage >= totalPages ? 0.5 : 1, cursor: activePage >= totalPages ? 'not-allowed' : 'pointer', boxShadow: 'none' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <IbadahDetailModal
        selectedRecord={selectedRecord}
        onClose={() => setSelectedHistoryIndex(null)}
      />
    </>
  );
}
