import { getWeekendTasks } from '@/actions/tasks';
import WeekendTasksClient from '@/components/weekend/WeekendTasksClient';
import { CalendarHeart } from 'lucide-react';
import prisma from '@/lib/prisma';

import Link from 'next/link';

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
      <Link href="/tasks" className="nav-item flex-row mb-24" style={{ width: 'fit-content', padding: '8px 16px', gap: '8px' }}>
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back to Tasks</span>
      </Link>

      <div className="w-full">
        <WeekendTasksClient initialTasks={uniqueTasks} />
      </div>
    </div>
  );
}
