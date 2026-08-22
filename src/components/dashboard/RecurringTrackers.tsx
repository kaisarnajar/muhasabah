'use client';

import { useState, useTransition, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { CalendarRange, Check, Plus, X, CalendarCheck } from 'lucide-react';
import { addRecurringTracker, updateRecurringLastDone, deleteRecurringTracker } from '@/features/tasks/actions';
import DeleteConfirmButton from '@/components/ui/DeleteConfirmButton';
import { useToast } from '@/context/ToastContext';
import { getTodayDateString, getLocalDateString } from '@/lib/dateUtils';

interface RecurringTracker {
  id: number;
  title: string;
  lastDone: Date | null;
  createdAt: Date;
}

export default function RecurringTrackers({ initialTrackers }: { initialTrackers: RecurringTracker[] }) {
  const [newTitle, setNewTitle] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTrackerForEdit, setSelectedTrackerForEdit] = useState<RecurringTracker | null>(null);
  const [editDate, setEditDate] = useState('');
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    startTransition(async () => {
      try {
        await addRecurringTracker(newTitle);
        setNewTitle('');
        setIsAddModalOpen(false);
        showToast('Tracker added successfully!', 'success');
        router.refresh();
      } catch (error) {
        console.error(error);
        showToast('Failed to add tracker.', 'error');
      }
    });
  };

  const handleMarkDoneToday = async (id: number, title: string) => {
    const todayStr = getTodayDateString();
    startTransition(async () => {
      try {
        await updateRecurringLastDone(id, todayStr);
        setSelectedTrackerForEdit(null);
        showToast(`Marked "${title}" as completed today!`, 'success');
        router.refresh();
      } catch (error) {
        console.error(error);
        showToast('Failed to update tracker.', 'error');
      }
    });
  };

  const handleSaveCustomDate = async (id: number, title: string) => {
    startTransition(async () => {
      try {
        await updateRecurringLastDone(id, editDate || null);
        setSelectedTrackerForEdit(null);
        showToast(`Updated completed date for "${title}".`, 'success');
        router.refresh();
      } catch (error) {
        console.error(error);
        showToast('Failed to update date.', 'error');
      }
    });
  };

  const handleClearDate = async (id: number, title: string) => {
    startTransition(async () => {
      try {
        await updateRecurringLastDone(id, null);
        setSelectedTrackerForEdit(null);
        showToast(`Cleared completed date for "${title}".`, 'success');
        router.refresh();
      } catch (error) {
        console.error(error);
        showToast('Failed to clear date.', 'error');
      }
    });
  };

  const handleDelete = async (id: number, title: string) => {
    startTransition(async () => {
      try {
        await deleteRecurringTracker(id);
        showToast(`Deleted tracker "${title}".`, 'success');
        router.refresh();
      } catch (error) {
        console.error(error);
        showToast('Failed to delete tracker.', 'error');
      }
    });
  };

  const formatLastDone = (lastDoneDate: Date | null) => {
    if (!lastDoneDate) return 'Never completed';

    const d = new Date(lastDoneDate);
    const localD = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    
    const now = new Date();
    const localToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffTime = localToday.getTime() - localD.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1) {
      const formatted = localD.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${diffDays} days ago (${formatted})`;
    }
    return localD.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 className="text-title-md" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <CalendarRange size={24} style={{ color: 'var(--c-primary)' }} />
            Periodic Tracker (Last Done)
          </h3>
          <p className="text-body-md text-on-surface-variant" style={{ marginTop: '4px' }}>
            Track tasks with infrequent frequencies, such as nail cutting or haircuts.
          </p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={18} /> Add Tracker
        </button>
      </div>

      {/* TRACKERS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {initialTrackers.map(tracker => {
          return (
            <div 
              key={tracker.id} 
              onClick={() => {
                setSelectedTrackerForEdit(tracker);
                setEditDate(tracker.lastDone ? getLocalDateString(tracker.lastDone, 'UTC') : '');
              }}
              className="habit-item" 
              style={{ 
                backgroundColor: 'var(--c-surface-container-low)', 
                padding: '16px 20px', 
                borderRadius: '12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                border: '1px solid var(--c-outline-variant)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--c-surface-container-high)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--c-surface-container-low)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="text-body-lg" style={{ fontWeight: 700, color: 'var(--c-on-surface)' }}>
                  {tracker.title}
                </span>
                <span className="text-label-md" style={{ color: tracker.lastDone ? 'var(--c-primary)' : 'var(--c-on-surface-variant)', fontWeight: 600 }}>
                  Last Done: {formatLastDone(tracker.lastDone)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
                {/* Visual indicator / trigger edit */}
                <span 
                  className="material-symbols-outlined" 
                  style={{ color: 'var(--c-on-surface-variant)', fontSize: '20px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedTrackerForEdit(tracker);
                    setEditDate(tracker.lastDone ? getLocalDateString(tracker.lastDone, 'UTC') : '');
                  }}
                  title="Edit completion date"
                >
                  calendar_month
                </span>

                {/* Delete button confirmation wrapper */}
                <DeleteConfirmButton 
                  action={() => handleDelete(tracker.id, tracker.title)} 
                  iconSize={18} 
                  title="Delete Tracker"
                  message={`Are you sure you want to delete the tracker "${tracker.title}"?`}
                />
              </div>
            </div>
          );
        })}

        {initialTrackers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--c-on-surface-variant)', border: '1px dashed var(--c-outline-variant)', borderRadius: '8px' }}>
            No periodic trackers added yet.
          </div>
        )}
      </div>

      {/* ADD TRACKER MODAL DIALOG */}
      {isAddModalOpen && mounted && createPortal(
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
            onSubmit={handleAdd}
            className="card" 
            style={{ 
              maxWidth: '450px', 
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
              onClick={() => setIsAddModalOpen(false)} 
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
                <CalendarRange size={22} style={{ color: 'var(--c-primary)' }} />
                Add Periodic Tracker
              </h3>
              <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '6px' }}>
                Create a new periodic task to track its last done date.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Tracker Name</label>
              <input 
                type="text" 
                placeholder="e.g. Nails Cutting, Haircut, Car Wash" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="search-input"
                required
                style={{ borderRadius: '8px' }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)} 
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
                Add Tracker
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* EDIT TRACKER MODAL DIALOG */}
      {selectedTrackerForEdit && mounted && createPortal(
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
          onClick={() => setSelectedTrackerForEdit(null)}
        >
          <div 
            className="card" 
            style={{ 
              maxWidth: '450px', 
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
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setSelectedTrackerForEdit(null)} 
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
                <CalendarCheck size={22} style={{ color: 'var(--c-primary)' }} />
                Update Completion
              </h3>
              <p className="text-body-md text-on-surface" style={{ fontWeight: 600, marginTop: '8px', color: 'var(--c-primary)' }}>
                {selectedTrackerForEdit.title}
              </p>
              <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '4px' }}>
                Last done: {formatLastDone(selectedTrackerForEdit.lastDone)}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '20px' }}>
              {/* Option 1: Done Today */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Option 1: Complete Today</span>
                <button
                  type="button"
                  onClick={() => handleMarkDoneToday(selectedTrackerForEdit.id, selectedTrackerForEdit.title)}
                  className="primary-btn"
                  style={{ 
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 700
                  }}
                >
                  <Check size={18} /> Mark Completed Today
                </button>
              </div>

              {/* Option 2: Custom Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
                <span className="text-label-sm text-on-surface" style={{ fontWeight: 600 }}>Option 2: Select Custom Date</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input 
                    type="date" 
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="search-input"
                    style={{ 
                      borderRadius: '8px', 
                      padding: '8px 12px', 
                      fontSize: '14px', 
                      flex: 1,
                      backgroundColor: 'var(--c-surface)',
                      border: '1px solid var(--c-outline-variant)'
                    }}
                  />
                  <button
                    type="button"
                    disabled={!editDate}
                    onClick={() => handleSaveCustomDate(selectedTrackerForEdit.id, selectedTrackerForEdit.title)}
                    className="primary-btn"
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      opacity: !editDate ? 0.5 : 1,
                      cursor: !editDate ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Save Date
                  </button>
                </div>
              </div>

              {/* Option 3: Reset / Clear Date */}
              {selectedTrackerForEdit.lastDone && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handleClearDate(selectedTrackerForEdit.id, selectedTrackerForEdit.title)}
                    className="primary-btn"
                    style={{ 
                      padding: '10px 20px', 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      backgroundColor: 'var(--c-surface-container-high)',
                      color: 'var(--c-error)',
                      border: '1px solid var(--c-outline-variant)',
                      boxShadow: 'none',
                      backgroundImage: 'none',
                      fontWeight: 600
                    }}
                  >
                    Clear Completion Date
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => setSelectedTrackerForEdit(null)} 
                className="primary-btn" 
                style={{ 
                  padding: '8px 20px', 
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
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
