import { getTimeTable } from '@/actions/timetable';
import { getAuthenticatedUser } from '@/actions/auth';
import prisma from '@/lib/prisma';
import TimetableForm from '@/components/timetable/TimetableForm';
import TimetableDashboardCard from '@/components/dashboard/TimetableDashboardCard';
import { CalendarRange } from 'lucide-react';

export default async function TimetablePage() {
  const timetable = await getTimeTable();
  const sessionUser = await getAuthenticatedUser();
  const user = sessionUser ? await prisma.user.findUnique({ where: { id: sessionUser.id } }) : null;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let prayerTimes = null;
  if (user?.latitude && user?.longitude) {
    try {
      const method = user.calculationMethod ?? 1;
      const res = await fetch(`https://api.aladhan.com/v1/timings/${todayStr}?latitude=${user.latitude}&longitude=${user.longitude}&method=${method}&school=0`, { next: { revalidate: 3600 } });
      const data = await res.json();
      if (data && data.data && data.data.timings) {
        prayerTimes = data.data.timings;
      }
    } catch (e) {
      console.error('Failed to fetch prayer times', e);
    }
  }

  const initialData = {
    ...timetable,
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
    locationName: user?.locationName || null,
    calculationMethod: user?.calculationMethod ?? 1,
  };

  return (
    <div style={{ padding: '0 24px 60px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CalendarRange color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Daily Time Table</h2>
      </div>

      <div className="w-full" style={{ marginBottom: '12px' }}>
        <TimetableDashboardCard timetable={initialData} prayerTimes={prayerTimes} />
      </div>

      <div className="w-full">
        <TimetableForm initialData={initialData} />
      </div>
    </div>
  );
}
