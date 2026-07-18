'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { GoalItem } from './GoalItem';
import { AddGoalForm } from './AddGoalForm';
import { Goal, GoalCategory, GoalPriority } from '@prisma/client';
import { deleteGoal, toggleGoal, editGoal } from '@/actions/index';

export function GoalsDashboard({ goals }: { goals: Goal[] }) {
  const [activeTab, setActiveTab] = useState<GoalCategory | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const tabs: Array<{ value: GoalCategory | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Goals' },
    { value: 'RELIGIOUS', label: 'Religious' },
    { value: 'CAREER', label: 'Career' },
    { value: 'FINANCES', label: 'Finances' },
    { value: 'HEALTH', label: 'Health & Fitness' },
    { value: 'PERSONAL', label: 'Personal' }
  ];

  const handleTabChange = (tab: GoalCategory | 'ALL') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'ALL') return true;
    return goal.category === activeTab;
  });

  filteredGoals.sort((a, b) => {
    const priorityWeights: Record<GoalPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (priorityWeights[b.priority] !== priorityWeights[a.priority]) {
      return priorityWeights[b.priority] - priorityWeights[a.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Pagination Logic
  const PAGE_SIZE = 25;
  const totalPages = Math.ceil(filteredGoals.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedGoals = filteredGoals.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  return (
    <div>
      <AddGoalForm activeCategory={activeTab} />

      <div style={{ marginBottom: '16px' }} />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid var(--c-outline-variant)' }}>
        {tabs.map(tab => (
          <button 
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              fontWeight: 600,
              backgroundColor: activeTab === tab.value ? 'var(--c-primary)' : 'transparent',
              color: activeTab === tab.value ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {paginatedGoals.map(goal => (
          <GoalItem 
            key={goal.id} 
            goal={goal} 
            onClick={() => setSelectedGoal(goal)}
          />
        ))}
        {paginatedGoals.length === 0 && (
          <p className="text-on-surface-variant" style={{ textAlign: 'center', padding: '40px 0', fontStyle: 'italic' }}>
            No goals found under this category. Create one above!
          </p>
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

      {/* GOAL DETAILS MODAL */}
      {selectedGoal && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedGoal(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGoal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            {/* Header info */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(195, 150, 38, 0.08)',
                  border: '1px solid rgba(195, 150, 38, 0.2)',
                  color: 'var(--c-primary)',
                  textTransform: 'uppercase'
                }}
              >
                {selectedGoal.category}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: selectedGoal.priority === 'HIGH' ? 'var(--c-error-container)' : selectedGoal.priority === 'MEDIUM' ? 'var(--c-secondary-container)' : 'var(--c-surface-variant)',
                  color: selectedGoal.priority === 'HIGH' ? 'var(--c-on-error-container)' : selectedGoal.priority === 'MEDIUM' ? 'var(--c-on-secondary-container)' : 'var(--c-on-surface-variant)'
                }}
              >
                {selectedGoal.priority} PRIORITY
              </span>
            </div>

            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700, color: 'var(--c-on-surface)' }}>{selectedGoal.title}</h3>
            
            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</span>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-on-surface)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {selectedGoal.description || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No description provided.</span>}
              </p>
            </div>

            {/* Target Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--c-surface-container-low)', border: '1px solid var(--c-outline-variant)' }}>
              <Calendar size={18} color="var(--c-on-surface-variant)" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '10px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>TARGET DATE</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-on-surface)' }}>
                  {selectedGoal.targetDate ? new Date(selectedGoal.targetDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No target date set.'}
                </span>
              </div>
            </div>


            {/* Actions buttons */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
              
              {/* Toggle Complete */}
              <button
                onClick={async () => {
                  await toggleGoal(selectedGoal.id, selectedGoal.isCompleted);
                  setSelectedGoal(prev => prev ? { ...prev, isCompleted: !prev.isCompleted, progress: !prev.isCompleted ? 100 : 0 } : null);
                }}
                className="primary-btn"
                style={{
                  flex: 1.5,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: selectedGoal.isCompleted ? 'var(--c-surface-container-high)' : 'var(--c-primary)',
                  color: selectedGoal.isCompleted ? 'var(--c-on-surface)' : 'var(--c-on-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: 'none'
                }}
              >
                <CheckCircle size={16} />
                {selectedGoal.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
              </button>

              {/* Edit */}
              <button
                onClick={() => setIsEditOpen(true)}
                className="primary-btn"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--c-surface-container-high)',
                  color: 'var(--c-on-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: 'none'
                }}
              >
                <Edit size={16} />
                Edit
              </button>

              {/* Delete */}
              <button
                onClick={async () => {
                  if (confirm('Are you sure you want to delete this goal?')) {
                    await deleteGoal(selectedGoal.id);
                    setSelectedGoal(null);
                  }
                }}
                className="primary-btn"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  border: '1px solid rgba(220, 53, 69, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: 'none'
                }}
              >
                <Trash2 size={16} />
                Delete
              </button>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT GOAL MODAL */}
      {isEditOpen && selectedGoal && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1010, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsEditOpen(false)}
        >
          <div 
            className="card" 
            style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Edit Goal</h3>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}>
                <X size={20} />
              </button>
            </div>

            <form 
              action={async (formData) => {
                await editGoal(selectedGoal.id, formData);
                setIsEditOpen(false);
                setSelectedGoal(null); // Close details modal too to refresh
              }} 
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Goal Title</label>
                <input 
                  type="text" 
                  name="title"
                  defaultValue={selectedGoal.title}
                  className="search-input"
                  required 
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Category</label>
                  <select 
                    name="category" 
                    defaultValue={selectedGoal.category} 
                    className="search-input" 
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    <option value="RELIGIOUS">Religious</option>
                    <option value="CAREER">Career</option>
                    <option value="FINANCES">Finances</option>
                    <option value="HEALTH">Health & Fitness</option>
                    <option value="PERSONAL">Personal</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Priority</label>
                  <select 
                    name="priority" 
                    defaultValue={selectedGoal.priority} 
                    className="search-input" 
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Description (Optional)</label>
                <input 
                  type="text" 
                  name="description"
                  defaultValue={selectedGoal.description || ''}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Progress (%)</label>
                  <input 
                    type="number" 
                    name="progress"
                    min="0"
                    max="100"
                    defaultValue={selectedGoal.progress}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="text-label-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Target Date</label>
                  <input 
                    type="date" 
                    name="targetDate"
                    defaultValue={selectedGoal.targetDate ? new Date(selectedGoal.targetDate).toISOString().split('T')[0] : ''}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ padding: '10px 24px', borderRadius: '8px' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
