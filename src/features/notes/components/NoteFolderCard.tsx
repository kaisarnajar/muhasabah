'use client';

import { Folder, Pencil, Trash2 } from 'lucide-react';
import { NoteFolder } from '@prisma/client';

interface Props {
  folder: NoteFolder;
  count: number;
  onClick: (id: number) => void;
  onRename: (folder: NoteFolder, e: React.MouseEvent) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}

export default function NoteFolderCard({ folder, count, onClick, onRename, onDelete }: Props) {
  return (
    <div onClick={() => onClick(folder.id)} className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid var(--c-outline-variant)', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'var(--c-surface-container-low)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--c-outline-variant)'; e.currentTarget.style.transform = 'none'; }}>
      <Folder size={28} color="var(--c-primary)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--c-on-surface)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word', lineHeight: 1.3 }}>{folder.name}</p>
        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>{count} note{count !== 1 ? 's' : ''}</p>
      </div>
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <button onClick={(e) => onRename(folder, e)}
          style={{ padding: '5px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--c-on-surface-variant)', display: 'flex' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-on-surface-variant)'; }}
          title="Rename folder"><Pencil size={13} /></button>
        <button onClick={(e) => onDelete(folder.id, e)}
          style={{ padding: '5px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          title="Delete folder"><Trash2 size={13} /></button>
      </div>
    </div>
  );
}
