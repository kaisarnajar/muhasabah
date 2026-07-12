import TaskHistoryTable from '@/components/history/TaskHistoryTable';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function HistoryPage() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  startDate.setHours(0, 0, 0, 0);

  const tasks = await prisma.dailyTask.findMany({
    where: {
      targetDate: {
        gte: startDate,
        lte: new Date(),
      },
    },
    orderBy: {
      targetDate: 'desc',
    },
  });

  return (
    <div style={{ padding: '0 24px' }}>
      <Link href="/tasks" className="nav-item flex-row mb-24" style={{ width: 'fit-content', padding: '8px 16px', gap: '8px' }}>
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back to Tasks</span>
      </Link>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="text-headline-md">Task History</h2>
        <p className="text-body-md text-on-surface-variant">Review your daily plans and accomplishments over the last month.</p>
      </div>

      <TaskHistoryTable tasks={tasks} />
    </div>
  );
}
