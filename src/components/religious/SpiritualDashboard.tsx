'use client';

import { useState } from 'react';
import { Moon, CheckCircle2, Circle, Trash2, Plus, X, BookOpen, Settings } from 'lucide-react';
import { toggleSpiritualHabit, addSpiritualHabit, deleteSpiritualHabit, updateQuranMemorization } from '@/actions/religious';

interface HabitStatus {
  id: number;
  name: string;
  isCompleted: boolean;
}

interface HistoryRecord {
  date: Date;
  completedCount: number;
  totalCount: number;
  quranMemorization: string | null;
  habits: Array<{ name: string; isCompleted: boolean }>;
}

interface SpiritualDashboardProps {
  dateStr: string;
  initialTodayData: {
    habits: HabitStatus[];
    quranMemorization: string;
  };
  initialHistory: HistoryRecord[];
  allHabits: Array<{ id: number; name: string }>;
}

export default function SpiritualDashboard({
  dateStr,
  initialTodayData,
  initialHistory,
  allHabits
}: SpiritualDashboardProps) {
  // Modal states
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [submittingHabit, setSubmittingHabit] = useState(false);

  // Today Quran state
  const [quranNote, setQuranNote] = useState(initialTodayData.quranMemorization);
  const [savingQuran, setSavingQuran] = useState(false);
  const [quranMessage, setQuranMessage] = useState('');

  // Toggling status state (to prevent double clicks and show loading)
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Pagination states for history
  const [currentPage, setCurrentPage] = useState(1);

  const handleToggle = async (habitId: number, currentCompleted: boolean) => {
    setTogglingId(habitId);
    try {
      await toggleSpiritualHabit(dateStr, habitId, currentCompleted);
    } catch (error) {
      console.error(error);
      alert('Failed to update habit status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newHabitName.trim();
    if (!name) return;

    setSubmittingHabit(true);
    try {
      await addSpiritualHabit(name);
      setNewHabitName('');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to add habit.');
    } finally {
      setSubmittingHabit(false);
    }
  };

  const handleDeleteHabit = async (id: number) => {
    if (confirm('Are you sure you want to delete this habit? All past logs for this habit will also be permanently deleted.')) {
      try {
        await deleteSpiritualHabit(id);
      } catch (error) {
        console.error(error);
        alert('Failed to delete habit.');
      }
    }
  };

  const handleSaveQuran = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingQuran(true);
    setQuranMessage('');
    try {
      await updateQuranMemorization(dateStr, quranNote);
      setQuranMessage('Quran notes saved successfully!');
      setTimeout(() => setQuranMessage(''), 3000);
    } catch (error) {
      console.error(error);
      alert('Failed to save Quran notes.');
    } finally {
      setSavingQuran(false);
    }
  };

  // Pagination Logic
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(initialHistory.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedHistory = initialHistory.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* TODAY'S SPIRITUAL TRACKER CARD */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Moon color="var(--c-primary)" size={24} />
            <h2 className="text-headline-md" style={{ margin: 0, fontWeight: 700 }}>Today&apos;s Spiritual Tracker</h2>
          </div>
          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none' }}
          >
            <Settings size={18} /> Manage Habits
          </button>
        </div>

        <p className="text-body-md text-on-surface-variant mb-24" style={{ fontWeight: 500 }}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {initialTodayData.habits.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--c-surface-container-low)', border: '1px dashed var(--c-outline)' }}>
            <p className="text-on-surface-variant" style={{ margin: 0 }}>No habits added yet. Click &quot;Manage Habits&quot; above to create tracking tasks!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {initialTodayData.habits.map((habit) => {
              const isToggling = togglingId === habit.id;
              return (
                <div 
                  key={habit.id} 
                  className="habit-item"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    backgroundColor: 'var(--c-surface-container-low)',
                    border: '1px solid var(--c-outline-variant)',
                    opacity: isToggling ? 0.7 : 1,
                    pointerEvents: isToggling ? 'none' : 'auto'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                      onClick={() => handleToggle(habit.id, habit.isCompleted)}
                      className={`habit-checkbox ${habit.isCompleted ? 'checked' : ''}`}
                      style={{ border: '2px solid var(--c-primary)', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: habit.isCompleted ? 'var(--c-primary)' : 'none', padding: 0 }}
                    >
                      {habit.isCompleted && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-primary)', fontWeight: 'bold' }}>check</span>}
                    </button>
                    <p className="text-body-md" style={{ fontWeight: 600, margin: 0 }}>{habit.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quran Memorization Section */}
        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--c-outline-variant)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BookOpen size={20} color="var(--c-primary)" />
            <h3 className="text-title-md" style={{ margin: 0, fontWeight: 700 }}>Quran Memorization / Reflection</h3>
          </div>
          
          <form onSubmit={handleSaveQuran} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              placeholder="Record your Surah memorization, reading stats, or spiritual reflections today..."
              value={quranNote}
              onChange={(e) => setQuranNote(e.target.value)}
              className="search-input"
              style={{ width: '100%', minHeight: '100px', borderRadius: '8px', padding: '12px', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="text-label-sm" style={{ color: 'var(--c-secondary)', fontWeight: 600 }}>{quranMessage}</span>
              <button 
                type="submit" 
                className="primary-btn" 
                disabled={savingQuran}
                style={{ padding: '8px 24px', borderRadius: '8px' }}
              >
                {savingQuran ? 'Saving...' : 'Save Quran Log'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SPIRITUAL HISTORY SECTION */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <CheckCircle2 color="var(--c-secondary)" size={24} />
          <h2 className="text-headline-md" style={{ margin: 0, fontWeight: 700 }}>History Logs</h2>
        </div>

        {initialHistory.length === 0 ? (
          <p className="text-on-surface-variant" style={{ margin: 0 }}>No spiritual tracker logs saved yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {paginatedHistory.map((record, index) => {
              const formattedDate = new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
              
              // Calculate status percentage
              const completionRate = record.totalCount > 0 ? (record.completedCount / record.totalCount) * 100 : 0;

              return (
                <div key={index} className="p-16 rounded-12" style={{ backgroundColor: 'var(--c-surface-container-high)', border: '1px solid var(--c-outline-variant)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <span className="text-title-md" style={{ fontWeight: 'bold' }}>{formattedDate}</span>
                    <span className="text-label-sm" style={{ backgroundColor: completionRate === 100 ? 'var(--c-secondary-container)' : 'var(--c-primary-container)', color: completionRate === 100 ? 'var(--c-on-secondary-container)' : 'var(--c-primary)', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold' }}>
                      {record.completedCount} / {record.totalCount} Habits Completed
                    </span>
                  </div>

                  {record.habits.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
                      {record.habits.map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {h.isCompleted ? (
                            <CheckCircle2 size={16} color="var(--c-secondary)" />
                          ) : (
                            <Circle size={16} color="var(--c-on-surface-variant)" style={{ opacity: 0.5 }} />
                          )}
                          <span className="text-label-sm text-on-surface-variant" style={{ textDecoration: h.isCompleted ? 'none' : 'line-through', opacity: h.isCompleted ? 1 : 0.6 }}>
                            {h.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {record.quranMemorization && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--c-outline-variant)' }}>
                      <span className="text-label-sm" style={{ fontWeight: 'bold', color: 'var(--c-on-surface)' }}>Quran Reflection: </span>
                      <span className="text-body-sm text-on-surface-variant" style={{ whiteSpace: 'pre-wrap' }}>{record.quranMemorization}</span>
                    </div>
                  )}
                </div>
              );
            })}

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

      {/* MANAGE HABITS DIALOG / MODAL */}
      {isManageModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button 
              onClick={() => setIsManageModalOpen(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Manage Spiritual Habits</h3>

            {/* Add Habit Form */}
            <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="e.g. Tahajjud, Charity, Fasting..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="search-input"
                style={{ flex: 1, borderRadius: '8px' }}
                required
              />
              <button 
                type="submit" 
                className="primary-btn" 
                disabled={submittingHabit}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px' }}
              >
                <Plus size={16} /> Add
              </button>
            </form>

            {/* List of current Habits */}
            <div style={{ borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {allHabits.map((habit) => (
                <div 
                  key={habit.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '10px 16px', 
                    backgroundColor: 'var(--c-surface-container-low)', 
                    borderRadius: '8px',
                    border: '1px solid var(--c-outline-variant)'
                  }}
                >
                  <span className="text-body-md" style={{ fontWeight: 600 }}>{habit.name}</span>
                  <button 
                    onClick={() => handleDeleteHabit(habit.id)}
                    style={{ color: 'var(--c-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', transition: 'background-color 0.2s' }}
                    className="icon-btn-hover"
                    title="Delete Habit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {allHabits.length === 0 && (
                <p className="text-on-surface-variant text-center" style={{ margin: '16px 0' }}>No habits registered. Create one above!</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button 
                onClick={() => setIsManageModalOpen(false)} 
                className="primary-btn" 
                style={{ backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none', padding: '8px 24px', borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
