'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, X, Dumbbell, Flame, Compass, Activity, Sparkles, MessageSquare, TrendingUp } from 'lucide-react';
import { addFitnessLog, deleteFitnessLog } from '@/actions/fitness';
import DeleteConfirmButton from '@/components/layout/DeleteConfirmButton';
import { useToast } from '@/context/ToastContext';
import { FitnessLog } from '@prisma/client';

function getActivityStyle(activity: string) {
  switch (activity) {
    case 'Gym':
      return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', accent: '#f97316' }; // Warm Orange
    case 'Running':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', accent: '#ef4444' }; // Red
    case 'Walking':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', accent: '#10b981' }; // Emerald
    case 'Cycling':
      return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe', accent: '#3b82f6' }; // Blue
    case 'Yoga':
      return { bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff', accent: '#8b5cf6' }; // Purple
    case 'Swimming':
      return { bg: '#ecfeff', text: '#0e7490', border: '#c5f2f7', accent: '#06b6d4' }; // Sky
    default:
      return { bg: '#f9fafb', text: '#374151', border: '#e5e7eb', accent: '#64748b' }; // Slate
  }
}

export default function FitnessDashboard({ initialLogs }: { initialLogs: FitnessLog[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states
  const [activity, setActivity] = useState('Gym');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Summary logic (this week - starting Monday)
  const getMondayOfCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const monday = getMondayOfCurrentWeek();
  const weekLogs = initialLogs.filter(log => new Date(log.date) >= monday);
  const totalMinutes = weekLogs.reduce((sum, log) => sum + log.duration, 0);
  const workoutCount = weekLogs.length;
  const totalDistance = weekLogs.reduce((sum, log) => sum + (log.distance ? Number(log.distance) : 0), 0);

  const openModal = () => {
    setActivity('Gym');
    setDuration('30');
    setDistance('');
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
        new Date(date)
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

  // Pagination Logic
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(initialLogs.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedLogs = initialLogs.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  // Icon mapping helper
  const getActivityIcon = (type: string, color: string) => {
    switch (type) {
      case 'Running':
        return <Flame size={18} color={color} />;
      case 'Gym':
        return <Dumbbell size={18} color={color} />;
      case 'Walking':
        return <Compass size={18} color={color} />;
      case 'Cycling':
        return <TrendingUp size={18} color={color} />;
      case 'Yoga':
        return <Activity size={18} color={color} />;
      default:
        return <Sparkles size={18} color={color} />;
    }
  };

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        {/* Active Minutes Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            padding: '24px',
            border: '1.5px solid var(--c-outline-variant)',
            borderRadius: '20px',
            backgroundColor: 'var(--c-surface-container-low)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.borderColor = 'rgba(191,145,41,0.4)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(191,145,41,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ padding: '16px', backgroundColor: 'rgba(191,145,41,0.1)', color: 'var(--c-primary)', borderRadius: '16px', display: 'flex' }}>
            <Clock size={28} />
          </div>
          <div>
            <span className="text-label-md text-on-surface-variant" style={{ fontWeight: 600 }}>Active Minutes</span>
            <h3 className="text-display-sm" style={{ margin: '4px 0 0 0', fontWeight: 800, color: 'var(--c-primary)', fontSize: '26px' }}>{totalMinutes} <span style={{ fontSize: '14px', fontWeight: 600 }}>mins</span></h3>
          </div>
        </div>

        {/* Workouts Completed Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            padding: '24px',
            border: '1.5px solid var(--c-outline-variant)',
            borderRadius: '20px',
            backgroundColor: 'var(--c-surface-container-low)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(16,185,129,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ padding: '16px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '16px', display: 'flex' }}>
            <Dumbbell size={28} />
          </div>
          <div>
            <span className="text-label-md text-on-surface-variant" style={{ fontWeight: 600 }}>Workouts</span>
            <h3 className="text-display-sm" style={{ margin: '4px 0 0 0', fontWeight: 800, color: '#10b981', fontSize: '26px' }}>{workoutCount} <span style={{ fontSize: '14px', fontWeight: 600 }}>this week</span></h3>
          </div>
        </div>

        {/* Distance Card */}
        <div 
          className="card" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '20px', 
            padding: '24px',
            border: '1.5px solid var(--c-outline-variant)',
            borderRadius: '20px',
            backgroundColor: 'var(--c-surface-container-low)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(59,130,246,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ padding: '16px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '16px', display: 'flex' }}>
            <Compass size={28} />
          </div>
          <div>
            <span className="text-label-md text-on-surface-variant" style={{ fontWeight: 600 }}>Total Distance</span>
            <h3 className="text-display-sm" style={{ margin: '4px 0 0 0', fontWeight: 800, color: '#3b82f6', fontSize: '26px' }}>{totalDistance.toFixed(2)} <span style={{ fontSize: '14px', fontWeight: 600 }}>km</span></h3>
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

        {initialLogs.length === 0 && (
          <div className="card" style={{ padding: '48px', textAlign: 'center', gridColumn: '1 / -1', border: '1px dashed var(--c-outline)', backgroundColor: 'var(--c-surface-container-low)' }}>
            <p className="text-on-surface-variant" style={{ margin: 0, fontStyle: 'italic', fontWeight: 600 }}>No workouts logged yet. Log your first workout to get started!</p>
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
                  <option value="Walking">Walking</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Other">Other</option>
                </select>
              </div>

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
