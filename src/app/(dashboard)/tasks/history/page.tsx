import TasksOfTheDay from '@/components/dashboard/TasksOfTheDay';
import HistoryDatePicker from '@/components/history/HistoryDatePicker';
import Link from 'next/link';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const queryDate = resolvedSearchParams.date as string;
  
  let targetDateStr = queryDate;
  
  if (!targetDateStr) {
    // Default to yesterday if no date is provided
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    targetDateStr = yesterday.toISOString().split('T')[0];
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/tasks" className="nav-item flex-row mb-16" style={{ width: 'fit-content', padding: '8px 16px', gap: '8px' }}>
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back to Tasks</span>
      </Link>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="text-headline-md">Task History</h2>
        <p className="text-body-md text-on-surface-variant">Review what you planned and accomplished.</p>
      </div>

      <HistoryDatePicker initialDate={targetDateStr} />

      <TasksOfTheDay dateStr={targetDateStr} hideTitle={true} readOnly={true} />
    </div>
  );
}
