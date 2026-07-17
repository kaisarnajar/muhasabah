import { getSpiritualTodayData, getSpiritualHistory, getSpiritualHabits, seedDefaultSpiritualHabits } from '@/features/religious/actions';
import SpiritualDashboard from "@/features/religious/components/SpiritualDashboard";

export default async function ReligiousPage() {
  // Seed default habits (5 prayers + Adhkar) if none exist
  await seedDefaultSpiritualHabits();

  const today = new Date();
  // Adjust for local timezone to ensure 'today' is the user's today
  const offset = today.getTimezoneOffset() * 60000;
  const localToday = new Date(today.getTime() - offset);
  const dateStr = localToday.toISOString().split('T')[0];

  const [todayData, history, allHabits] = await Promise.all([
    getSpiritualTodayData(dateStr),
    getSpiritualHistory(),
    getSpiritualHabits()
  ]);

  return (
    <div style={{ padding: '0 24px 60px 24px' }}>
      <SpiritualDashboard
        dateStr={dateStr}
        initialTodayData={todayData}
        initialHistory={history}
        allHabits={allHabits}
      />
    </div>
  );
}
