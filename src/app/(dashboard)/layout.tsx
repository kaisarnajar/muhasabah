import Navigation from '@/components/layout/Navigation';
import { getAuthenticatedUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    redirect('/login');
  }

  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content" style={{ width: '100%' }}>
        <div className="container-max">
          {children}
        </div>
      </main>
    </div>
  );
}
