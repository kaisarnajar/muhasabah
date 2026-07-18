import { getNotes, getNoteFolders } from '@/features/notes/actions';
import NotesDashboard from "@/features/notes/components/NotesDashboard";
import { StickyNote } from 'lucide-react';

export default async function NotesPage() {
  const [notes, folders] = await Promise.all([getNotes(), getNoteFolders()]);

  return (
    <div style={{ padding: '0 24px 60px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <StickyNote color="var(--c-primary)" size={28} />
        <h2 className="text-headline-md" style={{ margin: 0 }}>My Notes</h2>
      </div>

      <NotesDashboard initialNotes={notes} initialFolders={folders} />
    </div>
  );
}
