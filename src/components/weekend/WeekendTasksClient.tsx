'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { addWeekendTask, deleteWeekendTask, toggleWeekendTask } from '@/actions';
import { WeekendTask } from '@prisma/client';

export default function WeekendTasksClient({ initialTasks }: { initialTasks: WeekendTask[] }) {

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to determine if the task was completed in the CURRENT week (Mon-Sun)
  const isCompletedThisWeek = (lastCompletedAt: Date | null) => {
    if (!lastCompletedAt) return false;
    
    const now = new Date();
    const completedDate = new Date(lastCompletedAt);
    
    // Find the Monday of the current week
    const currentWeekStart = new Date(now);
    currentWeekStart.setHours(0, 0, 0, 0);
    const day = currentWeekStart.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    currentWeekStart.setDate(diff);

    return completedDate >= currentWeekStart;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setLoading(true);
    try {
      await addWeekendTask(newTaskTitle);
      setNewTaskTitle('');
    } catch (error) {
      console.error(error);
      alert('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to permanently delete this task?')) {
      await deleteWeekendTask(id);
    }
  };

  const handleToggle = async (id: number, currentCompletedState: boolean) => {
    await toggleWeekendTask(id, !currentCompletedState);
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      
      {/* ADD TASK FORM */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Add a new weekend task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="search-input"
          style={{ flex: 1, borderRadius: '8px' }}
          required
        />
        <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '0 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add
        </button>
      </form>

      {/* TASK LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {initialTasks.map(task => {
          const completed = isCompletedThisWeek(task.lastCompletedAt);
          
          return (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--c-surface)', borderRadius: '8px', border: '1px solid var(--c-outline-variant)' }}>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', flex: 1 }}>
                <input 
                  type="checkbox" 
                  checked={completed}
                  onChange={() => handleToggle(task.id, completed)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <span className="text-body-lg" style={{ 
                  textDecoration: completed ? 'line-through' : 'none', 
                  color: completed ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)' 
                }}>
                  {task.title}
                </span>
              </label>

              <button onClick={() => handleDelete(task.id)} style={{ color: 'var(--c-error)', opacity: 0.6, padding: '8px' }}>
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
