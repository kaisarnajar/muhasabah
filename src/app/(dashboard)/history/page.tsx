import TasksOfTheDay from '../TasksOfTheDay';
import HistoryDatePicker from './HistoryDatePicker';

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const queryDate = searchParams.date as string;
  
  let targetDateStr = queryDate;
  
  if (!targetDateStr) {
    // Default to yesterday if no date is provided
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    targetDateStr = yesterday.toISOString().split('T')[0];
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 className="text-headline-md">Task History</h2>
        <p className="text-body-md text-on-surface-variant">Review what you planned and accomplished.</p>
      </div>

      <HistoryDatePicker initialDate={targetDateStr} />

      <TasksOfTheDay dateStr={targetDateStr} />
    </div>
  );
}
