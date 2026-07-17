'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DailyTask } from '@prisma/client';
import { Calendar, CheckCircle2, XCircle, X, Trash2 } from 'lucide-react';
import { deleteDailyTask } from '@/features/tasks/actions';

interface TaskHistoryTableProps {
  tasks: DailyTask[];
}

export default function TaskHistoryTable({ tasks }: TaskHistoryTableProps) {
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Filters State
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [endDateStr, setEndDateStr] = useState<string>('');

  // Local state to allow immediate updates on delete
  const [localTasks, setLocalTasks] = useState<DailyTask[]>(tasks);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const openModal = (dayStr: string) => {
    setSelectedDayStr(dayStr);
  };

  const closeModal = () => {
    setSelectedDayStr(null);
  };

  // Extract years present in the dataset dynamically
  const availableYears = Array.from(
    new Set([
      new Date().getFullYear(),
      ...localTasks
        .map(t => t.targetDate ? new Date(t.targetDate).getFullYear() : null)
        .filter((y): y is number => y !== null)
    ])
  ).sort((a, b) => b - a);

  // Delete handlers
  const handleDeleteTask = async (id: number) => {
    try {
      await deleteDailyTask(id);
      setLocalTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert("Failed to delete task: " + (e as Error).message);
    }
  };

  // Filter localTasks based on active filters
  const filteredTasks = localTasks.filter((task) => {
    if (!task.targetDate) return false;
    const taskDate = new Date(task.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply Year Dropdown if selected
    if (selectedYear !== 'all') {
      if (taskDate.getFullYear().toString() !== selectedYear) {
        return false;
      }
    }

    // Apply main range filters
    switch (activeFilter) {
      case 'today': {
        const startOfToday = new Date(today);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);
        return taskDate >= startOfToday && taskDate <= endOfToday;
      }
      case 'week': {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(today.setDate(diff));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return taskDate >= startOfWeek && taskDate <= endOfWeek;
      }
      case 'month': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        return taskDate >= startOfMonth && taskDate <= endOfMonth;
      }
      case 'year': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        endOfYear.setHours(23, 59, 59, 999);
        return taskDate >= startOfYear && taskDate <= endOfYear;
      }
      case 'custom': {
        if (startDateStr) {
          const start = new Date(startDateStr);
          start.setHours(0, 0, 0, 0);
          if (taskDate < start) return false;
        }
        if (endDateStr) {
          const end = new Date(endDateStr);
          end.setHours(23, 59, 59, 999);
          if (taskDate > end) return false;
        }
        return true;
      }
      case 'all':
      default:
        return true;
    }
  });

  // Group tasks by date string
  const tasksByDay: Record<string, DailyTask[]> = {};
  const activeDayStrings: string[] = [];

  filteredTasks.forEach((task) => {
    if (!task.targetDate) return;
    const dateStr = new Date(task.targetDate).toISOString().split('T')[0];
    if (!tasksByDay[dateStr]) {
      tasksByDay[dateStr] = [];
      activeDayStrings.push(dateStr);
    }
    tasksByDay[dateStr].push(task);
  });

  // Dynamically extract days with tasks (empty days are automatically hidden)
  const activeDays = activeDayStrings.map(dateStr => new Date(dateStr + 'T00:00:00'));

  // Pagination Logic
  const PAGE_SIZE = 24; 
  const totalPages = Math.ceil(activeDays.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedDays = activeDays.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  // Get data for selected day modal
  const selectedDayTasks = selectedDayStr ? tasksByDay[selectedDayStr] || [] : [];
  const selectedDayDate = selectedDayStr ? new Date(selectedDayStr + 'T00:00:00') : null;
  const selectedDayDisplayDate = selectedDayDate 
    ? selectedDayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) 
    : '';

  // Close modal automatically if no tasks are left on the selected day
  useEffect(() => {
    if (selectedDayStr && selectedDayTasks.length === 0) {
      setSelectedDayStr(null);
    }
  }, [localTasks, selectedDayStr, selectedDayTasks.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* FILTER CONTROLS */}
      <div className="card flex-col gap-16" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--c-primary)', fontSize: '22px' }}>filter_list</span>
          <h3 className="text-title-md" style={{ margin: 0, fontWeight: 600 }}>Filter Tasks</h3>
        </div>

        {/* Quick Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
            { id: 'custom', label: 'Custom Range' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: activeFilter === tab.id ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
                color: activeFilter === tab.id ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Year Dropdown & Custom Range Inputs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
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

          {activeFilter === 'custom' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-on-surface-variant)', letterSpacing: '0.05em' }}>START DATE</span>
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => {
                    setStartDateStr(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="search-input"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    border: '1px solid var(--c-outline-variant)',
                    backgroundColor: 'var(--c-surface)',
                    color: 'var(--c-on-surface)',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--c-on-surface-variant)', letterSpacing: '0.05em' }}>END DATE</span>
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => {
                    setEndDateStr(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="search-input"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    border: '1px solid var(--c-outline-variant)',
                    backgroundColor: 'var(--c-surface)',
                    color: 'var(--c-on-surface)',
                    outline: 'none'
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* TASK HISTORY GRID */}
      <div className="task-history-grid">
        {paginatedDays.map((day) => {
          const dayStr = day.toISOString().split('T')[0];
          const dayTasks = tasksByDay[dayStr] || [];
          // Display format with year included
          const displayDate = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          
          const todayStr = new Date().toISOString().split('T')[0];
          const isToday = dayStr === todayStr;

          const completedCount = dayTasks.filter((t) => t.isCompleted).length;
          const totalCount = dayTasks.length;
          const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

          return (
            <div 
              key={dayStr} 
              className="card" 
              style={{ 
                padding: 0, 
                overflow: 'hidden', 
                border: isToday ? '1px solid var(--c-primary)' : '1px solid var(--c-outline-variant)',
                boxShadow: isToday ? 'var(--shadow-glow-primary)' : 'var(--shadow-sm)'
              }}
            >
              {/* Header Card (Triggers Modal) */}
              <div 
                onClick={() => openModal(dayStr)}
                style={{ 
                  padding: '24px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  backgroundColor: isToday ? 'var(--c-surface-container-high)' : 'var(--c-surface)',
                  userSelect: 'none',
                  transition: 'background-color 0.2s ease',
                  height: '100%',
                  justifyContent: 'space-between'
                }}
                className="accordion-header"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={18} color={isToday ? 'var(--c-primary)' : 'var(--c-on-surface-variant)'} />
                    <span className="text-body-md" style={{ fontWeight: 700, color: 'var(--c-on-surface)', whiteSpace: 'nowrap' }}>
                      {isToday ? `Today (${displayDate})` : displayDate}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>
                      {completedCount} of {totalCount} tasks
                    </span>
                    <span className="material-symbols-outlined" style={{ color: 'var(--c-on-surface-variant)', fontSize: '18px' }}>visibility</span>
                  </div>
                </div>

                {/* Thin Progress Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--c-surface-container-highest)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                  <div 
                    style={{ 
                      width: `${completionRate}%`, 
                      height: '100%', 
                      backgroundColor: completionRate === 100 ? 'var(--c-secondary)' : 'var(--c-primary)',
                      transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeDays.length === 0 && (
        <div className="card" style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--c-surface-container-low)', borderRadius: '12px', border: '1px dashed var(--c-outline)' }}>
          <p className="text-on-surface-variant" style={{ margin: 0 }}>No daily tasks found matching the filter criteria.</p>
        </div>
      )}

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

      {/* DETAILED MODAL DIALOG */}
      {selectedDayStr && mounted && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000, 
            padding: '16px', 
            backdropFilter: 'blur(4px)' 
          }}
          onClick={closeModal}
        >
          <div 
            className="card" 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px', 
              padding: '24px', 
              position: 'relative', 
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginRight: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={22} color="var(--c-primary)" />
                <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>
                  {selectedDayDisplayDate}
                </h3>
              </div>

              <button
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete all tasks on ${selectedDayDisplayDate}?`)) {
                    try {
                      // Delete all tasks for this day
                      for (const t of selectedDayTasks) {
                        await deleteDailyTask(t.id);
                      }
                      setLocalTasks(prev => prev.filter(t => !selectedDayTasks.some(s => s.id === t.id)));
                      setSelectedDayStr(null);
                    } catch (e) {
                      alert("Error deleting tasks: " + (e as Error).message);
                    }
                  }
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'var(--c-error)',
                  border: '1px solid var(--c-error)',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={13} /> Delete All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
              {selectedDayTasks.map((task) => (
                <div 
                  key={task.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 16px', 
                    backgroundColor: 'var(--c-surface-container-low)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--c-outline-variant)' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    {task.isCompleted ? (
                      <CheckCircle2 size={20} color="var(--c-secondary)" />
                    ) : (
                      <XCircle size={20} color="var(--c-error)" />
                    )}
                    <span 
                      className="text-body-md" 
                      style={{ 
                        fontWeight: 500, 
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                        color: task.isCompleted ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)',
                        opacity: task.isCompleted ? 0.7 : 1,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word'
                      }}
                    >
                      {task.title}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span 
                      style={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: task.isCompleted ? 'var(--c-secondary)' : 'var(--c-error)',
                        backgroundColor: task.isCompleted ? 'var(--c-surface-container-highest)' : 'var(--c-error-container)',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}
                    >
                      {task.isCompleted ? 'Completed' : 'Missed'}
                    </span>

                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                          await handleDeleteTask(task.id);
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--c-error)',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={closeModal} 
                className="primary-btn" 
                style={{ padding: '8px 20px', borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
