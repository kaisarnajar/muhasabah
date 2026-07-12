import TasksOfTheDay from '@/components/dashboard/TasksOfTheDay';

export default async function TomorrowPage() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return (
    <div>
      <TasksOfTheDay dateStr={tomorrowStr} />
    </div>
  );
}
