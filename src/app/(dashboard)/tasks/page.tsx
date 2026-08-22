import { getWeekendTasks, getRecurringTrackers } from '@/features/tasks/actions';
import WeekendTasksClient from '@/features/tasks/components/WeekendTasksClient';
import RecurringTrackers from '@/components/dashboard/RecurringTrackers';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/features/auth/actions';

export default async function TasksPage() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const [tasks, trackers] = await Promise.all([
    getWeekendTasks(),
    getRecurringTrackers(),
  ]);

  // If weekend tasks database is empty, seed it on first load
  if (tasks.length === 0) {
    const initialTasks = [
      'Bathing', 'Ears Cleaning', 'Clothes Washing', 'Shoe Cleaning', 
      'Washroom Cleaning', 'Room Cleaning', 'Beard Setting', 'Hands Nail Cutting', 
      'Hair Removal', 'Feet Nail Cutting', 'Hair Cutting', 'Expense Tracker', 
      'Tasks Tracker', 'Iron Clothes'
    ];
    for (const title of initialTasks) {
      await prisma.weekendTask.create({ data: { title, userId: user.id } });
    }
    const newTasks = await getWeekendTasks();
    tasks.push(...newTasks);
  }

  // If recurring trackers database is empty, seed initial default trackers
  if (trackers.length === 0) {
    const defaultTrackers = [
      'Hands Nail Cutting', 'Feet Nail Cutting', 'Hair Removal', 'Haircut'
    ];
    for (const title of defaultTrackers) {
      await prisma.recurringTracker.create({ data: { title, userId: user.id } });
    }
    const newTrackers = await getRecurringTrackers();
    trackers.push(...newTrackers);
  }

  const uniqueTasks = Array.from(new Map(tasks.map(item => [item.title, item])).values());

  return (
    <div style={{ padding: '0 24px 60px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <WeekendTasksClient initialTasks={uniqueTasks} />
      <RecurringTrackers initialTrackers={trackers} />
    </div>
  );
}

