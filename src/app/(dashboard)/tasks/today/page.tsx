import TasksOfTheDay from '@/components/dashboard/TasksOfTheDay';

export default function TodayTasksPage() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h2 className="text-headline-md" style={{ margin: 0 }}>Today's Tasks</h2>
      </div>
      <div className="grid-container">
        <div className="col-span-12 flex-col gap-24" style={{ alignContent: 'start' }}>
          <TasksOfTheDay dateStr={todayStr} />
        </div>
      </div>
    </>
  );
}
