import { getGoals } from '@/actions';
import { Target } from 'lucide-react';
import { GoalsDashboard } from '@/components/goals/GoalsDashboard';

export default async function GoalsPage() {
  const goals = await getGoals(true); // Fetch all, including archived. The client dashboard filters them.

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Target color="var(--c-primary)" />
        <h2 className="text-headline-md" style={{ margin: 0 }}>My Goals</h2>
      </div>

      <GoalsDashboard goals={goals} />
    </div>
  );
}
