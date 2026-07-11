'use client';

import { toggleGoal } from '@/actions';

export function GoalItem({ goal }: { goal: any }) {
  return (
    <label className="checkbox-label" style={{ 
      backgroundColor: 'var(--surface-color)', 
      padding: '1rem', 
      borderRadius: '8px',
      margin: 0,
      opacity: goal.isCompleted ? 0.6 : 1
    }}>
      <input 
        type="checkbox" 
        checked={goal.isCompleted} 
        onChange={() => toggleGoal(goal.id, goal.isCompleted)} 
      />
      <div style={{ flex: 1, textDecoration: goal.isCompleted ? 'line-through' : 'none' }}>
        {goal.title}
      </div>
      {goal.targetDate && (
        <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
          {new Date(goal.targetDate).toLocaleDateString()}
        </div>
      )}
    </label>
  );
}
