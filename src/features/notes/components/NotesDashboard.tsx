'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Calendar, Clock, X, FolderOpen, ChevronRight, FolderPlus, Pin } from 'lucide-react';
import { addNote, updateNote, deleteNote, deleteNoteFolder, togglePinNote } from '@/features/notes/actions';
import DeleteConfirmButton from '@/components/ui/DeleteConfirmButton';
import { useToast } from '@/context/ToastContext';
import { Note, NoteFolder } from '@prisma/client';
import NoteFolderCard from './NoteFolderCard';
import NoteFolderModal from './NoteFolderModal';

export default function NotesDashboard({ initialNotes, initialFolders }: { initialNotes: Note[], initialFolders: NoteFolder[] }) {
  const [search, setSearch] = useState('');
  const { showToast } = useToast();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Folder navigation state
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);

  // Folder management modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<NoteFolder | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  const noteCategories = Array.from(new Set([
    'All',
    'General',
    'Review',
    'Monthly Review',
    'Yearly Review',
    'College Life',
    'Samsung R&D',
    'Super 30',
    'Career & Tech',
    'Islamic & Religious',
    'Personal',
    'Health & Fitness',
    'Finance',
    'Ideas & Goals',
    ...initialNotes.map(n => n.category).filter(Boolean)
  ]));

  // Folder handlers
  const openAddFolder = () => {
    setEditingFolder(null);
    setIsFolderModalOpen(true);
  };

  const openRenameFolder = (f: NoteFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(f);
    setIsFolderModalOpen(true);
  };

  const handleDeleteFolder = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this folder? Notes inside will become unfiled.')) return;
    try {
      await deleteNoteFolder(id);
      if (activeFolderId === id) setActiveFolderId(null);
      showToast('Folder deleted.', 'success');
    } catch {
      showToast('Failed to delete folder.', 'error');
    }
  };

  const openAddModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('General');
    setSelectedFolderId(activeFolderId);
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category || 'General');
    setSelectedFolderId(note.folderId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('General');
    setSelectedFolderId(null);
  };

  const closeViewModal = () => {
    setViewingNote(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setSubmitting(true);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteTitle, noteContent, noteCategory, selectedFolderId);
      } else {
        await addNote(noteTitle, noteContent, noteCategory, selectedFolderId);
        setCurrentPage(1); // Reset page on add
      }
      closeModal();
    } catch (error) {
      console.error(error);
      showToast('Failed to save note', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Derived folder data
  const activeFolder = initialFolders.find(f => f.id === activeFolderId) ?? null;

  // Filter notes by active folder, then by search and category
  const viewNotes = initialNotes.filter(n => 
    activeFolderId === null ? n.folderId === null : n.folderId === activeFolderId
  );

  const filteredNotes = viewNotes.filter(note => {
    const term = search.toLowerCase();
    const matchesSearch = note.title.toLowerCase().includes(term) || note.content.toLowerCase().includes(term);
    const matchesCategory = selectedCategoryFilter === 'All' || note.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort notes
  filteredNotes.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Pagination Logic
  const PAGE_SIZE = 24;
  const totalPages = Math.ceil(filteredNotes.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedNotes = filteredNotes.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  const countInFolder = (id: number) => initialNotes.filter(n => n.folderId === id).length;
  const unfiledCount = initialNotes.filter(n => n.folderId === null).length;

  return (
    <div>
      {/* Search and Sort Toolbar */}
      <div className="flex-row justify-between mb-24 gap-16" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)' }} />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="search-input"
            style={{ width: '100%', paddingLeft: '40px', borderRadius: '8px' }}
          />
        </div>

        <div className="flex-row gap-16" style={{ width: 'auto', flexWrap: 'wrap' }}>
          <select 
            value={sortBy} 
            onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setCurrentPage(1); }}
            className="search-input"
            style={{ borderRadius: '8px', padding: '8px 16px', width: 'auto' }}
          >
            <option value="newest">Sort by Newest</option>
            <option value="oldest">Sort by Oldest</option>
            <option value="title">Sort by Title</option>
          </select>

          {activeFolderId === null && (
            <button 
              onClick={openAddFolder} 
              className="primary-btn" 
              style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none', border: '1px solid var(--c-outline-variant)' }}
            >
              <FolderPlus size={18} /> New Folder
            </button>
          )}

          <button onClick={openAddModal} className="primary-btn" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Note
          </button>
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '13px', fontWeight: 600, color: 'var(--c-on-surface-variant)' }}>
        <button 
          onClick={() => { setActiveFolderId(null); setSearch(''); setCurrentPage(1); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeFolderId ? 'var(--c-primary)' : 'var(--c-on-surface)', fontWeight: 700, fontSize: '13px', padding: 0 }}
        >
          All Notes
        </button>
        {activeFolder && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--c-on-surface)' }}>{activeFolder.name}</span>
          </>
        )}
      </div>

      {/* Folders grid (root only) */}
      {activeFolderId === null && initialFolders.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {initialFolders.map(folder => (
            <NoteFolderCard
              key={folder.id}
              folder={folder}
              count={countInFolder(folder.id)}
              onClick={(id) => { setActiveFolderId(id); setSearch(''); setCurrentPage(1); }}
              onRename={openRenameFolder}
              onDelete={handleDeleteFolder}
            />
          ))}
        </div>
      )}

      {/* Section label for unfiled notes at root */}
      {activeFolderId === null && initialFolders.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FolderOpen size={16} color="var(--c-on-surface-variant)" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Unfiled — {unfiledCount} note{unfiledCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Category Filter Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {noteCategories.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategoryFilter(cat); setCurrentPage(1); }}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: selectedCategoryFilter === cat 
                ? 'var(--c-primary)' 
                : 'var(--c-surface-container-high)',
              color: selectedCategoryFilter === cat
                ? 'var(--c-on-primary)'
                : 'var(--c-on-surface-variant)',
              border: selectedCategoryFilter === cat ? 'none' : '1px solid var(--c-outline-variant)',
              transition: 'background-color 0.2s, color 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {paginatedNotes.map(note => {
          const createdDate = new Date(note.createdAt);
          const dateString = createdDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          const timeString = createdDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={note.id}
              className="card"
              onClick={() => setViewingNote(note)}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '240px', 
                justifyContent: 'space-between', 
                padding: '20px', 
                border: note.isPinned ? '1.5px solid var(--c-primary)' : '1px solid var(--c-outline-variant)', 
                backgroundColor: note.isPinned ? 'rgba(220, 174, 46, 0.04)' : 'var(--c-surface-container-low)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <h3 className="text-title-md" style={{ margin: 0, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', color: 'var(--c-on-surface)' }}>
                    {note.isPinned && <span style={{ marginRight: '6px' }} title="Pinned">📌</span>}
                    {note.title}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      onClick={async (event) => {
                        event.stopPropagation();
                        try {
                          await togglePinNote(note.id);
                          showToast(note.isPinned ? 'Unpinned note' : 'Pinned note to top', 'success');
                        } catch {
                          showToast('Failed to toggle pin', 'error');
                        }
                      }}
                      style={{ 
                        color: note.isPinned ? 'var(--c-primary)' : 'var(--c-on-surface-variant)', 
                        background: note.isPinned ? 'rgba(220, 174, 46, 0.15)' : 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: '6px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        transition: 'all 0.2s',
                        opacity: note.isPinned ? 1 : 0.6
                      }}
                      className="icon-btn-hover"
                      title={note.isPinned ? "Unpin Note" : "Pin Note to top"}
                    >
                      <Pin size={15} style={{ transform: note.isPinned ? 'rotate(45deg)' : 'none' }} />
                    </button>
                    <button 
                      onClick={(event) => { event.stopPropagation(); openEditModal(note); }}
                      style={{ color: 'var(--c-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', transition: 'background-color 0.2s' }}
                      className="icon-btn-hover"
                      title="Edit Note"
                    >
                      <Edit2 size={16} />
                    </button>
                    <div onClick={(event) => event.stopPropagation()}>
                      <DeleteConfirmButton
                        action={async () => {
                          await deleteNote(note.id);
                          setCurrentPage(1);
                        }}
                        iconSize={16}
                        title="Delete Note"
                        message="Are you sure you want to permanently delete this note?"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-body-md text-on-surface-variant" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', lineBreak: 'anywhere', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                  {note.content}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '12px', marginTop: '12px', color: 'var(--c-on-surface-variant)' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span className="text-label-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {dateString}
                  </span>
                  <span className="text-label-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    {timeString}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="text-label-sm" style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    backgroundColor: 'var(--c-surface-container-high)', 
                    border: '1px solid var(--c-outline-variant)',
                    color: 'var(--c-on-surface)',
                    fontSize: '10px',
                    fontWeight: 600
                  }}>
                    {note.category || 'General'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
          <p className="text-on-surface-variant text-body-md" style={{ margin: 0 }}>
            {search ? 'No notes match your search.' : activeFolderId ? 'This folder is empty. Click "Add Note" to add one.' : 'No unfiled notes found. Click "Add Note" to add one.'}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
          <button 
            disabled={activePage <= 1}
            onClick={() => setCurrentPage(activePage - 1)}
            className="primary-btn" 
            style={{ padding: '8px 16px', backgroundColor: activePage <= 1 ? 'var(--c-surface-container-lowest)' : 'var(--c-surface-container-high)', color: activePage <= 1 ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)', opacity: activePage <= 1 ? 0.5 : 1, cursor: activePage <= 1 ? 'not-allowed' : 'pointer', boxShadow: 'none' }}
          >
            Previous
          </button>
          
          <span className="text-body-md text-on-surface-variant" style={{ fontWeight: 600 }}>
            Page {activePage} of {totalPages}
          </span>

          <button 
            disabled={activePage >= totalPages}
            onClick={() => setCurrentPage(activePage + 1)}
            className="primary-btn" 
            style={{ padding: '8px 16px', backgroundColor: activePage >= totalPages ? 'var(--c-surface-container-lowest)' : 'var(--c-surface-container-high)', color: activePage >= totalPages ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)', opacity: activePage >= totalPages ? 0.5 : 1, cursor: activePage >= totalPages ? 'not-allowed' : 'pointer', boxShadow: 'none' }}
          >
            Next
          </button>
        </div>
      )}

      {/* NOTE VIEWER */}
      {viewingNote && (
        <div
          role="presentation"
          onClick={closeViewModal}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-viewer-title"
            onClick={(event) => event.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: '680px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}
          >
            <button
              type="button"
              onClick={closeViewModal}
              aria-label="Close note viewer"
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <div style={{ paddingRight: '32px' }}>
              <h3 id="note-viewer-title" className="text-headline-sm" style={{ margin: 0, fontWeight: 700, wordBreak: 'break-word' }}>
                {viewingNote.title}
              </h3>
              <div className="text-label-sm text-on-surface-variant" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <span>{new Date(viewingNote.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>{new Date(viewingNote.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  backgroundColor: 'var(--c-surface-container-high)', 
                  border: '1px solid var(--c-outline-variant)',
                  color: 'var(--c-on-surface)',
                  fontSize: '10px',
                  fontWeight: 600
                }}>
                  {viewingNote.category || 'General'}
                </span>
              </div>
            </div>

            <p className="text-body-md text-on-surface-variant" style={{ margin: 0, paddingTop: '16px', borderTop: '1px solid var(--c-outline-variant)', whiteSpace: 'pre-wrap', overflowY: 'auto', lineHeight: 1.65, wordBreak: 'break-word' }}>
              {viewingNote.content}
            </p>
          </div>
        </div>
      )}

      {/* MODAL DIALOG FOR ADD / EDIT */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            <button 
              onClick={closeModal} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>
              {editingNote ? 'Edit Note' : 'Add Note'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Title</label>
                <input 
                  type="text" 
                  placeholder="Enter note title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '8px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label className="text-label-md" style={{ fontWeight: 600 }}>Folder</label>
                  <select
                    value={selectedFolderId ? selectedFolderId.toString() : 'unfiled'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedFolderId(val === 'unfiled' ? null : Number(val));
                    }}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    <option value="unfiled">Unfiled (No Folder)</option>
                    {initialFolders.map(f => (
                      <option key={f.id} value={f.id.toString()}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <label className="text-label-md" style={{ fontWeight: 600 }}>Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', borderRadius: '8px' }}
                  >
                    <option value="General">General</option>
                    <option value="Review">Review</option>
                    <option value="Monthly Review">Monthly Review</option>
                    <option value="Yearly Review">Yearly Review</option>
                    <option value="College Life">College Life</option>
                    <option value="Samsung R&D">Samsung R&D</option>
                    <option value="Super 30">Super 30</option>
                    <option value="Career & Tech">Career & Tech</option>
                    <option value="Islamic & Religious">Islamic & Religious</option>
                    <option value="Personal">Personal</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Finance">Finance</option>
                    <option value="Ideas & Goals">Ideas & Goals</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Content</label>
                <textarea 
                  placeholder="Type note content here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '150px', borderRadius: '8px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="primary-btn" 
                  style={{ backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOLDER CREATION / RENAME MODAL */}
      <NoteFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
        }}
        editingFolder={editingFolder}
      />
    </div>
  );
}
