import { getNotes } from '@/actions/notes';
import NotesDashboard from '@/components/notes/NotesDashboard';
import { StickyNote } from 'lucide-react';

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div style={{ padding: '0 24px 60px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <StickyNote color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>My Notes</h2>
      </div>

      <NotesDashboard initialNotes={notes} />
    </div>
  );
}
