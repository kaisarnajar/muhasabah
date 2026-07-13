'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Edit, Trash2, Calendar, Clock, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { addRelapseLog, updateRelapseLog, deleteRelapseLog } from '@/actions/relapse';
import { useToast } from '@/context/ToastContext';
import { RelapseLog } from '@prisma/client';

export default function RelapseDashboard({ initialLogs }: { initialLogs: RelapseLog[] }) {
  const { showToast } = useToast();
  const [filterPeriod, setFilterPeriod] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<RelapseLog | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [logDate, setLogDate] = useState('');
  const [logTime, setLogTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate clean streak
  const calculateStreak = () => {
    if (initialLogs.length === 0) return { days: 0, text: 'No logs yet. Start your clean streak today!' };
    
    // Sort logs descending
    const sorted = [...initialLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const lastLogDate = new Date(sorted[0].date);
    const now = new Date();
    
    const diffMs = now.getTime() - lastLogDate.getTime();
    if (diffMs < 0) return { days: 0, text: 'Stay strong!' };
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { days: 0, text: 'Last occurrence was today. Reset, refocus, and keep going!' };
    }
    if (diffDays === 1) {
      return { days: 1, text: '1 day clean. You are on the right track!' };
    }
    return { days: diffDays, text: `${diffDays} days clean. Keep up the excellent work!` };
  };

  const streakInfo = calculateStreak();

  const openAddModal = () => {
    const now = new Date();
    // Format to local YYYY-MM-DD
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    
    setLogDate(`${yyyy}-${mm}-${dd}`);
    setLogTime(`${hh}:${min}`);
    setNotes('');
    setIsFormOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const combinedDateTime = new Date(`${logDate}T${logTime}`);
      await addRelapseLog(combinedDateTime, notes);
      setIsFormOpen(false);
      setCurrentPage(1);
      showToast('Occurrence logged.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to log occurrence', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;
    setLoading(true);
    try {
      const combinedDateTime = new Date(`${logDate}T${logTime}`);
      await updateRelapseLog(selectedLog.id, combinedDateTime, notes);
      setIsEditOpen(false);
      setSelectedLog(null);
      showToast('Log updated.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update log', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (logId: number) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return;
    try {
      await deleteRelapseLog(logId);
      setSelectedLog(null);
      showToast('Log entry deleted.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete log', 'error');
    }
  };

  const handleFilterChange = (newPeriod: string) => {
    setFilterPeriod(newPeriod);
    setCurrentPage(1);
  };

  // Filter logs by period
  const filteredLogs = initialLogs.filter(log => {
    const d = new Date(log.date);
    const now = new Date();

    if (filterPeriod === 'ALL') return true;
    if (filterPeriod === 'TODAY') {
      return d.toDateString() === now.toDateString();
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
  });

  // Pagination
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedLogs = filteredLogs.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  const filterTabs = [
    { id: 'TODAY', label: 'Today' },
    { id: 'WEEK', label: 'This Week' },
    { id: 'MONTH', label: 'This Month' },
    { id: 'YEAR', label: 'This Year' },
    { id: 'ALL', label: 'All Time' },
    { id: 'CUSTOM', label: 'Custom Range' },
  ];

  return (
    <div>
      {/* STREAK & LOG ACTION BLOCK */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Streak card */}
        <div className="card highlight-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '3px solid var(--c-primary)', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(195,150,38,0.12)', color: 'var(--c-primary)' }}>
              <Flame size={22} />
            </span>
            <div>
              <span className="text-label-sm text-on-surface-variant">CURRENT RECOVERY STREAK</span>
              <h2 className="text-headline-lg" style={{ margin: 0, fontWeight: 800, color: 'var(--c-primary)' }}>
                {streakInfo.days} {streakInfo.days === 1 ? 'Day' : 'Days'}
              </h2>
            </div>
          </div>
          <p className="text-body-md text-on-surface-variant" style={{ margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
            {streakInfo.text}
          </p>
        </div>

        {/* Action card */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px dashed var(--c-outline)', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <ShieldCheck size={40} color="var(--c-primary)" />
          <div>
            <h4 className="text-title-md" style={{ margin: '0 0 4px 0', fontWeight: 700 }}>Stay Mindful</h4>
            <p className="text-label-md text-on-surface-variant" style={{ margin: 0 }}>Every minute is a victory. Log immediately to maintain accountability.</p>
          </div>
          <button onClick={openAddModal} className="primary-btn" style={{ padding: '10px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Log Occurrence
          </button>
        </div>

      </div>

      {/* FILTER TABS & SEARCH */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: filterPeriod === tab.id ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
                color: filterPeriod === tab.id ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Counter Badge */}
        <div style={{ padding: '6px 12px', borderRadius: '12px', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={14} />
          <span>Count in Selected Period: {filteredLogs.length}</span>
        </div>
      </div>

      {/* Custom Range date inputs */}
      {filterPeriod === 'CUSTOM' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input type="date" value={customStart} onChange={(e) => { setCustomStart(e.target.value); setCurrentPage(1); }} className="search-input" style={{ borderRadius: '8px' }} />
          <span className="text-on-surface-variant" style={{ fontWeight: 600 }}>to</span>
          <input type="date" value={customEnd} onChange={(e) => { setCustomEnd(e.target.value); setCurrentPage(1); }} className="search-input" style={{ borderRadius: '8px' }} />
        </div>
      )}

      {/* Grid of Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {paginatedLogs.length === 0 ? (
          <p className="text-on-surface-variant text-body-md" style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>No logged occurrences found for this period. Stay strong, keep moving forward!</p>
        ) : (
          paginatedLogs.map(log => {
            const dateObj = new Date(log.date);
            const dateStr = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div 
                key={log.id} 
                className="card"
                onClick={() => setSelectedLog(log)}
                style={{ 
                  padding: '16px', 
                  cursor: 'pointer',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--c-outline-variant)',
                  justifyContent: 'space-between',
                  minHeight: '120px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                      style={{ 
                        fontSize: '9px', 
                        fontWeight: 800, 
                        backgroundColor: 'rgba(220, 53, 69, 0.12)', 
                        color: '#dc3545', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <AlertTriangle size={10} /> Logged
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="text-body-md" style={{ fontWeight: 700, color: 'var(--c-on-surface)' }}>
                      {dateStr}
                    </span>
                    <span className="text-label-sm text-on-surface-variant" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {timeStr}
                    </span>
                  </div>

                  {log.notes && (
                    <p 
                      className="text-body-md"
                      style={{ 
                        whiteSpace: 'pre-wrap', 
                        margin: '4px 0 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.5,
                        color: 'var(--c-on-surface-variant)'
                      }}
                    >
                      {log.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
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

      {/* ADD LOG MODAL */}
      {isFormOpen && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsFormOpen(false)}
        >
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Log Occurrence</h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 600 }}>Date</label>
                  <input 
                    type="date" 
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '8px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 600 }}>Time</label>
                  <input 
                    type="time" 
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '8px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Notes / Triggers / Reflections (Optional)</label>
                <textarea 
                  placeholder="How did it happen? What were the triggers? What can you do to prevent it next time?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '100px', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#dc3545', color: '#ffffff' }}>{loading ? 'Saving...' : 'Confirm Log'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* LOG DETAILS MODAL */}
      {selectedLog && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedLog(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span 
                  style={{ 
                    alignSelf: 'flex-start',
                    fontSize: '10px', 
                    fontWeight: 700, 
                    backgroundColor: 'rgba(220, 53, 69, 0.12)', 
                    color: '#dc3545', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Occurrence Details
                </span>
                <h3 className="text-headline-sm" style={{ margin: '4px 0 0 0', fontWeight: 700 }}>
                  {new Date(selectedLog.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h3>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-on-surface-variant)' }}>
                  at {new Date(selectedLog.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            </div>

            {selectedLog.notes && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Triggers & Reflections</span>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--c-surface-container-low)', border: '1px solid var(--c-outline-variant)' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-on-surface)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {selectedLog.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Actions buttons */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '20px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  const dateObj = new Date(selectedLog.date);
                  const yyyy = dateObj.getFullYear();
                  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const dd = String(dateObj.getDate()).padStart(2, '0');
                  const hh = String(dateObj.getHours()).padStart(2, '0');
                  const min = String(dateObj.getMinutes()).padStart(2, '0');
                  
                  setLogDate(`${yyyy}-${mm}-${dd}`);
                  setLogTime(`${hh}:${min}`);
                  setNotes(selectedLog.notes || '');
                  setIsEditOpen(true);
                }}
                className="primary-btn"
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, boxShadow: 'none' }}
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(selectedLog.id)}
                className="primary-btn"
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', border: '1px solid rgba(220, 53, 69, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, boxShadow: 'none' }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT LOG MODAL */}
      {isEditOpen && selectedLog && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1010, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsEditOpen(false)}
        >
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Edit Log Entry</h3>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 600 }}>Date</label>
                  <input 
                    type="date" 
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '8px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 600 }}>Time</label>
                  <input 
                    type="time" 
                    value={logTime}
                    onChange={(e) => setLogTime(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '8px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Notes / Triggers / Reflections (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '100px', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
