'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { NoteFolder } from '@prisma/client';
import { addNoteFolder, renameNoteFolder } from '@/features/notes/actions';
import { useToast } from '@/context/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingFolder: NoteFolder | null;
}

export default function NoteFolderModal({ isOpen, onClose, editingFolder }: Props) {
  const { showToast } = useToast();
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFolderName(editingFolder ? editingFolder.name : '');
    }
  }, [isOpen, editingFolder]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setLoading(true);
    try {
      if (editingFolder) {
        await renameNoteFolder(editingFolder.id, folderName);
        showToast('Folder renamed.', 'success');
      } else {
        await addNoteFolder(folderName);
        showToast('Folder created.', 'success');
      }
      onClose();
    } catch {
      showToast('Failed to save folder.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '16px', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
        <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>{editingFolder ? 'Rename Folder' : 'New Folder'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Folder name…" value={folderName} onChange={(e) => setFolderName(e.target.value)} className="search-input" style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} autoFocus required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" className="primary-btn" style={{ padding: '10px 24px', borderRadius: '8px' }} disabled={loading}>{loading ? 'Saving…' : editingFolder ? 'Rename' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
