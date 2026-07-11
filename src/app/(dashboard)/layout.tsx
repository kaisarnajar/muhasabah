import Navigation from '@/components/layout/Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
