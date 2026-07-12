'use client';

import { toggleGoal } from '@/actions';
import { Clock } from 'lucide-react';
import { Goal } from '@prisma/client';

export function GoalItem({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening details modal
    toggleGoal(goal.id, goal.isCompleted);
  };

  // Overdue check
  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && !goal.isCompleted;

  // Priority Colors
  const priorityColors = {
    HIGH: { bg: 'var(--c-error-container)', text: 'var(--c-on-error-container)' },
    MEDIUM: { bg: 'var(--c-secondary-container)', text: 'var(--c-on-secondary-container)' },
    LOW: { bg: 'var(--c-surface-variant)', text: 'var(--c-on-surface-variant)' },
  };
  const colors = priorityColors[goal.priority as keyof typeof priorityColors] || priorityColors.MEDIUM;

  return (
    <div 
      className="card flex-col gap-12" 
      onClick={onClick}
      style={{ 
        backgroundColor: 'var(--c-surface-container-low)', 
        cursor: 'pointer',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--c-outline-variant)',
        minWidth: 0 // Prevent card overflow
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', minWidth: 0 }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: '100%', minWidth: 0 }}>
          <button 
            onClick={handleToggle}
            className={`habit-checkbox ${goal.isCompleted ? 'checked' : ''}`}
            style={{ marginTop: '4px', flexShrink: 0 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
          </button>
          
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', flexWrap: 'wrap', width: '100%' }}>
              <p className="text-body-md" style={{ fontWeight: 600, margin: 0, textDecoration: goal.isCompleted ? 'line-through' : 'none', color: 'var(--c-on-surface)', wordBreak: 'break-word' }}>
                {goal.title}
              </p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ backgroundColor: colors.bg, color: colors.text, padding: '2px 8px', borderRadius: '12px', fontSize: '0.70rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {goal.priority}
                </span>
                {isOverdue && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--c-error)', fontSize: '0.70rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    <Clock size={10} /> OVERDUE
                  </span>
                )}
              </div>
            </div>

            {goal.description && (
              <p className="text-label-sm text-on-surface-variant" style={{ margin: 0, wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                {goal.description}
              </p>
            )}

            {goal.targetDate && (
              <p className="text-label-sm text-on-surface-variant" style={{ margin: 0, opacity: 0.8 }}>
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
