import { getRelapseLogs } from '@/actions/relapse';
import { Shield } from 'lucide-react';
import RelapseDashboard from '@/components/relapse/RelapseDashboard';

export default async function RelapsePage() {
  const logs = await getRelapseLogs();

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Shield color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Habit Tracker</h2>
      </div>
      <RelapseDashboard initialLogs={logs} />
    </div>
  );
}
