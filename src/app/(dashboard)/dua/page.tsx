import { getDuas } from '@/actions/dua';
import { Heart } from 'lucide-react';
import DuaDashboard from '@/components/dua/DuaDashboard';

export default async function DuaPage() {
  const duas = await getDuas();

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Heart color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Dua List</h2>
      </div>
      <DuaDashboard initialDuas={duas} />
    </div>
  );
}
