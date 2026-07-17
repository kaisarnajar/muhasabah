import { getAuthenticatedUser } from '@/features/auth/actions';
import prisma from '@/lib/prisma';
import TimetableForm from "@/features/timetable/components/TimetableForm";
import TimetableDashboardCard from '@/components/dashboard/TimetableDashboardCard';
import HijriDateDisplay from '@/components/ui/HijriDateDisplay';
import { CalendarRange } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function TimetablePage() {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const [timetable, user] = await Promise.all([
    prisma.timeTable.findUnique({
      where: { userId: sessionUser.id }
    }).then(async (t) => {
      if (!t) {
        return await prisma.timeTable.create({
          data: { userId: sessionUser.id }
        });
      }
      return t;
    }),
    prisma.user.findUnique({ where: { id: sessionUser.id } })
  ]);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let prayerTimes = null;
  if (user?.latitude && user?.longitude) {
    try {
      const method = user.calculationMethod ?? 1;
      const school = user.asrTiming ?? 0;
      const res = await fetch(`https://api.aladhan.com/v1/timings/${todayStr}?latitude=${user.latitude}&longitude=${user.longitude}&method=${method}&school=${school}`, { next: { revalidate: 3600 } });
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
    asrTiming: user?.asrTiming ?? 0,
  };

  return (
    <div style={{ padding: '0 24px 60px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <CalendarRange color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Daily Time Table</h2>
      </div>

      <HijriDateDisplay initialOffset={user?.hijriOffset ?? 0} showControls={true} />

      <div className="w-full" style={{ marginBottom: '12px' }}>
        <TimetableDashboardCard timetable={initialData} prayerTimes={prayerTimes} />
      </div>

      <div className="w-full">
        <TimetableForm initialData={initialData} />
      </div>
    </div>
  );
}
