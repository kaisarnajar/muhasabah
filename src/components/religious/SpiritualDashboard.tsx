'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Moon, CheckCircle2, Circle, Plus, X, Settings, Users, ScrollText, Calendar } from 'lucide-react';
import { toggleSpiritualHabit, addSpiritualHabit, deleteSpiritualHabit, setPrayerJamaat, updateQuranMemorization, updateOtherActivities } from '@/actions/religious';
import DeleteConfirmButton from '@/components/layout/DeleteConfirmButton';
import { useToast } from '@/context/ToastContext';
import { isDefaultSpiritualHabit, PRAYER_HABIT_NAMES, sortSpiritualHabits, OPTIONAL_HABIT_NAMES } from '@/lib/spiritualHabits';
import { QURAN_SURAHS } from '@/lib/quranData';

interface HabitStatus {
  id: number;
  name: string;
  isCompleted: boolean;
  prayedWithJamaat: boolean;
}

interface HistoryRecord {
  date: Date;
  completedCount: number;
  totalCount: number;
  quranMemorization: string | null;
  otherActivities: string | null;
  habits: Array<{ name: string; isCompleted: boolean; prayedWithJamaat: boolean }>;
}

interface SpiritualDashboardProps {
  dateStr: string;
  initialTodayData: {
    habits: HabitStatus[];
    quranMemorization: string | null;
    otherActivities: string | null;
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
  const { showToast } = useToast();

  // Modal states
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [submittingHabit, setSubmittingHabit] = useState(false);

  // Quran Memorisation states
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(() => {
    if (initialTodayData.quranMemorization) {
      try {
        const parsed = JSON.parse(initialTodayData.quranMemorization);
        return parsed?.surahNumber || 1;
      } catch (e) {}
    }
    return 1;
  });
  const [fromVerse, setFromVerse] = useState<number>(() => {
    if (initialTodayData.quranMemorization) {
      try {
        const parsed = JSON.parse(initialTodayData.quranMemorization);
        return parsed?.fromVerse || 1;
      } catch (e) {}
    }
    return 1;
  });
  const [toVerse, setToVerse] = useState<number>(() => {
    if (initialTodayData.quranMemorization) {
      try {
        const parsed = JSON.parse(initialTodayData.quranMemorization);
        return parsed?.toVerse || 1;
      } catch (e) {}
    }
    return 1;
  });
  const [savingAll, setSavingAll] = useState(false);

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

  const handleSurahChange = (num: number) => {
    setSelectedSurahNum(num);
    setFromVerse(1);
    setToVerse(1);
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      // 1. Save Quran Memorisation if the habit is completed
      const quranHabit = initialTodayData.habits.find(h => h.name === 'Quran Memorisation');
      if (quranHabit?.isCompleted) {
        const payload = JSON.stringify({
          surahNumber: selectedSurahNum,
          fromVerse,
          toVerse
        });
        await updateQuranMemorization(dateStr, payload);
      } else {
        await updateQuranMemorization(dateStr, '');
      }

      // 2. Save Other Activities
      await updateOtherActivities(dateStr, otherActivities);

      showToast('Spiritual tracker progress saved!', 'success');
      setIsTrackerOpen(false);
    } catch (error) {
      console.error(error);
      showToast('Failed to save spiritual tracker details.', 'error');
    } finally {
      setSavingAll(false);
    }
  };

  // Other activities state
  const [otherActivities, setOtherActivities] = useState<string>(initialTodayData.otherActivities || '');

  // Toggling status state
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const sortedAllHabits = sortSpiritualHabits(allHabits);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Pagination states for history
  const [currentPage, setCurrentPage] = useState(1);

  const requiredCompleted = initialTodayData.habits.filter(h => !OPTIONAL_HABIT_NAMES.has(h.name) && h.isCompleted).length;
  const requiredTotal = initialTodayData.habits.filter(h => !OPTIONAL_HABIT_NAMES.has(h.name)).length;
  const optionalCompleted = initialTodayData.habits.filter(h => OPTIONAL_HABIT_NAMES.has(h.name) && h.isCompleted).length;

