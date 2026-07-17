'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, X, Dumbbell, Flame, Compass, Activity, Sparkles, MessageSquare, TrendingUp } from 'lucide-react';
import { addFitnessLog, deleteFitnessLog } from '@/features/fitness/actions';
import DeleteConfirmButton from '@/components/ui/DeleteConfirmButton';
import CustomDateRangeDialog from '@/components/ui/CustomDateRangeDialog';
import { useToast } from '@/context/ToastContext';
import { FitnessLog } from '@prisma/client';

function getActivityStyle(activity: string) {
  switch (activity) {
    case 'Gym':
      return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', accent: '#f97316' }; // Warm Orange
    case 'Running':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', accent: '#ef4444' }; // Red
    case 'Swimming':
      return { bg: '#ecfeff', text: '#0e7490', border: '#c5f2f7', accent: '#06b6d4' }; // Sky
    default:
      return { bg: '#f9fafb', text: '#374151', border: '#e5e7eb', accent: '#64748b' }; // Slate
  }
}

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Other'
];

export default function FitnessDashboard({ initialLogs }: { initialLogs: FitnessLog[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter and Custom range states
  const [filterPeriod, setFilterPeriod] = useState('WEEK');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');

  // Form states
  const [activity, setActivity] = useState('Gym');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const openModal = () => {
    setActivity('Gym');
    setDuration('30');
    setDistance('');
    setMuscleGroup('Chest');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const durNum = parseInt(duration, 10);
    if (isNaN(durNum) || durNum <= 0) {
      showToast('Please enter a valid duration.', 'error');
      return;
    }
    const distNum = distance.trim() ? parseFloat(distance) : null;
    if (distNum !== null && (isNaN(distNum) || distNum < 0)) {
      showToast('Please enter a valid distance.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await addFitnessLog(
        activity,
        durNum,
        distNum,
        notes.trim() || null,
        new Date(date),
        activity === 'Gym' ? muscleGroup : null
      );
      setCurrentPage(1); // Reset page on add
      closeModal();
      showToast('Workout logged successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to log fitness activity.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (newPeriod: string) => {
    if (newPeriod === 'CUSTOM') {
      setIsCustomRangeOpen(true);
      return;
    }
    setFilterPeriod(newPeriod);
    setCurrentPage(1);
  };

  const availableYears = Array.from(
    new Set([
      new Date().getFullYear(),
      ...initialLogs
        .map(l => l.date ? new Date(l.date).getFullYear() : null)
        .filter((y): y is number => y !== null)
    ])
  ).sort((a, b) => b - a);

  // Filter logs by period
  const filteredLogs = initialLogs.filter(log => {
    const d = new Date(log.date);
    const now = new Date();

    if (selectedYear !== 'all') {
      if (d.getFullYear().toString() !== selectedYear) {
        return false;
      }
    }

    if (filterPeriod === 'ALL') return true;
    if (filterPeriod === 'TODAY') {
      return d.toISOString().split('T')[0] === now.toISOString().split('T')[0];
    }
    if (filterPeriod === 'WEEK') {
      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1)); // Monday
      return d >= weekStart;
    }
    if (filterPeriod === 'MONTH') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filterPeriod === 'YEAR') {
      return d.getFullYear() === now.getFullYear();
    }
    if (filterPeriod === 'CUSTOM') {
      if (!customStart || !customEnd) return true;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    }
    return true;
  });

  // pagination
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedLogs = filteredLogs.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  // Gym Stats
  const gymLogs = filteredLogs.filter(log => log.activity === 'Gym');
  const gymCount = gymLogs.length;

  const muscleBreakdown: Record<string, number> = {
    Chest: 0,
    Back: 0,
    Legs: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0,
    'Full Body': 0,
    Other: 0
  };
  gymLogs.forEach(log => {
    const focus = log.muscleGroup || 'Other';
    if (focus in muscleBreakdown) {
      muscleBreakdown[focus]++;
    } else {
      muscleBreakdown['Other']++;
    }
  });

  // Running Stats
  const runningLogs = filteredLogs.filter(log => log.activity === 'Running');
  const runningMinutes = runningLogs.reduce((sum, log) => sum + log.duration, 0);
  const runningDistance = runningLogs.reduce((sum, log) => sum + (log.distance ? Number(log.distance) : 0), 0);

  // Total active minutes in period
  const totalMinutes = filteredLogs.reduce((sum, log) => sum + log.duration, 0);

  // Icon mapping helper
  const getActivityIcon = (type: string, color: string) => {
    switch (type) {
      case 'Running':
        return <Flame size={18} color={color} />;
      case 'Gym':
        return <Dumbbell size={18} color={color} />;
      case 'Swimming':
        return <Activity size={18} color={color} />;
      default:
        return <Sparkles size={18} color={color} />;
    }
  };

  const filterTabs = [
    { id: 'TODAY', label: 'Today' },
    { id: 'WEEK', label: 'This Week' },
    { id: 'MONTH', label: 'This Month' },
    { id: 'YEAR', label: 'This Year' },
    { id: 'ALL', label: 'All Time' },
    { id: 'CUSTOM', label: 'Custom Range' },
  ];

  return (
    <div>
      {/* FILTER TABS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleFilterChange(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: '13px',
              backgroundColor: filterPeriod === tab.id ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
              color: filterPeriod === tab.id ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Year Selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
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
      </div>

      {isCustomRangeOpen && (
        <CustomDateRangeDialog
          initialStartDate={customStart}
          initialEndDate={customEnd}
          onClose={() => setIsCustomRangeOpen(false)}
          onApply={(startDate, endDate) => {
            setCustomStart(startDate);
            setCustomEnd(endDate);
            setFilterPeriod('CUSTOM');
            setCurrentPage(1);
            setIsCustomRangeOpen(false);
          }}
        />
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        {/* Gym Workouts Summary Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px', 
            padding: '24px',
            border: '1.5px solid var(--c-outline-variant)',
            borderRadius: '20px',
            backgroundColor: 'var(--c-surface-container-low)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.01)';
            e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(249,115,22,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(249,115,22,0.1)', color: '#f97316', borderRadius: '16px', display: 'flex' }}>
              <Dumbbell size={24} />
            </div>
            <div>
              <span className="text-label-md text-on-surface-variant" style={{ fontWeight: 600 }}>Gym Sessions</span>
              <h3 className="text-display-sm" style={{ margin: '2px 0 0 0', fontWeight: 800, color: '#f97316', fontSize: '24px' }}>{gymCount} <span style={{ fontSize: '13px', fontWeight: 600 }}>workouts done</span></h3>
            </div>
          </div>

          {/* Muscle breakdown badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '12px' }}>
            {Object.entries(muscleBreakdown).map(([focus, count]) => {
              if (count === 0) return null;
              return (
                <span key={focus} style={{ 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(249,115,22,0.06)', 
                  color: '#ea580c', 
                  border: '1px solid rgba(249,115,22,0.12)' 
                }}>
                  💪 {focus}: {count}
                </span>
              );
            })}
            {gymCount === 0 && (
              <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontStyle: 'italic' }}>No muscle focus logged</span>
            )}
          </div>
        </div>

        {/* Running Summary Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px', 
            padding: '24px',
            border: '1.5px solid var(--c-outline-variant)',
            borderRadius: '20px',
            backgroundColor: 'var(--c-surface-container-low)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.01)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(239,68,68,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '16px', display: 'flex' }}>
              <Flame size={24} />
            </div>
            <div>
              <span className="text-label-md text-on-surface-variant" style={{ fontWeight: 600 }}>Running Stats</span>
              <h3 className="text-display-sm" style={{ margin: '2px 0 0 0', fontWeight: 800, color: '#ef4444', fontSize: '24px' }}>
                {runningDistance.toFixed(2)} <span style={{ fontSize: '13px', fontWeight: 600 }}>km</span>
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '12px', color: 'var(--c-on-surface-variant)', fontSize: '11px', fontWeight: 700 }}>
            <span>⏱️ Total Time: {runningMinutes} mins</span>
          </div>
        </div>

        {/* Total Active Minutes Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px', 
            padding: '24px',
            border: '1.5px solid var(--c-outline-variant)',
            borderRadius: '20px',
            backgroundColor: 'var(--c-surface-container-low)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.01)';
            e.currentTarget.style.borderColor = 'rgba(191,145,41,0.4)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(191,145,41,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(191,145,41,0.1)', color: 'var(--c-primary)', borderRadius: '16px', display: 'flex' }}>
              <Clock size={24} />
            </div>
            <div>
              <span className="text-label-md text-on-surface-variant" style={{ fontWeight: 600 }}>Active Minutes</span>
              <h3 className="text-display-sm" style={{ margin: '2px 0 0 0', fontWeight: 800, color: 'var(--c-primary)', fontSize: '24px' }}>
                {totalMinutes} <span style={{ fontSize: '13px', fontWeight: 600 }}>mins</span>
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '12px', color: 'var(--c-on-surface-variant)', fontSize: '11px', fontWeight: 600, fontStyle: 'italic' }}>
            <span>Across all activities logged in this period</span>
          </div>
        </div>
      </div>

      {/* Toolbar / Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="text-title-lg" style={{ margin: 0, fontWeight: 800, color: 'var(--c-on-surface)' }}>Activity History</h3>
        <button 
          onClick={openModal} 
          className="primary-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 700 }}
        >
          <Plus size={18} /> Log Workout
        </button>
      </div>

      {/* Grid of Workouts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: '20px' }}>
        {paginatedLogs.map(log => {
          const logDate = new Date(log.date);
          const dateString = logDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          const distanceVal = log.distance ? Number(log.distance) : null;
          const style = getActivityStyle(log.activity);

          return (
            <div 
              key={log.id} 
              className="card" 
              style={{ 
                padding: '20px', 
                borderRadius: '16px',
                border: '1.5px solid var(--c-outline-variant)',
                backgroundColor: 'var(--c-surface-container-low)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--c-primary)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(191,145,41,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Card Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '8px', backgroundColor: style.bg, borderRadius: '50%', display: 'flex', border: `1px solid ${style.border}` }}>
                    {getActivityIcon(log.activity, style.accent)}
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--c-on-surface)' }}>
                    {log.activity}
                  </span>
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  backgroundColor: style.bg,
                  color: style.text,
                  border: `1.5px solid ${style.border}`,
                  whiteSpace: 'nowrap'
                }}>
                  ⏱️ {log.duration} mins
                </span>
              </div>

              {/* Gym Muscle Focus detail row */}
              {log.activity === 'Gym' && log.muscleGroup && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  backgroundColor: 'rgba(249,115,22,0.06)', 
                  color: '#ea580c', 
                  padding: '6px 12px', 
                  borderRadius: '8px',
                  width: 'fit-content',
                  border: '1px solid rgba(249,115,22,0.1)'
                }}>
                  💪 Focus: {log.muscleGroup}
                </div>
              )}

              {/* Distance Detail Row */}
              {distanceVal !== null && (
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  backgroundColor: 'rgba(59,130,246,0.06)', 
                  color: '#2563eb', 
                  padding: '6px 12px', 
                  borderRadius: '8px',
                  width: 'fit-content',
                  border: '1px solid rgba(59,130,246,0.1)'
                }}>
                  🏃‍♂️ {distanceVal.toFixed(2)} km covered
                </div>
              )}

              {/* Notes Speech Bubble */}
              {log.notes && (
                <p style={{ 
                  margin: '4px 0 0 0', 
                  padding: '10px 14px', 
                  borderRadius: '12px', 
                  backgroundColor: 'var(--c-surface-container-high)',
                  fontSize: '13px', 
                  color: 'var(--c-on-surface-variant)', 
                  lineHeight: 1.5, 
                  fontStyle: 'italic',
                  borderLeft: `4px solid ${style.accent}`,
                  wordBreak: 'break-word'
                }}>
                  "{log.notes}"
                </p>
              )}

              {/* Card Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '12px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-on-surface-variant)', opacity: 0.85, fontSize: '11px', fontWeight: 600 }}>
                  <Calendar size={13} />
                  <span>{dateString}</span>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <DeleteConfirmButton 
                    action={async () => {
                      await deleteFitnessLog(log.id);
                      setCurrentPage(1);
                    }}
                    iconSize={15}
                    title="Delete Activity"
                    message="Are you sure you want to delete this activity log?"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', gridColumn: '1 / -1', border: '1px dashed var(--c-outline)', backgroundColor: 'var(--c-surface-container-low)' }}>
            <p className="text-on-surface-variant" style={{ margin: 0, fontStyle: 'italic', fontWeight: 600 }}>No workouts logged for this time period.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
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

      {/* Log Workout Modal */}
      {isModalOpen && mounted && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}>
            <button 
              onClick={closeModal} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Log Fitness Activity</h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Type</label>
                <select 
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px', padding: '10px 14px', backgroundColor: 'var(--c-surface-container-high)', border: '1px solid var(--c-outline-variant)' }}
                  required
                >
                  <option value="Gym">Gym / Workout</option>
                  <option value="Running">Running</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {activity === 'Gym' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workout Focus (Muscle Group)</label>
                  <select 
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px', padding: '10px 14px', backgroundColor: 'var(--c-surface-container-high)', border: '1px solid var(--c-outline-variant)' }}
                    required
                  >
                    {MUSCLE_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration (mins)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 45"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}
                    min="1"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance (km - optional)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5.2"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes / Context</label>
                <textarea 
                  placeholder="How did it go? (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '100px', borderRadius: '10px', resize: 'vertical', fontSize: '14px', lineHeight: 1.6 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-btn"
                  style={{ padding: '10px 24px', borderRadius: '8px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
