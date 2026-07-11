import { getGoals, addGoal } from '@/actions';
import { Target, Plus } from 'lucide-react';
import { GoalItem } from './GoalItem';

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <div className="glass-panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Target color="var(--primary-color)" />
        <h2 style={{ margin: 0 }}>Goals & Activities</h2>
      </div>

      <form action={addGoal} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          name="title"
          placeholder="New goal or activity..." 
          required 
          style={{ flex: 2 }}
        />
        <input 
          type="date" 
          name="targetDate"
          style={{ flex: 1 }}
        />
        <button type="submit" className="primary">
          <Plus size={20} />
        </button>
      </form>

      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {goals.map(goal => (
            <GoalItem key={goal.id} goal={goal} />
          ))}
          {goals.length === 0 && <p className="text-secondary">No goals set yet.</p>}
        </div>
      </div>
    </div>
  );
}
