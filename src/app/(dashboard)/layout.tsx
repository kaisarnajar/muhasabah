import Navigation from './Navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container">
      <Navigation />
      <main>
        {children}
      </main>
    </div>
  );
}
