'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Moon, CheckCircle2, Plus, X, Users } from 'lucide-react';
import { toggleSpiritualHabit, setPrayerJamaat, updateQuranMemorization, updateOtherActivities } from '@/features/religious/actions';
import { useToast } from '@/context/ToastContext';
import { PRAYER_HABIT_NAMES } from '@/lib/spiritualHabits';
import { QURAN_SURAHS } from '@/lib/quranData';

interface HabitStatus {
  id: number;
  name: string;
  isCompleted: boolean;
  prayedWithJamaat: boolean;
}

interface TodayTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  initialTodayData: {
    habits: HabitStatus[];
    quranMemorization: string | null;
    otherActivities: string | null;
  };
}

export default function TodayTrackerModal({ isOpen, onClose, dateStr, initialTodayData }: TodayTrackerModalProps) {
  const { showToast } = useToast();
  
  const isToday = new Date().toISOString().split('T')[0] === dateStr;
  const displayDate = new Date(dateStr);
  // adjust timezone offset to show correct local day if needed, 
  // or simply use UTC to parse the YYYY-MM-DD correctly.
  const displayDateOffset = displayDate.getTimezoneOffset() * 60000;
  const localDisplayDate = new Date(displayDate.getTime() + displayDateOffset);

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

  const [otherActivities, setOtherActivities] = useState<string>(initialTodayData.otherActivities || '');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  if (!isOpen) return null;

  const handleSurahChange = (num: number) => {
    setSelectedSurahNum(num);
    setFromVerse(1);
    setToVerse(1);
  };

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

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
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

      await updateOtherActivities(dateStr, otherActivities);

      showToast('Spiritual tracker progress saved!', 'success');
      onClose();
    } catch (error) {
      console.error(error);
      showToast('Failed to save spiritual tracker details.', 'error');
    } finally {
      setSavingAll(false);
    }
  };

  return createPortal(
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Moon color="var(--c-primary)" size={24} />
          <h2 className="text-headline-md" style={{ margin: 0, fontWeight: 700 }}>{isToday ? "Today's Spiritual Tracker" : "Spiritual Tracker"}</h2>
        </div>

        <p className="text-body-md text-on-surface-variant mb-24" style={{ fontWeight: 500 }}>
          {localDisplayDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            onClick={onClose}
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
  );
}
