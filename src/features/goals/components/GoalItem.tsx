'use client';

import { toggleGoal } from '@/actions/index';
import { Calendar, Clock } from 'lucide-react';
import { Goal } from '@prisma/client';

export function GoalItem({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening details modal
    toggleGoal(goal.id, goal.isCompleted);
  };

  // Overdue check
  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && !goal.isCompleted;

  // Priority Colors matching Note cards
  const priorityColors = {
    HIGH: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' },
    MEDIUM: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' },
    LOW: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)' },
  };
  const colors = priorityColors[goal.priority as keyof typeof priorityColors] || priorityColors.MEDIUM;

  const targetDateObj = goal.targetDate ? new Date(goal.targetDate) : null;
  const targetDateStr = targetDateObj 
    ? targetDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : null;

  return (
    <div 
      className="card" 
      onClick={onClick}
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        height: '240px',
        padding: '20px',
        borderRadius: '16px',
        border: goal.isTopGoal ? '1.5px solid var(--c-primary)' : '1.5px solid rgba(191, 145, 41, 0.25)', 
        backgroundColor: goal.isTopGoal ? 'rgba(220, 174, 46, 0.04)' : 'var(--c-surface-container-low)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--c-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = goal.isTopGoal ? 'var(--c-primary)' : 'rgba(191, 145, 41, 0.25)';
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
            <button 
              onClick={handleToggle}
              className={`habit-checkbox ${goal.isCompleted ? 'checked' : ''}`}
              style={{ marginTop: '2px', flexShrink: 0 }}
              title={goal.isCompleted ? "Mark Incomplete" : "Mark Complete"}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
            </button>
            <h3 className="text-title-md" style={{ margin: 0, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: 'var(--c-on-surface)', textDecoration: goal.isCompleted ? 'line-through' : 'none', opacity: goal.isCompleted ? 0.6 : 1, lineHeight: '1.35' }}>
              {goal.isTopGoal && <span style={{ marginRight: '6px' }} title="Top Goal">📌</span>}
              {goal.title}
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
            <span style={{ backgroundColor: colors.bg, color: colors.text, border: colors.border, padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {goal.priority}
            </span>
          </div>
        </div>

        {/* Status / Overdue Badge if any */}
        {isOverdue && (
          <div style={{ marginBottom: '8px' }}>
            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--c-error)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} /> OVERDUE
            </span>
          </div>
        )}

        {/* Goal Description */}
        <p className="text-body-md text-on-surface-variant" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', lineBreak: 'anywhere', whiteSpace: 'pre-wrap', lineHeight: '1.55', fontSize: '13px', color: 'var(--c-on-surface-variant)' }}>
          {goal.description || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No description provided.</span>}
        </p>
      </div>

      {/* Footer metadata line matching Notes card */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '12px', marginTop: '12px', color: 'var(--c-on-surface-variant)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: 'var(--c-on-surface-variant)' }}>
          <Calendar size={14} color="var(--c-primary)" />
          <span>{targetDateStr ? `TARGET: ${targetDateStr}` : 'NO TARGET DATE'}</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--c-primary)', backgroundColor: 'var(--c-primary-container)', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {goal.category}
        </span>
      </div>
    </div>
  );
}
