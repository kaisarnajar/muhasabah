import { getDailyTasks, addDailyTask, toggleDailyTask, deleteDailyTask } from '@/actions';
import { Target, ChevronLeft, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default async function TasksOfTheDay({ dateStr }: { dateStr: string }) {
  const tasks = await getDailyTasks(dateStr);
  
  const currentDate = new Date(dateStr);
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const displayDate = currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  // Determine if it's "Today", "Tomorrow", or "Yesterday"
  const realToday = new Date().toISOString().split('T')[0];
  const isToday = dateStr === realToday;
  const isTomorrow = dateStr === formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));

  let titleText = "Tasks of the Day";
  if (isToday) titleText = "Today's Tasks";
  if (isTomorrow) titleText = "Tomorrow's Plan";

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 className="text-headline-md">{titleText}</h3>
          <p className="text-label-sm text-on-surface-variant">{displayDate}</p>
        </div>
      </div>

      <form action={addDailyTask} style={{ display: 'flex', gap: '12px' }}>
        <input type="hidden" name="date" value={dateStr} />
        <input 
          type="text" 
          name="title" 
          placeholder="Add a new task..." 
          className="search-input"
          required
          style={{ flex: 1, borderRadius: '8px' }}
        />
        <button type="submit" className="primary-btn" style={{ borderRadius: '8px', padding: '0 16px' }}>
          <PlusCircle size={20} />
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map(task => {
          const toggleAction = toggleDailyTask.bind(null, task.id, task.isCompleted);
          const deleteAction = deleteDailyTask.bind(null, task.id);
          
          return (
            <div key={task.id} className="habit-item" style={{ backgroundColor: 'var(--c-surface-container-low)', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <form action={toggleAction}>
                  <button type="submit" className={`habit-checkbox ${task.isCompleted ? 'checked' : ''}`}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                  </button>
                </form>
                <span className="text-body-md" style={{ fontWeight: 500, textDecoration: task.isCompleted ? 'line-through' : 'none', opacity: task.isCompleted ? 0.6 : 1 }}>
                  {task.title}
                </span>
              </div>
              <form action={deleteAction}>
                <button type="submit" style={{ all: 'unset', cursor: 'pointer', color: 'var(--c-error)', opacity: 0.7, display: 'flex' }}>
                  <Trash2 size={18} />
                </button>
              </form>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="text-on-surface-variant text-label-sm">No tasks planned for this day.</p>}
      </div>
    </div>
  );
}
