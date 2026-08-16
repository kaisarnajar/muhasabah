'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Moon, Plus, X, Users, User, CheckCircle2 } from 'lucide-react';
import { toggleSpiritualHabit, setPrayerStatus, updateOtherActivities, updateShortcomings } from '@/features/religious/actions';
import { useToast } from '@/context/ToastContext';
import { PRAYER_HABIT_NAMES } from '@/lib/spiritualHabits';

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
    shortcomings: string | null;
  };
}

import { getTodayDateString, formatDateForDisplay } from '@/lib/dateUtils';

export default function TodayTrackerModal({ isOpen, onClose, dateStr, initialTodayData }: TodayTrackerModalProps) {
  const { showToast } = useToast();
  
  const isToday = getTodayDateString() === dateStr;
  const formattedDisplayDate = formatDateForDisplay(dateStr);

  const [otherActivities, setOtherActivities] = useState<string>(initialTodayData.otherActivities || '');
  const [shortcomings, setShortcomings] = useState<string>(initialTodayData.shortcomings || '');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  if (!isOpen) return null;

  const handleToggle = async (habitId: number, currentCompleted: boolean) => {
    setTogglingId(habitId);
    try {
      await toggleSpiritualHabit(dateStr, habitId, currentCompleted);
    } catch (error) {
      console.error(error);
      showToast('Failed to update habit status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleStatusChange = async (habitId: number, status: 'NONE' | 'INDIVIDUAL' | 'JAMAAT') => {
    setTogglingId(habitId);
    try {
      await setPrayerStatus(dateStr, habitId, status);
    } catch (error) {
      console.error(error);
      showToast('Failed to update prayer status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      await updateOtherActivities(dateStr, otherActivities);
      await updateShortcomings(dateStr, shortcomings);

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
          {formattedDisplayDate}
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
                  {isPrayer ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px' }}>🕌</span>
                        <p className="text-body-md" style={{ fontWeight: 700, margin: 0, color: 'var(--c-on-surface)' }}>
                          {habit.name}
                        </p>
                      </div>

                      {/* Separate Natural Buttons for Prayer Options */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Individual Option */}
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => {
                            if (isToggling) return;
                            const isCurrentlyIndividual = habit.isCompleted && !habit.prayedWithJamaat;
                            handleStatusChange(habit.id, isCurrentlyIndividual ? 'NONE' : 'INDIVIDUAL');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: habit.isCompleted && !habit.prayedWithJamaat 
                              ? '1.5px solid var(--c-primary)' 
                              : '1px solid var(--c-outline)',
                            backgroundColor: habit.isCompleted && !habit.prayedWithJamaat 
                              ? 'var(--c-primary-container)' 
                              : 'var(--c-surface)',
                            color: habit.isCompleted && !habit.prayedWithJamaat 
                              ? 'var(--c-on-primary-container)' 
                              : 'var(--c-on-surface-variant)',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: isToggling ? 'not-allowed' : 'pointer',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          <User size={14} />
                          Individual
                        </button>

                        {/* With Jamaat Option */}
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => {
                            if (isToggling) return;
                            const isCurrentlyJamaat = habit.isCompleted && habit.prayedWithJamaat;
                            handleStatusChange(habit.id, isCurrentlyJamaat ? 'NONE' : 'JAMAAT');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            border: habit.isCompleted && habit.prayedWithJamaat 
                              ? '1.5px solid #22c55e' 
                              : '1px solid var(--c-outline)',
                            backgroundColor: habit.isCompleted && habit.prayedWithJamaat 
                              ? 'rgba(34, 197, 94, 0.15)' 
                              : 'var(--c-surface)',
                            color: habit.isCompleted && habit.prayedWithJamaat 
                              ? '#15803d' 
                              : 'var(--c-on-surface-variant)',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: isToggling ? 'not-allowed' : 'pointer',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          <Users size={14} />
                          With Jama&apos;at
                        </button>
                      </div>
                    </div>
                  ) : (
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

        {/* Shortcomings Textarea */}
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
            <span className="material-symbols-outlined" style={{ color: 'var(--c-error)', fontSize: '18px' }}>error</span>
            <h3 className="text-title-md" style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Shortcomings / Missed Worship</h3>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--c-on-surface-variant)', fontWeight: 500 }}>
            Record any missed obligations or areas of improvement (e.g., &quot;Today, I missed Fajr Salah. May Allah Forgive Me&quot;, missed Azkaar, etc.)
          </p>
          <textarea
            rows={3}
            placeholder="Log any missed worships or shortcomings..."
            value={shortcomings}
            onChange={(e) => setShortcomings(e.target.value)}
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
