'use client';

import { useState, useEffect } from 'react';
import { Moon, CheckCircle2, Circle, Settings, ScrollText, Plus, Calendar } from 'lucide-react';
import { OPTIONAL_HABIT_NAMES } from '@/lib/spiritualHabits';
import { QURAN_SURAHS } from '@/lib/quranData';

// Subcomponents
import TodayTrackerModal from './TodayTrackerModal';
import ManageHabitsModal from './ManageHabitsModal';
import PrayerStats from './PrayerStats';
import IbadahRegister from './IbadahRegister';
import StatsDetailsModal from './StatsDetailsModal';
import IslamicEventsModal from './IslamicEventsModal';

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
  baseOffset: number;
  maghribPassed: boolean;
}

export default function SpiritualDashboard({
  dateStr,
  initialTodayData,
  initialHistory,
  allHabits,
  baseOffset,
  maghribPassed
}: SpiritualDashboardProps) {
  // Modal states
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Statistics Filter States
  const [statsFilter, setStatsFilter] = useState<'day' | 'week' | 'month' | 'year' | 'all' | 'custom'>('month');
  const [statsCustomStart, setStatsCustomStart] = useState<string>('');
  const [statsCustomEnd, setStatsCustomEnd] = useState<string>('');
  const [isStatsCustomRangeOpen, setIsStatsCustomRangeOpen] = useState(false);
  const [activeStatsDetail, setActiveStatsDetail] = useState<{ type: 'prayer' | 'quran' | 'deeds'; title: string; prayerName?: string } | null>(null);

  const completedCount = initialTodayData.habits.filter(h => !OPTIONAL_HABIT_NAMES.has(h.name) && h.isCompleted).length;
  const totalCount = initialTodayData.habits.filter(h => !OPTIONAL_HABIT_NAMES.has(h.name)).length;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  // Helper to calculate statistics based on active filters
  const getFilteredPrayerStats = () => {
    const today = new Date();
    const todayStr = dateStr;
    
    let startLimit: Date | null = null;
    let endLimit: Date | null = null;

    if (statsFilter === 'day') {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      startLimit = monday;
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      endLimit = sunday;
    } else if (statsFilter === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'year') {
      const start = new Date(today.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'custom') {
      if (statsCustomStart) {
        const start = new Date(statsCustomStart);
        start.setHours(0, 0, 0, 0);
        startLimit = start;
      }
      if (statsCustomEnd) {
        const end = new Date(statsCustomEnd);
        end.setHours(23, 59, 59, 999);
        endLimit = end;
      }
    }

    const prayers = ['Fajr', 'Zuhur', 'Asr', 'Maghrib', 'Isha', 'Tahajjud'];
    const stats: Record<string, { completed: number; jamaat: number; total: number }> = {};
    
    prayers.forEach(p => {
      stats[p] = { completed: 0, jamaat: 0, total: 0 };
    });

    // 1. Gather historical data
    initialHistory.forEach(record => {
      const recDate = new Date(record.date);
      if (startLimit && recDate < startLimit) return;
      if (endLimit && recDate > endLimit) return;

      const recStr = recDate.toISOString().split('T')[0];
      if (recStr === todayStr) {
        return;
      }

      prayers.forEach(p => {
        const habit = record.habits.find(h => h.name === p);
        stats[p].total += 1;
        if (habit?.isCompleted) {
          stats[p].completed += 1;
          if (habit.prayedWithJamaat) {
            stats[p].jamaat += 1;
          }
        }
      });
    });

    // 2. Gather today's live data
    const todayDateObj = new Date();
    let includeToday = true;
    if (startLimit && todayDateObj < startLimit) includeToday = false;
    if (endLimit && todayDateObj > endLimit) includeToday = false;

    if (includeToday) {
      prayers.forEach(p => {
        const habit = initialTodayData.habits.find(h => h.name === p);
        if (habit) {
          stats[p].total += 1;
          if (habit.isCompleted) {
            stats[p].completed += 1;
            if (habit.prayedWithJamaat) {
              stats[p].jamaat += 1;
            }
          }
        }
      });
    }

    return stats;
  };

  const monthlyStats = getFilteredPrayerStats();

  // Helper to calculate additional stats (Quran and other activities) based on active filters
  const getFilteredAdditionalStats = () => {
    const today = new Date();
    const todayStr = dateStr;
    
    let startLimit: Date | null = null;
    let endLimit: Date | null = null;

    if (statsFilter === 'day') {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      startLimit = monday;
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      endLimit = sunday;
    } else if (statsFilter === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'year') {
      const start = new Date(today.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'custom') {
      if (statsCustomStart) {
        const start = new Date(statsCustomStart);
        start.setHours(0, 0, 0, 0);
        startLimit = start;
      }
      if (statsCustomEnd) {
        const end = new Date(statsCustomEnd);
        end.setHours(23, 59, 59, 999);
        endLimit = end;
      }
    }

    let quranDays = 0;
    let totalVerses = 0;
    const memorizedSurahs = new Set<string>();
    const activitiesList: Array<{ date: Date; text: string }> = [];

    const processQuranData = (quranVal: string | null) => {
      if (!quranVal) return;
      try {
        const parsed = JSON.parse(quranVal);
        if (parsed && typeof parsed === 'object' && 'surahNumber' in parsed) {
          quranDays += 1;
          const count = (parsed.toVerse - parsed.fromVerse) + 1;
          if (count > 0) totalVerses += count;
          
          const surah = QURAN_SURAHS.find(s => s.number === parsed.surahNumber);
          if (surah) {
            memorizedSurahs.add(surah.englishName);
          }
        }
      } catch (e) {}
    };

    // 1. Gather historical data
    initialHistory.forEach(record => {
      const recDate = new Date(record.date);
      if (startLimit && recDate < startLimit) return;
      if (endLimit && recDate > endLimit) return;

      const recStr = recDate.toISOString().split('T')[0];
      if (recStr === todayStr) {
        return;
      }

      // Quran memorisation
      processQuranData(record.quranMemorization);

      // Other activities
      if (record.otherActivities && record.otherActivities.trim()) {
        activitiesList.push({ date: recDate, text: record.otherActivities.trim() });
      }
    });

    // 2. Gather today's live data
    const todayDateObj = new Date();
    let includeToday = true;
    if (startLimit && todayDateObj < startLimit) includeToday = false;
    if (endLimit && todayDateObj > endLimit) includeToday = false;

    if (includeToday) {
      if (initialTodayData.quranMemorization) {
        processQuranData(initialTodayData.quranMemorization);
      }
      if (initialTodayData.otherActivities && initialTodayData.otherActivities.trim()) {
        activitiesList.push({ date: todayDateObj, text: initialTodayData.otherActivities.trim() });
      }
    }

    return {
      quranDays,
      totalVerses,
      surahs: Array.from(memorizedSurahs),
      activities: activitiesList.sort((a, b) => b.date.getTime() - a.date.getTime()),
    };
  };

  const additionalStats = getFilteredAdditionalStats();

  // Helper to get detailed logs for a specific prayer inside the selected stats range
  const getPrayerPeriodDetails = (prayer: string) => {
    const today = new Date();
    const todayStr = dateStr;
    
    let startLimit: Date | null = null;
    let endLimit: Date | null = null;

    if (statsFilter === 'day') {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      startLimit = monday;
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      endLimit = sunday;
    } else if (statsFilter === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'year') {
      const start = new Date(today.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'custom') {
      if (statsCustomStart) {
        const start = new Date(statsCustomStart);
        start.setHours(0, 0, 0, 0);
        startLimit = start;
      }
      if (statsCustomEnd) {
        const end = new Date(statsCustomEnd);
        end.setHours(23, 59, 59, 999);
        endLimit = end;
      }
    }

    const details: Array<{ date: Date; isCompleted: boolean; prayedWithJamaat: boolean }> = [];

    initialHistory.forEach(record => {
      const recDate = new Date(record.date);
      if (startLimit && recDate < startLimit) return;
      if (endLimit && recDate > endLimit) return;

      const recStr = recDate.toISOString().split('T')[0];
      if (recStr === todayStr) return;

      const habit = record.habits.find(h => h.name === prayer);
      details.push({
        date: recDate,
        isCompleted: habit?.isCompleted || false,
        prayedWithJamaat: habit?.prayedWithJamaat || false,
      });
    });

    const todayDateObj = new Date();
    let includeToday = true;
    if (startLimit && todayDateObj < startLimit) includeToday = false;
    if (endLimit && todayDateObj > endLimit) includeToday = false;

    if (includeToday) {
      const habit = initialTodayData.habits.find(h => h.name === prayer);
      if (habit) {
        details.push({
          date: todayDateObj,
          isCompleted: habit.isCompleted,
          prayedWithJamaat: habit.prayedWithJamaat,
        });
      }
    }

    return details.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Helper to get detailed logs for Quran memorisation inside the selected stats range
  const getQuranPeriodDetails = () => {
    const today = new Date();
    const todayStr = dateStr;
    
    let startLimit: Date | null = null;
    let endLimit: Date | null = null;

    if (statsFilter === 'day') {
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      const end = new Date(today);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      startLimit = monday;
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      endLimit = sunday;
    } else if (statsFilter === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'year') {
      const start = new Date(today.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      startLimit = start;
      
      const end = new Date(today.getFullYear(), 11, 31);
      end.setHours(23, 59, 59, 999);
      endLimit = end;
    } else if (statsFilter === 'custom') {
      if (statsCustomStart) {
        const start = new Date(statsCustomStart);
        start.setHours(0, 0, 0, 0);
        startLimit = start;
      }
      if (statsCustomEnd) {
        const end = new Date(statsCustomEnd);
        end.setHours(23, 59, 59, 999);
        endLimit = end;
      }
    }

    const details: Array<{ date: Date; text: string }> = [];

    const processQuran = (quranVal: string | null, d: Date) => {
      if (!quranVal) return;
      try {
        const parsed = JSON.parse(quranVal);
        if (parsed && typeof parsed === 'object' && 'surahNumber' in parsed) {
          const surah = QURAN_SURAHS.find(s => s.number === parsed.surahNumber);
          if (surah) {
            details.push({
              date: d,
              text: `Surah ${surah.englishName} (${parsed.surahNumber}), Verses ${parsed.fromVerse} - ${parsed.toVerse}`,
            });
          }
        }
      } catch (e) {}
    };

    initialHistory.forEach(record => {
      const recDate = new Date(record.date);
      if (startLimit && recDate < startLimit) return;
      if (endLimit && recDate > endLimit) return;

      const recStr = recDate.toISOString().split('T')[0];
      if (recStr === todayStr) return;

      processQuran(record.quranMemorization, recDate);
    });

    const todayDateObj = new Date();
    let includeToday = true;
    if (startLimit && todayDateObj < startLimit) includeToday = false;
    if (endLimit && todayDateObj > endLimit) includeToday = false;

    if (includeToday && initialTodayData.quranMemorization) {
      processQuran(initialTodayData.quranMemorization, todayDateObj);
    }

    return details.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Moon color="var(--c-primary)" size={28} />
          <h2 className="text-headline-md" style={{ margin: 0, fontWeight: 700 }}>Spiritual Tracker</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="secondary-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--c-surface-container-high)', 
              color: 'var(--c-on-surface)', 
              border: '1px solid var(--c-outline)',
              boxShadow: 'none',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'var(--transition-fast)'
            }}
          >
            <Calendar size={18} /> Islamic Events
          </button>
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="primary-btn"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px', 
              borderRadius: '12px', 
              backgroundColor: 'var(--c-primary)', 
              color: '#ffffff', 
              border: 'none',
              boxShadow: 'none',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'var(--transition-fast)'
            }}
          >
            <Settings size={18} /> Manage Habits
          </button>
        </div>
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

      {/* MONTHLY PRAYER STATISTICS */}
      <PrayerStats
        statsFilter={statsFilter}
        setStatsFilter={setStatsFilter}
        statsCustomStart={statsCustomStart}
        setStatsCustomStart={setStatsCustomStart}
        statsCustomEnd={statsCustomEnd}
        setStatsCustomEnd={setStatsCustomEnd}
        isStatsCustomRangeOpen={isStatsCustomRangeOpen}
        setIsStatsCustomRangeOpen={setIsStatsCustomRangeOpen}
        monthlyStats={monthlyStats}
        setActiveStatsDetail={setActiveStatsDetail}
      />

      {/* ADDITIONAL STATISTICS (QURAN & OTHER ACTIVITIES) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* QURAN INSIGHTS */}
        <div
          className="card"
          onClick={() => setActiveStatsDetail({ type: 'quran', title: 'Quran Memorisation Details' })}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: '100%',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            border: '1px solid var(--c-outline-variant)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--c-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <ScrollText color="var(--c-primary)" size={22} />
            <h3 className="text-title-md" style={{ margin: 0, fontWeight: 700 }}>Quran Memorisation Insights</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--c-surface-container-low)', border: '1px solid var(--c-outline-variant)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days Completed</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--c-on-surface)' }}>{additionalStats.quranDays}</span>
            </div>
            
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--c-surface-container-low)', border: '1px solid var(--c-outline-variant)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verses Memorised</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--c-secondary)' }}>{additionalStats.totalVerses}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexGrow: 1 }}>
            <span style={{ fontSize: '12px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>Surahs Memorised</span>
            {additionalStats.surahs.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {additionalStats.surahs.map(sName => (
                  <span
                    key={sName}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(195, 150, 38, 0.08)',
                      border: '1px solid rgba(195, 150, 38, 0.2)',
                      color: 'var(--c-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {sName}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--c-on-surface-variant)', margin: 0, fontStyle: 'italic', opacity: 0.7 }}>
                No surahs memorised during this period.
              </p>
            )}
          </div>
        </div>

        {/* OTHER ACTIVITIES INSIGHTS */}
        <div
          className="card"
          onClick={() => setActiveStatsDetail({ type: 'deeds', title: 'Good Deeds Log' })}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: '100%',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
            border: '1px solid var(--c-outline-variant)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.borderColor = 'var(--c-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Plus color="var(--c-secondary)" size={22} />
            <h3 className="text-title-md" style={{ margin: 0, fontWeight: 700 }}>Good Deeds Log</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--c-surface-container-low)', border: '1px solid var(--c-outline-variant)' }}>
            <span style={{ fontSize: '13px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>Active Days</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--c-on-surface)' }}>{additionalStats.activities.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
            <span style={{ fontSize: '12px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>Logged Deeds History</span>
            <div style={{
              maxHeight: '130px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '4px',
            }}>
              {additionalStats.activities.length > 0 ? (
                additionalStats.activities.map((act, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--c-surface-container-lowest)',
                      border: '1px solid var(--c-outline-variant)',
                      fontSize: '13px',
                      color: 'var(--c-on-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>
                      {new Date(act.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ whiteSpace: 'pre-wrap' }}>{act.text}</span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--c-on-surface-variant)', margin: 0, fontStyle: 'italic', opacity: 0.7 }}>
                  No other activities logged during this period.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IBADAH REGISTER */}
      <IbadahRegister initialHistory={initialHistory} />

      {/* TODAY'S TRACKER MODAL */}
      <TodayTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        dateStr={dateStr}
        initialTodayData={initialTodayData}
      />

      {/* ISLAMIC EVENTS MODAL */}
      <IslamicEventsModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        baseOffset={baseOffset}
        maghribPassed={maghribPassed}
      />

      {/* MANAGE HABITS MODAL */}
      <ManageHabitsModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        allHabits={allHabits}
      />

      {activeStatsDetail && mounted && (
        <StatsDetailsModal
          activeStatsDetail={activeStatsDetail}
          onClose={() => setActiveStatsDetail(null)}
          getPrayerPeriodDetails={getPrayerPeriodDetails}
          getQuranPeriodDetails={getQuranPeriodDetails}
          additionalStats={additionalStats}
        />
      )}
    </div>
  );
}
