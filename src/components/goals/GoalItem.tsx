'use client';

import { toggleGoal, updateGoalProgress, archiveGoal } from '@/actions';
import { Archive, ArchiveRestore, Clock } from 'lucide-react';
import { useState } from 'react';
import { Goal } from '@prisma/client';

export function GoalItem({ goal }: { goal: Goal }) {
  const [progress, setProgress] = useState(goal.progress);

  const handleToggle = () => toggleGoal(goal.id, goal.isCompleted);
  
  const handleProgressChange = async (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const val = parseInt((e.target as HTMLInputElement).value);
    setProgress(val);
    await updateGoalProgress(goal.id, val);
  };

  const handleArchive = () => archiveGoal(goal.id, !goal.isArchived);

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
    <div className="habit-item p-16 rounded-8 flex-col gap-12" style={{ backgroundColor: 'var(--c-surface-container-low)', opacity: goal.isArchived ? 0.6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <button 
            onClick={handleToggle}
            className={`habit-checkbox ${goal.isCompleted ? 'checked' : ''}`}
            style={{ marginTop: '4px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
          </button>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <p className="text-body-md" style={{ fontWeight: 600, textDecoration: goal.isCompleted ? 'line-through' : 'none' }}>
                {goal.title}
              </p>
              <span style={{ backgroundColor: colors.bg, color: colors.text, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {goal.priority}
              </span>
              {isOverdue && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--c-error)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  <Clock size={12} /> OVERDUE
                </span>
              )}
            </div>

            {goal.description && (
              <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '4px', maxWidth: '500px' }}>
                {goal.description}
              </p>
            )}

            {goal.targetDate && (
              <p className="text-label-sm text-on-surface-variant" style={{ marginTop: '4px' }}>
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <button onClick={handleArchive} style={{ color: 'var(--c-on-surface-variant)' }} title={goal.isArchived ? "Restore Goal" : "Archive Goal"}>
          {goal.isArchived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
        </button>
      </div>

      {/* Progress Bar Area */}
      {!goal.isCompleted && (
        <div style={{ paddingLeft: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value))}
            onMouseUp={handleProgressChange} // Only trigger DB update when sliding stops
            onTouchEnd={handleProgressChange}
            style={{ flex: 1, accentColor: 'var(--c-primary)' }}
          />
          <span className="text-label-sm" style={{ fontWeight: 'bold', minWidth: '40px' }}>
            {progress}%
          </span>
        </div>
      )}
    </div>
  );
}