  const completedCount = requiredCompleted + optionalCompleted;
  const totalCount = requiredTotal + optionalCompleted;

  const handleToggle = async (habitId: number, currentCompleted: boolean) => {
    setTogglingId(habitId);
    try {
      await toggleSpiritualHabit(dateStr, habitId, currentCompleted);
      const habit = initialTodayData.habits.find(h => h.id === habitId);
      if (habit?.name === 'Quran Memorisation' && currentCompleted) {
        await updateQuranMemorization(dateStr, '');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to update habit status.', 'error');
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
    } catch (error: unknown) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Failed to add habit.', 'error');
    } finally {
      setSubmittingHabit(false);
    }
  };

  const handleJamaatChange = async (habitId: number, prayedWithJamaat: boolean) => {
    setTogglingId(habitId);
    try {
      await setPrayerJamaat(dateStr, habitId, prayedWithJamaat);
    } catch (error) {
      console.error(error);
      showToast('Failed to update Jamaat status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Pagination Logic
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(initialHistory.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedHistory = initialHistory.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const selectedRecord = selectedHistoryIndex !== null ? initialHistory[selectedHistoryIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Moon color="var(--c-primary)" size={28} />
          <h2 className="text-headline-md" style={{ margin: 0, fontWeight: 700 }}>Spiritual Tracker</h2>
        </div>
        <button
          onClick={() => setIsManageModalOpen(true)}
          className="primary-btn"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 20px', 
            borderRadius: '12px', 
            backgroundColor: 'var(--c-surface-container-high)', 
            color: 'var(--c-on-surface)', 
            border: '1px solid var(--c-outline-variant)',
            boxShadow: 'none',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'var(--transition-fast)'
          }}
        >
          <Settings size={18} /> Manage Habits
        </button>
      </div>

      {/* TODAY'S SUMMARY CARD */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 className="text-title-md" style={{ margin: 0, fontWeight: 700 }}>Today&apos;s Progress</h3>
          <p className="text-body-md text-on-surface-variant" style={{ margin: 0, fontWeight: 500 }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Summary Progress */}
        {totalCount > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="text-body-md" style={{ fontWeight: 600 }}>{completedCount} of {totalCount} completed</span>
              <span className="text-label-sm text-on-surface-variant">{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--c-surface-container-high)', overflow: 'hidden' }}>
              <div style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                height: '100%',
                borderRadius: '4px',
                backgroundColor: completedCount === totalCount ? 'var(--c-secondary)' : 'var(--c-primary)',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Quick view of habits */}
        {totalCount > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px', marginBottom: '20px' }}>
            {initialTodayData.habits.map(habit => (
              <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {habit.isCompleted ? (
                  <CheckCircle2 size={16} color="var(--c-secondary)" />
                ) : (
                  <Circle size={16} color="var(--c-on-surface-variant)" style={{ opacity: 0.5 }} />
                )}
                <span className="text-label-sm" style={{ color: habit.isCompleted ? 'var(--c-on-surface)' : 'var(--c-on-surface-variant)', opacity: habit.isCompleted ? 1 : 0.6 }}>
                  {habit.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {initialTodayData.quranMemorization && (
          <div style={{
            marginTop: '8px',
            marginBottom: '20px',
            padding: '10px 14px',
            backgroundColor: 'rgba(195, 150, 38, 0.05)',
            border: '1px solid rgba(195, 150, 38, 0.15)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--c-on-surface)'
          }}>
            <ScrollText size={16} color="var(--c-primary)" />
            <span style={{ fontWeight: 600 }}>Memorised today:</span>
            <span>{formatQuranMemorization(initialTodayData.quranMemorization)}</span>
          </div>
        )}

        {initialTodayData.otherActivities && (
          <div style={{
            marginTop: '8px',
            marginBottom: '20px',
            padding: '10px 14px',
            backgroundColor: 'rgba(195, 150, 38, 0.05)',
            border: '1px solid rgba(195, 150, 38, 0.15)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--c-on-surface)'
          }}>
            <ScrollText size={16} color="var(--c-primary)" />
            <span style={{ fontWeight: 600 }}>Other activities:</span>
            <span>{initialTodayData.otherActivities}</span>
          </div>
        )}

        <button
          onClick={() => setIsTrackerOpen(true)}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', width: '100%', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}
        >
          <Moon size={20} /> Open Tracker
        </button>
      </div>

      {/* IBADAH REGISTER */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ScrollText color="var(--c-secondary)" size={24} />
          <h2 className="text-headline-md" style={{ margin: 0, fontWeight: 700 }}>Ibadah Register</h2>
        </div>

        {initialHistory.length === 0 ? (
          <p className="text-on-surface-variant" style={{ margin: 0 }}>No ibadah records saved yet. Start tracking today&apos;s worship to build your register.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="spiritual-history-grid">
              {paginatedHistory.map((record, index) => {
                const globalIndex = (activePage - 1) * PAGE_SIZE + index;
                const recordDate = new Date(record.date);
                const dateStr = recordDate.toISOString().split('T')[0];
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = dateStr === todayStr;
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

      {/* TODAY'S TRACKER MODAL */}
      {isTrackerOpen && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsTrackerOpen(false); }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button
              onClick={() => setIsTrackerOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Moon color="var(--c-primary)" size={24} />
              <h2 className="text-headline-md" style={{ margin: 0, fontWeight: 700 }}>Today&apos;s Spiritual Tracker</h2>
            </div>

            <p className="text-body-md text-on-surface-variant mb-24" style={{ fontWeight: 500 }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {initialTodayData.habits.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--c-surface-container-low)', border: '1px dashed var(--c-outline)', borderRadius: '12px' }}>
                <p className="text-on-surface-variant" style={{ margin: 0 }}>No habits added yet. Click &quot;Manage Habits&quot; to create tracking tasks!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {initialTodayData.habits.map((habit) => {
                  const isToggling = togglingId === habit.id;
                  const isPrayer = PRAYER_HABIT_NAMES.has(habit.name);
                  const isQuranMemorisation = habit.name === 'Quran Memorisation';
                  const currentSurah = QURAN_SURAHS.find(s => s.number === selectedSurahNum);
                  const maxAyahs = currentSurah ? currentSurah.numberOfAyahs : 286;

                  return (
                    <div
                      key={habit.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: habit.isCompleted ? 'rgba(195, 150, 38, 0.06)' : 'var(--c-surface-container-low)',
                        border: `1px solid ${habit.isCompleted ? 'var(--c-primary)' : 'var(--c-outline-variant)'}`,
                        opacity: isToggling ? 0.7 : 1,
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                        <span
                          onClick={() => !isToggling && handleToggle(habit.id, habit.isCompleted)}
                          style={{
                            border: '2px solid var(--c-primary)',
                            width: '24px',
                            height: '24px',
                            minWidth: '24px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: habit.isCompleted ? 'var(--c-primary)' : 'none',
                            cursor: isToggling ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {habit.isCompleted && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--c-on-primary)', fontWeight: 'bold' }}>check</span>}
                        </span>
                        <p
                          className="text-body-md"
                          onClick={() => !isToggling && handleToggle(habit.id, habit.isCompleted)}
                          style={{ fontWeight: 600, margin: 0, cursor: isToggling ? 'not-allowed' : 'pointer', flex: 1 }}
                        >
                          {habit.name}
                        </p>
                        {isPrayer && (
                          <button
                            type="button"
                            onClick={() => !isToggling && handleJamaatChange(habit.id, !habit.prayedWithJamaat)}
                            disabled={isToggling}
                            aria-pressed={habit.prayedWithJamaat}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', borderRadius: '999px',
                              border: `1px solid ${habit.prayedWithJamaat ? 'var(--c-secondary)' : 'var(--c-outline-variant)'}`,
                              background: habit.prayedWithJamaat ? 'var(--c-secondary-container)' : 'transparent',
                              color: habit.prayedWithJamaat ? 'var(--c-on-secondary-container)' : 'var(--c-on-surface-variant)',
                              cursor: isToggling ? 'not-allowed' : 'pointer', fontWeight: 600,
                            }}
                          >
                            <Users size={15} /> {habit.prayedWithJamaat ? 'Jamaat' : 'Jamaat?'}
                          </button>
                        )}
                      </div>

                      {/* Expandable Quran Memorisation Fields */}
                      {isQuranMemorisation && habit.isCompleted && (
                        <div style={{
                          marginTop: '4px',
                          padding: '16px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--c-surface)',
                          border: '1px solid var(--c-outline-variant)',
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                        }}>
                          <p className="text-label-sm text-primary" style={{ margin: 0, fontWeight: 700, letterSpacing: '0.05em' }}>
                            Record Memorisation Details
                          </p>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>Surah</span>
                              <select
                                value={selectedSurahNum}
                                onChange={(e) => handleSurahChange(Number(e.target.value))}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--c-outline)',
                                  backgroundColor: 'var(--c-surface-container-high)',
                                  color: 'var(--c-on-surface)',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  outline: 'none',
                                }}
                              >
                                {QURAN_SURAHS.map((s) => (
                                  <option key={s.number} value={s.number}>
                                    {s.number}. {s.englishName} ({s.numberOfAyahs} ayahs)
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>From Ayah</span>
                              <select
                                value={fromVerse}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setFromVerse(val);
                                  if (toVerse < val) setToVerse(val);
                                }}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--c-outline)',
                                  backgroundColor: 'var(--c-surface-container-high)',
                                  color: 'var(--c-on-surface)',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  outline: 'none',
                                }}
                              >
                                {Array.from({ length: maxAyahs }, (_, i) => i + 1).map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>To Ayah</span>
                              <select
                                value={toVerse}
                                onChange={(e) => setToVerse(Number(e.target.value))}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--c-outline)',
                                  backgroundColor: 'var(--c-surface-container-high)',
                                  color: 'var(--c-on-surface)',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  outline: 'none',
                                }}
                              >
                                {Array.from({ length: maxAyahs - fromVerse + 1 }, (_, i) => i + fromVerse).map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Other Activities Textarea */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--c-surface-container-low)',
              border: '1px solid var(--c-outline-variant)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus color="var(--c-primary)" size={18} />
                <h3 className="text-title-md" style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Other Worship / Good Deeds</h3>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-on-surface-variant)', fontWeight: 500 }}>
                Record any other good deeds done today (e.g., Watched video lecture, read a book, gave Sadaqah, helped someone, etc.)
              </p>
              <textarea
                rows={3}
                placeholder="Describe your activities..."
                value={otherActivities}
                onChange={(e) => setOtherActivities(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--c-outline)',
                  backgroundColor: 'var(--c-surface)',
                  color: 'var(--c-on-surface)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid var(--c-outline-variant)'
            }}>
              <button
                type="button"
                onClick={() => setIsTrackerOpen(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--c-on-surface-variant)',
                  border: '1px solid var(--c-outline-variant)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={savingAll}
                className="primary-btn"
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--c-primary)',
                  color: 'var(--c-on-primary)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'none',
                }}
              >
                <CheckCircle2 size={16} />
                {savingAll ? 'Saving...' : 'Save'}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* IBADAH DETAIL MODAL */}
      {selectedRecord && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedHistoryIndex(null); }}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedHistoryIndex(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ScrollText color="var(--c-secondary)" size={22} />
              <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>
                {new Date(selectedRecord.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span className="text-body-md text-on-surface-variant" style={{ fontWeight: 600 }}>
                {selectedRecord.completedCount} of {selectedRecord.totalCount} completed
              </span>
              <span
                className="text-label-sm"
                style={{
                  backgroundColor: selectedRecord.completedCount === selectedRecord.totalCount ? 'var(--c-secondary-container)' : 'var(--c-primary-container)',
                  color: selectedRecord.completedCount === selectedRecord.totalCount ? 'var(--c-on-secondary-container)' : 'var(--c-primary)',
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontWeight: 700,
                }}
              >
                {selectedRecord.totalCount > 0 ? Math.round((selectedRecord.completedCount / selectedRecord.totalCount) * 100) : 0}%
              </span>
            </div>

            {selectedRecord.habits.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedRecord.habits.map((habit, i) => {
                  const isPrayer = PRAYER_HABIT_NAMES.has(habit.name);
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        backgroundColor: habit.isCompleted ? 'rgba(195, 150, 38, 0.06)' : 'var(--c-surface-container-low)',
                        border: `1px solid ${habit.isCompleted ? 'var(--c-primary)' : 'var(--c-outline-variant)'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        {habit.isCompleted ? (
                          <CheckCircle2 size={18} color="var(--c-secondary)" />
                        ) : (
                          <Circle size={18} color="var(--c-on-surface-variant)" style={{ opacity: 0.5 }} />
                        )}
                        <span
                          className="text-body-md"
                          style={{
                            fontWeight: 600,
                            margin: 0,
                            textDecoration: habit.isCompleted ? 'none' : 'line-through',
                            opacity: habit.isCompleted ? 1 : 0.6,
                          }}
                        >
                          {habit.name}
                        </span>
                      </div>

                      {isPrayer && (
                        <span
                          className="text-label-sm"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            whiteSpace: 'nowrap',
                            fontWeight: 600,
                            border: `1px solid ${habit.isCompleted && habit.prayedWithJamaat ? 'var(--c-secondary)' : 'var(--c-outline-variant)'}`,
                            background: habit.isCompleted && habit.prayedWithJamaat ? 'var(--c-secondary-container)' : 'transparent',
                            color: !habit.isCompleted
                              ? 'var(--c-on-surface-variant)'
                              : habit.prayedWithJamaat
                                ? 'var(--c-on-secondary-container)'
                                : 'var(--c-on-surface-variant)',
                          }}
                        >
                          <Users size={14} />
                          {!habit.isCompleted ? 'Missed' : habit.prayedWithJamaat ? 'With Jamaat' : 'Alone'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-on-surface-variant" style={{ margin: 0 }}>No habits recorded for this day.</p>
            )}

            {selectedRecord.quranMemorization && (
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--c-surface-container-low)', border: '1px solid var(--c-outline-variant)' }}>
                <p className="text-label-sm text-on-surface-variant" style={{ margin: '0 0 8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quran Memorization</p>
                <p className="text-body-md" style={{ margin: 0, whiteSpace: 'pre-wrap', fontWeight: 600 }}>{formatQuranMemorization(selectedRecord.quranMemorization)}</p>
              </div>
            )}

            {selectedRecord.otherActivities && (
              <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', backgroundColor: 'var(--c-surface-container-low)', border: '1px solid var(--c-outline-variant)' }}>
                <p className="text-label-sm text-on-surface-variant" style={{ margin: '0 0 8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Other Worship / Good Deeds</p>
                <p className="text-body-md" style={{ margin: 0, whiteSpace: 'pre-wrap', fontWeight: 600 }}>{selectedRecord.otherActivities}</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* MANAGE HABITS MODAL */}
      {isManageModalOpen && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsManageModalOpen(false); }}
        >
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
            <div style={{ borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {sortedAllHabits.map((habit) => (
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
                  {isDefaultSpiritualHabit(habit.name) ? (
                    <span className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600, padding: '4px 10px', borderRadius: '999px', backgroundColor: 'var(--c-surface-container-high)' }}>
                      Default
                    </span>
                  ) : (
                    <DeleteConfirmButton
                      action={() => deleteSpiritualHabit(habit.id)}
                      iconSize={16}
                      title="Delete Habit"
                      message="Are you sure you want to delete this habit? All past logs for this habit will also be permanently deleted."
                    />
                  )}
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
        </div>,
        document.body
      )}
    </div>
  );
}
