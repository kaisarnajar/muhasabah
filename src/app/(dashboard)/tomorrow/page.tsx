import TasksOfTheDay from '../TasksOfTheDay';

export default async function TomorrowPage() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <TasksOfTheDay dateStr={tomorrowStr} />
    </div>
  );
}
