import { getWeekendTasks } from '@/actions';
import WeekendTasksClient from '@/components/weekend/WeekendTasksClient';
import { CalendarHeart } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function WeekendPage() {
  const tasks = await getWeekendTasks();

  // If the database is empty, seed it on first load!
  if (tasks.length === 0) {
    const initialTasks = [
      'Bathing', 'Ears Cleaning', 'Clothes Washing', 'Shoe Cleaning', 
      'Washroom Cleaning', 'Room Cleaning', 'Beard Setting', 'Hands Nail Cutting', 
      'Hair Removal', 'Feet Nail Cutting', 'Hair Cutting', 'Expense Tracker', 
      'Tasks Tracker', 'Iron Clothes'
    ];
    for (const title of initialTasks) {
      await prisma.weekendTask.create({ data: { title } });
    }
    // Refresh the list after seeding
    const newTasks = await getWeekendTasks();
    tasks.push(...newTasks);
  }

  // Deduplicate in case of parallel seeds
  const uniqueTasks = Array.from(new Map(tasks.map(item => [item.title, item])).values());

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <CalendarHeart color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Weekend Tasks</h2>
      </div>

      <div className="w-full">
        <p className="text-body-md text-on-surface-variant mb-24">
          These are your recurring weekly tasks. You can complete them any day from Monday to Sunday, but they are typically done on weekends. This list will automatically reset every Monday.
        </p>

        <WeekendTasksClient initialTasks={uniqueTasks} />
      </div>
    </div>
  );
}
