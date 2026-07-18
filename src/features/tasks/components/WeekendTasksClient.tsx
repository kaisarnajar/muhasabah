'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, List, Calendar, CalendarHeart, X, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { addWeekendTask, deleteWeekendTask, updateWeekendTaskStatus } from '@/features/tasks/actions';
import DeleteConfirmButton from '@/components/ui/DeleteConfirmButton';
import { WeekendTask, WeekendTaskLog } from '@prisma/client';

type TaskWithLogs = WeekendTask & { logs: WeekendTaskLog[] };

function getMonday(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const localMonday = new Date(date.setDate(diff));
  // Return Monday at midnight in UTC
  return new Date(Date.UTC(localMonday.getFullYear(), localMonday.getMonth(), localMonday.getDate()));
}

// Generate the last 12 weeks (Mondays)
function generatePastWeeks(count: number) {
  const weeks = [];
  const currentMonday = getMonday(new Date());
  
  for (let i = 0; i < count; i++) {
    const w = new Date(currentMonday);
    w.setUTCDate(currentMonday.getUTCDate() - (i * 7));
    weeks.push(w);
  }
  return weeks;
}

export default function WeekendTasksClient({ initialTasks }: { initialTasks: TaskWithLogs[] }) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [view, setView] = useState<'table' | 'manage'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEditWeek, setSelectedEditWeek] = useState<Date | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ taskId: number; weekDateStr: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [customWeeks, setCustomWeeks] = useState<string[]>([]);
  const [isAddWeekOpen, setIsAddWeekOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const getWeekLabel = (weekDate: Date) => {
    const endDate = new Date(weekDate);
    endDate.setUTCDate(weekDate.getUTCDate() + 6);
    const startLabel = weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    const endLabel = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    return `From ${startLabel} - To ${endLabel}`;
  };

  // Extract all week start dates that have logs in the database
  const loggedWeeks = new Set<string>();
  initialTasks.forEach(task => {
    task.logs.forEach(log => {
      if (log.weekStartDate) {
        const d = new Date(log.weekStartDate);
        loggedWeeks.add(d.toISOString().split('T')[0]);
      }
    });
  });

  const currentWeekMonday = getMonday(new Date());
  const currentWeekStr = currentWeekMonday.toISOString().split('T')[0];

  const weeks = Array.from(new Set([
    currentWeekStr,
    ...Array.from(loggedWeeks),
    ...customWeeks
  ]))
  .map(dateStr => new Date(dateStr))
  .sort((a, b) => b.getTime() - a.getTime());

  const selectedTask = selectedCell
    ? initialTasks.find(t => t.id === selectedCell.taskId)
    : null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setLoading(true);
    try {
      await addWeekendTask(newTaskTitle);
      setNewTaskTitle('');
      setIsAddTaskOpen(false);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      showToast('Failed to add task', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleStatusUpdate = async (id: number, status: 'DONE' | 'UNDONE' | 'UNMARKED', weekStartDateStr: string) => {
    await updateWeekendTaskStatus(id, status, weekStartDateStr);
  };

  const handleViewChange = (newView: 'table' | 'manage') => {
    setView(newView);
    setCurrentPage(1); // Reset page when view switches
  };

  // Pagination Logic for Manage View Task List
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(initialTasks.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedTasks = initialTasks.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  return (
    <div>
      {/* PAGE HEADER (Always visible, stays fixed at the top) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CalendarHeart color="var(--c-primary)" size={28} />
          <h2 className="text-headline-md" style={{ margin: 0 }}>Weekend Tasks</h2>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {view === 'table' && (
            <button 
              onClick={() => setIsAddWeekOpen(true)} 
              className="primary-btn" 
            >
              <Plus size={18} /> Add Week
            </button>
          )}

          {view === 'table' ? (
            <button 
              onClick={() => handleViewChange('manage')} 
              className="primary-btn" 
            >
              <List size={18} /> Manage Tasks
            </button>
          ) : (
            <button 
              onClick={() => handleViewChange('table')} 
              className="primary-btn" 
            >
              <Calendar size={18} /> View History Table
            </button>
          )}
        </div>
      </div>

      <p className="text-body-md text-on-surface-variant mb-24">
        {view === 'table' 
          ? 'Track your recurring weekend tasks historically. Check off tasks for the current week at the top, and see your progress over the past weeks below.'
          : 'Add new recurring weekend tasks or delete existing ones from your schedule.'
        }
      </p>

      {view === 'manage' ? (
        /* MANAGE TASKS CARD */
        <div className="card" style={{ padding: '24px' }}>
          <h3 className="text-title-md" style={{ margin: '0 0 20px 0', fontWeight: 600 }}>Manage Weekend Tasks</h3>

          {/* ADD TASK BUTTON */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => { setNewTaskTitle(''); setIsAddTaskOpen(true); }}
              className="primary-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 700 }}
            >
              <Plus size={18} /> Add Task
            </button>
          </div>

          {/* VERTICAL LIST FOR MANAGING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paginatedTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--c-surface-container-low)', borderRadius: '8px', border: '1px solid var(--c-outline-variant)' }}>
                <span className="text-body-md" style={{ fontWeight: 500, color: 'var(--c-on-surface)' }}>
                  {task.title}
                </span>
                <DeleteConfirmButton 
                  action={async () => {
                    await deleteWeekendTask(task.id);
                    setCurrentPage(1);
                  }}
                  iconSize={18}
                  title="Delete Task"
                  message="Are you sure you want to permanently delete this weekend task?"
                  style={{ padding: '8px' }}
                />
              </div>
            ))}
            {paginatedTasks.length === 0 && (
              <p className="text-on-surface-variant" style={{ textAlign: 'center', padding: '24px' }}>No tasks found. Add a task above.</p>
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
          </div>
        </div>
      ) : (
        /* 2D HISTORY TABLE CARD */
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ overflowX: 'auto', transform: 'rotateX(180deg)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '800px', transform: 'rotateX(180deg)' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px', borderBottom: '2px solid var(--c-outline-variant)', textAlign: 'left', minWidth: '150px' }}>Week Of</th>
                  {initialTasks.map(task => (
                    <th key={task.id} style={{ padding: '16px', borderBottom: '2px solid var(--c-outline-variant)', minWidth: '120px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>{task.title}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, idx) => {
                  const weekDateStr = week.toISOString().split('T')[0];
                  const weekLabel = getWeekLabel(week);
                  const isCurrentWeek = idx === 0;
                  
                  return (
                    <tr key={weekDateStr} style={{ backgroundColor: isCurrentWeek ? 'var(--c-surface-container-high)' : 'transparent', borderBottom: '1px solid var(--c-outline-variant)' }}>
                      <td 
                        onClick={() => setSelectedEditWeek(week)}
                        style={{ 
                          padding: '16px', 
                          textAlign: 'left', 
                          fontWeight: isCurrentWeek ? '700' : '500',
                          cursor: 'pointer',
                          color: 'var(--c-primary)',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--c-primary-light, #dcae2e)';
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--c-primary)';
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{isCurrentWeek ? `Current Week (${weekLabel})` : weekLabel}</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', opacity: 0.8 }}>edit</span>
                        </div>
                      </td>
                      
                      {initialTasks.map(task => {
                        const logEntry = task.logs.find(log => {
                          const logWeekStr = new Date(log.weekStartDate).toISOString().split('T')[0];
                          return logWeekStr === weekDateStr;
                        });

                        let status: 'DONE' | 'UNDONE' | 'UNMARKED' = 'UNMARKED';
                        if (logEntry) {
                          status = logEntry.status as 'DONE' | 'UNDONE';
                        } else {
                          // Default to UNDONE for past weeks
                          if (!isCurrentWeek) {
                            status = 'UNDONE';
                          }
                        }
                        
                        return (
                          <td key={task.id} style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              {status === 'DONE' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCell({ taskId: task.id, weekDateStr })}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--c-task-done-bg)',
                                    border: '1.5px solid var(--c-task-done-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--c-task-done-icon)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Check size={16} strokeWidth={3} />
                                </button>
                              )}
                              {status === 'UNDONE' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCell({ taskId: task.id, weekDateStr })}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    backgroundColor: 'var(--c-task-undone-bg)',
                                    border: '1.5px solid var(--c-task-undone-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--c-task-undone-icon)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <X size={16} strokeWidth={3} />
                                </button>
                              )}
                              {status === 'UNMARKED' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCell({ taskId: task.id, weekDateStr })}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '4px',
                                    backgroundColor: 'transparent',
                                    border: '2px solid var(--c-outline)',
                                    display: 'flex',
                                    cursor: 'pointer'
                                  }}
                                />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedEditWeek && mounted && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000, 
            padding: '16px', 
            backdropFilter: 'blur(4px)' 
          }}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: '500px', 
              width: '100%', 
              position: 'relative', 
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: 'var(--c-surface)',
              border: '1px solid var(--c-outline-variant)'
            }}
          >
            <button 
              type="button"
              onClick={() => setSelectedEditWeek(null)} 
              style={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--c-on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-surface-container-high)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Close"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-title-md" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: 'var(--c-on-surface)' }}>
                <Calendar size={22} style={{ color: 'var(--c-primary)' }} />
                Edit Week Progress
              </h3>
              <p className="text-label-sm text-primary" style={{ marginTop: '6px', textTransform: 'uppercase', fontWeight: 700 }}>
                {getWeekLabel(selectedEditWeek)}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
              {initialTasks.map(task => {
                const weekDateStr = selectedEditWeek.toISOString().split('T')[0];
                const logEntry = task.logs.find(log => {
                  const logWeekStr = new Date(log.weekStartDate).toISOString().split('T')[0];
                  return logWeekStr === weekDateStr;
                });

                let status: 'DONE' | 'UNDONE' | 'UNMARKED' = 'UNMARKED';
                if (logEntry) {
                  status = logEntry.status as 'DONE' | 'UNDONE';
                } else {
                  // For past weeks, default display is UNDONE
                  const currentWeekMonday = getMonday(new Date());
                  const currentWeekStr = currentWeekMonday.toISOString().split('T')[0];
                  if (weekDateStr !== currentWeekStr) {
                    status = 'UNDONE';
                  }
                }

                return (
                  <div 
                    key={task.id} 
                    className="habit-item" 
                    style={{ 
                      backgroundColor: 'var(--c-surface-container-low)', 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      border: '1px solid var(--c-outline-variant)'
                    }}
                  >
                    <span className="text-body-md" style={{ fontWeight: 500, color: 'var(--c-on-surface)' }}>
                      {task.title}
                    </span>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* DONE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(task.id, status === 'DONE' ? 'UNMARKED' : 'DONE', weekDateStr)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: status === 'DONE' ? 'var(--c-task-done-bg)' : 'transparent',
                          color: status === 'DONE' ? 'var(--c-task-done-icon)' : 'var(--c-on-surface-variant)',
                          border: status === 'DONE' ? '1.5px solid var(--c-task-done-border)' : '1px solid var(--c-outline)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        title="Mark Done"
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>

                      {/* UNDONE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(task.id, status === 'UNDONE' ? 'UNMARKED' : 'UNDONE', weekDateStr)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: status === 'UNDONE' ? 'var(--c-task-undone-bg)' : 'transparent',
                          color: status === 'UNDONE' ? 'var(--c-task-undone-icon)' : 'var(--c-on-surface-variant)',
                          border: status === 'UNDONE' ? '1.5px solid var(--c-task-undone-border)' : '1px solid var(--c-outline)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        title="Mark Undone"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setSelectedEditWeek(null)} 
                className="primary-btn" 
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px',
                  backgroundColor: 'var(--c-surface-container-high)', 
                  color: 'var(--c-on-surface)', 
                  boxShadow: 'none',
                  border: '1px solid var(--c-outline-variant)',
                  backgroundImage: 'none',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isAddWeekOpen && mounted && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1000, 
            padding: '16px', 
            backdropFilter: 'blur(4px)' 
          }}
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const startDateStr = formData.get('startDate') as string;
              const endDateStr = formData.get('endDate') as string;
              
              if (!startDateStr || !endDateStr) {
                showToast("Please fill in both dates.", "error");
                return;
              }

              // Local timezone parse
              const [sY, sM, sD] = startDateStr.split('-').map(Number);
              const startLocalDate = new Date(sY, sM - 1, sD);

              const [eY, eM, eD] = endDateStr.split('-').map(Number);
              const endLocalDate = new Date(eY, eM - 1, eD);

              // 1. Start date must be Monday (getDay() === 1)
              // 2. End date must be Sunday (getDay() === 0)
              // 3. End date must be exactly 6 days after Start date
              const isMonday = startLocalDate.getDay() === 1;
              const isSunday = endLocalDate.getDay() === 0;
              const diffTime = endLocalDate.getTime() - startLocalDate.getTime();
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
              const isOneWeek = diffDays === 6;

              if (!isMonday || !isSunday || !isOneWeek) {
                showToast("You haven't entered the dates correctly. The week must start on a Monday and end on a Sunday.", "error");
                return;
              }

              const formattedStart = startLocalDate.toISOString().split('T')[0];
              setCustomWeeks(prev => Array.from(new Set([...prev, formattedStart])));
              setIsAddWeekOpen(false);
            }}
            className="card" 
            style={{ 
              maxWidth: '400px', 
              width: '100%', 
              position: 'relative', 
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: 'var(--c-surface)',
              border: '1px solid var(--c-outline-variant)'
            }}
          >
            <button 
              type="button"
              onClick={() => setIsAddWeekOpen(false)} 
              style={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--c-on-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--c-surface-container-high)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Close"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-title-md" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: 'var(--c-on-surface)' }}>
                <Calendar size={22} style={{ color: 'var(--c-primary)' }} />
                Add Custom Week
              </h3>
              <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '6px' }}>
                Select a date range strictly spanning from Monday to Sunday.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Start Date (Monday)</label>
                <input 
                  type="date" 
                  name="startDate" 
                  required 
                  className="search-input"
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>End Date (Sunday)</label>
                <input 
                  type="date" 
                  name="endDate" 
                  required 
                  className="search-input"
                  style={{ borderRadius: '8px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setIsAddWeekOpen(false)} 
                className="primary-btn" 
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px',
                  backgroundColor: 'var(--c-surface-container-high)', 
                  color: 'var(--c-on-surface)', 
                  boxShadow: 'none',
                  border: '1px solid var(--c-outline-variant)',
                  backgroundImage: 'none',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="primary-btn" 
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                Add Week
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
      {isAddTaskOpen && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '16px', backdropFilter: 'blur(6px)' }}
          onClick={() => setIsAddTaskOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '420px', width: '100%', position: 'relative', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsAddTaskOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Add New Task</h3>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Name</label>
                <input
                  type="text"
                  placeholder="e.g., Room Cleaning, Laundry..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsAddTaskOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ padding: '10px 24px', borderRadius: '8px' }} disabled={loading}>
                  {loading ? 'Adding…' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {selectedCell && selectedTask && mounted && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 1100, 
            backdropFilter: 'blur(2px)' 
          }}
          onClick={() => setSelectedCell(null)}
        >
          <div 
            className="card"
            style={{ 
              maxWidth: '320px', 
              width: '100%', 
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: 'var(--c-surface)',
              border: '1px solid var(--c-outline-variant)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setSelectedCell(null)} 
              style={{ 
                position: 'absolute', 
                top: '16px', 
                right: '16px', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--c-on-surface-variant)',
                display: 'flex'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', padding: '8px 0 0 0' }}>
              <span className="text-label-sm text-primary" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                {getWeekLabel(new Date(selectedCell.weekDateStr))}
              </span>
              <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', fontWeight: 800, color: 'var(--c-on-surface)', wordBreak: 'break-word' }}>
                {selectedTask.title}
              </h4>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '8px 0' }}>
              <button
                type="button"
                onClick={async () => {
                  await handleStatusUpdate(selectedCell.taskId, 'DONE', selectedCell.weekDateStr);
                  setSelectedCell(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--c-task-done-bg)',
                  color: 'var(--c-task-done-icon)',
                  border: '1.5px solid var(--c-task-done-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                <Check size={18} strokeWidth={3} />
                Done
              </button>
              
              <button
                type="button"
                onClick={async () => {
                  await handleStatusUpdate(selectedCell.taskId, 'UNDONE', selectedCell.weekDateStr);
                  setSelectedCell(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--c-task-undone-bg)',
                  color: 'var(--c-task-undone-icon)',
                  border: '1.5px solid var(--c-task-undone-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                <X size={18} strokeWidth={3} />
                Undone
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={async () => {
                  await handleStatusUpdate(selectedCell.taskId, 'UNMARKED', selectedCell.weekDateStr);
                  setSelectedCell(null);
                }}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--c-surface-container-high)',
                  color: 'var(--c-on-surface-variant)',
                  border: '1px solid var(--c-outline-variant)',
                  cursor: 'pointer',
                  fontWeight: 650,
                  fontSize: '12px'
                }}
              >
                Clear / Unmark
              </button>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--c-on-surface)',
                  border: '1px solid var(--c-outline)',
                  cursor: 'pointer',
                  fontWeight: 650,
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
