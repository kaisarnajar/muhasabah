'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ScrollText, CheckCircle2, Circle, Users, Pencil } from 'lucide-react';
import { getSpiritualTodayData } from '@/features/religious/actions';
import TodayTrackerModal from './TodayTrackerModal';
import { PRAYER_HABIT_NAMES } from '@/lib/spiritualHabits';
import { QURAN_SURAHS } from '@/lib/quranData';

interface HistoryRecord {
  date: Date;
  completedCount: number;
  totalCount: number;
  quranMemorization: string | null;
  otherActivities: string | null;
  habits: Array<{ name: string; isCompleted: boolean; prayedWithJamaat: boolean }>;
}

interface IbadahDetailModalProps {
  selectedRecord: HistoryRecord | null;
  onClose: () => void;
}

export default function IbadahDetailModal({ selectedRecord, onClose }: IbadahDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!selectedRecord) {
    if (isEditing) {
       setIsEditing(false);
       setEditData(null);
    }
    return null;
  }

  const dateStr = selectedRecord.date.toISOString().split('T')[0];

  const handleEditClick = async () => {
    setIsLoading(true);
    try {
      const data = await getSpiritualTodayData(dateStr);
      setEditData(data);
      setIsEditing(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing && editData) {
    return (
      <TodayTrackerModal
        isOpen={true}
        onClose={() => {
          setIsEditing(false);
          onClose(); // Close both and rely on Next.js to re-fetch IbadahRegister history
        }}
        dateStr={dateStr}
        initialTodayData={editData}
      />
    );
  }

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

  return createPortal(
    <div
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingRight: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ScrollText color="var(--c-secondary)" size={22} />
            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>
              {new Date(selectedRecord.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>
          <button
            onClick={handleEditClick}
            disabled={isLoading}
            className="primary-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 12px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--c-surface-container-high)', 
              color: 'var(--c-on-surface)', 
              border: '1px solid var(--c-outline)',
              boxShadow: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isLoading ? 'wait' : 'pointer'
            }}
          >
            <Pencil size={14} /> {isLoading ? 'Loading...' : 'Edit'}
          </button>
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
  );
}
