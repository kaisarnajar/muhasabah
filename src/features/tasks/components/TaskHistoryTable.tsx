'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DailyTask } from '@prisma/client';
import { Calendar, CheckCircle2, XCircle, X } from 'lucide-react';

interface TaskHistoryTableProps {
  tasks: DailyTask[];
}

export default function TaskHistoryTable({ tasks }: TaskHistoryTableProps) {
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const openModal = (dayStr: string) => {
    setSelectedDayStr(dayStr);
  };

  const closeModal = () => {
    setSelectedDayStr(null);
  };

  // Group tasks by date string
  const tasksByDay: Record<string, DailyTask[]> = {};
  const activeDayStrings: string[] = [];

  tasks.forEach((task) => {
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
  const PAGE_SIZE = 24; // 24 cards fits nicely in grid structures (multiples of 2, 3, 4)
  const totalPages = Math.ceil(activeDays.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedDays = activeDays.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  // Get data for selected day modal
  const selectedDayTasks = selectedDayStr ? tasksByDay[selectedDayStr] || [] : [];
  const selectedDayDate = selectedDayStr ? new Date(selectedDayStr + 'T00:00:00') : null;
  const selectedDayDisplayDate = selectedDayDate 
    ? selectedDayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) 
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="task-history-grid">
        {paginatedDays.map((day) => {
          const dayStr = day.toISOString().split('T')[0];
          const dayTasks = tasksByDay[dayStr] || [];
          const displayDate = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          
          // Find if this day matches today's date
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
        <p className="text-on-surface-variant" style={{ margin: 0 }}>No daily tasks recorded yet.</p>
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
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card inside modal
          >
            <button 
              onClick={closeModal} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={22} color="var(--c-primary)" />
              <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>
                {selectedDayDisplayDate}
              </h3>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                        opacity: task.isCompleted ? 0.7 : 1
                      }}
                    >
                      {task.title}
                    </span>
                  </div>
                  
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
