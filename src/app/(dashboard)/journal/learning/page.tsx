import { getJournalEntries } from '@/actions';
import { GraduationCap } from 'lucide-react';
import JournalDashboard from '@/components/journal/JournalDashboard';

export default async function LearningJournalPage() {
  const entries = await getJournalEntries('LEARNING');

  return (
    <div style={{ padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <GraduationCap color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>Career Learnings</h2>
      </div>
      <JournalDashboard category="LEARNING" initialEntries={entries} />
    </div>
  );
}
