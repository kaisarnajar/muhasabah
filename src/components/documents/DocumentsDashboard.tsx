'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Edit, Trash2, FileText, ExternalLink, Search, Folder, FolderOpen, ChevronRight, FolderPlus, Pencil } from 'lucide-react';
import {
  addDocument, updateDocument, deleteDocument,
  addDocumentFolder, renameDocumentFolder, deleteDocumentFolder,
} from '@/actions/documents';
import { useToast } from '@/context/ToastContext';
import { Document, DocumentFolder } from '@prisma/client';

interface Props {
  initialDocuments: Document[];
  initialFolders: DocumentFolder[];
}

export default function DocumentsDashboard({ initialDocuments, initialFolders }: Props) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Folder navigation
  const [activeFolderId, setActiveFolderId] = useState<number | null>(null);

  // Folder management modals
  const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const [folderLoading, setFolderLoading] = useState(false);

  // Document modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [formFolderId, setFormFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  // ── Folder handlers ────────────────────────────────────────────────────────

  const openAddFolder = () => { setEditingFolder(null); setFolderName(''); setIsFolderFormOpen(true); };
  const openRenameFolder = (f: DocumentFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(f); setFolderName(f.name); setIsFolderFormOpen(true);
  };

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setFolderLoading(true);
    try {
      if (editingFolder) {
        await renameDocumentFolder(editingFolder.id, folderName);
        showToast('Folder renamed.', 'success');
      } else {
        await addDocumentFolder(folderName);
        showToast('Folder created.', 'success');
      }
      setIsFolderFormOpen(false);
    } catch {
      showToast('Failed to save folder.', 'error');
    } finally {
      setFolderLoading(false);
    }
  };

  const handleDeleteFolder = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this folder? Documents inside will become unfiled.')) return;
    try {
      await deleteDocumentFolder(id);
      if (activeFolderId === id) setActiveFolderId(null);
      showToast('Folder deleted.', 'success');
    } catch {
      showToast('Failed to delete folder.', 'error');
    }
  };

  // ── Document handlers ──────────────────────────────────────────────────────

  const openAddModal = () => {
    setSelectedDoc(null); setTitle(''); setLink(''); setNotes('');
    setFormFolderId(activeFolderId);
    setIsFormOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;
    setLoading(true);
    try {
      await addDocument(title, link, notes, formFolderId);
      setIsFormOpen(false); setCurrentPage(1);
      showToast('Document added successfully!', 'success');
    } catch { showToast('Failed to add document', 'error'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !title.trim() || !link.trim()) return;
    setLoading(true);
    try {
      await updateDocument(selectedDoc.id, title, link, notes, formFolderId);
      setIsEditOpen(false); setSelectedDoc(null); setViewingDoc(null);
      showToast('Document updated successfully!', 'success');
    } catch { showToast('Failed to update document', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument(docId);
      setViewingDoc(null);
      showToast('Document deleted.', 'success');
    } catch { showToast('Failed to delete document', 'error'); }
  };

  // ── Derived data ───────────────────────────────────────────────────────────

  const activeFolder = initialFolders.find(f => f.id === activeFolderId) ?? null;

  // Docs visible in current view (root = unfiled, folder = that folder's docs)
  const viewDocs = initialDocuments.filter(d =>
    activeFolderId === null ? d.folderId === null : d.folderId === activeFolderId
  );

  const filteredDocs = viewDocs.filter(doc => {
    const term = search.toLowerCase();
    return doc.title.toLowerCase().includes(term) ||
      (doc.notes && doc.notes.toLowerCase().includes(term)) ||
      doc.link.toLowerCase().includes(term);
  });

  const PAGE_SIZE = 12;
  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedDocs = filteredDocs.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  // Folder item counts
  const countInFolder = (id: number) => initialDocuments.filter(d => d.folderId === id).length;
  const unfiledCount = initialDocuments.filter(d => d.folderId === null).length;

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)' }} />
          <input
            type="text"
            placeholder={activeFolderId ? `Search in "${activeFolder?.name}"…` : 'Search unfiled documents…'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="search-input"
            style={{ width: '100%', paddingLeft: '44px', borderRadius: '12px', height: '44px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeFolderId === null && (
            <button onClick={openAddFolder} className="primary-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', fontWeight: 700, backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', boxShadow: 'none', border: '1px solid var(--c-outline-variant)' }}>
              <FolderPlus size={17} /> New Folder
            </button>
          )}
          <button onClick={openAddModal} className="primary-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', fontWeight: 700 }}>
            <Plus size={18} /> Add Document
          </button>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '13px', fontWeight: 600, color: 'var(--c-on-surface-variant)' }}>
        <button onClick={() => { setActiveFolderId(null); setSearch(''); setCurrentPage(1); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: activeFolderId ? 'var(--c-primary)' : 'var(--c-on-surface)', fontWeight: 700, fontSize: '13px', padding: 0 }}>
          All Documents
        </button>
        {activeFolder && (
          <>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--c-on-surface)' }}>{activeFolder.name}</span>
          </>
        )}
      </div>

      {/* ── Folders grid (root only) ── */}
      {activeFolderId === null && initialFolders.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {initialFolders.map(folder => (
            <div key={folder.id}
              onClick={() => { setActiveFolderId(folder.id); setSearch(''); setCurrentPage(1); }}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid var(--c-outline-variant)', cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: 'var(--c-surface-container-low)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--c-outline-variant)'; e.currentTarget.style.transform = 'none'; }}
            >
              <Folder size={28} color="var(--c-primary)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: 'var(--c-on-surface)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word', lineHeight: 1.3 }}>{folder.name}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--c-on-surface-variant)', fontWeight: 600 }}>{countInFolder(folder.id)} item{countInFolder(folder.id) !== 1 ? 's' : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button onClick={(e) => openRenameFolder(folder, e)}
                  style={{ padding: '5px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--c-on-surface-variant)', display: 'flex' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-on-surface-variant)'; }}
                  title="Rename folder">
                  <Pencil size={13} />
                </button>
                <button onClick={(e) => handleDeleteFolder(folder.id, e)}
                  style={{ padding: '5px', background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  title="Delete folder">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Section label ── */}
      {activeFolderId === null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FolderOpen size={16} color="var(--c-on-surface-variant)" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Unfiled — {unfiledCount} item{unfiledCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* ── Documents grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {paginatedDocs.length === 0 ? (
          <p className="text-on-surface-variant text-body-md" style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', fontStyle: 'italic', fontWeight: 600 }}>
            {search ? 'No documents match your search.' : activeFolderId ? 'This folder is empty. Click "Add Document" to add one.' : 'No unfiled documents. Add one or open a folder.'}
          </p>
        ) : (
          paginatedDocs.map(doc => {
            const dateStr = new Date(doc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={doc.id} className="card"
                onClick={() => setViewingDoc(doc)}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px', borderRadius: '16px', border: '1.5px solid var(--c-outline-variant)', backgroundColor: 'var(--c-surface-container-low)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--c-primary)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(191,145,41,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--c-outline-variant)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(191,145,41,0.1)', color: 'var(--c-primary)', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 className="text-title-md" style={{ margin: 0, fontWeight: 700, color: 'var(--c-on-surface)', wordBreak: 'break-word', lineHeight: 1.3 }}>{doc.title}</h4>
                  </div>
                </div>
                {doc.notes && (
                  <p style={{ margin: 0, padding: '10px 14px', borderRadius: '12px', backgroundColor: 'var(--c-surface-container-high)', fontSize: '13px', color: 'var(--c-on-surface-variant)', lineHeight: 1.5, fontStyle: 'italic', borderLeft: '4px solid var(--c-primary)', wordBreak: 'break-word' }}>
                    &quot;{doc.notes}&quot;
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '12px', marginTop: 'auto' }}>
                  <span className="text-body-sm text-on-surface-variant" style={{ fontWeight: 600 }}>Saved: {dateStr}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a href={doc.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="primary-btn"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px', boxShadow: 'none' }}>
                      <ExternalLink size={13} /> Link
                    </a>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setTitle(doc.title); setLink(doc.link); setNotes(doc.notes || ''); setFormFolderId(doc.folderId ?? null); setIsEditOpen(true); }}
                      style={{ padding: '6px', backgroundColor: 'transparent', border: '1px solid var(--c-outline-variant)', borderRadius: '8px', color: 'var(--c-on-surface-variant)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--c-surface-container-high)'; e.currentTarget.style.color = 'var(--c-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--c-on-surface-variant)'; }}>
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                      style={{ padding: '6px', backgroundColor: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button disabled={activePage <= 1} onClick={() => setCurrentPage(activePage - 1)} className="primary-btn"
            style={{ padding: '8px 16px', backgroundColor: activePage <= 1 ? 'var(--c-surface-container-lowest)' : 'var(--c-surface-container-high)', color: activePage <= 1 ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)', opacity: activePage <= 1 ? 0.5 : 1, cursor: activePage <= 1 ? 'not-allowed' : 'pointer', boxShadow: 'none' }}>
            Previous
          </button>
          <span className="text-body-md text-on-surface-variant" style={{ fontWeight: 600 }}>Page {activePage} of {totalPages}</span>
          <button disabled={activePage >= totalPages} onClick={() => setCurrentPage(activePage + 1)} className="primary-btn"
            style={{ padding: '8px 16px', backgroundColor: activePage >= totalPages ? 'var(--c-surface-container-lowest)' : 'var(--c-surface-container-high)', color: activePage >= totalPages ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)', opacity: activePage >= totalPages ? 0.5 : 1, cursor: activePage >= totalPages ? 'not-allowed' : 'pointer', boxShadow: 'none' }}>
            Next
          </button>
        </div>
      )}

      {/* ── Document Viewer ── */}
      {viewingDoc && !isEditOpen && (
        <div role="presentation" onClick={() => setViewingDoc(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)' }}>
          <div role="dialog" aria-modal="true" aria-labelledby="doc-viewer-title" onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '16px', padding: '28px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}>
            <button type="button" onClick={() => setViewingDoc(null)} aria-label="Close" style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            <div style={{ paddingRight: '32px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ padding: '10px', backgroundColor: 'rgba(191,145,41,0.1)', color: 'var(--c-primary)', borderRadius: '12px', display: 'flex', flexShrink: 0 }}><FileText size={22} /></div>
              <div>
                <h3 id="doc-viewer-title" className="text-headline-sm" style={{ margin: 0, fontWeight: 700, wordBreak: 'break-word', lineHeight: 1.3 }}>{viewingDoc.title}</h3>
                {viewingDoc.folderId && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--c-primary)', fontWeight: 600, marginTop: '4px' }}>
                    <Folder size={12} /> {initialFolders.find(f => f.id === viewingDoc.folderId)?.name}
                  </span>
                )}
                <span className="text-label-sm text-on-surface-variant" style={{ display: 'block', marginTop: '6px' }}>
                  Saved: {new Date(viewingDoc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--c-outline-variant)' }} />
            {viewingDoc.notes ? (
              <div style={{ overflowY: 'auto' }}>
                <p className="text-label-md" style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes / Context</p>
                <p className="text-body-md" style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.65, wordBreak: 'break-word', color: 'var(--c-on-surface)' }}>{viewingDoc.notes}</p>
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant" style={{ margin: 0, fontStyle: 'italic' }}>No notes added for this document.</p>
            )}
            <div style={{ borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => { setSelectedDoc(viewingDoc); setTitle(viewingDoc.title); setLink(viewingDoc.link); setNotes(viewingDoc.notes || ''); setFormFolderId(viewingDoc.folderId ?? null); setIsEditOpen(true); }}
                  style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid var(--c-outline-variant)', borderRadius: '8px', color: 'var(--c-on-surface-variant)', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--c-surface-container-high)'; e.currentTarget.style.color = 'var(--c-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--c-on-surface-variant)'; }}
                  title="Edit document"><Edit size={16} /></button>
                <button type="button" onClick={() => handleDelete(viewingDoc.id)}
                  style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', display: 'flex', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  title="Delete document"><Trash2 size={16} /></button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setViewingDoc(null)}
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>Close</button>
                <a href={viewingDoc.link} target="_blank" rel="noopener noreferrer" className="primary-btn"
                  style={{ padding: '10px 20px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <ExternalLink size={15} /> Open Document
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Document Modal (shared form) ── */}
      {(isFormOpen || isEditOpen) && mounted && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '16px', backdropFilter: 'blur(6px)' }}
          onClick={() => { setIsFormOpen(false); setIsEditOpen(false); }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setIsFormOpen(false); setIsEditOpen(false); }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>{isEditOpen ? 'Edit Document' : 'Add New Document'}</h3>
            <form onSubmit={isEditOpen ? handleUpdate : handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Title</label>
                <input type="text" placeholder="e.g., Financial Report 2026" value={title} onChange={(e) => setTitle(e.target.value)} className="search-input" style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Link / URL</label>
                <input type="url" placeholder="https://drive.google.com/…" value={link} onChange={(e) => setLink(e.target.value)} className="search-input" style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Folder</label>
                <select value={formFolderId ?? ''} onChange={(e) => setFormFolderId(e.target.value ? Number(e.target.value) : null)} className="search-input" style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}>
                  <option value="">— Unfiled —</option>
                  {initialFolders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes / Context</label>
                <textarea placeholder="What is this document for? (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="search-input" style={{ width: '100%', minHeight: '90px', borderRadius: '10px', resize: 'vertical', fontSize: '14px', lineHeight: 1.6 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => { setIsFormOpen(false); setIsEditOpen(false); }} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="primary-btn" style={{ padding: '10px 24px', borderRadius: '8px' }} disabled={loading}>{loading ? 'Saving…' : isEditOpen ? 'Save Changes' : 'Add Document'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Folder Form Modal ── */}
      {isFolderFormOpen && mounted && createPortal(
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '16px', backdropFilter: 'blur(6px)' }}
          onClick={() => setIsFolderFormOpen(false)}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsFolderFormOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>{editingFolder ? 'Rename Folder' : 'New Folder'}</h3>
            <form onSubmit={handleFolderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="Folder name…" value={folderName} onChange={(e) => setFolderName(e.target.value)} className="search-input" style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} autoFocus required />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setIsFolderFormOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="primary-btn" style={{ padding: '10px 24px', borderRadius: '8px' }} disabled={folderLoading}>{folderLoading ? 'Saving…' : editingFolder ? 'Rename' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
