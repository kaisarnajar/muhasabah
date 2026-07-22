import { getAuthenticatedUser } from '@/features/auth/actions';
import prisma from '@/lib/prisma';
import TimetableForm from "@/features/timetable/components/TimetableForm";
import TimetableDashboardCard from '@/components/dashboard/TimetableDashboardCard';
import HijriDateDisplay from '@/components/ui/HijriDateDisplay';
import { CalendarRange } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getPrayerTimesAndMaghribStatus } from '@/features/timetable/actions';

export default async function TimetablePage() {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    redirect('/login');
  }

  const [timetable, user, prayerTimesData] = await Promise.all([
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
    prisma.user.findUnique({ where: { id: sessionUser.id } }),
    getPrayerTimesAndMaghribStatus()
  ]);

  const { prayerTimes, maghribPassed } = prayerTimesData;
  const baseOffset = user?.hijriOffset ?? 0;

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

      <HijriDateDisplay baseOffset={baseOffset} maghribPassed={maghribPassed} showControls={true} />

      <div className="w-full" style={{ marginBottom: '12px' }}>
        <TimetableDashboardCard timetable={initialData} prayerTimes={prayerTimes} />
      </div>

      <div className="w-full">
        <TimetableForm initialData={initialData} />
      </div>
    </div>
  );
}
