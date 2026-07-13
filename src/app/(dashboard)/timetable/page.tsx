import { getTimeTable } from '@/actions/timetable';
import { getAuthenticatedUser } from '@/actions/auth';
import prisma from '@/lib/prisma';
import TimetableForm from '@/components/timetable/TimetableForm';
import { CalendarRange } from 'lucide-react';

export default async function TimetablePage() {
  const timetable = await getTimeTable();
  const sessionUser = await getAuthenticatedUser();
  const user = sessionUser ? await prisma.user.findUnique({ where: { id: sessionUser.id } }) : null;

  const initialData = {
    ...timetable,
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
  };

  return (
    <div style={{ padding: '0 24px 60px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <CalendarRange color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Daily Time Table</h2>
      </div>

      <div className="w-full">
        <TimetableForm initialData={initialData} />
      </div>
    </div>
  );
}
