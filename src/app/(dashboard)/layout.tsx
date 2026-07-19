import Navigation from '@/components/layout/Navigation';
import { getAuthenticatedUser } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getUpcomingIslamicEvents } from '@/lib/islamicEvents';

export interface AppNotification {
  type: 'TRACKER' | 'ISLAMIC_EVENT';
  title: string;
  days?: number;
  lastDone?: Date | null;
  statusLabel?: string;
  dayLabel?: string;
  description?: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    redirect('/login');
  }

  // Fetch user settings and recurring trackers in parallel
  const [user, trackers] = await Promise.all([
    prisma.user.findUnique({ where: { id: sessionUser.id } }),
    prisma.recurringTracker.findMany({ where: { userId: sessionUser.id } })
  ]);

  const MAX_DAYS = 35;
  const trackerTitlesToCheck = ['Trim Toenails', 'Remove Body Hair', 'Trim Fingernails'];
  const notifications: AppNotification[] = [];

  // 1. Add overdue hygiene trackers
  trackers.forEach(t => {
    if (trackerTitlesToCheck.includes(t.title)) {
      if (t.lastDone) {
        const diffMs = new Date().getTime() - new Date(t.lastDone).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > MAX_DAYS) {
          notifications.push({
            type: 'TRACKER',
            title: t.title,
            days: diffDays,
            lastDone: t.lastDone
          });
        }
      } else {
        notifications.push({
          type: 'TRACKER',
          title: t.title,
          days: 36,
          lastDone: null
        });
      }
    }
  });

  // 2. Add upcoming Islamic Events (in 2 days, 1 day, or today)
  const upcomingEvents = getUpcomingIslamicEvents(new Date(), user?.hijriOffset ?? 0, 2);
  upcomingEvents.forEach(item => {
    const statusLabel = item.status === 'TODAY' 
      ? 'Today' 
      : item.status === 'IN_1_DAY' 
      ? 'Tomorrow' 
      : 'In 2 Days';

    notifications.push({
      type: 'ISLAMIC_EVENT',
      title: item.event.title,
      statusLabel,
      dayLabel: item.event.dayLabel,
      description: item.event.description
    });
  });

  return (
    <div className="app-layout">
      <Navigation notifications={notifications} />
      <main className="main-content" style={{ width: '100%' }}>
        <div className="container-max">
          {children}
        </div>
      </main>
    </div>
  );
}
