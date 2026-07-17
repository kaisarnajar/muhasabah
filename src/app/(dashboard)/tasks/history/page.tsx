import TaskHistoryTable from '@/features/tasks/components/TaskHistoryTable';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getAuthenticatedUser } from '@/features/auth/actions';
import { redirect } from 'next/navigation';

export default async function HistoryPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login');
  }

  const tasks = await prisma.dailyTask.findMany({
    where: {
      userId: user.id,
      targetDate: { not: null },
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
        <p className="text-body-md text-on-surface-variant">Review your complete daily plans and accomplishments — from day one to today.</p>
      </div>

      <TaskHistoryTable tasks={tasks} />
    </div>
  );
}
