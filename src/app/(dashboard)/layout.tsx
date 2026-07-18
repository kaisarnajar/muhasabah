import Navigation from '@/components/layout/Navigation';
import { getAuthenticatedUser } from '@/features/auth/actions';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    redirect('/login');
  }

  // Fetch recurring trackers for the user to check nail/hair removal limits
  const trackers = await prisma.recurringTracker.findMany({
    where: { userId: sessionUser.id }
  });

  const MAX_DAYS = 35;
  const trackerTitlesToCheck = ['Trim Toenails', 'Remove Body Hair', 'Trim Fingernails'];
  const notifications: { title: string; days: number; lastDone: Date | null }[] = [];

  trackers.forEach(t => {
    if (trackerTitlesToCheck.includes(t.title)) {
      if (t.lastDone) {
        const diffMs = new Date().getTime() - new Date(t.lastDone).getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > MAX_DAYS) {
          notifications.push({
            title: t.title,
            days: diffDays,
            lastDone: t.lastDone
          });
        }
      } else {
        // If never completed, it's considered overdue
        notifications.push({
          title: t.title,
          days: 36,
          lastDone: null
        });
      }
    }
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
